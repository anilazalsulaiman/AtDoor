 
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import type { RegisterInput } from '../../types/user.types'

const Register = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState<RegisterInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
    defaultMode: undefined,
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/register', formData)
      const { user, token } = response.data.data
      login(token, user, false)
      navigate('/home')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* App Name */}
        <h1 style={styles.appName}>AtDoor</h1>
        <p style={styles.subtitle}>Create your account</p>

        {/* Error message */}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* First Name + Last Name */}
          <div style={styles.row}>
            <div style={styles.halfField}>
              <label style={styles.label}>First Name</label>
              <input
                style={styles.input}
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.halfField}>
              <label style={styles.label}>Last Name</label>
              <input
                style={styles.input}
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div style={styles.field}>
            <label style={styles.label}>Phone</label>
            <input
              style={styles.input}
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Date of Birth */}
          <div style={styles.field}>
            <label style={styles.label}>Date of Birth</label>
            <input
              style={styles.input}
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <input
              style={styles.input}
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Default Mode */}
          <div style={styles.field}>
            <label style={styles.label}>
              Default Mode <span style={styles.optional}>(Optional)</span>
            </label>
            <select
              style={styles.input}
              name="defaultMode"
              value={formData.defaultMode || ''}
              onChange={handleChange}
            >
              <option value="">Select your primary role</option>
              <option value="CREATOR">Creator — I want to post jobs</option>
              <option value="WORKER">Worker — I want to offer skills</option>
              <option value="BOTH">Both — I want to do both</option>
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Login link */}
        <p style={styles.loginText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  appName: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2563eb',
    textAlign: 'center',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '24px',
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
  row: {
    display: 'flex',
    gap: '12px',
  },
  halfField: {
    flex: 1,
    marginBottom: '16px',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
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
  loginText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '20px',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
}

export default Register