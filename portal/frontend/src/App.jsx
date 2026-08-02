import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import HomeSection from './components/HomeSection'
import LoginModal from '../../../../accounts/templates/accounts/LoginModal'
import { HeartPulse } from 'lucide-react'

function FooterLink({ href, label, hoverColor, onClick }) {
  const [hover, setHover] = React.useState(false)
  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textDecoration: 'none',
        color: hover ? hoverColor : 'var(--text-secondary)',
        fontSize: '13px',
        transition: 'color 0.2s ease'
      }}
    >
      {label}
    </a>
  )
}

function PincodeModal({ isOpen, onClose, pincode, setPincode }) {
  const [tempPincode, setTempPincode] = useState(pincode)

  // Sync tempPincode with current pincode when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempPincode(pincode)
    }
  }, [isOpen, pincode])

  if (!isOpen) return null

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
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="glass animate-fade-in" style={{
        width: '100%',
        maxWidth: '360px',
        borderRadius: '20px',
        padding: '30px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }}>Enter Location Pincode</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Provide a 6-digit pincode to locate services nearby</p>
        </div>
        
        {/* Input */}
        <input
          type="text"
          maxLength={6}
          placeholder="e.g. 380015"
          value={tempPincode}
          onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '16px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: '4px',
            outline: 'none'
          }}
        />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={onClose} 
            className="btn btn-secondary" 
            style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px' }}
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (tempPincode.length !== 6) {
                alert('Pincode must be exactly 6 digits!')
                return
              }
              setPincode(tempPincode)
              onClose()
            }} 
            className="btn btn-primary" 
            style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [pincode, setPincode] = useState('')
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false)
  const isScrollingRef = React.useRef(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  const scrollToSection = (sectionId, tabId = sectionId) => {
    isScrollingRef.current = true
    setActiveTab(tabId)
    setTimeout(() => {
      const el = document.getElementById(`section-${sectionId}`) || document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => {
        isScrollingRef.current = false
      }, 800)
    }, 50)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return

      const scrollPosition = window.scrollY
      const viewportHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Bottom of the page fallback -> highlight Contact Us
      if (scrollPosition + viewportHeight >= documentHeight - 60) {
        setActiveTab('about')
        return
      }

      // Top of the page fallback -> highlight Home
      if (scrollPosition < 150) {
        setActiveTab('home')
        return
      }

      const sections = [
        { id: 'medicines', elId: 'section-medicines' },
        { id: 'diseases', elId: 'section-diseases' },
        { id: 'pharmacies', elId: 'section-pharmacies' },
        { id: 'doctors', elId: 'section-doctors' }
      ]

      const focusLine = 140
      let currentSection = 'home'

      for (const sec of sections) {
        const el = document.getElementById(sec.elId)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= focusLine) {
            currentSection = sec.id
          }
        }
      }

      setActiveTab(currentSection)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const renderActiveSection = () => {
    return <HomeSection onNavigate={scrollToSection} openLogin={() => setIsLoginOpen(true)} />
  }

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background Decorative Blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openLogin={() => setIsLoginOpen(true)}
        scrollToSection={scrollToSection}
        pincode={pincode}
        openPincode={() => setIsPincodeModalOpen(true)}
      />

      <main style={{ flex: 1, padding: '24px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          {renderActiveSection()}
        </div>
      </main>

      {/* Footer */}
      <footer id="section-about" className="glass" style={{ padding: '30px 0 10px 0', borderTop: 'var(--glass-border)', fontSize: '14px', color: 'var(--text-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px' }}>
            {/* Left Side: Brand Logo, Tagline and Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px', alignItems: 'flex-start', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)',
                }}>
                  <HeartPulse size={18} color="#ffffff" />
                </div>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  Medi<span style={{ color: 'var(--color-primary)', fontWeight: 800, marginLeft: '1px' }}>Sphere</span>
                </span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                AI-Powered Smart Healthcare Ecosystem
              </p>
              <p style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-muted)', margin: 0 }}>
                Access direct databases for verified healthcare services. Instantly lookup drug details, pharmacy inventory, and doctor availability.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', textAlign: 'left' }}>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '4px' }}>Quick Links</strong>
                <FooterLink href="#medicines" label="Medicines" hoverColor="#3b82f6" onClick={(e) => { e.preventDefault(); scrollToSection('medicines'); }} />
                <FooterLink href="#diseases" label="Diseases" hoverColor="#ef4444" onClick={(e) => { e.preventDefault(); scrollToSection('diseases'); }} />
                <FooterLink href="#pharmacies" label="Pharmacies" hoverColor="#f59e0b" onClick={(e) => { e.preventDefault(); scrollToSection('pharmacies'); }} />
                <FooterLink href="#doctors" label="Doctors" hoverColor="#10b981" onClick={(e) => { e.preventDefault(); scrollToSection('doctors'); }} />
              </div>
            </div>

            {/* Right Side: Contact Us */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', textAlign: 'right' }}>
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '4px' }}>Contact Us</strong>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+91 9601070101</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>medisphere@gmail.com</span>
              </div>
              <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
                <a href="https://wa.me/919601070101" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp" title="WhatsApp">
                  <svg className="social-icon whatsapp" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.411.002 12.048c0 2.12.54 4.19 1.566 6.02L0 24l6.125-1.606a11.848 11.848 0 005.922 1.577h.005c6.632 0 12.042-5.411 12.045-12.048a11.82 11.82 0 00-3.535-8.414z" />
                  </svg>
                </a>
                <a href="https://instagram.com/vasumiyani01" target="_blank" rel="noopener noreferrer" className="social-icon instagram" title="Instagram">
                  <svg className="social-icon instagram" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="https://x.com/vasumiyani01" target="_blank" rel="noopener noreferrer" className="social-icon x-logo" title="X">
                  <svg className="social-icon x-logo" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://facebook.com/vasumiyani01" target="_blank" rel="noopener noreferrer" className="social-icon facebook" title="Facebook">
                  <svg className="social-icon facebook" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Divider & Copyright */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', paddingBottom: '10px', marginTop: '-15px', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              © MediSphere 2026. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
      <PincodeModal isOpen={isPincodeModalOpen} onClose={() => setIsPincodeModalOpen(false)} pincode={pincode} setPincode={setPincode} />
    </div>
  )
}

export default App
