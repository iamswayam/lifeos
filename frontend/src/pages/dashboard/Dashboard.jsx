import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getEntries } from '../../api/journal'
import { getTodos, toggleStatus } from '../../api/todos'
import { getUpcoming, getSummary } from '../../api/interviews'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const s = {
  card: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden' },
  ch:   { padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  ct:   { fontSize:'13px', fontWeight:600, color:'var(--text)' },
  cl:   { fontSize:'11.5px', color:'var(--accent)', cursor:'pointer' },
}

// ── STAT CARD ──
function StatCard({ label, value, sub, subColor, topColor, onClick }) {
  return (
    <div onClick={onClick} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'14px', position:'relative', overflow:'hidden', transition:'all 0.2s', cursor:'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow)'; e.currentTarget.style.borderColor='var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--border)' }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:topColor }} />
      <div style={{ fontSize:'10px', fontWeight:500, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>{label}</div>
      <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'26px', lineHeight:1, marginBottom:'3px', color:'var(--text)' }}>{value}</div>
      <div style={{ fontSize:'10.5px', color: subColor || 'var(--muted)' }}>{sub}</div>
    </div>
  )
}

// ── MINI CALENDAR ──
function MiniCalendar({ entries, upcoming }) {
  const today  = new Date()
  const [offset, setOffset] = useState(0)
  const [tooltip, setTooltip] = useState({ show:false, items:[], x:0, y:0 })
  const calRef = useRef()

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + offset + i)
    return d
  })

  const getItems = (date) => {
    const ds = date.toISOString().split('T')[0]
    const items = []
    entries.forEach(e => { if (e.date === ds) items.push({ type:'journal', label: e.title }) })
    upcoming.forEach(i => {
      if (new Date(i.scheduled_at).toISOString().split('T')[0] === ds)
        items.push({ type:'interview', label: i.company_name, time: new Date(i.scheduled_at).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}) })
    })
    return items
  }

  const isToday = d => d.toDateString() === today.toDateString()
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa']

  return (
    <div ref={calRef} style={{ ...s.card, display:'flex', flexDirection:'column', height:'100%', position:'relative' }}>
      <div style={{ ...s.ch }}>
        <div style={s.ct}>📅 Calendar</div>
        <div style={{ display:'flex', gap:'4px' }}>
          <button onClick={() => setOffset(o => o-7)} style={{ width:'22px', height:'22px', borderRadius:'5px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--muted)', cursor:'pointer', fontSize:'11px' }}>‹</button>
          <button onClick={() => setOffset(0)} style={{ padding:'0 6px', height:'22px', borderRadius:'5px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--muted)', cursor:'pointer', fontSize:'10px', fontFamily:'DM Sans, sans-serif' }}>Today</button>
          <button onClick={() => setOffset(o => o+7)} style={{ width:'22px', height:'22px', borderRadius:'5px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--muted)', cursor:'pointer', fontSize:'11px' }}>›</button>
        </div>
      </div>

      <div style={{ padding:'10px 12px', flex:1 }}>
        {/* Month label */}
        <div style={{ fontSize:'11px', color:'var(--muted)', marginBottom:'8px', fontWeight:500 }}>
          {days[0].toLocaleDateString('en-IN',{month:'long', year:'numeric'})}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'3px' }}>
          {/* Day names */}
          {dayNames.map(d => (
            <div key={d} style={{ textAlign:'center', fontSize:'9.5px', fontWeight:600, color:'var(--muted2)', paddingBottom:'4px' }}>{d}</div>
          ))}
          {/* First week */}
          {days.slice(0,7).map((d,i) => {
            const items = getItems(d)
            const tod = isToday(d)
            return (
              <div key={i}
                onMouseEnter={e => { if(items.length) { const r=e.currentTarget.getBoundingClientRect(); const cr=calRef.current.getBoundingClientRect(); setTooltip({show:true,items,x:r.left-cr.left,y:r.bottom-cr.top+4}) }}}
                onMouseLeave={() => setTooltip({show:false,items:[]})}
                style={{ textAlign:'center', padding:'5px 2px', borderRadius:'7px', background: tod?'var(--accent)':items.length?'var(--accent-bg)':'transparent', border: tod?'none':items.length?'1px solid var(--accent-soft)':'1px solid transparent', transition:'all 0.15s' }}
              >
                <div style={{ fontSize:'12px', fontWeight: tod?700:400, color: tod?'#0a0a0f':items.length?'var(--accent)':'var(--text)' }}>{d.getDate()}</div>
                {items.length > 0 && (
                  <div style={{ display:'flex', justifyContent:'center', gap:'2px', marginTop:'2px' }}>
                    {items.slice(0,2).map((it,ii) => <div key={ii} style={{ width:'3px', height:'3px', borderRadius:'50%', background: it.type==='journal'?'var(--green)':'var(--accent)' }} />)}
                  </div>
                )}
              </div>
            )
          })}
          {/* Second week */}
          {days.slice(7,14).map((d,i) => {
            const items = getItems(d)
            const tod = isToday(d)
            return (
              <div key={i+7}
                onMouseEnter={e => { if(items.length) { const r=e.currentTarget.getBoundingClientRect(); const cr=calRef.current.getBoundingClientRect(); setTooltip({show:true,items,x:r.left-cr.left,y:r.bottom-cr.top+4}) }}}
                onMouseLeave={() => setTooltip({show:false,items:[]})}
                style={{ textAlign:'center', padding:'5px 2px', borderRadius:'7px', background: tod?'var(--accent)':items.length?'var(--accent-bg)':'transparent', border: tod?'none':items.length?'1px solid var(--accent-soft)':'1px solid transparent', transition:'all 0.15s' }}
              >
                <div style={{ fontSize:'12px', fontWeight: tod?700:400, color: tod?'#0a0a0f':items.length?'var(--accent)':'var(--text)' }}>{d.getDate()}</div>
                {items.length > 0 && (
                  <div style={{ display:'flex', justifyContent:'center', gap:'2px', marginTop:'2px' }}>
                    {items.slice(0,2).map((it,ii) => <div key={ii} style={{ width:'3px', height:'3px', borderRadius:'50%', background: it.type==='journal'?'var(--green)':'var(--accent)' }} />)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display:'flex', gap:'10px', marginTop:'10px', paddingTop:'8px', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--green)' }} />
            <span style={{ fontSize:'10px', color:'var(--muted)' }}>Journal</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)' }} />
            <span style={{ fontSize:'10px', color:'var(--muted)' }}>Interview</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div style={{ position:'absolute', top: tooltip.y, left: Math.min(tooltip.x, 120), zIndex:999, background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:'8px', padding:'8px 10px', minWidth:'160px', boxShadow:'var(--shadow)', pointerEvents:'none' }}>
          {tooltip.items.map((it,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom: i<tooltip.items.length-1?'4px':0 }}>
              <div style={{ width:'5px', height:'5px', borderRadius:'50%', background: it.type==='journal'?'var(--green)':'var(--accent)', flexShrink:0 }} />
              <span style={{ fontSize:'11.5px', color:'var(--text)', fontWeight:500 }}>{it.type==='interview'?`${it.label} · ${it.time}`:it.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── MAIN ──
export default function Dashboard() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [entries,    setEntries]    = useState([])
  const [todos,      setTodos]      = useState([])
  const [upcoming,   setUpcoming]   = useState([])
  const [intSummary, setIntSummary] = useState({})
  const [allEntries, setAllEntries] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([getEntries(), getTodos(), getUpcoming(), getSummary()])
      .then(([e, t, u, ss]) => {
        setAllEntries(e.data)
        setEntries(e.data.slice(0, 5))
        setTodos(t.data.slice(0, 8))
        setUpcoming(u.data.slice(0, 8))
        setIntSummary(ss.data)
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

  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const moodEmoji = { great:'😊', good:'🙂', neutral:'😐', bad:'😔', terrible:'😢' }
  const moodBg    = { great:'var(--green-bg)', good:'var(--accent-bg)', neutral:'var(--surface2)', bad:'var(--amber-bg)', terrible:'var(--red-bg)' }
  const moodClr   = { great:'var(--green)', good:'var(--accent)', neutral:'var(--muted)', bad:'var(--amber)', terrible:'var(--red)' }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--muted)', fontSize:'14px' }}>Loading...</div>

  const pendingCount   = todos.filter(t => t.status !== 'done').length
  const completedCount = todos.filter(t => t.status === 'done').length
  const overdueCount   = todos.filter(t => t.is_overdue).length

  return (
    <div>
      {/* HEADER */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px', paddingBottom:'18px', borderBottom:'1px solid var(--border)' }}>
        <div>
          <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'28px', letterSpacing:'-0.5px', marginBottom:'3px' }}>
            {greeting}, <em style={{ fontStyle:'italic', color:'var(--name-color)' }}>{user?.first_name?.split(' ')[0] || user?.username}</em> 👋
          </div>
          <div style={{ fontSize:'12.5px', color:'var(--muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => navigate('/todos')}   style={{ padding:'7px 14px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text2)', fontSize:'12.5px', fontWeight:500, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>+ New Todo</button>
          <button onClick={() => navigate('/journal')} style={{ padding:'7px 14px', borderRadius:'8px', border:'none', background:'var(--accent)', color:'#0a0a0f', fontSize:'12.5px', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>+ New Entry</button>
        </div>
      </div>

      {/* MAIN GRID: left (stats+journal+todos) | right (calendar+summary+upcoming) */}
      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'16px' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

          {/* 4 Stat Cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
            <StatCard label="Journal"   value={allEntries.length}      sub="entries"      topColor="linear-gradient(90deg,#fb923c,#fdba74)" onClick={() => navigate('/journal')} />
            <StatCard label="Completed" value={completedCount}         sub="tasks done"   subColor="var(--green)"  topColor="linear-gradient(90deg,#4ade80,#86efac)" onClick={() => navigate('/todos')} />
            <StatCard label="Pending"   value={pendingCount}           sub={overdueCount > 0 ? `${overdueCount} overdue` : 'on track'} subColor={overdueCount > 0 ? 'var(--red)' : 'var(--muted)'} topColor="linear-gradient(90deg,#fbbf24,#fde68a)" onClick={() => navigate('/todos')} />
            <StatCard label="Interviews" value={intSummary.total || 0} sub={`${intSummary.selected||0} selected`} subColor="var(--green)" topColor="linear-gradient(90deg,#7dd3fc,#bae6fd)" onClick={() => navigate('/interviews')} />
          </div>

          {/* Recent Journal */}
          <div style={{ ...s.card, display:'flex', flexDirection:'column', maxHeight:'320px' }}>
            <div style={s.ch}>
              <div style={s.ct}>📓 Recent Journal</div>
              <span style={s.cl} onClick={() => navigate('/journal')}>View all →</span>
            </div>
            <div style={{ overflowY:'auto', padding:'4px 16px', flex:1 }}>
              {entries.length === 0 && <div style={{ padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:'13px' }}>No entries yet. <span style={{ color:'var(--accent)', cursor:'pointer' }} onClick={() => navigate('/journal')}>Write your first →</span></div>}
              {entries.map(e => (
                <div key={e.id} onClick={() => navigate('/journal')}
                  style={{ padding:'11px 0', borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'all 0.15s', borderRadius:'4px', paddingLeft:'0' }}
                  onMouseEnter={el => { el.currentTarget.style.paddingLeft='6px'; el.currentTarget.style.background='var(--surface2)' }}
                  onMouseLeave={el => { el.currentTarget.style.paddingLeft='0';   el.currentTarget.style.background='transparent' }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                    <div style={{ fontSize:'13px', fontWeight:500, color:'var(--text)' }}>{e.title}</div>
                    <div style={{ fontSize:'11px', color:'var(--muted2)' }}>{new Date(e.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                  </div>
                  <div style={{ fontSize:'12px', color:'var(--muted)', lineHeight:1.6, marginBottom:'6px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>{e.content}</div>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', fontSize:'10.5px', fontWeight:500, padding:'1px 7px', borderRadius:'20px', background: moodBg[e.mood], color: moodClr[e.mood] }}>
                    {moodEmoji[e.mood]} {e.mood}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Todos */}
          <div style={{ ...s.card, display:'flex', flexDirection:'column', maxHeight:'300px' }}>
            <div style={s.ch}>
              <div style={s.ct}>✓ Active Todos</div>
              <span style={s.cl} onClick={() => navigate('/todos')}>View all →</span>
            </div>
            <div style={{ overflowY:'auto', padding:'4px 16px', flex:1 }}>
              {todos.length === 0 && <div style={{ padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:'13px' }}>No todos yet. <span style={{ color:'var(--accent)', cursor:'pointer' }} onClick={() => navigate('/todos')}>Add one →</span></div>}
              {todos.map(t => (
                <div key={t.id}
                  style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'10px 0', borderBottom:'1px solid var(--border)', transition:'all 0.15s', borderRadius:'4px' }}
                  onMouseEnter={el => { el.currentTarget.style.paddingLeft='6px'; el.currentTarget.style.background='var(--surface2)' }}
                  onMouseLeave={el => { el.currentTarget.style.paddingLeft='0';   el.currentTarget.style.background='transparent' }}
                >
                  <div onClick={() => handleToggle(t.id)} style={{ width:'16px', height:'16px', borderRadius:'4px', flexShrink:0, marginTop:'1px', border: t.status==='done'?'none':'1.5px solid var(--border2)', background: t.status==='done'?'var(--green)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'9px', color:'white', transition:'all 0.12s' }}>{t.status==='done'?'✓':''}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'12.5px', color:'var(--text)', marginBottom:'3px', textDecoration: t.status==='done'?'line-through':'none', opacity: t.status==='done'?0.5:1 }}>{t.title}</div>
                    <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                      <span style={{ fontSize:'10px', fontWeight:600, padding:'1px 6px', borderRadius:'20px', textTransform:'uppercase', letterSpacing:'0.4px', background: t.priority==='high'?'var(--red-bg)':t.priority==='medium'?'var(--amber-bg)':'var(--green-bg)', color: t.priority==='high'?'var(--red)':t.priority==='medium'?'var(--amber)':'var(--green)' }}>{t.priority}</span>
                      {t.due_date && <span style={{ fontSize:'10.5px', color: t.is_overdue?'var(--red)':'var(--muted2)' }}>{t.is_overdue?'⚠ ':''}{t.due_date}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

          {/* Calendar */}
          <MiniCalendar entries={allEntries} upcoming={upcoming} />

          {/* Interview Summary */}
          <div style={{ ...s.card, cursor:'pointer', transition:'all 0.2s' }}
            onClick={() => navigate('/interviews')}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
          >
            <div style={s.ch}>
              <div style={s.ct}>📊 Interview Summary</div>
              <span style={{ fontSize:'11px', color:'var(--accent)' }}>View all →</span>
            </div>
            <div style={{ padding:'12px 16px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
                {[
                  { label:'Total',    value: intSummary.total    || 0, color:'var(--text)' },
                  { label:'Selected', value: intSummary.selected || 0, color:'var(--green)' },
                  { label:'On Hold',  value: intSummary.on_hold  || 0, color:'var(--amber)' },
                  { label:'Rejected', value: intSummary.rejected || 0, color:'var(--red)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background:'var(--surface2)', borderRadius:'8px', padding:'10px 6px', textAlign:'center' }}>
                    <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'22px', color }}>{value}</div>
                    <div style={{ fontSize:'10px', color:'var(--muted)', marginTop:'1px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div style={{ ...s.card, display:'flex', flexDirection:'column', flex:1, minHeight:'200px' }}>
            <div style={s.ch}>
              <div style={s.ct}>🎯 Upcoming Interviews</div>
              <span style={s.cl} onClick={() => navigate('/interviews')}>View all →</span>
            </div>
            <div style={{ overflowY:'auto', padding:'4px 16px', flex:1 }}>
              {upcoming.length === 0 && <div style={{ padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:'13px' }}>No upcoming interviews</div>}
              {upcoming.map(i => (
                <div key={i.id}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 0', borderBottom:'1px solid var(--border)', transition:'all 0.15s', borderRadius:'4px' }}
                  onMouseEnter={el => { el.currentTarget.style.paddingLeft='6px'; el.currentTarget.style.background='var(--surface2)' }}
                  onMouseLeave={el => { el.currentTarget.style.paddingLeft='0';   el.currentTarget.style.background='transparent' }}
                >
                  <div style={{ width:'38px', height:'38px', border:'1.5px solid var(--border2)', borderRadius:'9px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--surface2)', flexShrink:0 }}>
                    <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'16px', lineHeight:1, color:'var(--text)' }}>{new Date(i.scheduled_at).getDate()}</div>
                    <div style={{ fontSize:'8px', textTransform:'uppercase', color:'var(--muted)' }}>{new Date(i.scheduled_at).toLocaleString('en',{month:'short'})}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'12.5px', fontWeight:500, color:'var(--text)', marginBottom:'1px' }}>{i.company_name}</div>
                    <div style={{ fontSize:'11px', color:'var(--muted)' }}>{i.role} · Round {i.round_number}</div>
                  </div>
                  <div style={{ fontSize:'11.5px', color:'var(--accent)', fontWeight:500, flexShrink:0 }}>
                    {new Date(i.scheduled_at).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}