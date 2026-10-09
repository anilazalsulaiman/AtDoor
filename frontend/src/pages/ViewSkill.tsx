import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Header from '../components/layout/Header'
import { useAuth } from '../context/AuthContext'

const ViewSkill = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [skill, setSkill] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const res = await api.get(`/skills/${id}`)
        setSkill(res.data.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load skill')
      } finally {
        setLoading(false)
      }
    }
    fetchSkill()
  }, [id])

  const formatPrice = () => {
    if (!skill) return ''
    if (skill.pricingType === 'FIXED' && skill.priceFixed) return `₹${skill.priceFixed}`
    if (skill.pricingType === 'RANGE' && skill.priceMin) return `₹${skill.priceMin}${skill.priceMax ? ` - ₹${skill.priceMax}` : '+'}`
    return 'Negotiable'
  }

  const isOwner = skill?.worker?.id === user?.id
  if (loading) return <div><Header /><div style={styles.centerMsg}>Loading...</div></div>
  if (error || !skill) return (
    <div><Header /><div style={styles.container}>
      <div style={styles.errorMsg}>{error || 'Skill not found'}</div>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
    </div></div>
  )

  return (
    <div>
      <Header />
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>

        <div style={styles.card}>
          <div style={styles.topRow}>
            <div style={styles.categoryTag}>
              {skill.category ? `${skill.category.icon} ${skill.category.name}` : `⏳ ${skill.suggestedCategoryName}`}
            </div>
            <div style={{
              ...styles.availBadge,
              backgroundColor: skill.isAvailable ? '#f0fdf4' : '#f3f4f6',
              color: skill.isAvailable ? '#15803d' : '#9ca3af',
            }}>
              {skill.isAvailable ? '🟢 Available' : '⚪ Not Available'}
            </div>
          </div>

          <h2 style={styles.title}>{skill.skillTitle}</h2>
          <p style={styles.desc}>{skill.description}</p>

          <div style={styles.grid}>
            <div style={styles.item}><span style={styles.label}>📍 Location</span><span style={styles.value}>{skill.residenceLocation}</span></div>
            <div style={styles.item}><span style={styles.label}>💰 Pricing</span><span style={styles.value}>{formatPrice()}</span></div>
            {skill.experienceLevel && (
              <div style={styles.item}><span style={styles.label}>📊 Experience</span><span style={styles.value}>
                {skill.experienceLevel === 'CUSTOM'
                  ? `${skill.experienceYears || 0}y ${skill.experienceMonths || 0}m`
                  : skill.experienceLevel}
              </span></div>
            )}
            {skill.preferredTimes?.length > 0 && (
              <div style={styles.item}><span style={styles.label}>🕐 Working Time</span><span style={styles.value}>{skill.preferredTimes.join(', ')}</span></div>
            )}
            {skill.workingDaysType && (
              <div style={styles.item}><span style={styles.label}>📅 Working Days</span><span style={styles.value}>
                {skill.workingDaysType === 'SPECIFIC_DAYS' ? skill.preferredDays?.join(', ')
                  : skill.workingDaysType === 'SPECIFIC_DATES' ? skill.preferredDates?.join(', ')
                  : 'Daily'}
              </span></div>
            )}
            {skill.education && (
              <div style={styles.item}><span style={styles.label}>🎓 Education</span><span style={styles.value}>{skill.education}</span></div>
            )}
            {skill.projectPreference && (
              <div style={styles.item}><span style={styles.label}>🏢 Project Type</span><span style={styles.value}>{skill.projectPreference}</span></div>
            )}
            {skill.preferredCommunication && (
              <div style={styles.item}><span style={styles.label}>💬 Communication</span><span style={styles.value}>{skill.preferredCommunication}</span></div>
            )}
          </div>

          {skill.workingTypes?.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Working Type</h4>
              <div style={styles.chipRow}>
                {skill.workingTypes.map((t: string) => <span key={t} style={styles.chip}>{t.replace(/_/g, ' ')}</span>)}
              </div>
            </div>
          )}

          {skill.languages?.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Languages</h4>
              <div style={styles.chipRow}>
                {skill.languages.map((l: string) => <span key={l} style={styles.chip}>{l}</span>)}
              </div>
            </div>
          )}

          {skill.preferredLocations?.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Preferred Locations</h4>
              <div style={styles.chipRow}>
                {skill.preferredLocations.map((l: string) => <span key={l} style={styles.chip}>{l}</span>)}
              </div>
            </div>
          )}

          {skill.certifications?.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Certifications</h4>
              {skill.certifications.map((c: any) => (
                <div key={c.id} style={styles.certItem}>🎖️ {c.name}{c.issuer ? ` — ${c.issuer}` : ''}</div>
              ))}
            </div>
          )}

          {skill.portfolioLinks?.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Portfolio</h4>
              {skill.portfolioLinks.map((p: any) => (
                <a key={p.id} href={p.url} target="_blank" rel="noreferrer" style={styles.portfolioLink}>🔗 {p.url}</a>
              ))}
            </div>
          )}

          {skill.aboutDescription && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>About</h4>
              <p style={styles.desc}>{skill.aboutDescription}</p>
            </div>
          )}

          {isOwner ? (
  <button style={styles.editBtn} onClick={() => navigate(`/edit-skill/${skill.id}`)}>
    Edit Skill
  </button>
) : (
  <div style={styles.contactSection}>
    <h4 style={styles.sectionTitle}>Contact</h4>
    <div style={styles.contactRow}>
      {(skill.preferredCommunication === 'PHONE' || skill.preferredCommunication === 'ANY') && (
        <a href={`tel:${skill.worker.phone}`} style={styles.callBtn}>
          📞 Call {skill.worker.firstName}
        </a>
      )}
      {(skill.preferredCommunication === 'EMAIL' || skill.preferredCommunication === 'ANY') && (
        <a href={`mailto:${skill.worker.email}`} style={styles.emailBtn}>
          📧 Email {skill.worker.firstName}
        </a>
      )}
      {(!skill.preferredCommunication || skill.preferredCommunication === 'CHAT') && (
        <div style={styles.chatBtn}>💬 Chat in App</div>
      )}
    </div>
    {!skill.isAvailable && (
      <div style={styles.notAvailableNote}>
        ⚠️ This worker is currently marked as not available.
      </div>
    )}
  </div>
)}
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '16px', boxSizing: 'border-box', width: '100%' },
  centerMsg: { textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '14px' },
  backBtn: { backgroundColor: 'transparent', border: 'none', color: '#2563eb', fontSize: '14px', cursor: 'pointer', padding: '0 0 16px 0', fontWeight: '500' },
  errorMsg: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  topRow: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
  categoryTag: { fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '99px' },
  availBadge: { fontSize: '12px', fontWeight: '500', padding: '4px 12px', borderRadius: '99px' },
  title: { fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' },
  desc: { fontSize: '14px', color: '#4b5563', lineHeight: '1.7', margin: '0 0 16px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' },
  item: { display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: '#f9fafb', padding: '10px 12px', borderRadius: '8px' },
  label: { fontSize: '11px', color: '#9ca3af', fontWeight: '500' },
  value: { fontSize: '13px', color: '#111827', fontWeight: '500' },
  section: { marginBottom: '16px' },
  sectionTitle: { fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' },
  chipRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  chip: { padding: '4px 12px', borderRadius: '99px', fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8' },
  certItem: { fontSize: '13px', color: '#4b5563', marginBottom: '6px' },
  portfolioLink: { display: 'block', fontSize: '13px', color: '#2563eb', marginBottom: '6px', wordBreak: 'break-all' },
  editBtn: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  contactSection: {
  borderTop: '1px solid #f3f4f6',
  paddingTop: '20px',
  marginTop: '8px',
},
notAvailableNote: {
  backgroundColor: '#fef3c7',
  color: '#b45309',
  padding: '10px 14px',
  borderRadius: '8px',
  fontSize: '13px',
  marginTop: '12px',
  textAlign: 'center',
},
contactRow: {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
},
callBtn: {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
  borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '500',
  textDecoration: 'none', cursor: 'pointer',
},
emailBtn: {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
  borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '500',
  textDecoration: 'none', cursor: 'pointer',
},
chatBtn: {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb',
  borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '500',
  cursor: 'pointer',
},
}

export default ViewSkill