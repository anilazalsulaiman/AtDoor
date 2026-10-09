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
  workerId: number | null
  workStartedAt: string | null
  workEndedAt: string | null
  startAcceptedByCreator: boolean
  startAcceptedByWorker: boolean
  endAcceptedByCreator: boolean
  endAcceptedByWorker: boolean
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
  agreedAmount: number | null
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

  const [workLogs, setWorkLogs] = useState<any[]>([])
const [actionLoading, setActionLoading] = useState(false)
const [actionMsg, setActionMsg] = useState('')
const [showReschedule, setShowReschedule] = useState(false)
const [showExtend, setShowExtend] = useState(false)
const [rescheduleStart, setRescheduleStart] = useState('')
const [rescheduleEnd, setRescheduleEnd] = useState('')
const [extendEnd, setExtendEnd] = useState('')
const [showRatingModal, setShowRatingModal] = useState(false)
const [ratingStars, setRatingStars] = useState(0)
const [ratingComment, setRatingComment] = useState('')
const [negotiations, setNegotiations] = useState<any[]>([])
const [negotiateAmount, setNegotiateAmount] = useState('')
const [showNegotiationLog, setShowNegotiationLog] = useState(false)

  useEffect(() => {
    fetchJob()
    fetchWorkLogs()
    fetchNegotiations()
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
  const fetchWorkLogs = async () => {
  try {
    const res = await api.get(`/jobs/${id}/work-logs`)
    setWorkLogs(res.data.data)
  } catch (err) {
    console.error('Failed to fetch work logs')
  }
}

const fetchNegotiations = async () => {
  try {
    const res = await api.get(`/jobs/${id}/negotiations`)
    setNegotiations(res.data.data)
  } catch (err) {
    // not a participant on this job, nothing to show
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
  
  const handleStartWork = async () => {
  setActionLoading(true)
  setActionMsg('')
  try {
    const res = await api.put(`/jobs/${id}/start`)
    setActionMsg(res.data.message)
    fetchJob()
    fetchWorkLogs()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to start work')
  } finally {
    setActionLoading(false)
  }
}

const handleProposeReschedule = async () => {
  if (!rescheduleStart) { alert('Please select a new start time'); return }
  setActionLoading(true)
  try {
    await api.put(`/jobs/${id}/reschedule`, {
      newStartTime: rescheduleStart,
      newEndTime: rescheduleEnd || undefined,
    })
    setShowReschedule(false)
    setRescheduleStart('')
    setRescheduleEnd('')
    fetchJob()
    fetchWorkLogs()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to propose reschedule')
  } finally {
    setActionLoading(false)
  }
}

const handleAcceptReschedule = async () => {
  setActionLoading(true)
  try {
    await api.put(`/jobs/${id}/reschedule/accept`)
    fetchJob()
    fetchWorkLogs()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to accept reschedule')
  } finally {
    setActionLoading(false)
  }
}

const handleProposeExtension = async () => {
  if (!extendEnd) { alert('Please select a new end time'); return }
  setActionLoading(true)
  try {
    await api.put(`/jobs/${id}/extend`, { newEndTime: extendEnd })
    setShowExtend(false)
    setExtendEnd('')
    fetchWorkLogs()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to propose extension')
  } finally {
    setActionLoading(false)
  }
}

const handleAcceptExtension = async () => {
  setActionLoading(true)
  try {
    await api.put(`/jobs/${id}/extend/accept`)
    fetchJob()
    fetchWorkLogs()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to accept extension')
  } finally {
    setActionLoading(false)
  }
}

const handleOpenRatingModal = () => {
  if (pendingNegotiation) {
    alert('Please accept or decline the pending negotiation request before marking as done.')
    return
  }
  setShowRatingModal(true)
}

const handleSubmitRating = async () => {
  if (ratingStars === 0) {
    alert('Please select a star rating')
    return
  }
  setActionLoading(true)
  try {
    const res = await api.put(`/jobs/${id}/mark-done`, {
      stars: ratingStars,
      comment: ratingComment || undefined,
    })
    setActionMsg(res.data.message)
    setShowRatingModal(false)
    setRatingStars(0)
    setRatingComment('')
    fetchJob()
    fetchWorkLogs()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to submit rating')
  } finally {
    setActionLoading(false)
  }
}

const handleProposeNegotiation = async () => {
  if (!negotiateAmount || parseFloat(negotiateAmount) <= 0) {
    alert('Enter a valid amount')
    return
  }
  setActionLoading(true)
  try {
    await api.put(`/jobs/${id}/negotiate`, { amount: negotiateAmount })
    setNegotiateAmount('')
    fetchNegotiations()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to send request')
  } finally {
    setActionLoading(false)
  }
}

const handleRespondNegotiation = async (action: 'ACCEPT' | 'DECLINE') => {
  setActionLoading(true)
  try {
    await api.put(`/jobs/${id}/negotiate/respond`, { action })
    fetchNegotiations()
    fetchJob()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to respond')
  } finally {
    setActionLoading(false)
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
  const myRole = isCreator ? 'CREATOR' : (job?.workerId === user?.id ? 'WORKER' : null)
const hasPendingReschedule = workLogs.some((l) => l.type === 'RESCHEDULE' && l.status === 'PENDING')
const pendingRescheduleLog = workLogs.find((l) => l.type === 'RESCHEDULE' && l.status === 'PENDING')
const hasPendingExtension = workLogs.some((l) => l.type === 'EXTENSION' && l.status === 'PENDING')
const pendingExtensionLog = workLogs.find((l) => l.type === 'EXTENSION' && l.status === 'PENDING')
const myStartAccepted = myRole === 'CREATOR' ? job?.startAcceptedByCreator : job?.startAcceptedByWorker
const myEndAccepted = myRole === 'CREATOR' ? job?.endAcceptedByCreator : job?.endAcceptedByWorker
const pendingNegotiation = negotiations.find((n) => n.status === 'PENDING')
const canNegotiate =
  !!myRole &&
  !!job &&
  ['WORK_ACCEPTED', 'WORK_STARTED'].includes(job.status) &&
  !job.endAcceptedByCreator &&
  !job.endAcceptedByWorker

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

{/* Negotiation */}
{myRole && (
  <div style={styles.section}>
    <h4 style={styles.sectionTitle}>Negotiation</h4>

    {job.agreedAmount && (
      <div style={styles.agreedBox}>
        ✅ Agreed amount: <strong>₹{job.agreedAmount}</strong>
      </div>
    )}

    {canNegotiate && !pendingNegotiation && (
      <div style={styles.negoRow}>
        <input
          style={styles.negoInput}
          type="number"
          placeholder="₹ Enter amount"
          value={negotiateAmount}
          onChange={(e) => setNegotiateAmount(e.target.value)}
        />
        <button style={styles.negoBtn} onClick={handleProposeNegotiation} disabled={actionLoading}>
          Request Negotiation
        </button>
      </div>
    )}

    {pendingNegotiation && (
      <div style={styles.pendingBox}>
        <p style={styles.pendingText}>
          💬 {pendingNegotiation.proposedBy === user?.id ? 'You requested' : 'Requested amount'}: <strong>₹{pendingNegotiation.amount}</strong>
        </p>
        {pendingNegotiation.proposedBy !== user?.id ? (
          <div style={styles.negoRow}>
            <button style={styles.tickBtn} onClick={() => handleRespondNegotiation('ACCEPT')} disabled={actionLoading}>
              ✓ Accept
            </button>
            <button style={styles.crossBtn} onClick={() => handleRespondNegotiation('DECLINE')} disabled={actionLoading}>
              ✕ Decline
            </button>
          </div>
        ) : (
          <p style={styles.waitingText}>Waiting for the other party to respond...</p>
        )}
      </div>
    )}

    {negotiations.length > 0 && (
      <>
        <button style={styles.logBtn} onClick={() => setShowNegotiationLog(!showNegotiationLog)}>
          {showNegotiationLog ? 'Hide Log' : `View Log (${negotiations.length})`}
        </button>
        {showNegotiationLog && (
          <div style={styles.logList}>
            {negotiations.map((n) => (
              <div key={n.id} style={styles.logItem}>
                {n.proposedBy === user?.id ? 'You' : 'Other party'} requested ₹{n.amount} —{' '}
                {n.status === 'ACCEPTED' ? '✅ Accepted' : n.status === 'DECLINED' ? '❌ Declined' : '⏳ Pending'}{' '}
                · {new Date(n.createdAt).toLocaleString('en-IN')}
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
)}
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

          {/* Work Lifecycle Actions */}
{myRole && job.status === 'WORK_ACCEPTED' && (
  <div style={styles.actionSection}>
    {actionMsg && <div style={styles.actionMsgBox}>{actionMsg}</div>}

    {hasPendingReschedule ? (
      <div style={styles.pendingBox}>
        <p style={styles.pendingText}>
          🔄 Reschedule proposed: {new Date(pendingRescheduleLog.newStartTime).toLocaleString('en-IN')}
        </p>
        {pendingRescheduleLog.proposedBy !== user?.id ? (
          <button style={styles.acceptSmallBtn} onClick={handleAcceptReschedule} disabled={actionLoading}>
            Accept New Time
          </button>
        ) : (
          <p style={styles.waitingText}>Waiting for the other party to accept...</p>
        )}
      </div>
    ) : (
      <>
        <button
          style={{ ...styles.startBtn, opacity: myStartAccepted ? 0.6 : 1 }}
          onClick={handleStartWork}
          disabled={actionLoading || myStartAccepted}
        >
          {myStartAccepted ? '✅ You accepted — waiting for other party' : '▶️ Start Work'}
        </button>
        <button style={styles.rescheduleBtn} onClick={() => setShowReschedule(!showReschedule)}>
          🔄 Reschedule
        </button>
      </>
    )}

    {showReschedule && (
      <div style={styles.rescheduleForm}>
        <label style={styles.smallLabel}>New Start Time</label>
        <input
          style={styles.input}
          type="datetime-local"
          value={rescheduleStart}
          onChange={(e) => setRescheduleStart(e.target.value)}
        />
        <label style={styles.smallLabel}>New End Time (optional)</label>
        <input
          style={styles.input}
          type="datetime-local"
          value={rescheduleEnd}
          onChange={(e) => setRescheduleEnd(e.target.value)}
        />
        <button style={styles.submitSmallBtn} onClick={handleProposeReschedule} disabled={actionLoading}>
          Propose New Time
        </button>
      </div>
    )}
  </div>
)}

{myRole && job.status === 'WORK_STARTED' && (
  <div style={styles.actionSection}>
    {actionMsg && <div style={styles.actionMsgBox}>{actionMsg}</div>}

    <div style={styles.onWorkBadge}>🟡 Work In Progress</div>

    {hasPendingExtension ? (
      <div style={styles.pendingBox}>
        <p style={styles.pendingText}>
          ⏱️ Extension proposed: new end time {new Date(pendingExtensionLog.newEndTime).toLocaleString('en-IN')}
        </p>
        {pendingExtensionLog.proposedBy !== user?.id ? (
          <button style={styles.acceptSmallBtn} onClick={handleAcceptExtension} disabled={actionLoading}>
            Accept Extension
          </button>
        ) : (
          <p style={styles.waitingText}>Waiting for the other party to accept...</p>
        )}
      </div>
    ) : (
      job.endTime && (
        <button style={styles.rescheduleBtn} onClick={() => setShowExtend(!showExtend)}>
          ⏱️ Extend Time
        </button>
      )
    )}

    {showExtend && (
      <div style={styles.rescheduleForm}>
        <label style={styles.smallLabel}>New End Time</label>
        <input
          style={styles.input}
          type="datetime-local"
          value={extendEnd}
          onChange={(e) => setExtendEnd(e.target.value)}
        />
        <button style={styles.submitSmallBtn} onClick={handleProposeExtension} disabled={actionLoading}>
          Propose Extension
        </button>
      </div>
    )}

    <button
  style={{ ...styles.startBtn, opacity: myEndAccepted ? 0.6 : 1, marginTop: '10px' }}
  onClick={handleOpenRatingModal}
  disabled={actionLoading || myEndAccepted}
>
  {myEndAccepted ? '✅ You rated — waiting for other party' : '✅ Mark as Done & Rate'}
</button>
  </div>
)}

{/* Work Log */}
{workLogs.length > 0 && (
  <div style={styles.section}>
    <h4 style={styles.sectionTitle}>Work Log</h4>
    <div style={styles.logList}>
      {job.workStartedAt && (
        <div style={styles.logItem}>▶️ Work started: {new Date(job.workStartedAt).toLocaleString('en-IN')}</div>
      )}
      {workLogs.filter((l) => l.type === 'RESCHEDULE' && l.status === 'ACCEPTED').map((l) => (
        <div key={l.id} style={styles.logItem}>
          🔄 Rescheduled to {new Date(l.newStartTime).toLocaleString('en-IN')}
        </div>
      ))}
      {workLogs.filter((l) => l.type === 'EXTENSION' && l.status === 'ACCEPTED').map((l) => (
        <div key={l.id} style={styles.logItem}>
          ⏱️ Extended to {new Date(l.newEndTime).toLocaleString('en-IN')}
        </div>
      ))}
      {job.workEndedAt && (
        <div style={styles.logItem}>
          ✅ Work ended: {new Date(job.workEndedAt).toLocaleString('en-IN')}
          {job.workStartedAt && (
            <> — Total: {((new Date(job.workEndedAt).getTime() - new Date(job.workStartedAt).getTime()) / 3600000).toFixed(1)} hrs</>
          )}
        </div>
      )}
    </div>
  </div>
)}

          {/* Already accepted or not available */}
          {!canAccept && !isCreator && job.status !== 'PUBLISHED' && (
            <div style={styles.notAvailable}>
              ⚠️ This job is no longer available for acceptance.
            </div>
          )}

        </div>
{showRatingModal && (
  <div style={styles.modalOverlay} onClick={() => setShowRatingModal(false)}>
    <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
      <h3 style={styles.modalTitle}>Rate {myRole === 'CREATOR' ? 'the Worker' : 'the Creator'}</h3>
      <p style={styles.modalSubtitle}>Your rating is required to mark this job as done</p>
<div style={styles.summaryBox}>
  <div style={styles.summaryRow}>
    <span>💰 Amount</span>
    <strong>
      {job.agreedAmount
        ? `₹${job.agreedAmount}`
        : job.budgetMin
          ? `₹${job.budgetMin}${job.budgetMax ? ` - ₹${job.budgetMax}` : '+'}`
          : 'Not set'}
    </strong>
  </div>
  {job.agreedAmount && job.budgetMin && (
    <div style={styles.summaryRow}>
      <span>Original budget (reference)</span>
      <span>₹{job.budgetMin}{job.budgetMax ? ` - ₹${job.budgetMax}` : '+'}</span>
    </div>
  )}
  {job.workStartedAt && (
    <div style={styles.summaryRow}>
      <span>▶️ Started</span>
      <span>{new Date(job.workStartedAt).toLocaleString('en-IN')}</span>
    </div>
  )}
  <div style={styles.summaryRow}>
    <span>⏹️ Ending</span>
    <span>{new Date().toLocaleString('en-IN')}</span>
  </div>
</div>
      <div style={styles.starPicker}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              ...styles.starIcon,
              color: star <= ratingStars ? '#f59e0b' : '#e5e7eb',
            }}
            onClick={() => setRatingStars(star)}
          >
            ★
          </span>
        ))}
      </div>

      <textarea
        style={styles.commentBox}
        placeholder="Add a comment (optional)"
        value={ratingComment}
        onChange={(e) => setRatingComment(e.target.value)}
        rows={3}
      />

      <div style={styles.modalBtnRow}>
        <button style={styles.modalCancelBtn} onClick={() => setShowRatingModal(false)}>
          Cancel
        </button>
        <button
          style={{ ...styles.modalSubmitBtn, opacity: actionLoading ? 0.7 : 1 }}
          onClick={handleSubmitRating}
          disabled={actionLoading}
        >
          {actionLoading ? 'Submitting...' : 'Submit & Mark Done'}
        </button>
      </div>
    </div>
  </div>
)}
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
  actionMsgBox: {
  backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '8px 12px',
  borderRadius: '8px', fontSize: '12px', marginBottom: '10px',
},
startBtn: {
  width: '100%', padding: '12px', backgroundColor: '#10b981', color: '#ffffff',
  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
  cursor: 'pointer', marginBottom: '8px',
},
rescheduleBtn: {
  width: '100%', padding: '10px', backgroundColor: '#ffffff', color: '#6b7280',
  border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px',
  fontWeight: '500', cursor: 'pointer',
},
rescheduleForm: {
  marginTop: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px',
},
smallLabel: {
  display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', margin: '8px 0 4px 0',
},
input: {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px',
  fontSize: '13px', boxSizing: 'border-box',
},
submitSmallBtn: {
  marginTop: '10px', width: '100%', padding: '10px', backgroundColor: '#2563eb',
  color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px',
  fontWeight: '500', cursor: 'pointer',
},
pendingBox: {
  backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px', marginBottom: '8px',
},
pendingText: { fontSize: '13px', color: '#b45309', margin: '0 0 8px 0' },
waitingText: { fontSize: '12px', color: '#9ca3af', margin: 0 },
acceptSmallBtn: {
  padding: '8px 16px', backgroundColor: '#10b981', color: '#ffffff', border: 'none',
  borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
},
onWorkBadge: {
  display: 'inline-block', backgroundColor: '#fef3c7', color: '#b45309',
  padding: '6px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', marginBottom: '12px',
},
logList: { display: 'flex', flexDirection: 'column', gap: '6px' },
logItem: {
  fontSize: '12px', color: '#4b5563', backgroundColor: '#f9fafb', padding: '8px 12px', borderRadius: '6px',
},
modalOverlay: {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px',
},
modalBox: {
  backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
  maxWidth: '400px', width: '100%',
},
modalTitle: { fontSize: '17px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' },
modalSubtitle: { fontSize: '12px', color: '#9ca3af', margin: '0 0 16px 0' },
starPicker: { display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '16px' },
starIcon: { fontSize: '32px', cursor: 'pointer', userSelect: 'none' as const },
commentBox: {
  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
  borderRadius: '8px', fontSize: '13px', resize: 'vertical' as const,
  fontFamily: 'inherit', boxSizing: 'border-box' as const, marginBottom: '16px',
},
modalBtnRow: { display: 'flex', gap: '10px' },
modalCancelBtn: {
  flex: 1, padding: '10px', backgroundColor: '#f3f4f6', color: '#6b7280',
  border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
},
modalSubmitBtn: {
  flex: 1, padding: '10px', backgroundColor: '#2563eb', color: '#ffffff',
  border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
},
agreedBox: {
  backgroundColor: '#f0fdf4', color: '#15803d', padding: '10px 14px',
  borderRadius: '8px', fontSize: '14px', marginBottom: '10px',
},
negoRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
negoInput: {
  flex: 1, minWidth: '120px', padding: '10px 12px', border: '1px solid #d1d5db',
  borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
},
negoBtn: {
  padding: '10px 16px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none',
  borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
},
tickBtn: {
  padding: '8px 16px', backgroundColor: '#10b981', color: '#ffffff', border: 'none',
  borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
},
crossBtn: {
  padding: '8px 16px', backgroundColor: '#fef2f2', color: '#dc2626',
  border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px',
  fontWeight: '600', cursor: 'pointer',
},
logBtn: {
  marginTop: '10px', backgroundColor: 'transparent', color: '#2563eb', border: 'none',
  fontSize: '12px', fontWeight: '500', cursor: 'pointer', padding: 0,
},
summaryBox: {
  backgroundColor: '#f9fafb', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px',
},
summaryRow: {
  display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px',
  color: '#4b5563', padding: '3px 0',
},
}

export default JobDetail