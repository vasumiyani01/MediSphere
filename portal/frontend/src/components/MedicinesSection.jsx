import React, { useState } from 'react'
import { Search, Pill, ShieldCheck, Heart, ShoppingBag, Plus } from 'lucide-react'

function MedicinesSection({ isSlider, themeColor }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const medicinesData = [
    { id: 1, name: 'Paracetamol', generic: 'Acetaminophen', category: 'Analgesic', dose: '500mg', form: 'Tablet', price: '$4.50', stock: 'In Stock', count: 240, description: 'Used to treat mild to moderate pain (from headaches, menstrual periods, toothaches) and to reduce fever.' },
    { id: 2, name: 'Amoxicillin', generic: 'Amoxicillin Trihydrate', category: 'Antibiotic', dose: '250mg', form: 'Capsule', price: '$12.00', stock: 'Low Stock', count: 18, description: 'Penicillin antibiotic used to treat bacterial infections, such as chest infections and dental abscesses.' },
    { id: 3, name: 'Cetirizine', generic: 'Cetirizine Hydrochloride', category: 'Antihistamine', dose: '10mg', form: 'Tablet', price: '$6.80', stock: 'In Stock', count: 125, description: 'Non-drowsy allergy relief medicine used to relieve symptoms of hay fever and hives.' },
    { id: 4, name: 'Atorvastatin', generic: 'Atorvastatin Calcium', category: 'Cardiovascular', dose: '20mg', form: 'Tablet', price: '$18.20', stock: 'In Stock', count: 160, description: 'Statins used to lower cholesterol if you have been diagnosed with high cholesterol or heart disease.' },
    { id: 5, name: 'Metformin', generic: 'Metformin Hydrochloride', category: 'Antidiabetic', dose: '500mg', form: 'Tablet', price: '$9.40', stock: 'In Stock', count: 320, description: 'Used to treat type 2 diabetes, and to help prevent type 2 diabetes if you are at high risk of developing it.' },
    { id: 6, name: 'Ibuprofen', generic: 'Ibuprofen', category: 'Analgesic', dose: '400mg', form: 'Softgel', price: '$5.20', stock: 'Out of Stock', count: 0, description: 'Non-steroidal anti-inflammatory drug (NSAID) used to relieve pain from headache, dental pain, muscle aches.' },
  ]

  const categories = ['All', 'Analgesic', 'Antibiotic', 'Antihistamine', 'Cardiovascular', 'Antidiabetic']

  const filteredMedicines = isSlider ? medicinesData : medicinesData.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(search.toLowerCase()) ||
      med.generic.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || med.category === activeCategory
    return matchesSearch && matchesCategory
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
              placeholder="Search by brand or generic name..."
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

          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            maxWidth: '100%'
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: activeCategory === cat ? 'var(--color-primary-glow)' : 'var(--bg-secondary)',
                  color: activeCategory === cat ? 'var(--color-primary)' : 'var(--text-secondary)',
                  borderColor: activeCategory === cat ? 'var(--color-primary)' : 'var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Medicines */}
      {filteredMedicines.length > 0 ? (
        <div className={isSlider ? 'theme-slider' : undefined} style={isSlider ? { display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px', width: '100%', '--slider-color': themeColor } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredMedicines.map(med => (
            <div key={med.id} className="card" style={{
              ...(isSlider ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', flex: '0 0 320px' } : { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', height: '100%' }),
              '--hover-color': themeColor || 'var(--color-primary)',
              '--hover-glow': `0 0 20px ${(themeColor || 'var(--color-primary)')}40`
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: themeColor ? `${themeColor}15` : 'var(--color-primary-glow)',
                      color: themeColor || 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Pill size={16} />
                    </div>
                    <div>
                      <span className="badge" style={{ fontSize: '10px', backgroundColor: `${themeColor || 'var(--color-primary)'}15`, color: themeColor || 'var(--color-primary)', border: `1px solid ${themeColor || 'var(--color-primary)'}30` }}>{med.form}</span>
                    </div>
                  </div>

                  {/* Stock status badge */}
                  <span className={`badge ${med.stock === 'In Stock' ? 'badge-success' :
                      med.stock === 'Low Stock' ? 'badge-warning' : 'badge-danger'
                    }`} style={{
                      backgroundColor: med.stock === 'Out of Stock' ? 'rgba(239, 68, 68, 0.15)' : undefined,
                      color: med.stock === 'Out of Stock' ? 'var(--color-danger)' : undefined
                    }}>
                    {med.stock} ({med.count})
                  </span>
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '2px'
                }}>
                  {med.name} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>{med.dose}</span>
                </h3>
                <span style={{
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '12px'
                }}>
                  Generic: {med.generic}
                </span>

                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                  marginBottom: '8px'
                }}>
                  {med.description}
                </p>
              </div>

              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Avg Price</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{med.price}</span>
                </div>

                <button
                  disabled={med.stock === 'Out of Stock'}
                  className="btn"
                  onClick={() => alert(`${med.name} is available. Checking local pharmacies now.`)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    opacity: med.stock === 'Out of Stock' ? 0.5 : 1,
                    cursor: med.stock === 'Out of Stock' ? 'not-allowed' : 'pointer',
                    backgroundColor: themeColor || 'var(--color-primary)',
                    color: '#fff'
                  }}
                >
                  <ShoppingBag size={14} />
                  <span>Order / Locate</span>
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
          <Pill size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No Medicines Found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try resetting your search query or selecting a different category filter.</p>
        </div>
      )}
    </div>
  )
}

export default MedicinesSection
