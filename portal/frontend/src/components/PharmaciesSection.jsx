import React, { useState } from 'react'
import { Search, MapPin, Phone, Clock, Truck, Shield, ExternalLink } from 'lucide-react'

function PharmaciesSection({ isSlider, themeColor }) {
  const [search, setSearch] = useState('')
  const [deliveryOnly, setDeliveryOnly] = useState(false)

  const pharmaciesData = [
    { id: 1, name: 'Apollo Pharmacy', address: '12 Medical Square, Downtown', phone: '+1 (555) 019-2834', hours: 'Open 24/7', delivery: true, stockLevel: 'High', rating: 4.8 },
    { id: 2, name: 'Wellness Forever Medstore', address: 'Plot 42, Metro Galleria, West End', phone: '+1 (555) 014-9988', hours: 'Open 24/7', delivery: true, stockLevel: 'High', rating: 4.7 },
    { id: 3, name: 'MedPlus Pharmacy', address: '88 Greenwood Street, Sector 5', phone: '+1 (555) 012-7362', hours: '8:00 AM - 11:00 PM', delivery: false, stockLevel: 'Medium', rating: 4.5 },
    { id: 4, name: 'Guardian Care Pharmacy', address: '104 Lakeside Drive, Northern Heights', phone: '+1 (555) 015-8811', hours: '9:00 AM - 9:00 PM', delivery: true, stockLevel: 'Medium', rating: 4.3 },
    { id: 5, name: 'LifeSpring Pharmacy', address: '302 Oak Avenue, Riverdale', phone: '+1 (555) 018-2233', hours: 'Open 24/7', delivery: true, stockLevel: 'Low', rating: 4.6 },
    { id: 6, name: 'Apex Clinical Pharmacy', address: 'H-6, Apollo Annex, Health District', phone: '+1 (555) 011-9475', hours: '7:30 AM - 10:00 PM', delivery: false, stockLevel: 'High', rating: 4.9 },
  ]

  const filteredPharmacies = isSlider ? pharmaciesData : pharmaciesData.filter(pharm => {
    const matchesSearch = pharm.name.toLowerCase().includes(search.toLowerCase()) ||
      pharm.address.toLowerCase().includes(search.toLowerCase())
    const matchesDelivery = !deliveryOnly || pharm.delivery
    return matchesSearch && matchesDelivery
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>

      {/* Search and Filters */}
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
              placeholder="Search pharmacy or locality..."
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

          {/* Home Delivery Filter */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={deliveryOnly}
              onChange={(e) => setDeliveryOnly(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--color-primary)'
              }}
            />
            <span>Show Home Delivery Only</span>
          </label>
        </div>
      )}

      {/* Pharmacies Grid */}
      {filteredPharmacies.length > 0 ? (
        <div className={isSlider ? 'theme-slider' : undefined} style={isSlider ? { display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px', width: '100%', '--slider-color': themeColor } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredPharmacies.map(pharm => (
            <div key={pharm.id} className="card" style={{
              ...(isSlider ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', flex: '0 0 340px' } : { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '20px' }),
              '--hover-color': themeColor || 'var(--color-primary)',
              '--hover-glow': `0 0 20px ${(themeColor || 'var(--color-primary)')}40`
            }}>
              <div>
                {/* Pharmacy Name & Rating */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}>
                    {pharm.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#f59e0b'
                  }}>
                    <span>★</span>
                    <span>{pharm.rating}</span>
                  </div>
                </div>

                {/* Stock Level Badge */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span className={`badge ${pharm.stockLevel === 'High' ? 'badge-success' :
                      pharm.stockLevel === 'Medium' ? 'badge-warning' : 'badge-danger'
                    }`} style={{
                      backgroundColor: pharm.stockLevel === 'Low' ? 'rgba(239, 68, 68, 0.15)' : undefined,
                      color: pharm.stockLevel === 'Low' ? 'var(--color-danger)' : undefined
                    }}>
                    {pharm.stockLevel} Inventory
                  </span>
                  {pharm.delivery && (
                    <span className="badge" style={{ backgroundColor: `${themeColor || 'var(--color-primary)'}15`, color: themeColor || 'var(--color-primary)', border: `1px solid ${themeColor || 'var(--color-primary)'}30` }}>
                      <Truck size={10} style={{ marginRight: '4px' }} />
                      Home Delivery
                    </span>
                  )}
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: themeColor || 'var(--color-primary)' }} />
                    <span>{pharm.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: themeColor || 'var(--color-primary)' }} />
                    <span>{pharm.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} style={{ color: themeColor || 'var(--color-primary)' }} />
                    <span>{pharm.hours}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '10px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px',
                marginTop: 'auto'
              }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => alert(`Calling ${pharm.name} at ${pharm.phone}`)}
                  style={{ flex: 1, padding: '8px' }}
                >
                  <Phone size={14} />
                  <span>Call Store</span>
                </button>
                <button
                  className="btn"
                  onClick={() => alert(`Redirecting to live tracking location for ${pharm.name}`)}
                  style={{ flex: 1, padding: '8px', backgroundColor: themeColor || 'var(--color-primary)', color: '#fff', cursor: 'pointer' }}
                >
                  <ExternalLink size={14} />
                  <span>Get Directions</span>
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
          <MapPin size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No Pharmacies Found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try adjusting your search criteria or toggling filters.</p>
        </div>
      )}
    </div>
  )
}

export default PharmaciesSection
