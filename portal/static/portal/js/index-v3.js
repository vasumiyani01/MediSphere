const { useState, useEffect, useRef } = React;

// --- COMPONENT: FOOTERLINK ---
function FooterLink({ href, label, hoverColor, onClick }) {
    const [hover, setHover] = useState(false);
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
    );
}

// --- INLINE SVG ICONS (Lucide Alternatives) ---
const HeartPulseIcon = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h4.78" />
    </svg>
);

const SunIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
);

const MoonIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

const LogInIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
    </svg>
);

const SearchIcon = ({ size = 18, className = "", style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);

const PillIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" />
    </svg>
);

const UsersIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const MapPinIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
);

const BuildingIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
);

const ArrowRightIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

const ShieldAlertIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
);

const ShieldCheckIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 11 2 2 4-4" />
    </svg>
);

const PhoneIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const ClockIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

const TruckIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" /><polygon points="16 8 20 8 23 11 23 16 16 16" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);

const StarIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const CalendarIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);

const AwardIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
);

const DollarSignIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" x2="12" y1="1" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const ShoppingBagIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" x2="21" y1="6" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

const ExternalLinkIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
    </svg>
);

const XIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
    </svg>
);

const MenuIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
    </svg>
);

const EyeIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />
    </svg>
);

const LockIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const MailIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const UserIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

// --- COMPONENT: NAVBUTTON ---
function NavButton({ item, isActive, activeColor, onClick, buttonRef }) {
    const [hover, setHover] = useState(false);

    const textColor = isActive
        ? activeColor
        : hover
            ? (item.id === 'home' || item.id === 'about' ? 'var(--color-primary)' :
                item.id === 'medicines' ? '#3b82f6' :
                    item.id === 'diseases' ? '#ef4444' :
                        item.id === 'pharmacies' ? '#f59e0b' :
                            item.id === 'doctors' ? '#10b981' :
                                    'var(--text-primary)')
            : 'var(--text-secondary)';

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
    );
}


// --- COMPONENT: NAVBAR ---
function Navbar({ activeTab, setActiveTab, openLogin, scrollToSection, pincode, openPincode, user, onLogout }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const buttonRefs = useRef({});
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0, opacity: 0, backgroundColor: 'transparent' });

    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'medicines', label: 'Medicines', sectionId: 'section-medicines' },
        { id: 'diseases', label: 'Diseases', sectionId: 'section-diseases' },
        { id: 'pharmacies', label: 'Pharmacies', sectionId: 'section-pharmacies' },
        { id: 'doctors', label: 'Doctors', sectionId: 'section-doctors' },
        { id: 'about', label: 'Contact Us' }
    ];

    const getThemeColor = (tabId) => {
        switch (tabId) {
            case 'home':
            case 'about':
                return 'var(--color-primary)';
            case 'medicines':
                return '#3b82f6';
            case 'diseases':
                return '#ef4444';
            case 'pharmacies':
                return '#f59e0b';
            case 'doctors':
                return '#10b981';

            default:
                return 'var(--color-primary)';
        }
    };

    const activeColor = getThemeColor(activeTab);

    useEffect(() => {
        const activeBtn = buttonRefs.current[activeTab];
        if (activeBtn) {
            const left = activeBtn.offsetLeft + 16;
            const width = activeBtn.clientWidth - 32;
            setUnderlineStyle({
                left: left,
                width: width,
                opacity: 1,
                backgroundColor: activeColor
            });
        } else {
            setUnderlineStyle(prev => ({ ...prev, opacity: 0 }));
        }
    }, [activeTab, activeColor]);



    return (
        <nav className="glass" style={{
            position: 'sticky', top: 0, zIndex: 100,
            borderBottom: 'var(--glass-border)', padding: '0 24px', height: '74px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'background var(--transition-normal)'
        }}>
            {/* Logo */}
            <div onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
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
                    <HeartPulseIcon size={20} style={{ color: '#ffffff' }} />
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

            {/* Nav Items (Desktop) */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                {navItems.map(item => (
                    <NavButton
                        key={item.id}
                        item={item}
                        isActive={activeTab === item.id}
                        activeColor={activeColor}
                        buttonRef={el => buttonRefs.current[item.id] = el}
                        onClick={() => {
                            if (item.id === 'home') {
                                setActiveTab('home');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else if (item.id === 'about') {
                                setActiveTab('about');
                                const footer = document.querySelector('footer');
                                if (footer) footer.scrollIntoView({ behavior: 'smooth' });
                            } else if (item.sectionId) {
                                scrollToSection(item.sectionId, item.id);
                            } else {
                                setActiveTab(item.id);
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

            {/* Controls (Desktop) */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                    <MapPinIcon size={16} style={{ color: 'var(--color-primary)', marginRight: '6px', flexShrink: 0 }} />
                    <span style={{
                        color: pincode ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: 600
                    }}>
                        {pincode ? pincode : 'Pincode'}
                    </span>
                </div>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Hi, {user.username}</span>
                        <a href={user.user_type === 'citizen' ? '/citizens/' : user.user_type === 'doctor' ? '/doctors/' : '/pharmacies/'} className="btn btn-primary" style={{ height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                            Dashboard
                        </a>
                        <button onClick={onLogout} className="btn btn-secondary" style={{ height: '40px', borderRadius: '10px' }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <button onClick={openLogin} className="btn btn-primary" style={{
                        height: '40px', display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '0 20px', borderRadius: '10px'
                    }}>
                        <LogInIcon />
                        <span>Login</span>
                    </button>
                )}
            </div>

            {/* Mobile Menu Trigger */}
            <div className="mobile-menu-btn" style={{ display: 'none' }}>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="btn-secondary" style={{ width: '40px', height: '40px', padding: 0 }}>
                    {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
                </button>
            </div>

            {/* Mobile Menu Panel */}
            {mobileMenuOpen && (
                <div className="glass" style={{
                    position: 'absolute', top: '74px', left: 0, right: 0,
                    borderBottom: 'var(--glass-border)', padding: '20px',
                    display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 99
                }}>
                    {navItems.map(item => {
                        const isActive = activeTab === item.id;
                        const itemColor = getThemeColor(item.id);
                        return (
                            <button key={item.id} onClick={() => {
                                if (item.id === 'home') {
                                    setActiveTab('home');
                                    setMobileMenuOpen(false);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else if (item.id === 'about') {
                                    setActiveTab('about');
                                    setMobileMenuOpen(false);
                                    const footer = document.querySelector('footer');
                                    if (footer) footer.scrollIntoView({ behavior: 'smooth' });
                                } else if (item.sectionId) {
                                    setMobileMenuOpen(false);
                                    scrollToSection(item.sectionId, item.id);
                                } else {
                                    setActiveTab(item.id);
                                    setMobileMenuOpen(false);
                                }
                            }}
                                style={{
                                    textAlign: 'left', padding: '12px 16px', border: 'none',
                                    background: 'transparent',
                                    color: isActive ? itemColor : 'var(--text-primary)',
                                    borderRadius: '8px', fontWeight: 600, fontSize: '16px', cursor: 'pointer'
                                }}>
                                {item.label}
                            </button>
                        );
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
                            <MapPinIcon size={16} style={{ color: 'var(--color-primary)', marginRight: '6px', flexShrink: 0 }} />
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <a href={user.user_type === 'citizen' ? '/citizens/' : user.user_type === 'doctor' ? '/doctors/' : '/pharmacies/'} className="btn btn-primary" style={{ width: '100%', padding: '12px', textDecoration: 'none', textAlign: 'center', display: 'block', boxSizing: 'border-box' }}>
                                Dashboard
                            </a>
                            <button onClick={onLogout} className="btn btn-secondary" style={{ width: '100%', padding: '12px' }}>
                                Logout ({user.username})
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => { openLogin(); setMobileMenuOpen(false); }} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                            <LogInIcon />
                            <span>Login</span>
                        </button>
                    )}
                </div>
            )}
            {/* Pincode Input Modal */}
        </nav>
    );
}





// --- COMPONENT: EXPLORESECTION ---
function ExploreSection({ id, title, color, openLogin, marginTop = '15px', children }) {
    const [hover, setHover] = useState(false);
    return (
        <div
            id={`section-${id}`}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop, scrollMarginTop: '90px', paddingTop: '10px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '4px',
                        height: '28px',
                        borderRadius: '2px',
                        background: `linear-gradient(to bottom, ${color}, ${color}80)`
                    }} />
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Explore {title}
                    </h3>
                </div>
                <button
                    onClick={openLogin}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    className="btn"
                    style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        border: `1px solid ${hover ? color : 'var(--border-color)'}`,
                        background: hover ? `${color}18` : 'var(--bg-tertiary)',
                        color: hover ? color : 'var(--text-primary)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span>View All</span>
                    <ArrowRightIcon size={12} />
                </button>
            </div>
            {children}
        </div>
    );
}

// --- COMPONENT: HOMESECTION ---
function HomeSection({ onNavigate, openLogin, dbStats, pincode, globalSearch, setGlobalSearch }) {
    const stats = [
        { label: 'Medicines Available', value: dbStats?.medicines ?? 0, icon: PillIcon, color: '#3b82f6' },
        { label: 'Diseases Directory', value: dbStats?.diseases ?? 0, icon: ShieldAlertIcon, color: '#ef4444' },
        { label: 'Verified Doctors', value: dbStats?.doctors ?? 0, icon: UsersIcon, color: '#10b981' },
        { label: 'Partner Pharmacies', value: dbStats?.pharmacies ?? 0, icon: MapPinIcon, color: '#f59e0b' }
    ];

    const handleHeroSearch = () => {
        const query = globalSearch.trim().toLowerCase();
        if (!query) return;

        Promise.all([
            fetch('/api/accounts/public-medicines/').then(r => r.json()).catch(() => ({ medicines: [] })),
            fetch('/api/accounts/public-pharmacies/').then(r => r.json()).catch(() => ({ pharmacies: [] })),
            fetch('/api/accounts/public-doctors/').then(r => r.json()).catch(() => ({ doctors: [] }))
        ]).then(([medsData, pharmsData, docsData]) => {
            const meds = medsData.medicines || [];
            const pharms = pharmsData.pharmacies || [];
            const docs = docsData.doctors || [];

            const hasMedMatch = meds.some(m => 
                (m.name && m.name.toLowerCase().includes(query)) || 
                (m.manufacturer && m.manufacturer.toLowerCase().includes(query)) ||
                (m.uses && m.uses.toLowerCase().includes(query))
            );

            const hasDocMatch = docs.some(d => 
                (d.name && d.name.toLowerCase().includes(query)) || 
                (d.city && d.city.toLowerCase().includes(query)) ||
                (d.pincode && d.pincode.includes(query))
            );

            const hasPharmMatch = pharms.some(p => 
                (p.name && p.name.toLowerCase().includes(query)) || 
                (p.address && p.address.toLowerCase().includes(query)) ||
                (p.pincode && p.pincode.includes(query))
            );

            if (hasMedMatch) {
                onNavigate('medicines');
            } else if (hasDocMatch) {
                onNavigate('doctors');
            } else if (hasPharmMatch) {
                onNavigate('pharmacies');
            } else {
                onNavigate('medicines');
            }
        }).catch(err => {
            console.error("Hero search failed:", err);
            onNavigate('medicines');
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Hero Banner */}
            <div className="glass hero-banner" style={{
                padding: '70px 40px', borderRadius: '24px',
                textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '44px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    lineHeight: '1.2',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em'
                }}>
                    Welcome to Medi<span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>Sphere</span>
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
                    Access direct databases for verified healthcare services. Instantly lookup drug details, pharmacy inventory, and doctor availability.
                </p>
                <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <SearchIcon style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                    <input type="text" placeholder="Search pills, physician names, health specialties..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleHeroSearch(); }}
                        style={{ width: '100%', padding: '16px 20px 16px 54px', borderRadius: '16px', fontSize: '16px' }} />
                    <button onClick={handleHeroSearch} className="btn btn-primary" style={{ position: 'absolute', right: '8px', padding: '10px 20px', borderRadius: '10px' }}>
                        Search
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
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
                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${stat.color}15`, color: stat.color }}>
                                    <Icon size={18} />
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ExploreSection id="medicines" title="Medicines" color="#3b82f6" openLogin={openLogin} marginTop="10px">
                <MedicinesSection isSlider={true} themeColor="#3b82f6" openLogin={openLogin} globalSearch={globalSearch} />
            </ExploreSection>

            <ExploreSection id="diseases" title="Diseases" color="#ef4444" openLogin={openLogin}>
                <DiseasesSection isSlider={true} themeColor="#ef4444" onNavigate={onNavigate} globalSearch={globalSearch} />
            </ExploreSection>

            <ExploreSection id="pharmacies" title="Pharmacies" color="#f59e0b" openLogin={openLogin}>
                <PharmaciesSection isSlider={true} themeColor="#f59e0b" pincode={pincode} globalSearch={globalSearch} openLogin={openLogin} />
            </ExploreSection>

            <ExploreSection id="doctors" title="Doctors" color="#10b981" openLogin={openLogin}>
                <DoctorsSection isSlider={true} themeColor="#10b981" pincode={pincode} globalSearch={globalSearch} openLogin={openLogin} />
            </ExploreSection>


        </div>
    );
}


// --- COMPONENT: MEDICINESSECTION ---
function MedicinesSection({ isSlider, themeColor, openLogin, globalSearch }) {
    const [meds, setMeds] = useState([]);
    const [search, setSearch] = useState(globalSearch || '');
    const [cat, setCat] = useState('All');

    useEffect(() => {
        if (globalSearch !== undefined) {
            setSearch(globalSearch);
        }
    }, [globalSearch]);

    useEffect(() => {
        fetch('/api/accounts/public-medicines/')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.medicines) {
                    setMeds(data.medicines);
                }
            })
            .catch(err => console.error("Error loading public medicines:", err));
    }, []);

    const categories = ['All', 'Tablet', 'Capsule', 'Syrup', 'Drops', 'Other'];
    const filtered = meds.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.manufacturer.toLowerCase().includes(search.toLowerCase());
        const matchesCat = cat === 'All' || m.category.toLowerCase() === cat.toLowerCase();
        return matchesSearch && matchesCat;
    });

    const displayList = isSlider ? filtered.slice(0, 6) : filtered;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
            {!isSlider && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                        <SearchIcon style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search by brand or generic name..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 46px', borderRadius: '12px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                        {categories.map(c => (
                            <button key={c} onClick={() => setCat(c)} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', background: cat === c ? 'var(--color-primary-glow)' : undefined, color: cat === c ? 'var(--color-primary)' : undefined, borderColor: cat === c ? 'var(--color-primary)' : undefined }}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className={isSlider ? 'theme-slider' : undefined} style={isSlider ? { display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px', width: '100%', '--slider-color': themeColor } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {displayList.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>No medicines found in catalog.</div>
                ) : (
                    displayList.map(m => (
                        <div key={m.id} className="card" style={{
                            ...(isSlider ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', flex: '0 0 320px' } : { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }),
                            '--hover-color': themeColor || 'var(--color-primary)',
                            '--hover-glow': `0 0 20px ${(themeColor || 'var(--color-primary)')}40`
                        }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span className="badge" style={{ backgroundColor: `${themeColor || 'var(--color-primary)'}15`, color: themeColor || 'var(--color-primary)', border: `1px solid ${themeColor || 'var(--color-primary)'}30` }}>{m.category}</span>
                                </div>
                                {m.image_url && (
                                    <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', background: 'var(--bg-tertiary)' }}>
                                        <img src={m.image_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>{m.name}</h3>
                                <span style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>Manufacturer: {m.manufacturer}</span>
                                <div style={{ marginTop: '12px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Uses</span>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>{m.uses || 'No usage details specified.'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pack Size</span>
                                    <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{m.pack_size}</h4>
                                </div>
                                <button onClick={() => {
                                    if (openLogin) {
                                        openLogin();
                                    } else {
                                        alert(`Locating stockists for ${m.name}...`);
                                    }
                                }} className="btn" style={{ padding: '8px 16px', backgroundColor: themeColor || 'var(--color-primary)', color: '#fff' }}>
                                    <ShoppingBagIcon /><span>Locate</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}


// --- COMPONENT: PHARMACIESSECTION ---
function PharmaciesSection({ isSlider, themeColor, pincode, globalSearch, openLogin }) {
    const [pharms, setPharms] = useState([]);
    const [search, setSearch] = useState(globalSearch || '');
    const [delivery, setDelivery] = useState(false);

    useEffect(() => {
        if (globalSearch !== undefined) {
            setSearch(globalSearch);
        }
    }, [globalSearch]);

    useEffect(() => {
        fetch('/api/accounts/public-pharmacies/')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.pharmacies) {
                    setPharms(data.pharmacies);
                }
            })
            .catch(err => console.error("Error loading public pharmacies:", err));
    }, []);

    const filtered = pharms.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                             p.address.toLowerCase().includes(search.toLowerCase()) ||
                             (p.pincode && p.pincode.includes(search));
        const matchesPincode = !pincode || (p.pincode && String(p.pincode).trim() === String(pincode).trim());
        return matchesSearch && matchesPincode;
    });

    const displayList = isSlider ? filtered.slice(0, 6) : filtered;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
            {!isSlider && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                        <SearchIcon style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search pharmacy or locality..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 46px', borderRadius: '12px' }} />
                    </div>
                </div>
            )}

            <div className={isSlider ? 'theme-slider' : undefined} style={isSlider ? { display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px', width: '100%', '--slider-color': themeColor } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                {displayList.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>No pharmacies found.</div>
                ) : (
                    displayList.map(p => {
                        let delivery = false;
                        let pickup = false;
                        let optionsText = 'Pickup';
                        if (p.checkout_option) {
                            const opts = p.checkout_option.split(',');
                            delivery = opts.includes('delivery');
                            pickup = opts.includes('pickup');
                            if (opts.includes('delivery') && opts.includes('pickup')) {
                                optionsText = 'Delivery & Pickup';
                            } else if (opts.includes('delivery')) {
                                optionsText = 'Delivery Only';
                            } else {
                                optionsText = 'Pickup Only';
                            }
                        } else {
                            // Fallback for mock pharmacies
                            delivery = p.delivery !== undefined ? p.delivery : true;
                            pickup = p.pickup !== undefined ? p.pickup : true;
                            if (delivery && pickup) optionsText = 'Delivery & Pickup';
                            else if (delivery) optionsText = 'Delivery Only';
                            else optionsText = 'Pickup Only';
                        }

                        let timingText = 'Closed';
                        if (p.open_from && p.closes_from) {
                            timingText = `${p.open_from} - ${p.closes_from}`;
                        } else {
                            timingText = p.hours || 'N/A';
                        }

                        return (
                            <div key={p.id} className="card" style={{
                                ...(isSlider ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', flex: '0 0 340px' } : { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }),
                                '--hover-color': themeColor || 'var(--color-primary)',
                                '--hover-glow': `0 0 20px ${(themeColor || 'var(--color-primary)')}40`
                            }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>{p.name}</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                        {delivery && (
                                            <span className="badge" style={{ backgroundColor: `${themeColor || 'var(--color-primary)'}15`, color: themeColor || 'var(--color-primary)', border: `1px solid ${themeColor || 'var(--color-primary)'}30` }}><TruckIcon size={10} style={{ marginRight: '4px' }} />Home Delivery</span>
                                        )}
                                        {pickup && (
                                            <span className="badge" style={{ backgroundColor: `${themeColor || 'var(--color-primary)'}15`, color: themeColor || 'var(--color-primary)', border: `1px solid ${themeColor || 'var(--color-primary)'}30` }}><ShoppingBagIcon size={10} style={{ marginRight: '4px' }} />Store Pickup</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPinIcon size={14} style={{ color: themeColor || 'var(--color-primary)' }} /><span>{[p.address, p.city, p.state, p.pincode].filter(Boolean).join(', ') || 'No address provided'}</span></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><PhoneIcon size={14} style={{ color: themeColor || 'var(--color-primary)' }} /><span>{p.mobile_number || p.phone || 'N/A'}</span></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ClockIcon size={14} style={{ color: themeColor || 'var(--color-primary)' }} /><span>{timingText}</span></div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                    <button onClick={openLogin} className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}>View Details</button>
                                    <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' ' + (p.address || '') + ' ' + (p.city || ''))}`, '_blank')} className="btn" style={{ flex: 1, backgroundColor: themeColor || 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}><ExternalLinkIcon />Directions</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}


// --- COMPONENT: DOCTORSSECTION ---
function DoctorsSection({ isSlider, themeColor, pincode, globalSearch, openLogin }) {
    const [docs, setDocs] = useState([]);
    const [search, setSearch] = useState(globalSearch || '');
    const [spec, setSpec] = useState('All');

    useEffect(() => {
        if (globalSearch !== undefined) {
            setSearch(globalSearch);
        }
    }, [globalSearch]);

    useEffect(() => {
        fetch('/api/accounts/public-doctors/')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.doctors) {
                    setDocs(data.doctors);
                }
            })
            .catch(err => console.error("Error loading public doctors:", err));
    }, []);

    const specialties = ['All', 'Cardiology', 'Pediatrics', 'Dermatology', 'Neurology', 'General Medicine'];
    const filtered = docs.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                             (d.city && d.city.toLowerCase().includes(search.toLowerCase())) ||
                             (d.pincode && d.pincode.includes(search));
        const matchesPincode = !pincode || (d.pincode && String(d.pincode).trim() === String(pincode).trim());
        return matchesSearch && matchesPincode;
    });

    const displayList = isSlider ? filtered.slice(0, 6) : filtered;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
            {!isSlider && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                        <SearchIcon style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search doctor name or location..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 46px', borderRadius: '12px' }} />
                    </div>
                </div>
            )}

            <div className={isSlider ? 'theme-slider' : undefined} style={isSlider ? { display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px', width: '100%', '--slider-color': themeColor } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                {displayList.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>No doctors found.</div>
                ) : (
                    displayList.map(d => {
                        const initials = d.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
                        return (
                            <div key={d.id} className="card" style={{
                                ...(isSlider ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', flex: '0 0 340px' } : { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }),
                                '--hover-color': themeColor || 'var(--color-primary)',
                                '--hover-glow': `0 0 20px ${(themeColor || 'var(--color-primary)')}40`
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `linear-gradient(135deg, ${themeColor || 'var(--color-primary)'} 0%, ${themeColor || 'var(--color-primary)'}bb 100%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{initials || 'DR'}</div>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{d.name}</h3>
                                            <span className="badge" style={{ backgroundColor: `${themeColor || 'var(--color-primary)'}15`, color: themeColor || 'var(--color-primary)', border: `1px solid ${themeColor || 'var(--color-primary)'}30` }}>{d.specialization || 'General Physician'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPinIcon size={14} style={{ color: themeColor || 'var(--color-primary)' }} /><span>{[d.address, d.city, d.state, d.pincode].filter(Boolean).join(', ') || 'No address provided'}</span></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><PhoneIcon size={14} style={{ color: themeColor || 'var(--color-primary)' }} /><span>{d.mobile_number || 'N/A'}</span></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ClockIcon size={14} style={{ color: themeColor || 'var(--color-primary)' }} /><span>{d.open_from && d.closes_from ? `${d.open_from} - ${d.closes_from}` : '09:00 AM - 05:00 PM'}</span></div>
                                    </div>
                                </div>
                                <button onClick={openLogin} className="btn" style={{ width: '100%', gap: '8px', backgroundColor: themeColor || 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <CalendarIcon /><span>Book Consultation</span>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}





// --- COMPONENT: LOGINMODAL ---
function LoginModal({ onClose, onLoginSuccess }) {
    const [mode, setMode] = useState('signin'); // 'signin', 'signup', or 'forgot'
    const [step, setStep] = useState(1); // 1, 2, or 3 for signup stepper

    // Common states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Sign In fields
    const [signInMobile, setSignInMobile] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [showSignInPassword, setShowSignInPassword] = useState(false);

    // Sign Up fields
    const [signUpUsername, setSignUpUsername] = useState('');
    const [signUpMobile, setSignUpMobile] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpOtp, setSignUpOtp] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);
    const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
    const [signUpUserType, setSignUpUserType] = useState('citizen');
    const [signUpLicenseNumber, setSignUpLicenseNumber] = useState('');

    // Forgot Password fields
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [forgotOtpValues, setForgotOtpValues] = useState(['', '', '', '', '', '']);
    const [forgotPassword, setForgotPassword] = useState('');
    const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
    const [forgotCountdown, setForgotCountdown] = useState(0);

    // Timer for OTP cooldown
    const [countdown, setCountdown] = useState(0);
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);

    useEffect(() => {
        let timer;
        if (forgotCountdown > 0) {
            timer = setTimeout(() => setForgotCountdown(forgotCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [forgotCountdown]);

    const handleEnterKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = e.target.form;
            if (!form) return;
            const index = Array.prototype.indexOf.call(form, e.target);
            for (let i = index + 1; i < form.elements.length; i++) {
                const el = form.elements[i];
                if (el && (el.tagName === 'INPUT' || el.tagName === 'BUTTON') && !el.disabled && el.type !== 'hidden') {
                    el.focus();
                    break;
                }
            }
        }
    };

    const handleOtpChange = (value, idx) => {
        const cleanValue = value.replace(/\D/g, '');
        const newOtpValues = [...otpValues];
        newOtpValues[idx] = cleanValue;
        setOtpValues(newOtpValues);
        setSignUpOtp(newOtpValues.join(''));

        if (cleanValue && idx < 5) {
            const nextInput = document.getElementById(`otp-box-${idx + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (e, idx) => {
        if (e.key === 'Backspace') {
            if (!otpValues[idx] && idx > 0) {
                const prevInput = document.getElementById(`otp-box-${idx - 1}`);
                if (prevInput) {
                    prevInput.focus();
                    const newOtpValues = [...otpValues];
                    newOtpValues[idx - 1] = '';
                    setOtpValues(newOtpValues);
                    setSignUpOtp(newOtpValues.join(''));
                }
            }
        }
    };

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (signUpMobile.length !== 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/accounts/send-otp/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signUpEmail, mobile_number: signUpMobile, name: signUpUsername })
            });
            const data = await response.json();
            if (data.success) {
                setStep(2);
                setCountdown(30);
                setOtpValues(['', '', '', '', '', '']);
                setSignUpOtp('');
            } else {
                setError(data.error || 'Failed to send OTP.');
            }
        } catch (err) {
            setError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await fetch('/api/accounts/send-otp/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signUpEmail, mobile_number: signUpMobile, name: signUpUsername })
            });
            const data = await response.json();
            if (data.success) {
                setCountdown(30);
                setOtpValues(['', '', '', '', '', '']);
                setSignUpOtp('');
                alert('OTP resent successfully!');
            } else {
                setError(data.error || 'Failed to resend OTP.');
            }
        } catch (err) {
            setError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (signUpOtp.length !== 6) {
            setError('Please enter a 6-digit OTP.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/accounts/verify-otp/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signUpEmail, otp: signUpOtp })
            });
            const data = await response.json();
            if (data.success) {
                setStep(3);
            } else {
                setError(data.error || 'Invalid OTP.');
            }
        } catch (err) {
            setError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (signUpPassword !== signUpConfirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (signUpPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/accounts/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile_number: signUpMobile,
                    password: signUpPassword,
                    user_type: signUpUserType,
                    license_number: signUpUserType !== 'citizen' ? signUpLicenseNumber : undefined
                })
            });
            const data = await response.json();
            if (data.success) {
                onLoginSuccess(data.user);
                onClose();
            } else {
                setError(data.error || 'Registration failed.');
            }
        } catch (err) {
            setError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch('/api/accounts/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile_number: signInMobile,
                    password: signInPassword
                })
            });
            const data = await response.json();
            if (data.success) {
                onLoginSuccess(data.user);
                onClose();
            } else {
                setError(data.error || 'Invalid credentials.');
            }
        } catch (err) {
            setError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!forgotEmail) {
            setError('Please enter your email address.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/accounts/forgot-password/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await response.json();
            if (data.success) {
                setForgotStep(2);
                setForgotCountdown(30);
                setForgotOtpValues(['', '', '', '', '', '']);
                setForgotOtp('');
            } else {
                setError(data.error || 'Failed to send OTP.');
            }
        } catch (err) {
            setError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotResendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await fetch('/api/accounts/forgot-password/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await response.json();
            if (data.success) {
                setForgotCountdown(30);
                setForgotOtpValues(['', '', '', '', '', '']);
                setForgotOtp('');
                alert('OTP resent successfully!');
            } else {
                setError(data.error || 'Failed to resend OTP.');
            }
        } catch (err) {
            setError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (forgotOtp.length !== 6) {
            setError('Please enter a 6-digit OTP.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/accounts/forgot-password/verify/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp: forgotOtp })
            });
            const data = await response.json();
            if (data.success) {
                setForgotStep(3);
            } else {
                setError(data.error || 'Invalid OTP.');
            }
        } catch (err) {
            setError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (forgotPassword !== forgotConfirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (forgotPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/accounts/forgot-password/reset/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, password: forgotPassword })
            });
            const data = await response.json();
            if (data.success) {
                alert('Password reset successful! Please sign in with your new password.');
                setMode('signin');
                setError('');
            } else {
                setError(data.error || 'Failed to reset password.');
            }
        } catch (err) {
            setError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotOtpChange = (value, idx) => {
        const cleanValue = value.replace(/\D/g, '');
        const newOtpValues = [...forgotOtpValues];
        newOtpValues[idx] = cleanValue;
        setForgotOtpValues(newOtpValues);
        setForgotOtp(newOtpValues.join(''));

        if (cleanValue && idx < 5) {
            const nextInput = document.getElementById(`forgot-otp-box-${idx + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleForgotOtpKeyDown = (e, idx) => {
        if (e.key === 'Backspace') {
            if (!forgotOtpValues[idx] && idx > 0) {
                const prevInput = document.getElementById(`forgot-otp-box-${idx - 1}`);
                if (prevInput) {
                    prevInput.focus();
                    const newOtpValues = [...forgotOtpValues];
                    newOtpValues[idx - 1] = '';
                    setForgotOtpValues(newOtpValues);
                    setForgotOtp(newOtpValues.join(''));
                }
            }
        }
    };

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
                    <XIcon size={16} />
                </button>

                {/* Title and Icon */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        width: '44px', height: '44px', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px auto', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
                    }}>
                        <HeartPulseIcon size={22} />
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
                                : step === 1
                                    ? 'Enter registration details to begin'
                                    : step === 2
                                        ? `Enter the OTP sent to ${signUpEmail}`
                                        : step === 3
                                            ? 'Select your user account type'
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

                {/* Mode toggles */}
                {mode === 'signin' && (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Mobile Number</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                                    <PhoneIcon size={14} />
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
                                    <LockIcon size={14} />
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
                                    {showSignInPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
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

                {mode === 'signup' && (
                    <div>
                        {/* Stepper Progress Bar */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 1 ? 'var(--color-primary)' : 'var(--bg-tertiary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>1</div>
                            <div style={{ width: '30px', height: '2px', background: step >= 2 ? 'var(--color-primary)' : 'var(--border-color)' }} />
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 2 ? 'var(--color-primary)' : 'var(--bg-tertiary)', color: step >= 2 ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>2</div>
                            <div style={{ width: '30px', height: '2px', background: step >= 3 ? 'var(--color-primary)' : 'var(--border-color)' }} />
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 3 ? 'var(--color-primary)' : 'var(--bg-tertiary)', color: step >= 3 ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>3</div>
                            <div style={{ width: '30px', height: '2px', background: step >= 4 ? 'var(--color-primary)' : 'var(--border-color)' }} />
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 4 ? 'var(--color-primary)' : 'var(--bg-tertiary)', color: step >= 4 ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>4</div>
                        </div>

                        {step === 1 && (
                            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                                            <UserIcon size={14} />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={signUpUsername}
                                            onChange={e => setSignUpUsername(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '12px 14px 12px 42px' }}
                                            onKeyDown={handleEnterKey}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Mobile Number</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                                            <PhoneIcon size={14} />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Enter mobile number"
                                            value={signUpMobile}
                                            onChange={e => setSignUpMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            maxLength={10}
                                            required
                                            style={{ width: '100%', padding: '12px 14px 12px 42px' }}
                                            onKeyDown={handleEnterKey}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                                            <MailIcon size={14} />
                                        </span>
                                        <input
                                            type="email"
                                            placeholder="Enter email address"
                                            value={signUpEmail}
                                            onChange={e => setSignUpEmail(e.target.value)}
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

                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Enter 6-Digit OTP</label>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '10px 0' }}>
                                        {otpValues.map((val, idx) => (
                                            <input
                                                key={idx}
                                                id={`otp-box-${idx}`}
                                                type="text"
                                                maxLength={1}
                                                value={val}
                                                onChange={(e) => handleOtpChange(e.target.value, idx)}
                                                onKeyDown={(e) => handleOtpKeyDown(e, idx)}
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
                                        onClick={handleResendOtp}
                                        disabled={countdown > 0 || loading}
                                        style={{
                                            background: 'none', border: 'none', color: countdown > 0 ? 'var(--text-muted)' : 'var(--color-primary)',
                                            fontWeight: 600, cursor: countdown > 0 ? 'default' : 'pointer', fontSize: '13px'
                                        }}
                                    >
                                        {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                                    </button>
                                </div>
                                <button id="verify-otp-submit-btn" type="submit" disabled={loading || signUpOtp.length !== 6} className="btn btn-primary" style={{ padding: '12px', borderRadius: '10px', marginTop: '10px', width: '100%' }}>
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>User Type</label>
                                    <select
                                        value={signUpUserType}
                                        onChange={e => setSignUpUserType(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-tertiary)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="citizen">Citizen</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="pharmacy">Pharmacy</option>
                                    </select>
                                </div>

                                {signUpUserType !== 'citizen' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>License Number</label>
                                        <input
                                            type="text"
                                            placeholder={`Enter ${signUpUserType} license number`}
                                            value={signUpLicenseNumber}
                                            onChange={e => setSignUpLicenseNumber(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-tertiary)',
                                                color: 'var(--text-primary)',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" style={{ padding: '12px', borderRadius: '10px', marginTop: '10px', width: '100%' }}>
                                    Continue
                                </button>
                            </form>
                        )}

                        {step === 4 && (
                            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Create Password</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                                            <LockIcon size={14} />
                                        </span>
                                        <input
                                            type={showSignUpPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={signUpPassword}
                                            onChange={e => setSignUpPassword(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '12px 42px 12px 42px' }}
                                            onKeyDown={handleEnterKey}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                                            style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                                        >
                                            {showSignUpPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm Password</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                                            <LockIcon size={14} />
                                        </span>
                                        <input
                                            type={showSignUpConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={signUpConfirmPassword}
                                            onChange={e => setSignUpConfirmPassword(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '12px 42px 12px 42px' }}
                                            onKeyDown={handleEnterKey}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                                            style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                                        >
                                            {showSignUpConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px', borderRadius: '10px', marginTop: '10px', width: '100%' }}>
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>
                        )}

                        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                            Already have an account?{' '}
                            <a href="#login" onClick={(e) => { e.preventDefault(); setMode('signin'); setError(''); }} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                                Sign in
                            </a>
                        </div>
                    </div>
                )}

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
                                            <MailIcon size={14} />
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
                                            <LockIcon size={14} />
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
                                            {showForgotPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm Password</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
                                            <LockIcon size={14} />
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
                                            {showForgotConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
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
    );
}


// --- COMPONENT: PINCODEMODAL ---
function PincodeModal({ isOpen, onClose, pincode, setPincode }) {
    const [tempPincode, setTempPincode] = useState(pincode);

    useEffect(() => {
        if (isOpen) {
            setTempPincode(pincode);
        }
    }, [isOpen, pincode]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.65)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, padding: '20px'
        }}>
            <div className="glass animate-fade-in" style={{
                width: '100%', maxWidth: '360px', borderRadius: '20px', padding: '30px',
                position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }}>Enter Location Pincode</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Provide a 6-digit pincode to locate services nearby</p>
                </div>

                {/* Input */}
                <div style={{ position: 'relative', width: '100%' }}>
                    <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="var(--text-secondary)" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            opacity: 0.8
                        }}
                    >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div style={{
                        position: 'absolute',
                        left: '44px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '1px',
                        height: '20px',
                        backgroundColor: 'var(--border-color)',
                        pointerEvents: 'none'
                    }}></div>
                    <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 380015"
                        value={tempPincode}
                        onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                        style={{
                            width: '100%', padding: '12px 16px 12px 56px', borderRadius: '10px', fontSize: '16px',
                            border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)', fontWeight: 700,
                            letterSpacing: '4px', outline: 'none'
                        }}
                    />
                </div>

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
                                        alert('Pincode must be exactly 6 digits!');
                                return;
                            }
                            setPincode(tempPincode);
                            try { localStorage.setItem('user_pincode', tempPincode); } catch(e){}
                            onClose();
                        }}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px' }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENT: DISEASESSECTION ---
function DiseasesSection({ isSlider, themeColor, onNavigate, globalSearch }) {
    const [diseases, setDiseases] = useState([]);
    const [search, setSearch] = useState(globalSearch || '');
    const [cat, setCat] = useState('All');

    useEffect(() => {
        if (globalSearch !== undefined) {
            setSearch(globalSearch);
        }
    }, [globalSearch]);

    useEffect(() => {
        fetch('/api/accounts/public-diseases/')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.diseases) {
                    setDiseases(data.diseases);
                }
            })
            .catch(err => console.error("Error loading public diseases:", err));
    }, []);

    const categories = ['All', 'Chronic', 'Infectious', 'Respiratory', 'Neurological', 'General'];
    const filtered = diseases.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                             (d.description && d.description.toLowerCase().includes(search.toLowerCase())) ||
                             (d.medicine && d.medicine.toLowerCase().includes(search.toLowerCase()));
        return matchesSearch;
    });

    const displayList = isSlider ? filtered.slice(0, 6) : filtered;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
            {!isSlider && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                        <SearchIcon style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search by disease name, description, or treatment..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 46px', borderRadius: '12px' }} />
                    </div>
                </div>
            )}

            <div className={isSlider ? 'theme-slider' : undefined} style={isSlider ? { display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px', width: '100%', '--slider-color': themeColor } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                {displayList.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>No diseases found in directory.</div>
                ) : (
                    displayList.map(d => {
                        const symptomsArr = d.symptoms ? d.symptoms.split(',').map(s => s.trim()).filter(Boolean) : [];
                        const treatmentArr = d.treatment ? d.treatment.split(',').map(t => t.trim()).filter(Boolean) : [];
                        return (
                            <div key={d.id} className="card" style={{
                                ...(isSlider ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', flex: '0 0 340px' } : { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }),
                                '--hover-color': themeColor || 'var(--color-primary)',
                                '--hover-glow': `0 0 20px ${(themeColor || 'var(--color-primary)')}40`
                            }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 700 }}>{d.name}</h3>
                                        </div>
                                    </div>
                                    {d.description && (
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>{d.description}</p>
                                    )}
                                    {symptomsArr.length > 0 && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Symptoms</span>
                                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>{symptomsArr.join(', ')}</p>
                                        </div>
                                    )}
                                    {!isSlider && treatmentArr.length > 0 && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Care & First-line Treatments</h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {treatmentArr.map((t, idx) => (
                                                    <span key={idx} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {isSlider && d.medicine && (
                                        <div style={{ marginTop: '8px' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Treatment Medicine</span>
                                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{d.medicine}</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 'auto' }}>
                                    <button onClick={() => { if (onNavigate) onNavigate('section-pharmacies', 'pharmacies'); else alert("Locating pharmacies..."); }} className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', padding: '8px 4px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                        <span>Find Pharmacies</span>
                                    </button>
                                    <button onClick={() => { if (onNavigate) onNavigate('section-doctors', 'doctors'); else alert("Locating doctors..."); }} className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', padding: '8px 4px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                        <span>Consult Doctor</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// --- COMPONENT: APP ---
function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [pincode, setPincode] = useState(() => {
        try { return localStorage.getItem('user_pincode') || ''; } catch(e) { return ''; }
    });
    const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(() => {
        try { return !localStorage.getItem('user_pincode'); } catch(e) { return true; }
    });
    const [globalSearch, setGlobalSearch] = useState('');
    const [user, setUser] = useState(null);
    const [dbStats, setDbStats] = useState(null);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        const userType = userData.user_type;
        const dest = userType === 'pharmacy' ? 'pharmacies' : `${userType}s`;
        window.location.href = `/${dest}/`;
    };

    const handleLogout = () => {
        fetch('/api/accounts/logout/', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(null);
                }
            })
            .catch(err => console.error("Logout failed:", err));
    };

    const scrollToSection = (sectionId, tabId) => {
        if (tabId) setActiveTab(tabId);
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        // Fetch current user if logged in
        fetch('/api/accounts/user-status/')
            .then(res => res.json())
            .then(data => {
                if (data.logged_in && data.user) {
                    setUser(data.user);
                    const userType = data.user.user_type;
                    const dest = userType === 'pharmacy' ? 'pharmacies' : `${userType}s`;
                    window.location.href = `/${dest}/`;
                }
            })
            .catch(err => console.error("Error fetching current user:", err));

        // Fetch dashboard counts for public view
        fetch('/api/accounts/public-stats/')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDbStats(data);
                }
            })
            .catch(err => console.error("Error loading DB stats:", err));
    }, []);

    const renderSection = () => {
        return <HomeSection onNavigate={scrollToSection} openLogin={() => setIsLoginOpen(true)} dbStats={dbStats} pincode={pincode} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />;
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Background Decorative Blobs */}
            <div className="bg-blob blob-1" />
            <div className="bg-blob blob-2" />
            <div className="bg-blob blob-3" />
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} openLogin={() => setIsLoginOpen(true)} scrollToSection={scrollToSection} pincode={pincode} openPincode={() => setIsPincodeModalOpen(true)} user={user} onLogout={handleLogout} />
            <main style={{ flex: 1, padding: '40px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    {renderSection()}
                </div>
            </main>
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
                                    <HeartPulseIcon size={18} style={{ color: '#ffffff' }} />
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

                        {/* Center: Quick Links */}
                        <div style={{ display: 'flex', justifyContent: 'center', flex: 1, minWidth: '200px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', textAlign: 'left' }}>
                                <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '4px' }}>Quick Links</strong>
                                <FooterLink href="#medicines" label="Medicines" hoverColor="#3b82f6" onClick={(e) => { e.preventDefault(); scrollToSection('section-medicines', 'home'); }} />
                                <FooterLink href="#diseases" label="Diseases" hoverColor="#ef4444" onClick={(e) => { e.preventDefault(); scrollToSection('section-diseases', 'home'); }} />
                                <FooterLink href="#pharmacies" label="Pharmacies" hoverColor="#f59e0b" onClick={(e) => { e.preventDefault(); scrollToSection('section-pharmacies', 'home'); }} />
                                <FooterLink href="#doctors" label="Doctors" hoverColor="#10b981" onClick={(e) => { e.preventDefault(); scrollToSection('section-doctors', 'home'); }} />
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
                                {/* WhatsApp */}
                                <a href="https://wa.me/919601070101" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp" title="WhatsApp">
                                    <svg className="social-icon whatsapp" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.411.002 12.048c0 2.12.54 4.19 1.566 6.02L0 24l6.125-1.606a11.848 11.848 0 005.922 1.577h.005c6.632 0 12.042-5.411 12.045-12.048a11.82 11.82 0 00-3.535-8.414z" />
                                    </svg>
                                </a>
                                {/* Instagram */}
                                <a href="https://instagram.com/vasumiyani01" target="_blank" rel="noopener noreferrer" className="social-icon instagram" title="Instagram">
                                    <svg className="social-icon instagram" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                                {/* X */}
                                <a href="https://x.com/vasumiyani01" target="_blank" rel="noopener noreferrer" className="social-icon x-logo" title="X">
                                    <svg className="social-icon x-logo" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                {/* Facebook */}
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
            {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />}
            <PincodeModal isOpen={isPincodeModalOpen} onClose={() => setIsPincodeModalOpen(false)} pincode={pincode} setPincode={setPincode} />
        </div>
    );
}

// Mount React
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
