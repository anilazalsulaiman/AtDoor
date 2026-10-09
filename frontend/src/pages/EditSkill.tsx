import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Header from '../components/layout/Header'

interface Category {
  id: number
  name: string
  icon: string
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const WORKING_TYPES = ['HOURLY', 'PER_WORK', 'CONTRACT', 'FULL_DAY', 'COMMISSION_BASED', 'SUCCESS_FEE']
const LANGUAGES = ['English', 'Hindi', 'Malayalam', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi']

const EditSkill = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [formData, setFormData] = useState({
    skillTitle: '', description: '', residenceLocation: '', workingDaysType: '',
    experienceLevel: '', experienceYears: '', experienceMonths: '', pricingType: '',
    priceFixed: '', priceMin: '', priceMax: '', education: '', projectPreference: '',
    preferredCommunication: '', aboutDescription: '',
  })

  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [dateInput, setDateInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [preferredLocations, setPreferredLocations] = useState<string[]>([])
  const [selectedWorkingTypes, setSelectedWorkingTypes] = useState<string[]>([])
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([''])
  const [certifications, setCertifications] = useState<{ name: string; issuer: string }[]>([{ name: '', issuer: '' }])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, skillRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/skills/${id}`),
        ])
        setCategories(catRes.data.data)

        const skill = skillRes.data.data
        setFormData({
          skillTitle: skill.skillTitle || '',
          description: skill.description || '',
          residenceLocation: skill.residenceLocation || '',
          workingDaysType: skill.workingDaysType || '',
          experienceLevel: skill.experienceLevel || '',
          experienceYears: skill.experienceYears?.toString() || '',
          experienceMonths: skill.experienceMonths?.toString() || '',
          pricingType: skill.pricingType || '',
          priceFixed: skill.priceFixed?.toString() || '',
          priceMin: skill.priceMin?.toString() || '',
          priceMax: skill.priceMax?.toString() || '',
          education: skill.education || '',
          projectPreference: skill.projectPreference || '',
          preferredCommunication: skill.preferredCommunication || '',
          aboutDescription: skill.aboutDescription || '',
        })
        if (skill.category) {
          setSelectedCategory(skill.category)
          setSearchQuery(skill.category.name)
        }
        setSelectedDays(skill.preferredDays || [])
        setSelectedDates(skill.preferredDates || [])
        setPreferredLocations(skill.preferredLocations || [])
        setSelectedWorkingTypes(skill.workingTypes || [])
        setSelectedTimes(skill.preferredTimes || [])
        setSelectedLanguages(skill.languages || [])
        setPortfolioLinks(skill.portfolioLinks?.length > 0 ? skill.portfolioLinks.map((p: any) => p.url) : [''])
        setCertifications(skill.certifications?.length > 0
          ? skill.certifications.map((c: any) => ({ name: c.name, issuer: c.issuer || '' }))
          : [{ name: '', issuer: '' }])
      } catch (err: any) {
        setError('Failed to load skill data')
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [id])

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat)
    setSearchQuery(cat.name)
    setShowDropdown(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])
  }

  const addDate = () => {
    if (dateInput && !selectedDates.includes(dateInput)) {
      setSelectedDates([...selectedDates, dateInput])
      setDateInput('')
    }
  }
  const removeDate = (date: string) => setSelectedDates(selectedDates.filter((d) => d !== date))

  const addLocation = () => {
    if (locationInput.trim() && !preferredLocations.includes(locationInput.trim())) {
      setPreferredLocations([...preferredLocations, locationInput.trim()])
      setLocationInput('')
    }
  }
  const removeLocation = (loc: string) => setPreferredLocations(preferredLocations.filter((l) => l !== loc))

  const toggleWorkingType = (type: string) => {
    setSelectedWorkingTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type])
  }

  const toggleTime = (time: string) => {
    if (time === 'ANYTIME') {
      setSelectedTimes(selectedTimes.includes('ANYTIME') ? [] : ['ANYTIME'])
    } else {
      setSelectedTimes((prev) => {
        const withoutAnytime = prev.filter((t) => t !== 'ANYTIME')
        return withoutAnytime.includes(time) ? withoutAnytime.filter((t) => t !== time) : [...withoutAnytime, time]
      })
    }
  }

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang])
  }

  const addPortfolioLink = () => setPortfolioLinks([...portfolioLinks, ''])
  const updatePortfolioLink = (index: number, value: string) => {
    const updated = [...portfolioLinks]; updated[index] = value; setPortfolioLinks(updated)
  }
  const removePortfolioLink = (index: number) => setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index))

  const addCertification = () => setCertifications([...certifications, { name: '', issuer: '' }])
  const updateCertification = (index: number, field: 'name' | 'issuer', value: string) => {
    const updated = [...certifications]; updated[index][field] = value; setCertifications(updated)
  }
  const removeCertification = (index: number) => setCertifications(certifications.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.skillTitle || !formData.description || !formData.residenceLocation) {
      setError('Skill title, description and residence location are required')
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        ...formData,
        categoryId: selectedCategory ? selectedCategory.id : undefined,
        preferredDays: selectedDays.length > 0 ? selectedDays : undefined,
        preferredDates: selectedDates.length > 0 ? selectedDates : undefined,
        preferredTimes: selectedTimes.length > 0 ? selectedTimes : undefined,
        preferredLocations: preferredLocations.length > 0 ? preferredLocations : undefined,
        workingTypes: selectedWorkingTypes.length > 0 ? selectedWorkingTypes : undefined,
        languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
        portfolioLinks: portfolioLinks.filter((l) => l.trim() !== ''),
        certifications: certifications.filter((c) => c.name.trim() !== ''),
      }

      await api.put(`/skills/${id}`, payload)
      setSuccess('✅ Skill updated successfully!')
      setTimeout(() => navigate('/my-skills'), 1200)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update skill')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <div><Header /><div style={styles.centerMsg}>Loading skill...</div></div>

  return (
    <div>
      <Header />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Edit Skill</h2>
          <p style={styles.subtitle}>Update your skill details</p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.successMsg}>{success}</div>}

          <form onSubmit={handleSubmit}>

            <div style={styles.field}>
              <label style={styles.label}>Skill / Category</label>
              <div style={styles.categoryWrapper}>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Search category..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSelectedCategory(null); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                {showDropdown && (
                  <div style={styles.dropdown}>
                    {filteredCategories.map((cat) => (
                      <div key={cat.id} style={styles.dropdownItem} onClick={() => handleCategorySelect(cat)}>
                        {cat.icon} {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedCategory && (
                <div style={styles.selectedBadge}>✅ {selectedCategory.icon} {selectedCategory.name}</div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Skill Title <span style={styles.required}>*</span></label>
              <input style={styles.input} type="text" name="skillTitle" value={formData.skillTitle} onChange={handleChange} required />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description <span style={styles.required}>*</span></label>
              <textarea style={styles.textarea} name="description" value={formData.description} onChange={handleChange} required rows={3} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Residence Location <span style={styles.required}>*</span></label>
              <input style={styles.input} type="text" name="residenceLocation" value={formData.residenceLocation} onChange={handleChange} required />
            </div>

            <div style={styles.sectionDivider}>Optional details</div>

            <div style={styles.field}>
              <label style={styles.label}>Preferred Working Days</label>
              <select style={styles.input} name="workingDaysType" value={formData.workingDaysType} onChange={handleChange}>
                <option value="">Select</option>
                <option value="DAILY">Daily</option>
                <option value="SPECIFIC_DAYS">Specific Days</option>
                <option value="SPECIFIC_DATES">Specific Dates</option>
              </select>
              {formData.workingDaysType === 'SPECIFIC_DAYS' && (
                <div style={styles.chipRow}>
                  {DAYS.map((day) => (
                    <div key={day} style={{ ...styles.chip, ...(selectedDays.includes(day) ? styles.chipActive : {}) }} onClick={() => toggleDay(day)}>
                      {day}
                    </div>
                  ))}
                </div>
              )}
              {formData.workingDaysType === 'SPECIFIC_DATES' && (
                <div style={styles.tagInputRow}>
                  <input style={styles.input} type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
                  <button type="button" style={styles.addTagBtn} onClick={addDate}>Add</button>
                  <div style={styles.tagList}>
                    {selectedDates.map((date) => (
                      <div key={date} style={styles.tag}>{date} <span onClick={() => removeDate(date)} style={styles.tagRemove}>✕</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Preferred Working Time</label>
              <div style={styles.chipRow}>
                {['ANYTIME', 'MORNING', 'EVENING', 'NIGHT'].map((time) => (
                  <div key={time} style={{ ...styles.chip, ...(selectedTimes.includes(time) ? styles.chipActive : {}) }} onClick={() => toggleTime(time)}>
                    {time === 'MORNING' ? 'Morning (6am-12pm)' : time === 'EVENING' ? 'Evening (12pm-6pm)' : time === 'NIGHT' ? 'Night (6pm-6am)' : 'Anytime'}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Preferred Work Locations</label>
              <div style={styles.tagInputRow}>
                <input style={styles.input} type="text" placeholder="Type a location and press Add" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())} />
                <button type="button" style={styles.addTagBtn} onClick={addLocation}>Add</button>
              </div>
              <div style={styles.tagList}>
                {preferredLocations.map((loc) => (
                  <div key={loc} style={styles.tag}>{loc} <span onClick={() => removeLocation(loc)} style={styles.tagRemove}>✕</span></div>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Working Type</label>
              <div style={styles.chipRow}>
                {WORKING_TYPES.map((type) => (
                  <div key={type} style={{ ...styles.chip, ...(selectedWorkingTypes.includes(type) ? styles.chipActive : {}) }} onClick={() => toggleWorkingType(type)}>
                    {type.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Experience Level</label>
              <select style={styles.input} name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
                <option value="">Select</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="EXPERT">Expert</option>
                <option value="CUSTOM">Custom (enter years/months)</option>
              </select>
              {formData.experienceLevel === 'CUSTOM' && (
                <div style={styles.row}>
                  <input style={styles.input} type="number" name="experienceYears" placeholder="Years" value={formData.experienceYears} onChange={handleChange} />
                  <input style={styles.input} type="number" name="experienceMonths" placeholder="Months" value={formData.experienceMonths} onChange={handleChange} />
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Portfolio Links</label>
              {portfolioLinks.map((link, index) => (
                <div key={index} style={styles.tagInputRow}>
                  <input style={styles.input} type="text" placeholder="https://..." value={link} onChange={(e) => updatePortfolioLink(index, e.target.value)} />
                  {portfolioLinks.length > 1 && <button type="button" style={styles.removeBtn} onClick={() => removePortfolioLink(index)}>✕</button>}
                </div>
              ))}
              <button type="button" style={styles.addLinkBtn} onClick={addPortfolioLink}>+ Add another link</button>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Pricing</label>
              <select style={styles.input} name="pricingType" value={formData.pricingType} onChange={handleChange}>
                <option value="">Select</option>
                <option value="FIXED">Fixed Price</option>
                <option value="RANGE">Custom Range</option>
              </select>
              {formData.pricingType === 'FIXED' && (
                <input style={{ ...styles.input, marginTop: '8px' }} type="number" name="priceFixed" placeholder="₹ Amount" value={formData.priceFixed} onChange={handleChange} />
              )}
              {formData.pricingType === 'RANGE' && (
                <div style={styles.row}>
                  <input style={styles.input} type="number" name="priceMin" placeholder="₹ Min" value={formData.priceMin} onChange={handleChange} />
                  <input style={styles.input} type="number" name="priceMax" placeholder="₹ Max" value={formData.priceMax} onChange={handleChange} />
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Languages Spoken</label>
              <div style={styles.chipRow}>
                {LANGUAGES.map((lang) => (
                  <div key={lang} style={{ ...styles.chip, ...(selectedLanguages.includes(lang) ? styles.chipActive : {}) }} onClick={() => toggleLanguage(lang)}>
                    {lang}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Certifications</label>
              {certifications.map((cert, index) => (
                <div key={index} style={styles.row}>
                  <input style={styles.input} type="text" placeholder="Certification name" value={cert.name} onChange={(e) => updateCertification(index, 'name', e.target.value)} />
                  <input style={styles.input} type="text" placeholder="Issuer (optional)" value={cert.issuer} onChange={(e) => updateCertification(index, 'issuer', e.target.value)} />
                  {certifications.length > 1 && <button type="button" style={styles.removeBtn} onClick={() => removeCertification(index)}>✕</button>}
                </div>
              ))}
              <button type="button" style={styles.addLinkBtn} onClick={addCertification}>+ Add another certification</button>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Education</label>
              <input style={styles.input} type="text" name="education" value={formData.education} onChange={handleChange} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Project Preference</label>
              <select style={styles.input} name="projectPreference" value={formData.projectPreference} onChange={handleChange}>
                <option value="">Select</option>
                <option value="ONSITE">On-site</option>
                <option value="REMOTE">Remote Only</option>
                <option value="ANY">Any</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Preferred Communication</label>
              <select style={styles.input} name="preferredCommunication" value={formData.preferredCommunication} onChange={handleChange}>
                <option value="">Select</option>
                <option value="CHAT">Chat</option>
                <option value="EMAIL">Email</option>
                <option value="PHONE">Phone</option>
                <option value="ANY">Any</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>About You</label>
              <textarea style={styles.textarea} name="aboutDescription" value={formData.aboutDescription} onChange={handleChange} rows={3} />
            </div>

            <button style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Update Skill'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { maxWidth: '680px', margin: '0 auto', padding: '16px', boxSizing: 'border-box', width: '100%' },
  centerMsg: { textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '14px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  title: { fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' },
  subtitle: { fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0' },
  error: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  successMsg: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  field: { marginBottom: '18px', position: 'relative' },
  row: { display: 'flex', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
  required: { color: '#dc2626', marginLeft: '2px' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', resize: 'vertical', fontFamily: 'inherit' },
  sectionDivider: { fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 16px 0', borderTop: '1px solid #f3f4f6', paddingTop: '20px' },
  categoryWrapper: { position: 'relative' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: '200px', overflowY: 'auto' },
  dropdownItem: { padding: '10px 14px', fontSize: '13px', color: '#111827', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' },
  selectedBadge: { marginTop: '6px', fontSize: '12px', color: '#15803d', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '99px', display: 'inline-block' },
  chipRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' },
  chip: { padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '500', backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'pointer' },
  chipActive: { backgroundColor: '#2563eb', color: '#ffffff' },
  tagInputRow: { display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' },
  addTagBtn: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' },
  tagList: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  tag: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '99px', fontSize: '12px' },
  tagRemove: { cursor: 'pointer', fontWeight: '600' },
  removeBtn: { backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '0 12px', fontSize: '13px', cursor: 'pointer' },
  addLinkBtn: { backgroundColor: 'transparent', color: '#2563eb', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', padding: '4px 0' },
  button: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
}

export default EditSkill