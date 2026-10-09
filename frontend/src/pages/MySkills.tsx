import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Header from '../components/layout/Header'

interface Skill {
  id: number
  skillTitle: string
  description: string
  residenceLocation: string
  isAvailable: boolean
  pricingType: string | null
  priceFixed: number | null
  priceMin: number | null
  priceMax: number | null
  category: { id: number; name: string; icon: string } | null
  suggestedCategoryName: string | null
  createdAt: string
}

const MySkills = () => {
  const navigate = useNavigate()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const res = await api.get('/skills/my-skills')
      setSkills(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch skills')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this skill profile?')) return
    try {
      await api.delete(`/skills/${id}`)
      fetchSkills()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete')
    }
  }

  const handleToggleAvailability = async (id: number) => {
    try {
      await api.put(`/skills/${id}/toggle-availability`)
      fetchSkills()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update')
    }
  }

  const formatPrice = (skill: Skill) => {
    if (skill.pricingType === 'FIXED' && skill.priceFixed) {
      return `₹${skill.priceFixed}`
    }
    if (skill.pricingType === 'RANGE' && skill.priceMin) {
      return `₹${skill.priceMin}${skill.priceMax ? ` - ₹${skill.priceMax}` : '+'}`
    }
    return 'Not set'
  }

  return (
    <div>
      <Header />
      <div style={styles.container}>

        <div style={styles.topRow}>
          <div>
            <h2 style={styles.title}>My Skills</h2>
            <p style={styles.subtitle}>Showcase what you can offer</p>
          </div>
          <button style={styles.addBtn} onClick={() => navigate('/add-skill')}>
            + Add Skill
          </button>
        </div>

        {loading && <div style={styles.centerMsg}>Loading your skills...</div>}
        {error && <div style={styles.errorMsg}>{error}</div>}

        {!loading && skills.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🛠️</div>
            <p style={styles.emptyTitle}>No skills added yet</p>
            <p style={styles.emptyText}>
              Add your skills so creators can find and hire you directly.
            </p>
            <button style={styles.addBtn} onClick={() => navigate('/add-skill')}>
              Add Your First Skill
            </button>
          </div>
        )}

        <div style={styles.skillList}>
          {skills.map((skill) => (
            <div key={skill.id} style={styles.skillCard}>

              <div style={styles.cardTopRow}>
                <div style={styles.categoryTag}>
                  {skill.category
                    ? `${skill.category.icon} ${skill.category.name}`
                    : `⏳ ${skill.suggestedCategoryName} (Pending)`}
                </div>
                <div
                  style={{
                    ...styles.availBadge,
                    backgroundColor: skill.isAvailable ? '#f0fdf4' : '#f3f4f6',
                    color: skill.isAvailable ? '#15803d' : '#9ca3af',
                  }}
                  onClick={() => handleToggleAvailability(skill.id)}
                >
                  {skill.isAvailable ? '🟢 Available' : '⚪ Not Available'}
                </div>
              </div>

              <h3 style={styles.skillTitle}>{skill.skillTitle}</h3>
              <p style={styles.skillDesc}>
                {skill.description.length > 100
                  ? skill.description.substring(0, 100) + '...'
                  : skill.description}
              </p>

              <div style={styles.detailsRow}>
                <span style={styles.detail}>📍 {skill.residenceLocation}</span>
                <span style={styles.detail}>💰 {formatPrice(skill)}</span>
              </div>

              <div style={styles.cardFooter}>
                <button style={styles.viewBtn} onClick={() => navigate(`/skills/${skill.id}`)}>
                  View
                </button>
                <button style={styles.editBtn} onClick={() => navigate(`/edit-skill/${skill.id}`)}>
                  Edit
                </button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(skill.id)}>
                  Delete
                </button>
              </div>

            </div>
          ))}
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
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  title: { fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' },
  subtitle: { fontSize: '13px', color: '#6b7280', margin: 0 },
  addBtn: {
    backgroundColor: '#10b981', color: '#ffffff', border: 'none',
    borderRadius: '8px', padding: '8px 16px', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer',
  },
  centerMsg: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '14px' },
  errorMsg: {
    backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  emptyState: {
    textAlign: 'center', padding: '48px 20px', backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb', borderRadius: '12px',
  },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyTitle: { fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' },
  emptyText: { fontSize: '13px', color: '#9ca3af', margin: '0 0 20px 0' },
  skillList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  skillCard: {
    backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px',
    padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cardTopRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '10px', flexWrap: 'wrap', gap: '8px',
  },
  categoryTag: {
    fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6',
    padding: '3px 10px', borderRadius: '99px',
  },
  availBadge: {
    fontSize: '12px', fontWeight: '500', padding: '3px 10px',
    borderRadius: '99px', cursor: 'pointer',
  },
  skillTitle: { fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 6px 0' },
  skillDesc: { fontSize: '13px', color: '#6b7280', margin: '0 0 12px 0', lineHeight: '1.5' },
  detailsRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' },
  detail: { fontSize: '12px', color: '#6b7280' },
  cardFooter: {
    display: 'flex', gap: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '10px',
  },
  viewBtn: {
    backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px',
    padding: '6px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
  },
  editBtn: {
    backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px',
    padding: '6px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
    borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
  },
}

export default MySkills