import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, changePassword } from '../../api/auth'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, loginUser } = useAuth()

  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    username:   user?.username   || '',
    bio:        user?.bio        || '',
  })

  const [passwords, setPasswords] = useState({
    old_password: '', new_password: '', confirm_password: ''
  })

  const [saving,    setSaving]    = useState(false)
  const [savingPw,  setSavingPw]  = useState(false)
  const [tab,       setTab]       = useState('profile')
  const fileRef                   = useRef()
  const navigate                  = useNavigate()

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateProfile(profile)
      loginUser(
        { access: localStorage.getItem('access_token'), refresh: localStorage.getItem('refresh_token') },
        res.data
      )
      toast.success('Profile updated!')
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.username) toast.error(`Username: ${data.username[0]}`)
      else toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match!')
      return
    }
    setSavingPw(true)
    try {
      await changePassword({ old_password: passwords.old_password, new_password: passwords.new_password })
      toast.success('Password changed!')
      setPasswords({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      const data = err.response?.data
      if (data?.old_password) toast.error(data.old_password[0])
      else if (data?.new_password) toast.error(data.new_password[0])
      else toast.error('Failed to change password.')
    } finally {
      setSavingPw(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const res = await updateProfile(formData)
      loginUser(
        { access: localStorage.getItem('access_token'), refresh: localStorage.getItem('refresh_token') },
        res.data
      )
      toast.success('Avatar updated!')
    } catch {
      toast.error('Failed to upload avatar.')
    }
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

  const tabs = ['profile', 'password', 'account']

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px', paddingBottom: '22px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '28px', letterSpacing: '-0.5px' }}>Profile & Settings</div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Manage your account</div>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--logo-life), var(--logo-os))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 600, color: 'white', overflow: 'hidden'
          }}>
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user?.first_name?.slice(0, 2).toUpperCase() || 'U'
            }
          </div>
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px' }}>{user?.email}</div>
          <button onClick={() => fileRef.current.click()} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Upload Photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
            background: tab === t ? 'var(--accent)' : 'transparent',
            color: tab === t ? '#0a0a0f' : 'var(--muted)',
            transition: 'all 0.15s', textTransform: 'capitalize'
          }}>{t}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', maxWidth: '560px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Personal Information</div>
          <form onSubmit={handleProfileSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} style={inputStyle} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} style={inputStyle} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Username</label>
              <input value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} style={inputStyle} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Bio</label>
              <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} rows={3} placeholder="Tell us about yourself..." style={{ ...inputStyle, resize: 'vertical' }} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
            </div>
            <button type="submit" disabled={saving} style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#0a0a0f', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', maxWidth: '560px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Change Password</div>
          <form onSubmit={handlePasswordSave}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Current Password</label>
              <input type="password" value={passwords.old_password} onChange={e => setPasswords({...passwords, old_password: e.target.value})} style={inputStyle} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>New Password</label>
              <input type="password" value={passwords.new_password} onChange={e => setPasswords({...passwords, new_password: e.target.value})} placeholder="Min. 8 characters" style={inputStyle} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Confirm New Password</label>
              <input type="password" value={passwords.confirm_password} onChange={e => setPasswords({...passwords, confirm_password: e.target.value})} style={inputStyle} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
            </div>
            <button type="submit" disabled={savingPw} style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#0a0a0f', fontSize: '13px', fontWeight: 600, cursor: savingPw ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {savingPw ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Account Tab */}
      {tab === 'account' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', maxWidth: '560px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Account Information</div>
          {[
            { label: 'Email',       value: user?.email },
            { label: 'Username',    value: user?.username },
            { label: 'Member Since', value: new Date(user?.date_joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{label}</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}