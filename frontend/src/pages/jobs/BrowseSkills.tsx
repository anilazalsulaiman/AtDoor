import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import Header from '../../components/layout/Header'

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
  worker: { id: number; firstName: string; lastName: string }
  createdAt: string
}

interface Category {
  id: number
  name: string
  icon: string
}

const BrowseSkills = () => {
  const navigate = useNavigate()
  const [skills, setSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchSkills()
  }, [selectedCategory, searchQuery, availableOnly])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data.data)
    } catch (err) {
      console.error('Failed to fetch categories')
    }
  }

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (selectedCategory) params.categoryId = selectedCategory
      if (searchQuery) params.search = searchQuery
      if (availableOnly) params.availableOnly = 'true'

      const res = await api.get('/skills', { params })
      setSkills(res.data.data.skills)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch skills')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => setSearchQuery(searchInput)
  const handleClearSearch = () => { setSearchInput(''); setSearchQuery('') }

  const formatPrice = (skill: Skill) => {
    if (skill.pricingType === 'FIXED' && skill.priceFixed) return `₹${skill.priceFixed}`
    if (skill.pricingType === 'RANGE' && skill.priceMin) return `₹${skill.priceMin}${skill.priceMax ? ` - ₹${skill.priceMax}` : '+'}`
    return 'Negotiable'
  }

  return (
    <div>
      <Header />
      <div style={styles.container}>

        <h2 style={styles.title}>Find Skilled Workers</h2>
        <p style={styles.subtitle}>Browse and hire directly based on skills</p>

        <div style={styles.searchRow}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by title, description or location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button style={styles.searchBtn} onClick={handleSearch}>🔍 Search</button>
          {searchQuery && <button style={styles.clearBtn} onClick={handleClearSearch}>✕ Clear</button>}
        </div>

        <div style={styles.filterRow}>
          <div style={styles.categoryRow}>
            <div
              style={{ ...styles.categoryChip, backgroundColor: selectedCategory === null ? '#2563eb' : '#f3f4f6', color: selectedCategory === null ? '#ffffff' : '#6b7280' }}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </div>
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{ ...styles.categoryChip, backgroundColor: selectedCategory === cat.id ? '#2563eb' : '#f3f4f6', color: selectedCategory === cat.id ? '#ffffff' : '#6b7280' }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon} {cat.name}
              </div>
            ))}
          </div>
          <div
            style={{ ...styles.availToggle, backgroundColor: availableOnly ? '#f0fdf4' : '#f3f4f6', color: availableOnly ? '#15803d' : '#6b7280' }}
            onClick={() => setAvailableOnly(!availableOnly)}
          >
            {availableOnly ? '🟢' : '⚪'} Available Only
          </div>
        </div>

        {!loading && (
          <p style={styles.resultsCount}>
            {skills.length} worker{skills.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        )}

        {loading && <div style={styles.centerMsg}>Finding skilled workers...</div>}
        {error && <div style={styles.errorMsg}>{error}</div>}

        {!loading && skills.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <p style={styles.emptyTitle}>No workers found</p>
            <p style={styles.emptyText}>Try a different category or search term</p>
            <button
              style={styles.clearFilterBtn}
              onClick={() => { setSelectedCategory(null); setSearchQuery(''); setSearchInput(''); setAvailableOnly(false) }}
            >
              Clear Filters
            </button>
          </div>
        )}

        <div style={styles.skillGrid}>
          {skills.map((skill) => (
            <div key={skill.id} style={styles.skillCard} onClick={() => navigate(`/skills/${skill.id}`)}>

              <div style={styles.cardTopRow}>
                <div style={styles.categoryTag}>{skill.category?.icon} {skill.category?.name}</div>
                <div style={{
                  ...styles.availBadge,
                  backgroundColor: skill.isAvailable ? '#f0fdf4' : '#f3f4f6',
                  color: skill.isAvailable ? '#15803d' : '#9ca3af',
                }}>
                  {skill.isAvailable ? '🟢 Available' : '⚪ Busy'}
                </div>
              </div>

              <h3 style={styles.skillTitle}>{skill.skillTitle}</h3>
              <p style={styles.skillDesc}>
                {skill.description.length > 100 ? skill.description.substring(0, 100) + '...' : skill.description}
              </p>

              <div style={styles.detailsRow}>
                <span style={styles.detail}>📍 {skill.residenceLocation}</span>
              </div>

              <div style={styles.cardFooter}>
                <div style={styles.priceTag}>💰 {formatPrice(skill)}</div>
                <div style={styles.workerName}>By {skill.worker.firstName} {skill.worker.lastName}</div>
              </div>

              <button style={styles.viewBtn}>View Profile →</button>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '16px', boxSizing: 'border-box', width: '100%' },
  title: { fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' },
  subtitle: { fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0' },
  searchRow: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' },
  searchBtn: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' },
  clearBtn: { backgroundColor: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  filterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' },
  categoryRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  categoryChip: { padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' },
  availToggle: { padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' },
  resultsCount: { fontSize: '13px', color: '#6b7280', marginBottom: '16px' },
  centerMsg: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '14px' },
  errorMsg: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  emptyState: { textAlign: 'center', padding: '48px 20px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyTitle: { fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' },
  emptyText: { fontSize: '13px', color: '#9ca3af', margin: '0 0 20px 0' },
  clearFilterBtn: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' },
  skillGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  skillCard: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardTopRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' },
  categoryTag: { fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: '99px' },
  availBadge: { fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '99px' },
  skillTitle: { fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 },
  skillDesc: { fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.5', flex: 1 },
  detailsRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  detail: { fontSize: '12px', color: '#6b7280' },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' },
  priceTag: { fontSize: '13px', fontWeight: '500', color: '#15803d' },
  workerName: { fontSize: '11px', color: '#9ca3af' },
  viewBtn: { width: '100%', padding: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginTop: '4px' },
}

export default BrowseSkills