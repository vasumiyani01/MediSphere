require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to SQLite db.sqlite3
const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite3'), (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite db.sqlite3 successfully!');
    db.run("PRAGMA journal_mode = WAL;");
    db.run("PRAGMA synchronous = NORMAL;");
  }
});

// Helper utilities for SQLite queries returning Promises
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Transporter for nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions Config using MemoryStore (no MongoDB Store)
app.use(session({
  secret: process.env.SESSION_SECRET || 'medisphere_secret_key_12345',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Helper to generate OTP
function generate_otp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// API Routes

// 1. Send OTP
app.post('/api/accounts/send-otp/', async (req, res) => {
  const { name, mobile_number, email } = req.body;
  if (!name || !mobile_number || !email) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    // Check if email already registered
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email address is already registered' });
    }

    // Check if mobile number already registered
    const existingProfile = await dbGet('SELECT * FROM users WHERE mobile_number = ?', [mobile_number]);
    if (existingProfile) {
      return res.status(400).json({ success: false, error: 'Mobile number is already registered' });
    }

    // Cooldown check (60 seconds)
    const lastOtpTime = req.session.signup_created_at;
    const lastOtpMobile = req.session.signup_mobile_number;
    if (lastOtpTime && lastOtpMobile === mobile_number && (Date.now() - lastOtpTime < 60000)) {
      const timeLeft = Math.ceil((60000 - (Date.now() - lastOtpTime)) / 1000);
      return res.status(429).json({ success: false, error: `Please wait ${timeLeft} seconds before requesting a new OTP.` });
    }

    // Generate 6-digit OTP
    const otp = generate_otp();

    // Save to Session
    req.session.signup_otp = otp;
    req.session.signup_name = name;
    req.session.signup_mobile_number = mobile_number;
    req.session.signup_email = email;
    req.session.signup_created_at = Date.now();
    req.session.signup_verified = false;

    // Send email
    const mailOptions = {
      from: process.env.DEFAULT_FROM_EMAIL || 'MediSphere <mayanksoni2352007@gmail.com>',
      to: email,
      subject: 'MediSphere Verification OTP',
      text: `Hello ${name},\n\nYour One-Time Password (OTP) for MediSphere account verification is: {otp}\n\nThis OTP is valid for 5 minutes. Please do not share this code.\n\nThank you,\nMediSphere Team`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              .container { font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; color: #f8fafc; }
              .logo { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
              .title { font-size: 24px; font-weight: bold; color: #3b82f6; }
              .otp-box { font-size: 32px; font-weight: bold; text-align: center; margin: 30px 0; letter-spacing: 4px; padding: 15px; background: rgba(59, 130, 246, 0.15); border-radius: 8px; border: 1px dashed #3b82f6; color: #3b82f6; }
              .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #334155; padding-top: 15px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo">
                  <span class="title">MediSphere</span>
              </div>
              <p>Hello <strong>\${name}</strong>,</p>
              <p>Use the following One-Time Password (OTP) to complete your account registration.</p>
              <div class="otp-box">\${otp}</div>
              <p>This OTP is valid for <strong>5 minutes</strong>. For security reasons, please do not share this code with anyone.</p>
              <div class="footer">
                  © 2026 MediSphere Healthcare. All rights reserved.
              </div>
          </div>
      </body>
      </html>
      `
    };

    // Async mail transmission
    transporter.sendMail(mailOptions, (err) => {
      if (err) console.error('Failed to send verification email:', err);
    });

    return res.json({ success: true, message: 'OTP sent successfully!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Verify OTP
app.post('/api/accounts/verify-otp/', async (req, res) => {
  const { mobile_number, otp } = req.body;
  if (!mobile_number || !otp) {
    return res.status(400).json({ success: false, error: 'Mobile number and OTP are required' });
  }

  try {
    const session_otp = req.session.signup_otp;
    const session_mobile = req.session.signup_mobile_number;
    const session_verified = req.session.signup_verified;

    if (!session_otp || session_otp !== otp || session_mobile !== mobile_number || session_verified) {
      return res.status(400).json({ success: false, error: 'Invalid OTP or mobile number' });
    }

    const created_at = req.session.signup_created_at;
    if (created_at && (Date.now() - created_at > 300000)) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }

    req.session.signup_verified = true;
    return res.json({ success: true, message: 'OTP verified successfully!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Register
app.post('/api/accounts/register/', async (req, res) => {
  const { mobile_number, password, user_type, license_number } = req.body;
  if (!mobile_number || !password) {
    return res.status(400).json({ success: false, error: 'Mobile number and password are required' });
  }

  try {
    const session_otp = req.session.signup_otp;
    const session_mobile = req.session.signup_mobile_number;
    const session_verified = req.session.signup_verified;
    const session_name = req.session.signup_name;
    const session_email = req.session.signup_email;

    if (!session_verified || session_mobile !== mobile_number) {
      return res.status(400).json({ success: false, error: 'Please verify your OTP first' });
    }

    const created_at = req.session.signup_created_at;
    if (created_at && (Date.now() - created_at > 300000)) {
      return res.status(400).json({ success: false, error: 'Session expired. Please start registration again.' });
    }

    // Double check constraints
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [session_email]);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email address is already registered' });
    }

    const existingProfile = await dbGet('SELECT * FROM users WHERE mobile_number = ?', [mobile_number]);
    if (existingProfile) {
      return res.status(400).json({ success: false, error: 'Mobile number is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user directly in SQLite
    const result = await dbRun(
      `INSERT INTO users (name, mobile_number, email, password, user_type, license_number, is_approved, date_joined) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session_name,
        mobile_number,
        session_email,
        hashedPassword,
        user_type || 'citizen',
        user_type !== 'citizen' ? license_number : null,
        1,
        new Date().toISOString()
      ]
    );

    // Clean up verification records in session
    delete req.session.signup_otp;
    delete req.session.signup_name;
    delete req.session.signup_mobile_number;
    delete req.session.signup_email;
    delete req.session.signup_created_at;
    delete req.session.signup_verified;

    // Set Session
    req.session.userId = result.id;

    return res.json({
      success: true,
      message: 'Registration successful',
      user: {
        name: session_name,
        username: session_name,
        email: session_email,
        mobile_number: mobile_number,
        user_type: user_type || 'citizen',
        license_number: license_number
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Login
app.post('/api/accounts/login/', async (req, res) => {
  const { mobile_number, password } = req.body;
  if (!mobile_number || !password) {
    return res.status(400).json({ success: false, error: 'Mobile number and password are required' });
  }

  try {
    const profile = await dbGet('SELECT * FROM users WHERE mobile_number = ?', [mobile_number]);
    if (!profile) {
      return res.status(400).json({ success: false, error: 'Invalid mobile number or password' });
    }

    const isMatch = await bcrypt.compare(password, profile.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid mobile number or password' });
    }

    // Set Session
    req.session.userId = profile.id;

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        name: profile.name,
        username: profile.name,
        email: profile.email,
        mobile_number: profile.mobile_number,
        user_type: profile.user_type,
        license_number: profile.license_number
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Forgot Password - Send OTP
app.post('/api/accounts/forgot-password/', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ success: false, error: 'User not registered' });
    }

    const otp = generate_otp();
    req.session.forgot_email = email;
    req.session.forgot_otp = otp;
    req.session.forgot_created_at = Date.now();
    req.session.forgot_verified = false;

    const mailOptions = {
      from: process.env.DEFAULT_FROM_EMAIL || 'MediSphere <mayanksoni2352007@gmail.com>',
      to: email,
      subject: 'MediSphere Password Reset OTP',
      text: `Hello ${user.name},\n\nYour One-Time Password (OTP) for resetting your MediSphere password is: ${otp}\n\nThis OTP is valid for 5 minutes. Please do not share this code.\n\nThank you,\nMediSphere Team`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
      </head>
      <body style="background-color: #070b13; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070b13; padding: 40px 20px;">
              <tr>
                  <td align="center">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #0c1220; border: 1px solid #1e3a8a; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); overflow: hidden;">
                          <tr>
                              <td style="padding: 32px; text-align: center;">
                                  <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin-bottom: 20px;">
                                      <tr>
                                          <td align="center" valign="middle" style="background-color: #ef4444; width: 48px; height: 48px; border-radius: 12px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);">
                                              <img src="https://img.icons8.com/ios-filled/50/ffffff/key.png" width="24" height="24" style="display: block; margin: 0 auto; outline: none; border: none;" alt="Key Icon">
                                          </td>
                                      </tr>
                                  </table>
                                  
                                  <div style="font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 4px; letter-spacing: 0.5px;">Reset Password</div>
                                  <div style="font-size: 13px; color: #ef4444; font-weight: 600; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px;">MediSphere Security Service</div>
                                  
                                  <div style="text-align: left; border-top: 1px solid #1e293b; padding-top: 24px; margin-bottom: 20px;">
                                      <p style="margin: 0 0 12px 0; color: #f8fafc; font-size: 15px;">Hello <strong>${user.name}</strong>,</p>
                                      <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">You requested a password reset. Use the following One-Time Password (OTP) to verify your request. If you did not request this, you can ignore this email.</p>
                                  </div>
                                  
                                  <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 20px 0;">
                                      <tr>
                                          <td align="center" style="background-color: rgba(239, 68, 68, 0.1); border: 1px dashed #ef4444; border-radius: 12px; padding: 14px 28px; font-size: 32px; font-weight: bold; color: #ef4444; letter-spacing: 6px;">
                                              ${otp}
                                          </td>
                                      </tr>
                                  </table>
                                  
                                  <p style="color: #64748b; font-size: 11px; margin: 24px 0 0 0; line-height: 1.5; text-align: left;">⚠️ This OTP is valid for <strong>5 minutes</strong>. For security reasons, please do not share this code with anyone.</p>
                                  
                                  <div style="border-top: 1px solid #1e293b; margin-top: 30px; padding-top: 20px; font-size: 11px; color: #475569; text-align: center;">
                                      © 2026 MediSphere Healthcare. All rights reserved.
                                  </div>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
      `
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.error('Failed to send forgot password email:', err);
    });

    return res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Forgot Password - Verify OTP
app.post('/api/accounts/forgot-password/verify/', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP are required' });
  }

  try {
    const session_otp = req.session.forgot_otp;
    const session_email = req.session.forgot_email;
    const session_verified = req.session.forgot_verified;

    if (!session_otp || session_otp !== otp || session_email !== email || session_verified) {
      return res.status(400).json({ success: false, error: 'Invalid OTP or email' });
    }

    const created_at = req.session.forgot_created_at;
    if (created_at && (Date.now() - created_at > 300000)) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }

    req.session.forgot_verified = true;
    return res.json({ success: true, message: 'OTP verified successfully!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Forgot Password - Reset Password
app.post('/api/accounts/forgot-password/reset/', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const session_email = req.session.forgot_email;
    const session_verified = req.session.forgot_verified;

    if (!session_verified || session_email !== email) {
      return res.status(403).json({ success: false, error: 'Unauthorized password reset request' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await dbRun('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Clean up session
    delete req.session.forgot_email;
    delete req.session.forgot_otp;
    delete req.session.forgot_created_at;
    delete req.session.forgot_verified;

    return res.json({ success: true, message: 'Password reset successfully!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Logout
app.get('/api/accounts/logout/', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Failed to log out' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: 'Logged out successfully' });
  });
});

// 6. User Status
app.get('/api/accounts/user-status/', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ logged_in: false });
  }

  try {
    const profile = await dbGet('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    if (!profile) {
      return res.json({ logged_in: false });
    }

    return res.json({
      logged_in: true,
      user: {
        name: profile.name,
        username: profile.name,
        email: profile.email,
        mobile_number: profile.mobile_number,
        user_type: profile.user_type,
        license_number: profile.license_number,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        open_from: profile.open_from,
        closes_from: profile.closes_from,
        checkout_option: profile.checkout_option,
        specialization: profile.specialization,
        gender: profile.gender,
        age: profile.age,
        appointment_slot: profile.appointment_slot,
        appointment_slot_time: profile.appointment_slot_time
      }
    });
  } catch (err) {
    return res.status(500).json({ logged_in: false, error: err.message });
  }
});

// Helpdesk Support Routes
app.post('/api/accounts/helpdesk/send/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const profile = await dbGet('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const result = await dbRun(
      `INSERT INTO helpdesk_tickets (sender_email, sender_name, sender_type, message, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        profile.email,
        profile.name,
        profile.user_type,
        message.trim(),
        'requested',
        new Date().toISOString()
      ]
    );
    res.json({ success: true, ticket_id: result.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/accounts/helpdesk/my-tickets/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const profile = await dbGet('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    const tickets = await dbQuery('SELECT * FROM helpdesk_tickets WHERE sender_email = ? ORDER BY created_at ASC', [profile.email]);
    res.json({
      success: true,
      tickets: tickets.map(t => ({
        id: t.id,
        message: t.message,
        status: t.status,
        reply: t.reply || '',
        created_at: t.created_at
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/backend/api/helpdesk/all/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const tickets = await dbQuery('SELECT * FROM helpdesk_tickets ORDER BY created_at DESC');
    res.json({
      success: true,
      tickets: tickets.map(t => ({
        id: t.id,
        sender_email: t.sender_email,
        sender_name: t.sender_name,
        sender_type: t.sender_type,
        message: t.message,
        status: t.status,
        reply: t.reply || '',
        created_at: t.created_at.slice(0, 19).replace('T', ' ')
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/backend/api/helpdesk/open/:ticketId/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await dbRun('UPDATE helpdesk_tickets SET status = "open" WHERE id = ?', [req.params.ticketId]);
    res.json({ success: true, message: 'Ticket opened successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/backend/api/helpdesk/reject/:ticketId/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await dbRun('UPDATE helpdesk_tickets SET status = "rejected" WHERE id = ?', [req.params.ticketId]);
    res.json({ success: true, message: 'Ticket rejected successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/backend/api/helpdesk/resolve/:ticketId/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await dbRun('UPDATE helpdesk_tickets SET status = "resolved" WHERE id = ?', [req.params.ticketId]);
    res.json({ success: true, message: 'Ticket marked as resolved successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Backend Admin API routes
app.get('/backend/api/metrics/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const totalUsers = (await dbGet('SELECT COUNT(*) as count FROM users WHERE user_type != "admin"')).count;
    const citizens = (await dbGet('SELECT COUNT(*) as count FROM users WHERE user_type = "citizen"')).count;
    const doctors = (await dbGet('SELECT COUNT(*) as count FROM users WHERE user_type = "doctor"')).count;
    const pharmacies = (await dbGet('SELECT COUNT(*) as count FROM users WHERE user_type = "pharmacy"')).count;
    const diseases = (await dbGet('SELECT COUNT(*) as count FROM diseases')).count;
    const medicines = (await dbGet('SELECT COUNT(*) as count FROM medicines')).count;

    res.json({
      total_users: totalUsers,
      citizens,
      doctors,
      pharmacies,
      medicines,
      diseases,
      logs: 0
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/backend/api/diseases/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const diseases = await dbQuery('SELECT * FROM diseases ORDER BY name ASC');
    res.json({
      success: true,
      diseases: diseases.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description || '',
        causes: d.causes || '',
        symptoms: d.symptoms || '',
        risk_factors: d.risk_factors || '',
        complications: d.complications || '',
        treatment: d.treatment || ''
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/backend/api/medicines/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const medicines = await dbQuery('SELECT * FROM medicines ORDER BY name ASC');
    res.json({
      success: true,
      medicines: medicines.map(m => ({
        id: m.id,
        name: m.name,
        manufacturer: m.manufacturer,
        category: m.category,
        pack_size: m.pack_size,
        uses: m.uses || '',
        side_effects: m.side_effects || '',
        image_url: m.image_url || ''
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/backend/api/medicines/add/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { name, manufacturer, category, pack_size, uses, side_effects, image_url } = req.body;
    if (!name || !manufacturer) {
      return res.status(400).json({ success: false, error: 'Name and manufacturer are required.' });
    }

    const result = await dbRun(
      `INSERT INTO medicines (name, manufacturer, category, pack_size, uses, side_effects, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        manufacturer,
        category || 'tablet',
        pack_size || '10 Tablets',
        uses || '',
        side_effects || '',
        image_url || ''
      ]
    );

    res.json({ success: true, message: 'Medicine added successfully.', medicine: { id: result.id, name, manufacturer } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/backend/api/medicines/edit/:id/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { name, manufacturer, category, pack_size, uses, side_effects, image_url } = req.body;
    if (!name || !manufacturer) {
      return res.status(400).json({ success: false, error: 'Name and manufacturer are required.' });
    }

    await dbRun(
      `UPDATE medicines SET name = ?, manufacturer = ?, category = ?, pack_size = ?, uses = ?, side_effects = ?, image_url = ? 
       WHERE id = ?`,
      [
        name,
        manufacturer,
        category || 'tablet',
        pack_size || '10 Tablets',
        uses || '',
        side_effects || '',
        image_url || '',
        req.params.id
      ]
    );

    res.json({ success: true, message: 'Medicine updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/backend/api/medicines/delete/:id/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await dbRun('DELETE FROM medicines WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Medicine deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/backend/api/users/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const users = await dbQuery('SELECT * FROM users WHERE user_type != "admin" ORDER BY date_joined DESC');
    const user_data = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email || '-',
      mobile_number: u.mobile_number,
      user_type: u.user_type,
      license_number: u.license_number || '-',
      is_approved: u.is_approved !== 0,
      date_joined: u.date_joined ? u.date_joined.slice(0, 19).replace('T', ' ') : ''
    }));
    res.json({ success: true, users: user_data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/backend/api/pending-verifications/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const pending = await dbQuery('SELECT * FROM users WHERE is_approved = 0 ORDER BY date_joined DESC');
    const user_data = pending.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email || '-',
      mobile_number: u.mobile_number,
      user_type: u.user_type,
      license_number: u.license_number || '-',
      date_joined: u.date_joined ? u.date_joined.slice(0, 19).replace('T', ' ') : ''
    }));
    res.json({ success: true, users: user_data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/backend/api/approve-user/:userId/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const target = await dbGet('SELECT * FROM users WHERE id = ?', [req.params.userId]);
    if (!target) return res.status(404).json({ success: false, error: 'User not found.' });

    await dbRun('UPDATE users SET is_approved = 1 WHERE id = ?', [req.params.userId]);
    res.json({ success: true, message: `User ${target.name} approved successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/backend/api/logs/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const adminProfile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!adminProfile) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const logs = await dbQuery('SELECT * FROM activity_logs ORDER BY timestamp DESC');
    res.json({
      success: true,
      logs: logs.map(l => ({
        id: l.id,
        user_name: l.user_name || '-',
        user_email: l.user_email || '-',
        action: l.action,
        timestamp: l.timestamp ? l.timestamp.slice(0, 19).replace('T', ' ') : ''
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Custom Admin Console Routes
app.get('/backend/login/', (req, res) => {
  res.sendFile(path.join(__dirname, 'custom_admin', 'templates', 'custom_admin', 'login.html'));
});

app.post('/backend/login/', async (req, res) => {
  const { username, password } = req.body;

  // Check default credentials
  if (username === 'admin' && password === 'Admin') {
    try {
      let user = await dbGet('SELECT * FROM users WHERE email = "admin@medisphere.com"');
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin', salt);
        const result = await dbRun(
          `INSERT INTO users (name, mobile_number, email, password, user_type, is_approved, date_joined) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['Admin', '0000000000', 'admin@medisphere.com', hashedPassword, 'admin', 1, new Date().toISOString()]
        );
        user = { id: result.id };
      }

      req.session.userId = user.id;
      return res.redirect('/backend/');
    } catch (err) {
      return res.redirect('/backend/login/');
    }
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [username]);
    if (!user) return res.redirect('/backend/login/');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.redirect('/backend/login/');

    // Allow if user is admin
    if (user.user_type !== 'admin') {
      return res.redirect('/backend/login/');
    }

    req.session.userId = user.id;
    res.redirect('/backend/');
  } catch (err) {
    res.redirect('/backend/login/');
  }
});

app.get('/backend/', async (req, res) => {
  if (!req.session.userId) return res.redirect('/backend/login/');
  try {
    const profile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "admin"', [req.session.userId]);
    if (!profile) return res.redirect('/backend/login/');
    res.sendFile(path.join(__dirname, 'custom_admin', 'templates', 'custom_admin', 'dashboard.html'));
  } catch (err) { res.redirect('/backend/login/'); }
});

// Serve Dashboard page based on user type
app.get('/dashboard/', async (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  try {
    const profile = await dbGet('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    if (!profile) return res.redirect('/');
    const userType = profile.user_type;
    const dest = userType === 'pharmacy' ? 'pharmacies' : `${userType}s`;
    res.redirect(`/${dest}/`);
  } catch (err) { res.redirect('/'); }
});

app.get('/citizens/', async (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  try {
    const profile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "citizen"', [req.session.userId]);
    if (!profile) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'citizens', 'dashboard.html'));
  } catch (err) { res.redirect('/'); }
});

app.get('/doctors/', async (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  try {
    const profile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "doctor"', [req.session.userId]);
    if (!profile) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'doctors', 'dashboard.html'));
  } catch (err) { res.redirect('/'); }
});

app.get('/pharmacies/', async (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  try {
    const profile = await dbGet('SELECT * FROM users WHERE id = ? AND user_type = "pharmacy"', [req.session.userId]);
    if (!profile) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'pharmacies', 'dashboard.html'));
  } catch (err) { res.redirect('/'); }
});

// Serve Frontend Template
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'portal', 'templates', 'portal', 'index.html'));
});

// SPA routing fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/backend/api/')) return next();
  res.sendFile(path.join(__dirname, 'portal', 'templates', 'portal', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
