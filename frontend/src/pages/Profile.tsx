import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'

const Profile = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'creator' | 'worker'>('creator')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div>
      <Header />
      <div style={styles.container}>

        {/* Profile Card */}
        <div style={styles.profileCard}>

          {/* Avatar */}
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              {user?.firstName?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Name */}
          <h2 style={styles.name}>
            {user?.firstName} {user?.lastName}
          </h2>

          {/* Mode badges */}
          <div style={styles.badgeRow}>
            {(user?.defaultMode === 'CREATOR' || user?.defaultMode === 'BOTH') && (
              <span style={{ ...styles.badge, ...styles.creatorBadge }}>
                🏠 Creator
              </span>
            )}
            {(user?.defaultMode === 'WORKER' || user?.defaultMode === 'BOTH') && (
              <span style={{ ...styles.badge, ...styles.workerBadge }}>
                🔧 Worker
              </span>
            )}
            {!user?.defaultMode && (
              <span style={{ ...styles.badge, ...styles.neutralBadge }}>
                👤 Member
              </span>
            )}
          </div>

          {/* Common Info — stacked for mobile */}
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Email</span>
              <span style={styles.infoValue}>{user?.email}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Phone</span>
              <span style={styles.infoValue}>{user?.phone}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Date of Birth</span>
              <span style={styles.infoValue}>
                {user?.dob ? formatDate(user.dob) : '—'}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Member Since</span>
              <span style={styles.infoValue}>
                {user?.createdAt ? formatDate(user.createdAt) : '—'}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Default Mode</span>
              <span style={styles.infoValue}>
                {user?.defaultMode || 'Not set'}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Active Mode</span>
              <span style={styles.infoValue}>{user?.activeMode}</span>
            </div>
          </div>

        </div>

        {/* Tabs */}
        <div style={styles.tabCard}>
          <div style={styles.tabRow}>
            <div
              style={{
                ...styles.tab,
                ...(activeTab === 'creator' ? styles.activeTab : {}),
                color: activeTab === 'creator' ? '#2563eb' : '#6b7280',
              }}
              onClick={() => setActiveTab('creator')}
            >
              🏠 Creator
            </div>
            <div
              style={{
                ...styles.tab,
                ...(activeTab === 'worker' ? styles.activeTabWorker : {}),
                color: activeTab === 'worker' ? '#10b981' : '#6b7280',
              }}
              onClick={() => setActiveTab('worker')}
            >
              🔧 Worker
            </div>
          </div>

          <div style={styles.tabContent}>
            {activeTab === 'creator' ? (
              <div style={styles.comingSoon}>
                <div style={styles.comingSoonIcon}>📋</div>
                <p style={styles.comingSoonTitle}>Creator Activities</p>
                <p style={styles.comingSoonText}>
                  Your posted jobs and hiring history will appear here.
                </p>
              </div>
            ) : (
              <div style={styles.comingSoon}>
                <div style={styles.comingSoonIcon}>🛠️</div>
                <p style={styles.comingSoonTitle}>Worker Activities</p>
                <p style={styles.comingSoonText}>
                  Your skills, work history and points will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '16px',
    boxSizing: 'border-box',
    width: '100%',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px 16px',
    textAlign: 'center',
    marginBottom: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    boxSizing: 'border-box',
    width: '100%',
    overflow: 'hidden',
  },
  avatarWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700',
    flexShrink: 0,
  },
  name: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 12px 0',
    wordBreak: 'break-word',
  },
  badgeRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px 12px',
    borderRadius: '99px',
  },
  creatorBadge: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  workerBadge: {
    backgroundColor: '#f0fdf4',
    color: '#10b981',
  },
  neutralBadge: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    textAlign: 'left',
    width: '100%',
    boxSizing: 'border-box',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '10px 12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    overflow: 'hidden',
    minWidth: 0,
  },
  infoLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  infoValue: {
    fontSize: '13px',
    color: '#111827',
    fontWeight: '500',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
  },
  tabCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  tabRow: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
  },
  tab: {
    flex: 1,
    padding: '14px 8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  activeTab: {
    borderBottom: '2px solid #2563eb',
    backgroundColor: '#eff6ff',
  },
  activeTabWorker: {
    borderBottom: '2px solid #10b981',
    backgroundColor: '#f0fdf4',
  },
  tabContent: {
    padding: '24px 16px',
  },
  comingSoon: {
    textAlign: 'center',
    padding: '20px',
  },
  comingSoonIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  comingSoonTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 6px 0',
  },
  comingSoonText: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
}

export default Profile