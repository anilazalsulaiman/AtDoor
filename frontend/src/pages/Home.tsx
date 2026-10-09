import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const { user } = useAuth()
  const isCreator = user?.activeMode === 'CREATOR'
  const navigate = useNavigate()

  return (
    <div>
      <Header />
      <div style={styles.container}>

        {/* Welcome Banner */}
        <div style={{
          ...styles.banner,
          backgroundColor: isCreator ? '#eff6ff' : '#f0fdf4',
          borderColor: isCreator ? '#bfdbfe' : '#bbf7d0',
        }}>
          <h2 style={{
            ...styles.bannerTitle,
            color: isCreator ? '#1d4ed8' : '#15803d',
          }}>
            {isCreator ? '🏠 Creator Mode' : '🔧 Worker Mode'}
          </h2>
          <p style={styles.bannerText}>
            {isCreator
              ? 'Post jobs, hire skilled workers and get things done!'
              : 'Browse jobs, offer your skills and earn money!'}
          </p>
        </div>

        {/* Quick Actions */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Quick Actions</h3>
          <div style={styles.actionGrid}>
            {isCreator ? (
              <>
                <div style={styles.actionCard} onClick={() => navigate('/post-job')}>
                  <div style={styles.actionIcon}>📝</div>
                  <div style={styles.actionLabel}>Post a Job</div>
                </div>
                <div style={styles.actionCard} onClick={() => navigate('/browse-skills')}>
                  <div style={styles.actionIcon}>🔍</div>
                  <div style={styles.actionLabel}>Find Workers</div>
                </div>
                <div style={styles.actionCard} onClick={() => navigate('/my-jobs')}>
                  <div style={styles.actionIcon}>📋</div>
                  <div style={styles.actionLabel}>My Jobs</div>
                </div>
                <div style={styles.actionCard}>
                  <div style={styles.actionIcon}>💬</div>
                  <div style={styles.actionLabel}>Messages</div>
                </div>
              </>
            ) : (
              <>
                <div style={styles.actionCard} onClick={() => navigate('/browse-jobs')}>
                  <div style={styles.actionIcon}>🔍</div>
                  <div style={styles.actionLabel}>Browse Jobs</div>
                </div>
                <div style={styles.actionCard} onClick={() => navigate('/my-skills')}>
                  <div style={styles.actionIcon}>🛠️</div>
                  <div style={styles.actionLabel}>My Skills</div>
                </div>
                <div style={styles.actionCard} onClick={() => navigate('/my-work')}>
                  <div style={styles.actionIcon}>📋</div>
                  <div style={styles.actionLabel}>My Work</div>
                </div>
                <div style={styles.actionCard}>
                  <div style={styles.actionIcon}>⭐</div>
                  <div style={styles.actionLabel}>My Points</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Coming Soon */}
        <div style={styles.comingSoon}>
          <p style={styles.comingSoonText}>
            🚀 More features coming soon...
          </p>
        </div>

      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '24px 20px',
  },
  banner: {
    border: '1px solid',
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '28px',
  },
  bannerTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 6px 0',
  },
  bannerText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  section: {
    marginBottom: '28px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '14px',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  actionIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  actionLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  comingSoon: {
    textAlign: 'center',
    padding: '20px',
  },
  comingSoonText: {
    fontSize: '14px',
    color: '#9ca3af',
  },
}

export default Home