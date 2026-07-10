import React, { useState } from 'react'
import { Search, Building, MapPin, Phone, Star, ShieldCheck } from 'lucide-react'

function ClinicsSection({ isSlider, themeColor }) {
  const [search, setSearch] = useState('')
  const [facilityType, setFacilityType] = useState('All')

  const clinicsData = [
    { id: 1, name: 'Metro Health Clinic', type: 'Clinic', specialty: 'General Practice & Diagnostics', rating: 4.8, address: 'Building B, West Plaza, Sector 4', phone: '+1 (555) 019-8800', hours: '8:00 AM - 8:00 PM' },
    { id: 2, name: 'City General Hospital', type: 'Hospital', specialty: 'Multi-specialty, 24/7 Trauma Care & ER', rating: 4.9, address: '1 Central Square, Downtown', phone: '+1 (555) 019-9111', hours: 'Open 24/7' },
    { id: 3, name: 'St. Jude Children Specialty Hospital', type: 'Hospital', specialty: 'Pediatric Care & Neonatal Surgery', rating: 5.0, address: '88 North Ridge Drive, Ward 3', phone: '+1 (555) 012-2255', hours: 'Open 24/7' },
    { id: 4, name: 'Apex Dental & Eye Clinic', type: 'Clinic', specialty: 'Ophthalmology & Advanced Dentistry', rating: 4.6, address: 'Suite 3, East Block Galleria', phone: '+1 (555) 021-1400', hours: '9:00 AM - 6:00 PM' },
    { id: 5, name: 'Riverdale Diagnostics Lab', type: 'Diagnostic Center', specialty: 'Radiology, Pathology & Blood Testing', rating: 4.7, address: '405 Riverdale Road', phone: '+1 (555) 034-4780', hours: '7:00 AM - 9:00 PM' },
    { id: 6, name: 'Silvercrest Mental Wellness Center', type: 'Clinic', specialty: 'Psychiatry & Cognitive Therapy', rating: 4.9, address: '12 Quiet Valley, Southern Hills', phone: '+1 (555) 088-3399', hours: '9:00 AM - 5:00 PM' },
    { id: 7, name: 'Harborview Orthopedic & Spine Center', type: 'Hospital', specialty: 'Orthopedics, Joint Replacement & Physiotherapy', rating: 4.8, address: '17 Harborside Ave, Medical District', phone: '+1 (555) 077-6620', hours: '8:00 AM - 7:00 PM' },
  ]

  const types = ['All', 'Hospital', 'Clinic', 'Diagnostic Center']

  const filteredClinics = isSlider ? clinicsData : clinicsData.filter(clin => {
    const matchesSearch = clin.name.toLowerCase().includes(search.toLowerCase()) ||
      clin.specialty.toLowerCase().includes(search.toLowerCase())
    const matchesType = facilityType === 'All' || clin.type === facilityType
    return matchesSearch && matchesType
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
              placeholder="Search facility name or service..."
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

          {/* Filter Facility Type Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            maxWidth: '100%'
          }}>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFacilityType(t)}
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: facilityType === t ? 'var(--color-primary-glow)' : 'var(--bg-secondary)',
                  color: facilityType === t ? 'var(--color-primary)' : 'var(--text-secondary)',
                  borderColor: facilityType === t ? 'var(--color-primary)' : 'var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Clinics & Hospitals */}
      {filteredClinics.length > 0 ? (
        <div className={isSlider ? 'theme-slider' : undefined} style={isSlider ? { display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px', width: '100%', '--slider-color': themeColor } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredClinics.map(clin => (
            <div key={clin.id} className="card" style={{
              ...(isSlider ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', flex: '0 0 340px' } : { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '20px' }),
              '--hover-color': themeColor || 'var(--color-primary)',
              '--hover-glow': `0 0 20px ${(themeColor || 'var(--color-primary)')}40`
            }}>
              <div>
                {/* Facility Name & Rating */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '4px'
                    }}>
                      {clin.name}
                    </h3>
                    <span className="badge" style={{ fontSize: '10px', backgroundColor: `${themeColor || 'var(--color-primary)'}15`, color: themeColor || 'var(--color-primary)', border: `1px solid ${themeColor || 'var(--color-primary)'}30` }}>
                      {clin.type}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#f59e0b'
                  }}>
                    <span>★</span>
                    <span>{clin.rating}</span>
                  </div>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                  margin: '12px 0 16px 0',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 500
                }}>
                  Specialties: {clin.specialty}
                </p>

                {/* Details list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: themeColor || 'var(--color-primary)' }} />
                    <span>{clin.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: themeColor || 'var(--color-primary)' }} />
                    <span>{clin.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={14} style={{ color: themeColor || 'var(--color-primary)' }} />
                    <span>{clin.hours}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{
                display: 'flex',
                gap: '10px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px',
                marginTop: 'auto'
              }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => alert(`Calling facility reception at ${clin.phone}`)}
                  style={{ flex: 1 }}
                >
                  <Phone size={14} />
                  <span>Call Reception</span>
                </button>
                <button
                  className="btn"
                  onClick={() => alert(`Viewing department services for ${clin.name}`)}
                  style={{ flex: 1, backgroundColor: themeColor || 'var(--color-primary)', color: '#fff', cursor: 'pointer' }}
                >
                  <ShieldCheck size={14} />
                  <span>View Services</span>
                </button>
              </div>
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
          <Building size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No Facilities Found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try selecting a different category or refining your search term.</p>
        </div>
      )}
    </div>
  )
}

export default ClinicsSection
