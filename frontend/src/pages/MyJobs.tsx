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
  contactPreference: string
  createdAt: string
  category: {
    id: number
    name: string
    icon: string
  } | null
  suggestion: {
    id: number
    suggestedName: string
    status: string
  } | null
  photos: { photoUrl: string }[]
  ratings: { id: number; direction: string; stars: number; comment: string | null; fromUserId: number }[]
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

const MyJobs = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')

  const filters = ['ALL', 'PUBLISHED', 'PENDING', 'WORK_ACCEPTED', 'WORK_STARTED', 'COMPLETED', 'CANCELLED', 'EXPIRED']

  useEffect(() => {
    fetchMyJobs()
  }, [])

  const fetchMyJobs = async () => {
    try {
      setLoading(true)
      const res = await api.get('/jobs/my-jobs')
      setJobs(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelJob = async (jobId: number) => {
    if (!window.confirm('Are you sure you want to cancel this job?')) return
    try {
      await api.put(`/jobs/${jobId}/cancel`)
      fetchMyJobs()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel job')
    }
  }

  const filteredJobs = jobs.filter((job) => {
    if (activeFilter === 'ALL') return true
    if (activeFilter === 'COMPLETED') return job.status === 'PAYMENT_COMPLETED' || job.status === 'WORK_ENDED'
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
          <h2 style={styles.title}>My Jobs</h2>
          <button
            style={styles.postBtn}
            onClick={() => navigate('/post-job')}
          >
            + Post New Job
          </button>
        </div>

        {/* Filter tabs */}
        <div style={styles.filterRow}>
          {filters.map((filter) => (
            <div
              key={filter}
              style={{
                ...styles.filterTab,
                backgroundColor: activeFilter === filter ? '#2563eb' : '#f3f4f6',
                color: activeFilter === filter ? '#ffffff' : '#6b7280',
              }}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'ALL' ? 'All' : filter.replace('_', ' ')}
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.centerMsg}>Loading your jobs...</div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.errorMsg}>{error}</div>
        )}

        {/* Empty state */}
        {!loading && filteredJobs.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <p style={styles.emptyTitle}>No jobs found</p>
            <p style={styles.emptyText}>
              {activeFilter === 'ALL'
                ? "You haven't posted any jobs yet."
                : `No jobs with status "${activeFilter}".`}
            </p>
            <button
              style={styles.postBtn}
              onClick={() => navigate('/post-job')}
            >
              Post Your First Job
            </button>
          </div>
        )}

        {/* Job cards */}
        <div style={styles.jobList}>
          {filteredJobs.map((job) => {
            const status = statusConfig[job.status] || statusConfig.PUBLISHED
            const canCancel = !['WORK_STARTED', 'PAYMENT_COMPLETED', 'CANCELLED', 'EXPIRED', 'WORK_ENDED'].includes(job.status)

            return (
              <div key={job.id} style={styles.jobCard}>

                {/* Top row — category + status */}
                <div style={styles.cardTopRow}>
                  <div style={styles.categoryTag}>
                    {job.category
                      ? `${job.category.icon} ${job.category.name}`
                      : `⏳ ${job.suggestion?.suggestedName} (Pending)`}
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: status.bg,
                    color: status.color,
                  }}>
                    {status.icon} {status.label}
                  </div>
                </div>

                {/* Pending banner */}
                {job.status === 'PENDING' && (
                  <div style={styles.pendingBanner}>
                    ⏳ Your job is waiting for category approval before it gets published to workers.
                  </div>
                )}

                {/* Job title */}
                <h3 style={styles.jobTitle}>{job.title}</h3>

                {/* Description */}
                <p style={styles.jobDesc}>
                  {job.description.length > 100
                    ? job.description.substring(0, 100) + '...'
                    : job.description}
                </p>

                {/* Details row */}
                <div style={styles.detailsRow}>
                  <span style={styles.detail}>📍 {job.location}</span>
                  <span style={styles.detail}>🕐 {formatDate(job.startTime)}</span>
                  {job.budgetMin && (
                    <span style={styles.detail}>
                      💰 ₹{job.budgetMin}{job.budgetMax ? ` - ₹${job.budgetMax}` : '+'}
                    </span>
                  )}
                </div>
                {job.ratings.length > 0 && (
  <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
    {job.ratings.map((r) => (
      <div key={r.id} style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#fffbeb', padding: '4px 10px', borderRadius: '99px' }}>
        {r.direction === 'CREATOR_TO_WORKER' ? 'You rated worker' : 'Worker rated you'}: {'⭐'.repeat(r.stars)}
      </div>
    ))}
  </div>
)}

                {/* Footer row */}
                <div style={styles.cardFooter}>
                  <span style={styles.postedDate}>
                    Posted {formatDate(job.createdAt)}
                  </span>
                  <div style={styles.actionBtns}>
                    <button
                      style={styles.viewBtn}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View
                    </button>
                    {canCancel && (
                      <button
                        style={styles.cancelBtn}
                        onClick={() => handleCancelJob(job.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )
          })}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  postBtn: {
    backgroundColor: '#2563eb',
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
  pendingBanner: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    color: '#b45309',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    marginBottom: '10px',
    lineHeight: '1.5',
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
  actionBtns: {
    display: 'flex',
    gap: '8px',
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
  cancelBtn: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
}

export default MyJobs