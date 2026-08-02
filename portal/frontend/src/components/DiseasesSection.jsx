import React, { useState } from 'react'

// Simple Inline SVG Icons for Diseases view
const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
)

const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
)

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
)

function DiseasesSection({ isSlider, themeColor }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const diseasesData = [
    {
      id: 1,
      name: 'Type 2 Diabetes',
      category: 'Chronic',
      severity: 'Moderate',
      symptoms: ['Excessive thirst', 'Frequent urination', 'Increased hunger', 'Unexplained fatigue'],
      treatment: ['Metformin', 'Insulin therapy', 'Regular exercise', 'Dietary monitoring'],
      specialist: 'Endocrinologist'
    },
    {
      id: 2,
      name: 'Hypertension (High Blood Pressure)',
      category: 'Chronic',
      severity: 'Low to Moderate',
      symptoms: ['Headaches (rare)', 'Shortness of breath', 'Nosebleeds', 'Often asymptomatic'],
      treatment: ['Amlodipine', 'Lisinopril', 'Low sodium diet', 'Regular cardiovascular checks'],
      specialist: 'Cardiologist'
    },
    {
      id: 3,
      name: 'Influenza (Flu)',
      category: 'Infectious',
      severity: 'Acute',
      symptoms: ['High fever', 'Chills & body muscle aches', 'Dry cough', 'Nasal congestion'],
      treatment: ['Rest and hydration', 'Paracetamol for fever', 'Oseltamivir (Antiviral)'],
      specialist: 'General Physician'
    },
    {
      id: 4,
      name: 'Asthma',
      category: 'Respiratory',
      severity: 'Variable',
      symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing fits'],
      treatment: ['Albuterol (Inhaler)', 'Fluticasone (Steroid)', 'Avoiding allergy triggers'],
      specialist: 'Pulmonologist'
    },
    {
      id: 5,
      name: 'Migraine',
      category: 'Neurological',
      severity: 'Moderate to High',
      symptoms: ['Severe throbbing headache', 'Nausea and vomiting', 'Sensitivity to light & sound'],
      treatment: ['Ibuprofen', 'Sumatriptan', 'Rest in a quiet dark room', 'Hydration'],
      specialist: 'Neurologist'
    },
    {
      id: 6,
      name: 'Gastroenteritis',
      category: 'Infectious',
      severity: 'Acute',
      symptoms: ['Watery diarrhea', 'Abdominal cramps', 'Nausea & vomiting', 'Low-grade fever'],
      treatment: ['Oral Rehydration Salts (ORS)', 'Probiotics', 'Bland diet (BRAT)', 'Rest'],
      specialist: 'Gastroenterologist'
    }
  ]

  const categories = ['All', 'Chronic', 'Infectious', 'Respiratory', 'Neurological']

  const filtered = isSlider ? diseasesData : diseasesData.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialist.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || d.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>

      {/* Search and Category Filter Bar */}
      {!isSlider && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by disease name or specialist..."
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

          {/* Categories */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            maxWidth: '100%'
          }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: activeCategory === c ? 'var(--color-primary-glow)' : 'var(--bg-secondary)',
                  color: activeCategory === c ? 'var(--color-primary)' : 'var(--text-secondary)',
                  borderColor: activeCategory === c ? 'var(--color-primary)' : 'var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid Display */}
      {filtered.length > 0 ? (
        <div className={isSlider ? 'theme-slider' : undefined} style={isSlider ? { display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px', width: '100%', '--slider-color': themeColor } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filtered.map(d => (
            <div key={d.id} className="card" style={{
              ...(isSlider ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', flex: '0 0 340px' } : { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '20px' }),
              '--hover-color': themeColor || 'var(--color-primary)',
              '--hover-glow': `0 0 20px ${(themeColor || 'var(--color-primary)')}40`
            }}>
              <div>
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '19px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '4px'
                    }}>
                      {d.name}
                    </h3>
                    <span className="badge" style={{ fontSize: '10px', backgroundColor: `${themeColor || 'var(--color-primary)'}15`, color: themeColor || 'var(--color-primary)', border: `1px solid ${themeColor || 'var(--color-primary)'}30` }}>{d.category}</span>
                  </div>
                  <span className="badge badge-warning" style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: 'var(--color-warning)'
                  }}>
                    {d.severity} Severity
                  </span>
                </div>

                {/* Symptoms list */}
                {!isSlider && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Key Symptoms</h4>
                      <ul style={{ paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {d.symptoms.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>

                    {/* Common Treatments */}
                    <div>
                      <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Care & First-line Treatments</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {d.treatment.map((t, idx) => (
                          <span key={idx} style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                            fontWeight: 500
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {isSlider && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                    Primary care and clinical management is directed by a qualified {d.specialist}.
                  </p>
                )}
              </div>

              {/* Consultation trigger */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px',
                marginTop: 'auto'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Recommended care</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{d.specialist}</span>
                </div>

                <button
                  className="btn"
                  onClick={() => alert(`Redirecting to list of specialists for: ${d.specialist}`)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: themeColor || 'var(--color-primary)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <HeartIcon />
                  <span>Consult Doctor</span>
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}>
            <ActivityIcon />
          </div>
          <h3>No Conditions Found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try typing a different health query or diagnostic category.</p>
        </div>
      )}
    </div>
  )
}

export default DiseasesSection
