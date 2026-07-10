import React, { useState } from 'react'
import { X, Lock, Mail, Eye, EyeOff, HeartPulse } from 'lucide-react'

function LoginModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      alert('Please fill in all fields.')
      return
    }
    alert(`Successfully signed in as: ${email}`)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Modal Card */}
      <div className="glass" style={{
        width: '100%',
        maxWidth: '420px',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-ghost"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '32px',
            height: '32px',
            padding: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={18} />
        </button>

        {/* Logo and Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            <HeartPulse size={28} color="#ffffff" />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '6px'
          }}>
            Welcome Back
          </h2>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            Enter your credentials to access your portal account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email input group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail style={{
                position: 'absolute',
                left: '16px',
                color: 'var(--text-muted)'
              }} size={16} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 46px',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Password input group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock style={{
                position: 'absolute',
                left: '16px',
                color: 'var(--text-muted)'
              }} size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 46px 12px 46px',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span>Remember me</span>
            </label>
            <a 
              href="#forgot" 
              onClick={(e) => { e.preventDefault(); alert('Password reset flow simulated.') }}
              style={{
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
              marginTop: '8px',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
          >
            Sign In
          </button>
        </form>

        {/* Footer/Register link */}
        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px'
        }}>
          Don't have an account?{' '}
          <a
            href="#signup"
            onClick={(e) => { e.preventDefault(); alert('Account signup flow simulated.') }}
            style={{
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Sign up now
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
