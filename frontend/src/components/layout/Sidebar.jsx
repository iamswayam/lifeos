import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { logout } from '../../api/auth'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const { user, logoutUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await logout({ refresh })
    } catch {}
    logoutUser()
    toast.success('Logged out!')
    navigate('/login')
  }

  const initials = user?.first_name?.slice(0, 2).toUpperCase() || 'U'

  return (
    <aside style={{
      width: '220px', minHeight: '100vh',
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '28px 0',
      position: 'fixed', top: 0, left: 0, bottom: 0,
      transition: 'background 0.3s, border-color 0.3s'
    }}>

      {/* LOGO */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '26px', letterSpacing: '-0.5px', lineHeight: 1 }}>
          <span style={{ color: 'var(--logo-life)', transition: 'color 0.3s' }}>Life</span>
          <span style={{ color: 'var(--logo-os)',   transition: 'color 0.3s' }}>OS</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>Personal Operating System</div>
      </div>

      {/* NAV */}
      <div style={{ padding: '0 10px', marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '0 10px', marginBottom: '4px' }}>Overview</div>
        {[
          { to: '/dashboard',  icon: '⊞', label: 'Dashboard' },
          { to: '/journal',    icon: '📓', label: 'Journal' },
          { to: '/todos',      icon: '✓',  label: 'Todos' },
          { to: '/interviews', icon: '🎯', label: 'Interviews' },
        ].map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13.5px', marginBottom: '1px', textDecoration: 'none',
            fontWeight: isActive ? 500 : 400,
            background: isActive ? 'var(--accent-bg)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--muted)',
            transition: 'all 0.15s'
          })}>
            <span style={{ fontSize: '15px', width: '18px', textAlign: 'center' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      {/* BOTTOM */}
      <div style={{ marginTop: 'auto', padding: '16px 20px 0', borderTop: '1px solid var(--border)' }}>

        {/* Theme toggle */}
        <div onClick={toggleTheme} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '13.5px', color: 'var(--muted)', marginBottom: '4px',
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '15px', width: '18px', textAlign: 'center' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </div>

        {/* Logout */}
        <div onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '13.5px', color: 'var(--muted)', marginBottom: '12px',
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '15px', width: '18px', textAlign: 'center' }}>↗</span>
          Logout
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--logo-life), var(--logo-os))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 600, color: 'white', flexShrink: 0
          }}>{initials}</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{user?.first_name?.split(' ')[0]}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{user?.username}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}