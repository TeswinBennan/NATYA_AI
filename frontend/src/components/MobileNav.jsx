import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Hand, RotateCw, Video, Activity } from 'lucide-react';

const MobileNav = () => {
  const navItems = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/analyze', label: 'Studio', icon: Video },
    { to: '/mudra-studio', label: 'Mudras', icon: Hand },
    { to: '/3d-studio', label: '3D Twin', icon: RotateCw },
    { to: '/history', label: 'Vault', icon: Activity },
  ];

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 24px)',
          maxWidth: '480px',
          background: 'rgba(255, 255, 255, 0.96)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 10px',
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 990,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
        className="mobile-bottom-nav"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.72rem',
                boxShadow: isActive ? '0 2px 10px rgba(234, 88, 12, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              })}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <style>{`
        .mobile-bottom-nav {
          display: none;
        }
        @media (max-width: 1024px) {
          .mobile-bottom-nav {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default MobileNav;
