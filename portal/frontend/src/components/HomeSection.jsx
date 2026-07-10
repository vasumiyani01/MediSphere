import React, { useState } from 'react'
import { Search, Pill, Users, MapPin, Building, ArrowRight, ShieldAlert, Activity, Heart, Clock } from 'lucide-react'
import MedicinesSection from './MedicinesSection'
import DiseasesSection from './DiseasesSection'
import PharmaciesSection from './PharmaciesSection'
import DoctorsSection from './DoctorsSection'
import ClinicsSection from './ClinicsSection'

function HomeSection({ onNavigate, openLogin }) {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    { label: 'Medicines Available', value: '12,480+', icon: Pill, color: '#3b82f6' },
    { label: 'Diseases Directory', value: '840+', icon: ShieldAlert, color: '#ef4444' },
    { label: 'Verified Doctors', value: '1,850+', icon: Users, color: '#10b981' },
    { label: 'Partner Pharmacies', value: '420+', icon: MapPin, color: '#f59e0b' },
    { label: 'Active Clinics', value: '310+', icon: Building, color: '#a855f7' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* Hero Search Banner */}
      <div className="glass hero-banner" style={{
        padding: '70px 40px',
        borderRadius: '24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Glowing Elements */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '100px',
          background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '44px',
          fontWeight: 800,
          marginBottom: '12px',
          lineHeight: '1.2',
          background: 'linear-gradient(135deg, var(--text-primary) 30%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Welcome to MediSphere
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '18px',
          fontWeight: 600,
          maxWidth: '600px',
          margin: '0 auto 8px auto',
          lineHeight: '1.5'
        }}>
          AI-Powered Smart Healthcare Ecosystem
        </p>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '14px',
          maxWidth: '560px',
          margin: '0 auto 28px auto',
          lineHeight: '1.5',
          opacity: 0.85
        }}>
          Access direct databases for verified healthcare services. Instantly lookup drug details, local clinics, pharmacy inventory, and doctor availability.
        </p>

        {/* Global Search Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} size={20} />
          <input
            type="text"
            placeholder="Search pills, physician names, health specialties, medical centers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px 16px 54px',
              borderRadius: '16px',
              fontSize: '16px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          />
          <button
            onClick={() => {
              // Trigger navigation to medicines tab if searching for quick demo
              onNavigate('medicines')
            }}
            className="btn btn-primary"
            style={{
              position: 'absolute',
              right: '8px',
              padding: '10px 20px',
              borderRadius: '10px'
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon
          return (
            <div key={idx} className="card stat-card" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              paddingTop: '24px',
              '--hover-color': stat.color,
              '--hover-glow': '0 0 20px ' + stat.color + '40'
            }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{stat.label}</span>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${stat.color}15`,
                  color: stat.color
                }}>
                  <IconComponent size={18} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  {stat.value}
                </h3>
              </div>
            </div>
          )
        })}
      </div>

      {/* Explore Medicines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: 'linear-gradient(to bottom, #3b82f6, #60a5fa)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Explore Medicines</h3>
          </div>
          <button onClick={openLogin} className="btn btn-secondary" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
            <span>View All</span>
            <ArrowRight size={12} />
          </button>
        </div>
        <MedicinesSection isSlider={true} themeColor="#3b82f6" />
      </div>

      {/* Explore Diseases */}
      <div id="section-diseases" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px', scrollMarginTop: '90px', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: 'linear-gradient(to bottom, #ef4444, #f87171)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Explore Diseases</h3>
          </div>
          <button onClick={openLogin} className="btn btn-secondary" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
            <span>View All</span>
            <ArrowRight size={12} />
          </button>
        </div>
        <DiseasesSection isSlider={true} themeColor="#ef4444" />
      </div>

      {/* Explore Pharmacies */}
      <div id="section-pharmacies" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px', scrollMarginTop: '90px', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: 'linear-gradient(to bottom, #f59e0b, #fbbf24)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Explore Pharmacies</h3>
          </div>
          <button onClick={openLogin} className="btn btn-secondary" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
            <span>View All</span>
            <ArrowRight size={12} />
          </button>
        </div>
        <PharmaciesSection isSlider={true} themeColor="#f59e0b" />
      </div>

      {/* Explore Doctors */}
      <div id="section-doctors" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px', scrollMarginTop: '90px', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: 'linear-gradient(to bottom, #10b981, #34d399)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Explore Doctors</h3>
          </div>
          <button onClick={openLogin} className="btn btn-secondary" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
            <span>View All</span>
            <ArrowRight size={12} />
          </button>
        </div>
        <DoctorsSection isSlider={true} themeColor="#10b981" />
      </div>

      {/* Explore Clinics */}
      <div id="section-clinics" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px', scrollMarginTop: '90px', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: 'linear-gradient(to bottom, #a855f7, #c084fc)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Explore Clinics</h3>
          </div>
          <button onClick={openLogin} className="btn btn-secondary" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
            <span>View All</span>
            <ArrowRight size={12} />
          </button>
        </div>
        <ClinicsSection isSlider={true} themeColor="#a855f7" />
      </div>
    </div>
  )
}

export default HomeSection
