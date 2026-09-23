import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Header from '../components/layout/Header'

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
  createdAt: string
  category: {
    id: number
    name: string
    icon: string
  } | null
  creator: {
    id: number
    firstName: string
    lastName: string
    phone: string
    email: string
  }
}

const statusConfig: { [key: string]: { label: string; color: string; bg: string; icon: string } } = {
  WORK_ACCEPTED: { label: 'Accepted', color: '#7c3aed', bg: '#ede9fe', icon: '🤝' },
  WORK_STARTED: { label: 'In Progress', color: '#15803d', bg: '#f0fdf4', icon: '▶️' },
  WORK_ENDED: { label: 'Work Ended', color: '#15803d', bg: '#f0fdf4', icon: '✅' },
  PAYMENT_COMPLETED: { label: 'Completed', color: '#15803d', bg: '#f0fdf4', icon: '💰' },
  RESCHEDULED: { label: 'Rescheduled', color: '#6b7280', bg: '#f3f4f6', icon: '🔄' },
  CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2', icon: '❌' },
}

const MyWork = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')

  const filters = ['ALL', 'WORK_ACCEPTED', 'WORK_STARTED', 'WORK_ENDED', 'PAYMENT_COMPLETED', 'CANCELLED']

  useEffect(() => {
    fetchMyWork()
  }, [])

  const fetchMyWork = async () => {
    try {
      setLoading(true)
      const res = await api.get('/jobs/my-work')
      setJobs(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch your work')
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    if (activeFilter === 'ALL') return true
    return job.status === activeFilter
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
            <h2 style={styles.title}>My Work</h2>
            <p style={styles.subtitle}>Jobs you have accepted and worked on</p>
          </div>
          <button
            style={styles.browseBtn}
            onClick={() => navigate('/browse-jobs')}
          >
            🔍 Find More Work
          </button>
        </div>

        {/* Filter tabs */}
        <div style={styles.filterRow}>
          {filters.map((filter) => (
            <div
              key={filter}
              style={{
                ...styles.filterTab,
                backgroundColor: activeFilter === filter ? '#10b981' : '#f3f4f6',
                color: activeFilter === filter ? '#ffffff' : '#6b7280',
              }}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'ALL' ? 'All' : filter.replace(/_/g, ' ')}
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.centerMsg}>Loading your work...</div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.errorMsg}>{error}</div>
        )}

        {/* Empty state */}
        {!loading && filteredJobs.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🛠️</div>
            <p style={styles.emptyTitle}>No work found</p>
            <p style={styles.emptyText}>
              {activeFilter === 'ALL'
                ? "You haven't accepted any jobs yet."
                : `No jobs with status "${activeFilter.replace(/_/g, ' ')}".`}
            </p>
            <button
              style={styles.browseBtn}
              onClick={() => navigate('/browse-jobs')}
            >
              Browse Available Jobs
            </button>
          </div>
        )}

        {/* Job cards */}
        <div style={styles.jobList}>
          {filteredJobs.map((job) => {
            const status = statusConfig[job.status] || statusConfig.WORK_ACCEPTED

            return (
              <div key={job.id} style={styles.jobCard}>

                {/* Top row */}
                <div style={styles.cardTopRow}>
                  <div style={styles.categoryTag}>
                    {job.category?.icon} {job.category?.name}
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
                <h3 style={styles.jobTitle}>{job.title}</h3>

                {/* Description */}
                <p style={styles.jobDesc}>
                  {job.description.length > 100
                    ? job.description.substring(0, 100) + '...'
                    : job.description}
                </p>

                {/* Details */}
                <div style={styles.detailsRow}>
                  <span style={styles.detail}>📍 {job.location}</span>
                  <span style={styles.detail}>🕐 {formatDate(job.startTime)}</span>
                  {job.budgetMin && (
                    <span style={styles.detail}>
                      💰 ₹{job.budgetMin}{job.budgetMax ? ` - ₹${job.budgetMax}` : '+'}
                    </span>
                  )}
                </div>

                {/* Creator contact */}
                <div style={styles.creatorRow}>
                  <span style={styles.creatorName}>
                    👤 {job.creator.firstName} {job.creator.lastName}
                  </span>
                  
                    <a
                        href={`tel:${job.creator.phone}`}
                        style={styles.callBtn}
                        >
                        📞 Call
                    </a>
                </div>

                {/* Footer */}
                <div style={styles.cardFooter}>
                  <span style={styles.postedDate}>
                    Posted on {formatDate(job.createdAt)}
                    </span>
                    <button
                        style={styles.viewBtn}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                        View Details
                    </button>
                </div>
                </div>
            )
          }
            )}
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '16px',
    boxSizing: 'border-box',
    width: '100%',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  browseBtn: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  filterTab: {
    padding: '6px 12px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  centerMsg: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
    fontSize: '14px',
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
    margin: '0 0 20px 0',
  },
  jobList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  categoryTag: {
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '3px 10px',
    borderRadius: '99px',
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: '500',
    padding: '3px 10px',
    borderRadius: '99px',
  },
  jobTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 6px 0',
  },
  jobDesc: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 12px 0',
    lineHeight: '1.5',
  },
  detailsRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  detail: {
    fontSize: '12px',
    color: '#6b7280',
  },
  creatorRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: '8px 12px',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  creatorName: {
    fontSize: '13px',
    color: '#374151',
    fontWeight: '500',
  },
  callBtn: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '500',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '10px',
  },
  postedDate: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  viewBtn: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
}

export default MyWork