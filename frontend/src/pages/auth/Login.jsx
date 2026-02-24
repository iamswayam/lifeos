import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { loginUser }         = useAuth()
  const navigate              = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(form)
      loginUser(res.data.tokens, res.data.user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch {
      toast.error('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    if (!window.google) {
      toast.error('Google script not loaded. Try again.')
      return
    }
    window.google.accounts.id.initialize({
      client_id: '771794348372-6pcgbcvbialbiatlfh0i8nv0500jahdf.apps.googleusercontent.com',
      callback: async (response) => {
        try {
          const res = await api.post('/auth/google/', { token: response.credential })
          loginUser(res.data.tokens, res.data.user)
          toast.success('Welcome!')
          navigate('/dashboard')
        } catch {
          toast.error('Google login failed.')
        }
      }
    })
    window.google.accounts.id.prompt()
  }

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow)' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px', letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--logo-life)' }}>Life</span>
            <span style={{ color: 'var(--logo-os)' }}>OS</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Sign in to your account</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="example@email.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px', borderRadius: '8px', border: 'none',
            background: 'var(--accent)', color: '#0a0a0f',
            fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s'
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--muted)', fontSize: '12px' }}>or</div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <img src="https://www.google.com/favicon.ico" width="16" height="16" />
            Continue with Google
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
