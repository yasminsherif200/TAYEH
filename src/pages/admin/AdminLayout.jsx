import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, MapPin, ArrowLeft, Menu, X } from 'lucide-react'

const SIDEBAR_BG  = '#1a2410'
const SIDEBAR_TEXT = '#c8d4b0'
const ACTIVE_BG   = 'rgba(208, 235, 161, 0.12)'
const ACTIVE_TEXT = '#d0eba1'

export default function AdminLayout({ children }) {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navItems = [
    { path: '/admin',        label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/places', label: 'Places',   icon: MapPin },
  ]

  const SidebarContent = () => (
    <>
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(200, 212, 176, 0.5)',
          marginBottom: '4px',
        }}>
          Cairo University
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '15px',
          fontWeight: '700',
          color: '#d0eba1',
          letterSpacing: '0.04em',
        }}>
          TAYEH
        </div>
        <div style={{
          fontSize: '10px',
          color: 'rgba(200,212,176,0.4)',
          marginTop: '2px',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Admin Panel
        </div>
      </div>

      <nav style={{
        padding: '16px 12px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        <div style={{
          fontSize: '10px',
          fontFamily: "'JetBrains Mono', monospace",
          color: 'rgba(200,212,176,0.35)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '0 8px',
          marginBottom: '6px',
        }}>
          Navigation
        </div>

        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setDrawerOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? ACTIVE_TEXT : SIDEBAR_TEXT,
                backgroundColor: isActive ? ACTIVE_BG : 'transparent',
                borderLeft: isActive ? '2px solid #d0eba1' : '2px solid transparent',
                transition: 'all 0.15s ease',
                letterSpacing: '0.01em',
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link
          to="/"
          onClick={() => setDrawerOpen(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            fontSize: '12px',
            color: 'rgba(200,212,176,0.45)',
            padding: '8px 12px',
            borderRadius: '6px',
          }}
        >
          <ArrowLeft size={13} />
          Back to app
        </Link>
      </div>
    </>
  )

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Manrope', sans-serif",
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      backgroundColor: '#fbfbe2',
    }}>
      {/* Desktop Sidebar */}
      <aside
        className="admin-sidebar-desktop"
        style={{
          width: '220px',
          flexShrink: 0,
          backgroundColor: SIDEBAR_BG,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            backgroundColor: 'rgba(0,0,0,0.45)',
          }}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className="admin-sidebar-mobile"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '240px',
          zIndex: 301,
          backgroundColor: SIDEBAR_BG,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(200,212,176,0.6)',
            padding: '4px',
          }}
        >
          <X size={18} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main
        className="admin-main"
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#fbfbe2',
          boxShadow: 'inset 4px 0 12px rgba(26, 36, 16, 0.06)',
        }}
      >
        {/* Mobile top bar */}
        <div
          className="admin-mobile-header"
          style={{ display: 'none' }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#d0eba1',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Menu size={22} />
          </button>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '14px',
            fontWeight: '700',
            color: '#d0eba1',
          }}>
            TAYEH
          </span>
          <div style={{ width: 30 }} />
        </div>

        {children}
      </main>

      <style>{`
        @media (max-width: 767px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-mobile-header {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            height: 52px;
            background: #1a2410;
            padding: 0 16px;
            z-index: 200;
          }
        }
        @media (min-width: 768px) {
          .admin-sidebar-mobile { display: none !important; }
          .admin-mobile-header  { display: none !important; }
        }
      `}</style>
    </div>
  )
}