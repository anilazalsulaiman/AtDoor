 
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const Header = () => {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const isCreator = user?.activeMode === 'CREATOR'

  const handleModeSwitch = async () => {
  if (!user) return
  const newMode = isCreator ? 'WORKER' : 'CREATOR'
  try {
    const res = await api.put('/auth/switch-mode', { mode: newMode })
    updateUser(res.data.data)
  } catch (err) {
    console.error('Failed to switch mode')
  }
}

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const [unreadCount, setUnreadCount] = useState(0)
  useEffect(() => {
  fetchUnreadCount()
}, [])

const fetchUnreadCount = async () => {
  try {
    const res = await api.get('/notifications/unread-count')
    setUnreadCount(res.data.data.count)
  } catch (err) {
    console.error('Failed to fetch unread count')
  }
}

  return (
    <header style={styles.header}>
      {/* Left — App name */}
      <div style={styles.logo} onClick={() => navigate('/home')}>
        AtDoor
      </div>

      {/* Right — Controls */}
      <div style={styles.controls}>

        {/* Creator / Worker Toggle */}
        <div style={styles.toggleWrapper}>
          <span style={{
            ...styles.toggleLabel,
            color: isCreator ? '#2563eb' : '#6b7280',
            fontWeight: isCreator ? '600' : '400',
          }}>
            Creator
          </span>
          <div
            style={{
              ...styles.toggle,
              backgroundColor: isCreator ? '#2563eb' : '#10b981',
            }}
            onClick={handleModeSwitch}
          >
            <div style={{
              ...styles.toggleThumb,
              transform: isCreator ? 'translateX(0px)' : 'translateX(20px)',
            }} />
          </div>
          <span style={{
            ...styles.toggleLabel,
            color: !isCreator ? '#10b981' : '#6b7280',
            fontWeight: !isCreator ? '600' : '400',
          }}>
            Worker
          </span>
        </div>

        {/* Mode Badge */}
        <div style={{
          ...styles.modeBadge,
          backgroundColor: isCreator ? '#eff6ff' : '#f0fdf4',
          color: isCreator ? '#2563eb' : '#10b981',
        }}>
          {isCreator ? '🏠 Creator' : '🔧 Worker'}
        </div>

       {/* Notifications */}
<div
  style={styles.notifWrapper}
  onClick={() => navigate('/notifications')}
>
  <span style={styles.iconBtn}>🔔</span>
  {unreadCount > 0 && (
    <span style={styles.notifBadge}>
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</div>

        {/* Profile */}
        <div style={styles.profileWrapper}>
          <div
            style={styles.avatar}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {user?.firstName?.charAt(0).toUpperCase()}
          </div>

          {/* Dropdown menu */}
          {showProfileMenu && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <div style={styles.dropdownName}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={styles.dropdownEmail}>{user?.email}</div>
              </div>
              <div style={styles.dropdownDivider} />
              <div
                style={styles.dropdownItem}
                onClick={() => {
                  navigate('/profile')
                  setShowProfileMenu(false)
                }}
              >
                👤 View Profile
              </div>
              <div style={styles.dropdownDivider} />
              <div
                style={{ ...styles.dropdownItem, color: '#dc2626' }}
                onClick={handleLogout}
              >
                🚪 Logout
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '60px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  logo: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#2563eb',
    cursor: 'pointer',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  toggleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toggleLabel: {
    fontSize: '13px',
    transition: 'all 0.2s',
  },
  toggle: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.3s',
  },
  toggleThumb: {
    position: 'absolute',
    top: '3px',
    left: '3px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    transition: 'transform 0.3s',
  },
  modeBadge: {
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px 10px',
    borderRadius: '99px',
  },
  iconBtn: {
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
  },
  profileWrapper: {
    position: 'relative',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    top: '44px',
    right: '0',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    minWidth: '200px',
    zIndex: 200,
  },
  dropdownHeader: {
    padding: '12px 16px',
  },
  dropdownName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  dropdownEmail: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#f3f4f6',
  },
  dropdownItem: {
    padding: '10px 16px',
    fontSize: '13px',
    color: '#374151',
    cursor: 'pointer',
  },
  notifWrapper: {
  position: 'relative',
  cursor: 'pointer',
  padding: '4px',
},
notifBadge: {
  position: 'absolute',
  top: '-2px',
  right: '-2px',
  backgroundColor: '#dc2626',
  color: '#ffffff',
  fontSize: '10px',
  fontWeight: '600',
  minWidth: '16px',
  height: '16px',
  borderRadius: '99px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
},
}

export default Header