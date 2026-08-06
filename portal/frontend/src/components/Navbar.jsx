import React from 'react'
import { HeartPulse, Sun, Moon, LogIn, Menu, X, MapPin } from 'lucide-react'

function NavButton({ item, isActive, activeColor, onClick, buttonRef }) {
  const [hover, setHover] = React.useState(false)
  
  const textColor = isActive 
    ? activeColor 
    : hover 
      ? (item.id === 'home' || item.id === 'about' ? 'var(--color-primary)' :
         item.id === 'medicines' ? '#3b82f6' :
         item.id === 'diseases' ? '#ef4444' :
         item.id === 'pharmacies' ? '#f59e0b' :
         item.id === 'doctors' ? '#10b981' :
         'var(--text-primary)')
      : 'var(--text-secondary)'

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="btn-ghost"
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        color: textColor,
        transition: 'color 0.2s ease',
        position: 'relative'
      }}
    >
      {item.label}
    </button>
  )
}

function Navbar({ activeTab, setActiveTab, openLogin, scrollToSection, pincode, openPincode, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const buttonRefs = React.useRef({})
  const [underlineStyle, setUnderlineStyle] = React.useState({ left: 0, width: 0, opacity: 0, backgroundColor: 'transparent' })

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'medicines', label: 'Medicines', sectionId: 'section-medicines' },
    { id: 'diseases', label: 'Diseases', sectionId: 'section-diseases' },
    { id: 'pharmacies', label: 'Pharmacies', sectionId: 'section-pharmacies' },
    { id: 'doctors', label: 'Doctors', sectionId: 'section-doctors' },
    { id: 'about', label: 'Contact Us' }
  ]

  const getThemeColor = (tabId) => {
    switch (tabId) {
      case 'home':
      case 'about':
        return 'var(--color-primary)'
      case 'medicines':
        return '#3b82f6'
      case 'diseases':
        return '#ef4444'
      case 'pharmacies':
        return '#f59e0b'
      case 'doctors':
        return '#10b981'
      default:
        return 'var(--color-primary)'
    }
  }

  const activeColor = getThemeColor(activeTab)

  React.useEffect(() => {
    const activeBtn = buttonRefs.current[activeTab]
    if (activeBtn) {
      const left = activeBtn.offsetLeft + 16
      const width = activeBtn.clientWidth - 32
      setUnderlineStyle({
        left: left,
        width: width,
        opacity: 1,
        backgroundColor: activeColor
      })
    } else {
      setUnderlineStyle(prev => ({ ...prev, opacity: 0 }))
    }
  }, [activeTab, activeColor])



  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: 'var(--glass-border)',
      padding: '0 24px',
      height: '74px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'background var(--transition-normal)'
    }}>
      {/* Left: Brand Logo */}
      <div
        onClick={() => {
          setActiveTab('home')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)',
        }}>
          <HeartPulse size={20} color="#ffffff" />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center'
        }}>
          Medi<span style={{ color: 'var(--color-primary)', fontWeight: 800, marginLeft: '1px' }}>Sphere</span>
        </span>
      </div>

      {/* Middle: Links (Desktop) */}
      <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            activeColor={activeColor}
            buttonRef={el => buttonRefs.current[item.id] = el}
            onClick={() => {
              if (item.id === 'home') {
                setActiveTab('home')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              } else if (item.id === 'about') {
                setActiveTab('about')
                const footer = document.querySelector('footer')
                if (footer) {
                  footer.scrollIntoView({ behavior: 'smooth' })
                }
              } else if (item.sectionId) {
                scrollToSection(item.sectionId, item.id)
              } else {
                setActiveTab(item.id)
              }
            }}
          />
        ))}
        {/* Animated sliding line */}
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            height: '2px',
            borderRadius: '2px',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, opacity 0.2s ease',
            pointerEvents: 'none',
            ...underlineStyle
          }}
        />
      </div>

      {/* Right: Theme Toggle & Login (Desktop) */}
      <div className="desktop-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Pincode Selector */}
        <div
          onClick={openPincode}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '0 12px',
            height: '40px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <MapPin size={16} color="var(--color-primary)" style={{ marginRight: '6px', flexShrink: 0 }} />
          <span style={{
            color: pincode ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 600
          }}>
            {pincode ? pincode : 'Pincode'}
          </span>
        </div>



        {/* Login/Logout Button */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Hi, {user.username}</span>
            <button onClick={onLogout} className="btn btn-primary" style={{ height: '40px', borderRadius: '10px' }}>
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={openLogin}
            className="btn btn-primary"
            style={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 20px',
              borderRadius: '10px',
              boxShadow: 'none'
            }}
          >
            <LogIn size={16} />
            <span>Login</span>
          </button>
        )}
      </div>

      {/* Mobile Toggle Button */}
      <div className="mobile-nav-toggle" style={{ display: 'none' }}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn-secondary"
          style={{ width: '40px', height: '40px', padding: 0 }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="glass" style={{
          position: 'absolute',
          top: '74px',
          left: 0,
          right: 0,
          borderBottom: 'var(--glass-border)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 99
        }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            const itemColor = getThemeColor(item.id)
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'home') {
                    setActiveTab('home')
                    setMobileMenuOpen(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  } else if (item.id === 'about') {
                    setActiveTab('about')
                    setMobileMenuOpen(false)
                    const footer = document.querySelector('footer')
                    if (footer) {
                      footer.scrollIntoView({ behavior: 'smooth' })
                    }
                  } else if (item.sectionId) {
                    setMobileMenuOpen(false)
                    scrollToSection(item.sectionId, item.id)
                  } else {
                    setActiveTab(item.id)
                    setMobileMenuOpen(false)
                  }
                }}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  background: 'transparent',
                  color: isActive ? itemColor : 'var(--text-primary)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            )
          })}
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Location</span>
            <div
              onClick={() => { openPincode(); setMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '8px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <MapPin size={16} color="var(--color-primary)" style={{ marginRight: '6px', flexShrink: 0 }} />
              <span style={{
                color: pincode ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600
              }}>
                {pincode ? pincode : 'Enter Pincode'}
              </span>
            </div>
          </div>
          {user ? (
            <button
              onClick={() => { onLogout(); setMobileMenuOpen(false); }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>Logout ({user.username})</span>
            </button>
          ) : (
            <button
              onClick={() => { openLogin(); setMobileMenuOpen(false); }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>
          )}
        </div>
      )}

      {/* Media Query Styling injected to override desktop display */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .desktop-controls {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar
