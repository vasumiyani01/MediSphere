import React, { useState } from 'react'
import { Search, UserCheck, Calendar, Star, DollarSign, Award } from 'lucide-react'

function DoctorsSection({ isSlider, themeColor }) {
  const [search, setSearch] = useState('')
  const [activeSpecialty, setActiveSpecialty] = useState('All')

  const doctorsData = [
    { id: 1, name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', exp: '12 years', rating: 4.9, fee: '$80', availability: 'Today', location: 'Heart Center A', initials: 'SJ' },
    { id: 2, name: 'Dr. Robert Chen', specialty: 'Pediatrics', exp: '8 years', rating: 4.8, fee: '$60', availability: 'Tomorrow', location: 'Children Wing 2', initials: 'RC' },
    { id: 3, name: 'Dr. Elena Rostova', specialty: 'Dermatology', exp: '15 years', rating: 4.9, fee: '$90', availability: 'Today', location: 'Skin Clinic B', initials: 'ER' },
    { id: 4, name: 'Dr. Marcus Vance', specialty: 'General Medicine', exp: '10 years', rating: 4.7, fee: '$50', availability: 'Monday', location: 'OPD Block 1', initials: 'MV' },
    { id: 5, name: 'Dr. Aaliyah Jackson', specialty: 'Neurology', exp: '18 years', rating: 5.0, fee: '$120', availability: 'Today', location: 'Neuro Suite 4', initials: 'AJ' },
    { id: 6, name: 'Dr. David Kim', specialty: 'Orthopedics', exp: '9 years', rating: 4.6, fee: '$75', availability: 'Thursday', location: 'Bone & Joint Annex', initials: 'DK' },
  ]

  const specialties = ['All', 'Cardiology', 'Pediatrics', 'Dermatology', 'General Medicine', 'Neurology', 'Orthopedics']

  const filteredDoctors = isSlider ? doctorsData : doctorsData.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase())
    const matchesSpecialty = activeSpecialty === 'All' || doc.specialty === activeSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>

      {/* Search and Filters Bar */}
      {!isSlider && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} size={18} />
            <input
              type="text"
              placeholder="Search doctor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 46px',
                borderRadius: '12px',
                fontSize: '14px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)'
              }}
            />
          </div>

          {/* Specialties Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            maxWidth: '100%'
          }}>
            {specialties.map(spec => (
              <button
                key={spec}
                onClick={() => setActiveSpecialty(spec)}
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: activeSpecialty === spec ? 'var(--color-primary-glow)' : 'var(--bg-secondary)',
                  color: activeSpecialty === spec ? 'var(--color-primary)' : 'var(--text-secondary)',
                  borderColor: activeSpecialty === spec ? 'var(--color-primary)' : 'var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Doctor Profiles */}
      {filteredDoctors.length > 0 ? (
        <div className={isSlider ? 'theme-slider' : undefined} style={isSlider ? { display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px', width: '100%', '--slider-color': themeColor } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredDoctors.map(doc => (
            <div key={doc.id} className="card" style={{
              ...(isSlider ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', flex: '0 0 340px' } : { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '20px' }),
              '--hover-color': themeColor || 'var(--color-primary)',
              '--hover-glow': `0 0 20px ${(themeColor || 'var(--color-primary)')}40`
            }}>
              <div>
                {/* Profile Header (Dummy Avatar & Basic Info) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${themeColor || 'var(--color-primary)'} 0%, ${themeColor || 'var(--color-primary)'}bb 100%)`,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '18px',
                    boxShadow: `0 4px 10px ${(themeColor || 'var(--color-primary)')}30`
                  }}>
                    {doc.initials}
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '2px'
                    }}>
                      {doc.name}
                    </h3>
                    <span className="badge" style={{ fontSize: '11px', backgroundColor: `${themeColor || 'var(--color-primary)'}15`, color: themeColor || 'var(--color-primary)', border: `1px solid ${themeColor || 'var(--color-primary)'}30` }}>
                      {doc.specialty}
                    </span>
                  </div>
                </div>

                {/* Info List */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={14} style={{ color: themeColor || 'var(--color-primary)' }} />
                      <span>Experience</span>
                    </div>
                    <strong style={{ color: 'var(--text-primary)' }}>{doc.exp}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={14} style={{ color: '#f59e0b' }} />
                      <span>Patient Rating</span>
                    </div>
                    <strong style={{ color: 'var(--text-primary)' }}>{doc.rating} / 5.0</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: themeColor || 'var(--color-primary)' }} />
                      <span>Next Available Slot</span>
                    </div>
                    <strong style={{ color: 'var(--color-success)' }}>{doc.availability}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DollarSign size={14} style={{ color: themeColor || 'var(--color-primary)' }} />
                      <span>Consultation Fee</span>
                    </div>
                    <strong style={{ color: 'var(--text-primary)' }}>{doc.fee}</strong>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="btn"
                onClick={() => alert(`Opening appointment schedule for ${doc.name} (${doc.specialty})`)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '10px',
                  padding: '12px',
                  backgroundColor: themeColor || 'var(--color-primary)',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <Calendar size={16} />
                <span>Book Appointment</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass" style={{
          padding: '60px 24px',
          borderRadius: '16px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <UserCheck size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No Doctors Found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try searching a different name or checking another specialty tab.</p>
        </div>
      )}
    </div>
  )
}

export default DoctorsSection
