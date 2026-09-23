import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import Header from '../../components/layout/Header'
import { useAuth } from '../../context/AuthContext'

interface Job {
  id: number
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  budgetMin: number | null
  budgetMax: number | null
  status: string
  contactPreference: string
  createdAt: string
  category: {
    id: number
    name: string
    icon: string
  } | null
  suggestion: {
    suggestedName: string
    status: string
  } | null
  creator: {
    id: number
    firstName: string
    lastName: string
    phone: string
    email: string
  }
  photos: { photoUrl: string }[]
}

const statusConfig: { [key: string]: { label: string; color: string; bg: string; icon: string } } = {
  PENDING: { label: 'Pending Approval', color: '#b45309', bg: '#fef3c7', icon: '⏳' },
  PUBLISHED: { label: 'Published', color: '#1d4ed8', bg: '#eff6ff', icon: '📢' },
  WORK_ACCEPTED: { label: 'Work Accepted', color: '#7c3aed', bg: '#ede9fe', icon: '🤝' },
  WORK_STARTED: { label: 'Work Started', color: '#15803d', bg: '#f0fdf4', icon: '▶️' },
  WORK_ENDED: { label: 'Work Ended', color: '#15803d', bg: '#f0fdf4', icon: '✅' },
  PAYMENT_COMPLETED: { label: 'Payment Completed', color: '#15803d', bg: '#f0fdf4', icon: '💰' },
  RESCHEDULED: { label: 'Rescheduled', color: '#6b7280', bg: '#f3f4f6', icon: '🔄' },
  EXPIRED: { label: 'Expired', color: '#9ca3af', bg: '#f9fafb', icon: '⌛' },
  CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2', icon: '❌' },
}

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [acceptSuccess, setAcceptSuccess] = useState(false)

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/jobs/${id}`)
      setJob(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch job')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptJob = async () => {
    if (!window.confirm('Are you sure you want to accept this job?')) return
    setAccepting(true)
    try {
      await api.put(`/jobs/${id}/accept`)
      setAcceptSuccess(true)
      fetchJob()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept job')
    } finally {
      setAccepting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isCreator = job?.creator.id === user?.id
  const isWorker = user?.activeMode === 'WORKER'
  const canAccept = isWorker && !isCreator && job?.status === 'PUBLISHED'

  if (loading) {
    return (
      <div>
        <Header />
        <div style={styles.centerMsg}>Loading job details...</div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div>
        <Header />
        <div style={styles.container}>
          <div style={styles.errorMsg}>{error || 'Job not found'}</div>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  const status = statusConfig[job.status] || statusConfig.PUBLISHED

  return (
    <div>
      <Header />
      <div style={styles.container}>

        {/* Back button */}
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Accept success banner */}
        {acceptSuccess && (
          <div style={styles.successBanner}>
            🎉 You have accepted this job! The creator will be notified.
          </div>
        )}

        {/* Main card */}
        <div style={styles.card}>

          {/* Top row — category + status */}
          <div style={styles.cardTopRow}>
            <div style={styles.categoryTag}>
              {job.category
                ? `${job.category.icon} ${job.category.name}`
                : `⏳ ${job.suggestion?.suggestedName}`}
            </div>
            <div style={{
              ...styles.statusBadge,
              backgroundColor: status.bg,
              color: status.color,
            }}>
              {status.icon} {status.label}
            </div>
          </div>

          {/* Title */}
          <h2 style={styles.jobTitle}>{job.title}</h2>

          {/* Posted by */}
          <p style={styles.postedBy}>
            Posted by {job.creator.firstName} {job.creator.lastName} · {formatDate(job.createdAt)}
          </p>

          {/* Description */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Description</h4>
            <p style={styles.description}>{job.description}</p>
          </div>

          {/* Job details grid */}
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>📍 Location</span>
              <span style={styles.detailValue}>{job.location}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>🕐 Start Time</span>
              <span style={styles.detailValue}>{formatDate(job.startTime)}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>🕔 End Time</span>
              <span style={styles.detailValue}>{formatDate(job.endTime)}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>💰 Budget</span>
              <span style={styles.detailValue}>
                {job.budgetMin
                  ? `₹${job.budgetMin}${job.budgetMax ? ` - ₹${job.budgetMax}` : '+'}`
                  : 'Negotiable'}
              </span>
            </div>
          </div>

          {/* Contact details */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Contact</h4>
            <div style={styles.contactRow}> 
                {job.contactPreference === 'PHONE' && (
                    <a href={`tel:${job.creator.phone}`} style={styles.callBtn}>
                        📞 Call: {job.creator.phone}
                    </a>
                )}
                {job.contactPreference === 'EMAIL' && (
                    <a href={`mailto:${job.creator.email}`} style={styles.emailBtn}>
                        📧 Email: {job.creator.email}
                    </a>
                )}
                {job.contactPreference === 'CHAT_ONLY' && (
                    <div style={styles.chatBtn}>
                        💬 Chat in App
                    </div>
                )}
            </div>
          </div>

          {/* Worker actions */}
          {canAccept && (
            <div style={styles.actionSection}>
              <button
                style={{
                  ...styles.acceptBtn,
                  opacity: accepting ? 0.7 : 1,
                }}
                onClick={handleAcceptJob}
                disabled={accepting}
              >
                {accepting ? 'Accepting...' : '🤝 Accept This Job'}
              </button>
              <p style={styles.acceptNote}>
                By accepting, the creator will be notified and can confirm the job.
              </p>
            </div>
          )}

          {/* Creator actions */}
          {isCreator && (
            <div style={styles.actionSection}>
              <div style={styles.creatorNote}>
                👤 You posted this job
              </div>
              {job.status === 'PUBLISHED' && (
                <button
                  style={styles.cancelJobBtn}
                  onClick={() => navigate('/my-jobs')}
                >
                  View in My Jobs
                </button>
              )}
            </div>
          )}

          {/* Already accepted or not available */}
          {!canAccept && !isCreator && job.status !== 'PUBLISHED' && (
            <div style={styles.notAvailable}>
              ⚠️ This job is no longer available for acceptance.
            </div>
          )}

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
  centerMsg: {
    textAlign: 'center',
    padding: '60px',
    color: '#6b7280',
    fontSize: '14px',
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#2563eb',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '0 0 16px 0',
    fontWeight: '500',
  },
  successBanner: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
    fontWeight: '500',
  },
  errorMsg: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  categoryTag: {
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '4px 12px',
    borderRadius: '99px',
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px 12px',
    borderRadius: '99px',
  },
  jobTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 6px 0',
  },
  postedBy: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0 0 20px 0',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  description: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.7',
    margin: 0,
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: '#f9fafb',
    padding: '10px 12px',
    borderRadius: '8px',
  },
  detailLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '13px',
    color: '#111827',
    fontWeight: '500',
  },
  contactRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  callBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '500',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  emailBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '500',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  chatBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  actionSection: {
    borderTop: '1px solid #f3f4f6',
    paddingTop: '20px',
    marginTop: '8px',
  },
  acceptBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '8px',
  },
  acceptNote: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
    margin: 0,
  },
  creatorNote: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '10px',
    textAlign: 'center',
  },
  cancelJobBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#ffffff',
    color: '#2563eb',
    border: '1px solid #2563eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  notAvailable: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginTop: '16px',
    textAlign: 'center',
  },
}

export default JobDetail