import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Header from '../components/layout/Header'

interface Notification {
  id: number
  title: string
  message: string
  isRead: boolean
  jobId: number | null
  createdAt: string
}

const Notifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await api.get('/notifications')
      setNotifications(res.data.data)
      setUnreadCount(res.data.data.filter((n: Notification) => !n.isRead).length)
    } catch (err) {
      console.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read')
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }
    if (notification.jobId) {
      navigate(`/jobs/${notification.jobId}`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <Header />
      <div style={styles.container}>

        {/* Header row */}
        <div style={styles.topRow}>
          <div>
            <h2 style={styles.title}>Notifications</h2>
            {unreadCount > 0 && (
              <p style={styles.unreadText}>{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button style={styles.markAllBtn} onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.centerMsg}>Loading notifications...</div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔔</div>
            <p style={styles.emptyTitle}>No notifications yet</p>
            <p style={styles.emptyText}>
              You'll be notified about job updates, acceptances and more.
            </p>
          </div>
        )}

        {/* Notification list */}
        <div style={styles.list}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                ...styles.notifCard,
                backgroundColor: notification.isRead ? '#ffffff' : '#eff6ff',
                borderLeft: notification.isRead
                  ? '3px solid transparent'
                  : '3px solid #2563eb',
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <div style={styles.notifTop}>
                <div style={styles.notifTitle}>{notification.title}</div>
                <div style={styles.notifTime}>
                  {formatDate(notification.createdAt)}
                </div>
              </div>
              <p style={styles.notifMessage}>{notification.message}</p>
              {!notification.isRead && (
                <div style={styles.unreadDot} />
              )}
              {notification.jobId && (
                <div style={styles.viewJobLink}>
                  View Job →
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
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
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  unreadText: {
    fontSize: '13px',
    color: '#2563eb',
    margin: 0,
    fontWeight: '500',
  },
  markAllBtn: {
    backgroundColor: 'transparent',
    color: '#2563eb',
    border: '1px solid #2563eb',
    borderRadius: '8px',
    padding: '6px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  centerMsg: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 6px 0',
  },
  emptyText: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  notifCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '14px 16px',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  notifTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px',
    gap: '8px',
    flexWrap: 'wrap',
  },
  notifTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  notifTime: {
    fontSize: '11px',
    color: '#9ca3af',
    whiteSpace: 'nowrap',
  },
  notifMessage: {
    fontSize: '13px',
    color: '#4b5563',
    margin: '0 0 6px 0',
    lineHeight: '1.5',
  },
  unreadDot: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
  },
  viewJobLink: {
    fontSize: '12px',
    color: '#2563eb',
    fontWeight: '500',
  },
}

export default Notifications