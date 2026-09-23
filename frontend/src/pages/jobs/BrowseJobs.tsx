import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import Header from '../../components/layout/Header'

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
  creator: {
    id: number
    firstName: string
    lastName: string
  }
  photos: { photoUrl: string }[]
}

interface Category {
  id: number
  name: string
  icon: string
}

const BrowseJobs = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [selectedCategory, searchQuery])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data.data)
    } catch (err) {
      console.error('Failed to fetch categories')
    }
  }

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (selectedCategory) params.categoryId = selectedCategory
      if (searchQuery) params.search = searchQuery

      const res = await api.get('/jobs', { params })
      setJobs(res.data.data.jobs)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

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

        {/* Page title */}
        <h2 style={styles.title}>Browse Jobs</h2>
        <p style={styles.subtitle}>Find work that matches your skills</p>

        {/* Search bar */}
        <div style={styles.searchRow}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by title, description or location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button style={styles.searchBtn} onClick={handleSearch}>
            🔍 Search
          </button>
          {searchQuery && (
            <button style={styles.clearBtn} onClick={handleClearSearch}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Category filters */}
        <div style={styles.categoryRow}>
          <div
            style={{
              ...styles.categoryChip,
              backgroundColor: selectedCategory === null ? '#2563eb' : '#f3f4f6',
              color: selectedCategory === null ? '#ffffff' : '#6b7280',
            }}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </div>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                ...styles.categoryChip,
                backgroundColor: selectedCategory === cat.id ? '#2563eb' : '#f3f4f6',
                color: selectedCategory === cat.id ? '#ffffff' : '#6b7280',
              }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon} {cat.name}
            </div>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p style={styles.resultsCount}>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div style={styles.centerMsg}>Finding jobs for you...</div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.errorMsg}>{error}</div>
        )}

        {/* Empty state */}
        {!loading && jobs.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <p style={styles.emptyTitle}>No jobs found</p>
            <p style={styles.emptyText}>
              Try a different category or search term
            </p>
            <button
              style={styles.clearFilterBtn}
              onClick={() => {
                setSelectedCategory(null)
                setSearchQuery('')
                setSearchInput('')
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Job cards */}
        <div style={styles.jobGrid}>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={styles.jobCard}
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              {/* Category + time */}
              <div style={styles.cardTopRow}>
                <div style={styles.categoryTag}>
                  {job.category?.icon} {job.category?.name}
                </div>
                <div style={styles.timeAgo}>
                  {formatDate(job.createdAt)}
                </div>
              </div>

              {/* Title */}
              <h3 style={styles.jobTitle}>{job.title}</h3>

              {/* Description */}
              <p style={styles.jobDesc}>
                {job.description.length > 120
                  ? job.description.substring(0, 120) + '...'
                  : job.description}
              </p>

              {/* Details */}
              <div style={styles.detailsRow}>
                <span style={styles.detail}>📍 {job.location}</span>
                <span style={styles.detail}>🕐 {formatDate(job.startTime)}</span>
              </div>

              {/* Footer */}
              <div style={styles.cardFooter}>
                <div style={styles.budgetTag}>
                  {job.budgetMin
                    ? `💰 ₹${job.budgetMin}${job.budgetMax ? ` - ₹${job.budgetMax}` : '+'}`
                    : '💰 Negotiable'}
                </div>
                <div style={styles.postedBy}>
                  By {job.creator.firstName} {job.creator.lastName}
                </div>
              </div>

              {/* View details button */}
              <button style={styles.viewBtn}>
                View Details →
              </button>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '16px',
    boxSizing: 'border-box',
    width: '100%',
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
    margin: '0 0 16px 0',
  },
  searchRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  searchBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  clearBtn: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  categoryRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  categoryChip: {
    padding: '6px 12px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s',
  },
  resultsCount: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '16px',
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
  clearFilterBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  jobGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '6px',
  },
  categoryTag: {
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '3px 10px',
    borderRadius: '99px',
  },
  timeAgo: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  jobTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  jobDesc: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.5',
    flex: 1,
  },
  detailsRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
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
    gap: '6px',
  },
  budgetTag: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#15803d',
  },
  postedBy: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  viewBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '4px',
  },
}

export default BrowseJobs