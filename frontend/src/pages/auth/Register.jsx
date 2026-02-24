import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid var(--border2)', background: 'var(--surface2)',
  color: 'var(--text)', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.15s', fontFamily: 'DM Sans, sans-serif'
}

const labelStyle = {
  display: 'block', fontSize: '13px', fontWeight: 500,
  color: 'var(--text2)', marginBottom: '6px'
}

function Field({ label, value, onChange, type = 'text', placeholder = '', hint = '' }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        required
        minLength={type === 'password' ? 8 : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border2)'}
      />
      {hint && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{hint}</div>}
    </div>
  )
}

export default function Register() {
  const [form, setForm]       = useState({ name: '', username: '', email: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const { loginUser }         = useAuth()
  const navigate              = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) {
      toast.error('Passwords do not match!')
      return
    }
    setLoading(true)
    try {
      const res = await register({
        name:      form.name,
        username:  form.username,
        email:     form.email,
        password:  form.password,
        password2: form.password2,
      })
      loginUser(res.data.tokens, res.data.user)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.username)              toast.error(`Username: ${data.username[0]}`)
      else if (data?.email)            toast.error(`Email: ${data.email[0]}`)
      else if (data?.password)         toast.error(`Password: ${data.password[0]}`)
      else if (data?.non_field_errors) toast.error(data.non_field_errors[0])
      else                             toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow)' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px', letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--logo-life)' }}>Life</span>
            <span style={{ color: 'var(--logo-os)' }}>OS</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Create your account</div>
        </div>

        <form onSubmit={handleSubmit}>
          <Field
            label="Full Name"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            placeholder="Swayam Panda"
          />
          <Field
            label="Username"
            value={form.username}
            onChange={e => setForm({...form, username: e.target.value})}
            placeholder="swayam_panda"
            hint="Only letters, numbers, @/./+/-/_ allowed. Must be unique."
          />
          <Field
            label="Email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            type="email"
            placeholder="swayam@gmail.com"
          />
          <Field
            label="Password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            type="password"
            placeholder="Min. 8 characters"
            hint="At least 8 characters."
          />
          <Field
            label="Confirm Password"
            value={form.password2}
            onChange={e => setForm({...form, password2: e.target.value})}
            type="password"
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '11px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#0a0a0f', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', marginTop: '8px' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
        </div>

      </div>
    </div>
  )
}