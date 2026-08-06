import React, { useState, useEffect } from 'react'
import { X, Lock, Mail, Eye, EyeOff, HeartPulse, Phone } from 'lucide-react'

function LoginModal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('signin') // 'signin', 'signup', or 'forgot'
  const [step, setStep] = useState(1) // for signup

  // Common states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sign In fields
  const [signInMobile, setSignInMobile] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [showSignInPassword, setShowSignInPassword] = useState(false)

  // Sign Up fields
  const [signUpUsername, setSignUpUsername] = useState('')
  const [signUpMobile, setSignUpMobile] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpOtp, setSignUpOtp] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('')
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false)
  const [signUpUserType, setSignUpUserType] = useState('citizen')
  const [signUpLicenseNumber, setSignUpLicenseNumber] = useState('')

  // Forgot Password fields
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotOtpValues, setForgotOtpValues] = useState(['', '', '', '', '', ''])
  const [forgotPassword, setForgotPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false)
  const [forgotCountdown, setForgotCountdown] = useState(0)

  // Timer for signup OTP cooldown
  const [countdown, setCountdown] = useState(0)
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  useEffect(() => {
    let timer
    if (forgotCountdown > 0) {
      timer = setTimeout(() => setForgotCountdown(forgotCountdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [forgotCountdown])

  const handleEnterKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const form = e.target.form
      if (!form) return
      const index = Array.prototype.indexOf.call(form, e.target)
      for (let i = index + 1; i < form.elements.length; i++) {
        const el = form.elements[i]
        if (el && (el.tagName === 'INPUT' || el.tagName === 'BUTTON') && !el.disabled && el.type !== 'hidden') {
          el.focus()
          break
        }
      }
    }
  }

  const handleForgotSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!forgotEmail) {
      setError('Please enter your email address.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/accounts/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      })
      const data = await response.json()
      if (data.success) {
        setForgotStep(2)
        setForgotCountdown(30)
        setForgotOtpValues(['', '', '', '', '', ''])
        setForgotOtp('')
      } else {
        setError(data.error || 'Failed to send OTP.')
      }
    } catch (err) {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotResendOtp = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/accounts/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      })
      const data = await response.json()
      if (data.success) {
        setForgotCountdown(30)
        setForgotOtpValues(['', '', '', '', '', ''])
        setForgotOtp('')
        alert('OTP resent successfully!')
      } else {
        setError(data.error || 'Failed to resend OTP.')
      }
    } catch (err) {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (forgotOtp.length !== 6) {
      setError('Please enter a 6-digit OTP.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/accounts/forgot-password/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp })
      })
      const data = await response.json()
      if (data.success) {
        setForgotStep(3)
      } else {
        setError(data.error || 'Invalid OTP.')
      }
    } catch (err) {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (forgotPassword !== forgotConfirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (forgotPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/accounts/forgot-password/reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, password: forgotPassword })
      })
      const data = await response.json()
      if (data.success) {
        alert('Password reset successful! Please sign in with your new password.')
        setMode('signin')
        setError('')
      } else {
        setError(data.error || 'Failed to reset password.')
      }
    } catch (err) {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotOtpChange = (value, idx) => {
    const cleanValue = value.replace(/\D/g, '')
    const newOtpValues = [...forgotOtpValues]
    newOtpValues[idx] = cleanValue
    setForgotOtpValues(newOtpValues)
    setForgotOtp(newOtpValues.join(''))

    if (cleanValue && idx < 5) {
      const nextInput = document.getElementById(`forgot-otp-box-${idx + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleForgotOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!forgotOtpValues[idx] && idx > 0) {
        const prevInput = document.getElementById(`forgot-otp-box-${idx - 1}`)
        if (prevInput) {
          prevInput.focus()
          const newOtpValues = [...forgotOtpValues]
          newOtpValues[idx - 1] = ''
          setForgotOtpValues(newOtpValues)
          setForgotOtp(newOtpValues.join(''))
        }
      }
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: signInMobile,
          password: signInPassword
        })
      })
      const data = await response.json()
      if (data.success) {
        onLoginSuccess(data.user)
        onClose()
      } else {
        setError(data.error || 'Invalid credentials.')
      }
    } catch (err) {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div className="glass animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        borderRadius: '24px',
        padding: '32px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Close button */}
        <button onClick={onClose} className="btn-ghost" style={{
          position: 'absolute', top: '16px', right: '16px',
          width: '32px', height: '32px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', borderRadius: '50%'
        }}>
          <X size={16} />
        </button>

        {/* Title and Icon */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            width: '44px', height: '44px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px auto', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <HeartPulse size={22} color="#ffffff" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800 }}>
            {mode === 'signin' ? 'Welcome Back' : mode === 'forgot' ? 'Reset Password' : 'Create Account'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {mode === 'signin'
              ? 'Sign in to access your healthcare portal'
              : mode === 'forgot'
                ? forgotStep === 1
                  ? 'Enter email address to verify identity'
                  : forgotStep === 2
                    ? `Enter the OTP sent to ${forgotEmail}`
                    : 'Create a new secure password'
                : 'Create a password for your account'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Sign In Mode */}
        {mode === 'signin' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Mobile Number</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                  <Phone size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Enter registered mobile number"
                  value={signInMobile}
                  onChange={e => setSignInMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  required
                  style={{ width: '100%', padding: '12px 14px 12px 42px' }}
                  autoComplete="off"
                  onKeyDown={handleEnterKey}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                  <Lock size={14} />
                </span>
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={e => setSignInPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 42px 12px 42px' }}
                  autoComplete="new-password"
                  onKeyDown={handleEnterKey}
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                >
                  {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px' }}>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); setMode('forgot'); setForgotStep(1); setError(''); }} style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </a>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px', borderRadius: '10px', marginTop: '10px', width: '100%' }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
              Don't have an account?{' '}
              <a href="#signup" onClick={(e) => { e.preventDefault(); setMode('signup'); setStep(1); setError(''); }} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Sign up now
              </a>
            </div>
          </form>
        )}

        {/* Forgot Password Mode */}
        {mode === 'forgot' && (
          <div>
            {/* Stepper Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: forgotStep >= 1 ? 'var(--color-primary)' : 'var(--bg-tertiary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>1</div>
              <div style={{ width: '40px', height: '2px', background: forgotStep >= 2 ? 'var(--color-primary)' : 'var(--border-color)' }} />
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: forgotStep >= 2 ? 'var(--color-primary)' : 'var(--bg-tertiary)', color: forgotStep >= 2 ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>2</div>
              <div style={{ width: '40px', height: '2px', background: forgotStep >= 3 ? 'var(--color-primary)' : 'var(--border-color)' }} />
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: forgotStep >= 3 ? 'var(--color-primary)' : 'var(--bg-tertiary)', color: forgotStep >= 3 ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>3</div>
            </div>

            {forgotStep === 1 && (
              <form onSubmit={handleForgotSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 14px 12px 42px' }}
                      onKeyDown={handleEnterKey}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px', borderRadius: '10px', marginTop: '10px', width: '100%' }}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleForgotVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Enter 6-Digit OTP</label>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '10px 0' }}>
                    {forgotOtpValues.map((val, idx) => (
                      <input
                        key={idx}
                        id={`forgot-otp-box-${idx}`}
                        type="text"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleForgotOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleForgotOtpKeyDown(e, idx)}
                        required
                        style={{
                          width: '46px',
                          height: '48px',
                          textAlign: 'center',
                          fontSize: '20px',
                          fontWeight: 'bold',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          outline: 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleForgotResendOtp}
                    disabled={forgotCountdown > 0 || loading}
                    style={{
                      background: 'none', border: 'none', color: forgotCountdown > 0 ? 'var(--text-muted)' : 'var(--color-primary)',
                      fontWeight: 600, cursor: forgotCountdown > 0 ? 'default' : 'pointer', fontSize: '13px'
                    }}
                  >
                    {forgotCountdown > 0 ? `Resend OTP in ${forgotCountdown}s` : 'Resend OTP'}
                  </button>
                </div>
                <button type="submit" disabled={loading || forgotOtp.length !== 6} className="btn btn-primary" style={{ padding: '12px', borderRadius: '10px', marginTop: '10px', width: '100%' }}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleForgotResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>New Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                      <Lock size={14} />
                    </span>
                    <input
                      type={showForgotPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={forgotPassword}
                      onChange={e => setForgotPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 42px 12px 42px' }}
                      onKeyDown={handleEnterKey}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(!showForgotPassword)}
                      style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                    >
                      {showForgotPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                      <Lock size={14} />
                    </span>
                    <input
                      type={showForgotConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={forgotConfirmPassword}
                      onChange={e => setForgotConfirmPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 42px 12px 42px' }}
                      onKeyDown={handleEnterKey}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                    >
                      {showForgotConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px', borderRadius: '10px', marginTop: '10px', width: '100%' }}>
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            )}

            <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
              Back to{' '}
              <a href="#login" onClick={(e) => { e.preventDefault(); setMode('signin'); setError(''); }} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Sign in
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginModal
