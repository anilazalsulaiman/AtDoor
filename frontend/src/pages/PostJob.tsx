import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Header from '../components/layout/Header'

interface Category {
  id: number
  name: string
  icon: string
}

const PostJob = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isSuggestedCategory, setIsSuggestedCategory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    budgetMin: '',
    budgetMax: '',
    contactPreference: 'CHAT_ONLY',
  })

  // Load all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories')
        setCategories(res.data.data)
      } catch (err) {
        console.error('Failed to fetch categories')
      }
    }
    fetchCategories()
  }, [])

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat)
    setSearchQuery(cat.name)
    setIsSuggestedCategory(false)
    setShowDropdown(false)
  }

  const handleSuggestCategory = () => {
    setSelectedCategory(null)
    setIsSuggestedCategory(true)
    setShowDropdown(false)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedCategory && !isSuggestedCategory) {
      setError('Please select or suggest a category')
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        ...formData,
        categoryId: selectedCategory ? selectedCategory.id : undefined,
        suggestedCategoryName: isSuggestedCategory ? searchQuery : undefined,
      }

      const res = await api.post('/jobs', payload)

      if (res.data.data.status === 'PENDING') {
        setSuccess(
          '⏳ Job submitted! Awaiting category approval before publishing.'
        )
      } else {
        setSuccess('✅ Job posted successfully!')
        setTimeout(() => navigate('/my-jobs'), 1500)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Post a Job</h2>
          <p style={styles.subtitle}>
            Describe your work and find the right person
          </p>

          {error && (
            <div style={styles.toastError}>
                ❌ {error}
            </div>
            )}
            {success && (
            <div style={styles.toast}>
                ✅ {success}
            </div>
            )}

          <form onSubmit={handleSubmit}>

            {/* Category Search */}
            <div style={styles.field}>
              <label style={styles.label}>
                Category <span style={styles.required}>*</span>
              </label>
              <div style={styles.categoryWrapper}>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Search category... e.g. Plumbing"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSelectedCategory(null)
                    setIsSuggestedCategory(false)
                    setShowDropdown(true)
                  }}
                  onFocus ={() => {
                    setShowDropdown(true)
                    if (searchQuery === '') {
                        setSearchQuery('')
                    }
                    }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                {showDropdown && (
                  <div style={styles.dropdown}>
                    {filteredCategories.length > 0 ? (
                    <>
                        {filteredCategories.map((cat) => (
                        <div
                            key={cat.id}
                            style={styles.dropdownItem}
                            onClick={() => handleCategorySelect(cat)}
                        >
                            {cat.icon} {cat.name}
                        </div>
                        ))}
                        {searchQuery.length > 0 && !selectedCategory && 
                        !filteredCategories.some(cat => 
                            cat.name.toLowerCase() === searchQuery.toLowerCase()
                        ) && (
                        <div
                            style={styles.suggestItem}
                            onClick={handleSuggestCategory}
                        >
                            + Suggest "{searchQuery}" as new category
                        </div>
                        )}
                    </>
                    ) : (
                    <>
                        {searchQuery.length > 0 && (
                        <div
                            style={styles.suggestItem}
                            onClick={handleSuggestCategory}
                        >
                            + Suggest "{searchQuery}" as new category
                        </div>
                        )}
                    </>
                    )}
                    {/* {filteredCategories.length > 0 ? (
                      <>
                        {filteredCategories.map((cat) => (
                          <div
                            key={cat.id}
                            style={styles.dropdownItem}
                            onClick={() => handleCategorySelect(cat)}
                          >
                            {cat.icon} {cat.name}
                          </div>
                        ))}
                        <div
                          style={styles.suggestItem}
                          onClick={handleSuggestCategory}
                        >
                          + Suggest "{searchQuery}" as new category
                        </div>
                      </>
                    ) : (
                      <div
                        style={styles.suggestItem}
                        onClick={handleSuggestCategory}
                      >
                        + Suggest "{searchQuery}" as new category
                      </div>
                    )} */}
                  </div>
                )}
              </div>
              {selectedCategory && (
                <div style={styles.selectedBadge}>
                  ✅ {selectedCategory.icon} {selectedCategory.name}
                </div>
              )}
              {isSuggestedCategory && (
                <div style={styles.pendingBadge}>
                  ⏳ "{searchQuery}" will be suggested for approval
                </div>
              )}
            </div>

            {/* Title */}
            <div style={styles.field}>
              <label style={styles.label}>
                Job Title <span style={styles.required}>*</span>
              </label>
              <input
                style={styles.input}
                type="text"
                name="title"
                placeholder="e.g. Need a plumber to fix kitchen sink"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div style={styles.field}>
              <label style={styles.label}>
                Description <span style={styles.required}>*</span>
              </label>
              <textarea
                style={styles.textarea}
                name="description"
                placeholder="Describe the work in detail..."
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>

            {/* Location */}
            <div style={styles.field}>
              <label style={styles.label}>
                Location <span style={styles.required}>*</span>
              </label>
              <input
                style={styles.input}
                type="text"
                name="location"
                placeholder="e.g. Kollam, Kerala"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* Start and End Time */}
            <div style={styles.row}>
              <div style={styles.halfField}>
                <label style={styles.label}>
                  Start Time <span style={styles.required}>*</span>
                </label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={styles.halfField}>
                <label style={styles.label}>
                  End Time <span style={styles.required}>*</span>
                </label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Budget */}
            <div style={styles.row}>
              <div style={styles.halfField}>
                <label style={styles.label}>
                  Min Budget (₹) <span style={styles.optional}>(Optional)</span>
                </label>
                <input
                  style={styles.input}
                  type="number"
                  name="budgetMin"
                  placeholder="e.g. 500"
                  value={formData.budgetMin}
                  onChange={handleChange}
                />
              </div>
              <div style={styles.halfField}>
                <label style={styles.label}>
                  Max Budget (₹) <span style={styles.optional}>(Optional)</span>
                </label>
                <input
                  style={styles.input}
                  type="number"
                  name="budgetMax"
                  placeholder="e.g. 1000"
                  value={formData.budgetMax}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contact Preference */}
            <div style={styles.field}>
              <label style={styles.label}>Contact Preference</label>
              <select
                style={styles.input}
                name="contactPreference"
                value={formData.contactPreference}
                onChange={handleChange}
              >
                <option value="CHAT_ONLY">In-app Chat Only</option>
                <option value="PHONE">Show Phone Number</option>
                <option value="EMAIL">Show Email</option>
              </select>
            </div>

            {/* Submit */}
            <button
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '16px',
    boxSizing: 'border-box',
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
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
    margin: '0 0 24px 0',
  },
  error: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  successMsg: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  field: {
    marginBottom: '16px',
    position: 'relative',
  },
  row: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  halfField: {
    flex: '1 1 140px',
    minWidth: '140px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  required: {
    color: '#dc2626',
    marginLeft: '2px',
  },
  optional: {
    fontSize: '11px',
    color: '#9ca3af',
    fontWeight: '400',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  categoryWrapper: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 50,
    maxHeight: '200px',
    overflowY: 'auto',
  },
  dropdownItem: {
    padding: '10px 14px',
    fontSize: '13px',
    color: '#111827',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6',
  },
  suggestItem: {
    padding: '10px 14px',
    fontSize: '13px',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: '500',
  },
  selectedBadge: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#15803d',
    backgroundColor: '#f0fdf4',
    padding: '4px 10px',
    borderRadius: '99px',
    display: 'inline-block',
  },
  pendingBadge: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '4px 10px',
    borderRadius: '99px',
    display: 'inline-block',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  toast: {
  position: 'fixed' as const,
  top: '70px',
  right: '20px',
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  color: '#15803d',
  padding: '12px 20px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  zIndex: 1000,
},
toastError: {
  position: 'fixed' as const,
  top: '70px',
  right: '20px',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  padding: '12px 20px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  zIndex: 1000,
},
}

export default PostJob