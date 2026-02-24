import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getEntries, getMoodSummary } from '../../api/journal'
import { getTodos, toggleStatus } from '../../api/todos'
import { getUpcoming, getSummary } from '../../api/interviews'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const s = {
  card: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden', marginBottom:'0' },
  ch:   { padding:'15px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' },
  ct:   { fontSize:'13.5px', fontWeight:600, color:'var(--text)' },
  cl:   { fontSize:'12px', color:'var(--accent)', cursor:'pointer', textDecoration:'none' },
  cb:   { padding:'4px 20px' },
  cbp:  { padding:'16px 20px' },
}

function StatCard({ label, value, sub, subColor, topColor }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'18px', position:'relative', overflow:'hidden', transition:'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='none' }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:topColor }} />
      <div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px' }}>{label}</div>
      <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'34px', lineHeight:1, marginBottom:'4px', color:'var(--text)' }}>{value}</div>
      <div style={{ fontSize:'11.5px', color: subColor || 'var(--muted)' }}>{sub}</div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [entries,    setEntries]    = useState([])
  const [todos,      setTodos]      = useState([])
  const [upcoming,   setUpcoming]   = useState([])
  const [intSummary, setIntSummary] = useState({})
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([getEntries(), getTodos(), getUpcoming(), getSummary()])
      .then(([e, t, u, s]) => {
        setEntries(e.data.slice(0, 3))
        setTodos(t.data.slice(0, 5))
        setUpcoming(u.data.slice(0, 3))
        setIntSummary(s.data)
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async (id) => {
    try {
      const res = await toggleStatus(id)
      setTodos(todos.map(t => t.id === id ? { ...t, status: res.data.status } : t))
    } catch { toast.error('Failed to update') }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const moodEmoji = { great:'😊', good:'🙂', neutral:'😐', bad:'😔', terrible:'😢' }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--muted)', fontSize:'14px' }}>Loading...</div>

  const pendingCount   = todos.filter(t => t.status !== 'done').length
  const completedCount = todos.filter(t => t.status === 'done').length
  const overdueCount   = todos.filter(t => t.is_overdue).length

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'28px', paddingBottom:'22px', borderBottom:'1px solid var(--border)' }}>
        <div>
          <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'30px', letterSpacing:'-0.5px', marginBottom:'4px' }}>
            {greeting}, <em style={{ fontStyle:'italic', color:'var(--name-color)' }}>{user?.first_name?.split(' ')[0]}</em> 👋
          </div>
          <div style={{ fontSize:'13px', color:'var(--muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => navigate('/todos')} style={{ padding:'8px 16px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text2)', fontSize:'13px', fontWeight:500, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>+ New Todo</button>
          <button onClick={() => navigate('/journal')} style={{ padding:'8px 16px', borderRadius:'8px', border:'none', background:'var(--accent)', color:'#0a0a0f', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>+ New Entry</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
        <StatCard label="Journal Entries"  value={entries.length}    sub="This session"    topColor="linear-gradient(90deg,#fb923c,#fdba74)" />
        <StatCard label="Completed Tasks"  value={completedCount}    sub={completedCount > 0 ? "↑ Keep going!" : "No tasks yet"} subColor="var(--green)" topColor="linear-gradient(90deg,#4ade80,#86efac)" />
        <StatCard label="Pending Tasks"    value={pendingCount}      sub={overdueCount > 0 ? `${overdueCount} overdue` : 'On track'} subColor={overdueCount > 0 ? 'var(--red)' : 'var(--muted)'} topColor="linear-gradient(90deg,#fbbf24,#fde68a)" />
        <StatCard label="Interviews"       value={intSummary.total || 0} sub={`${intSummary.selected || 0} selected`} subColor="var(--green)" topColor="linear-gradient(90deg,#7dd3fc,#bae6fd)" />
      </div>

      {/* Row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:'18px', marginBottom:'18px' }}>

        {/* Journal */}
        <div style={s.card}>
          <div style={s.ch}>
            <div style={s.ct}>📓 Recent Journal</div>
            <span style={s.cl} onClick={() => navigate('/journal')}>View all →</span>
          </div>
          <div style={s.cb}>
            {entries.length === 0 && <div style={{ padding:'24px', textAlign:'center', color:'var(--muted)', fontSize:'13px' }}>No entries yet. <span style={{ color:'var(--accent)', cursor:'pointer' }} onClick={() => navigate('/journal')}>Write your first one →</span></div>}
            {entries.map(e => (
              <div key={e.id} style={{ padding:'13px 0', borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'padding-left 0.12s' }}
                onMouseEnter={el => el.currentTarget.style.paddingLeft='4px'}
                onMouseLeave={el => el.currentTarget.style.paddingLeft='0'}
                onClick={() => navigate('/journal')}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }}>
                  <div style={{ fontSize:'13.5px', fontWeight:500, color:'var(--text)' }}>{e.title}</div>
                  <div style={{ fontSize:'11px', color:'var(--muted2)' }}>{new Date(e.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</div>
                </div>
                <div style={{ fontSize:'12.5px', color:'var(--muted)', lineHeight:1.6, marginBottom:'8px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{e.content}</div>
                <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'11px', fontWeight:500, padding:'2px 8px', borderRadius:'20px', background:'var(--green-bg)', color:'var(--green)' }}>
                  {moodEmoji[e.mood]} {e.mood.charAt(0).toUpperCase() + e.mood.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right col */}
        <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

          {/* Upcoming */}
          <div style={s.card}>
            <div style={s.ch}>
              <div style={s.ct}>🎯 Upcoming Interviews</div>
              <span style={s.cl} onClick={() => navigate('/interviews')}>View all →</span>
            </div>
            <div style={s.cb}>
              {upcoming.length === 0 && <div style={{ padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:'13px' }}>No upcoming interviews</div>}
              {upcoming.map(i => (
                <div key={i.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:'42px', height:'42px', border:'1.5px solid var(--border2)', borderRadius:'10px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--surface2)', flexShrink:0 }}>
                    <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'18px', lineHeight:1, color:'var(--text)' }}>{new Date(i.scheduled_at).getDate()}</div>
                    <div style={{ fontSize:'9px', textTransform:'uppercase', color:'var(--muted)', letterSpacing:'0.5px' }}>{new Date(i.scheduled_at).toLocaleString('en', { month:'short' })}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'13px', fontWeight:500, marginBottom:'1px' }}>{i.company_name}</div>
                    <div style={{ fontSize:'11.5px', color:'var(--muted)' }}>{i.role} · Round {i.round_number}</div>
                  </div>
                  <div style={{ fontSize:'12px', color:'var(--accent)', fontWeight:500 }}>
                    {new Date(i.scheduled_at).toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview summary */}
          <div style={s.card}>
            <div style={s.ch}><div style={s.ct}>📊 Interview Summary</div></div>
            <div style={s.cbp}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                {[
                  { label:'Total',     value: intSummary.total     || 0, color:'var(--text)' },
                  { label:'Selected',  value: intSummary.selected  || 0, color:'var(--green)' },
                  { label:'On Hold',   value: intSummary.on_hold   || 0, color:'var(--amber)' },
                  { label:'Rejected',  value: intSummary.rejected  || 0, color:'var(--red)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background:'var(--surface2)', borderRadius:'8px', padding:'10px', textAlign:'center' }}>
                    <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'24px', color }}>{value}</div>
                    <div style={{ fontSize:'10.5px', color:'var(--muted)', marginTop:'1px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Todos */}
      <div style={s.card}>
        <div style={s.ch}>
          <div style={s.ct}>✓ Active Todos</div>
          <span style={s.cl} onClick={() => navigate('/todos')}>View all →</span>
        </div>
        <div style={s.cb}>
          {todos.length === 0 && <div style={{ padding:'24px', textAlign:'center', color:'var(--muted)', fontSize:'13px' }}>No todos yet. <span style={{ color:'var(--accent)', cursor:'pointer' }} onClick={() => navigate('/todos')}>Add one →</span></div>}
          {todos.map(t => (
            <div key={t.id} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
              <div onClick={() => handleToggle(t.id)} style={{
                width:'17px', height:'17px', borderRadius:'5px', flexShrink:0, marginTop:'1px',
                border: t.status === 'done' ? 'none' : '1.5px solid var(--border2)',
                background: t.status === 'done' ? 'var(--green)' : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', fontSize:'10px', color:'white', transition:'all 0.12s'
              }}>{t.status === 'done' ? '✓' : ''}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'13px', color:'var(--text)', marginBottom:'3px', textDecoration: t.status === 'done' ? 'line-through' : 'none', opacity: t.status === 'done' ? 0.5 : 1 }}>{t.title}</div>
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  <span style={{ fontSize:'10.5px', fontWeight:600, padding:'1px 7px', borderRadius:'20px', textTransform:'uppercase', letterSpacing:'0.4px', background: t.priority==='high' ? 'var(--red-bg)' : t.priority==='medium' ? 'var(--amber-bg)' : 'var(--green-bg)', color: t.priority==='high' ? 'var(--red)' : t.priority==='medium' ? 'var(--amber)' : 'var(--green)' }}>{t.priority}</span>
                  {t.due_date && <span style={{ fontSize:'11px', color: t.is_overdue ? 'var(--red)' : 'var(--muted2)', fontWeight: t.is_overdue ? 500 : 400 }}>{t.is_overdue ? '⚠ ' : ''}{t.due_date}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}