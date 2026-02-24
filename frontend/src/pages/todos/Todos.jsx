import { useState, useEffect } from 'react'
import { getTodos, createTodo, updateTodo, deleteTodo, toggleStatus } from '../../api/todos'
import toast from 'react-hot-toast'

const PRIORITIES = ['low','medium','high']
const emptyForm  = { title:'', description:'', priority:'medium', category:'', due_date:'' }

export default function Todos() {
  const [todos,    setTodos]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(emptyForm)
  const [editing,  setEditing]  = useState(null)
  const [filter,   setFilter]   = useState('')

  const load = async () => {
    try {
      const params = filter ? { status: filter } : {}
      const res = await getTodos(params)
      setTodos(res.data)
    } catch { toast.error('Failed to load todos') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) { await updateTodo(editing, form); toast.success('Updated!') }
      else         { await createTodo(form);           toast.success('Todo added!') }
      setShowForm(false); setForm(emptyForm); setEditing(null); load()
    } catch { toast.error('Failed to save') }
  }

  const handleToggle = async (id) => {
    try {
      const res = await toggleStatus(id)
      setTodos(todos.map(t => t.id === id ? { ...t, status: res.data.status } : t))
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this todo?')) return
    try { await deleteTodo(id); toast.success('Deleted!'); load() }
    catch { toast.error('Failed to delete') }
  }

  const statusColor = { pending:'var(--muted)', in_progress:'var(--amber)', done:'var(--green)' }
  const statusBg    = { pending:'var(--surface2)', in_progress:'var(--amber-bg)', done:'var(--green-bg)' }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px', paddingBottom:'22px', borderBottom:'1px solid var(--border)' }}>
        <div>
          <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'28px', letterSpacing:'-0.5px' }}>Todos</div>
          <div style={{ fontSize:'13px', color:'var(--muted)', marginTop:'2px' }}>{todos.filter(t=>t.status!=='done').length} pending · {todos.filter(t=>t.status==='done').length} completed</div>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }} style={{ padding:'8px 18px', borderRadius:'8px', border:'none', background:'var(--accent)', color:'#0a0a0f', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>+ Add Todo</button>
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
        {[['','All'],['pending','Pending'],['in_progress','In Progress'],['done','Done']].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding:'6px 14px', borderRadius:'20px', border:'1px solid var(--border2)', background: filter===val ? 'var(--accent)' : 'var(--surface)', color: filter===val ? '#0a0a0f' : 'var(--muted)', fontSize:'12px', fontWeight:500, cursor:'pointer', fontFamily:'DM Sans, sans-serif', transition:'all 0.15s' }}>{label}</button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'24px', marginBottom:'20px' }}>
          <div style={{ fontSize:'16px', fontWeight:600, marginBottom:'20px' }}>{editing ? 'Edit Todo' : 'New Todo'}</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Title *</label>
                <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif' }} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Category</label>
                <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="coding, health..." style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif' }} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
              </div>
            </div>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Description</label>
              <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif', resize:'vertical' }} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'18px' }}>
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Priority</label>
                <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif' }}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Due Date</label>
                <input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button type="submit" style={{ padding:'9px 20px', borderRadius:'8px', border:'none', background:'var(--accent)', color:'#0a0a0f', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>{editing ? 'Update' : 'Add Todo'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }} style={{ padding:'9px 20px', borderRadius:'8px', border:'1px solid var(--border2)', background:'transparent', color:'var(--muted)', fontSize:'13px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? <div style={{ textAlign:'center', color:'var(--muted)', padding:'40px' }}>Loading...</div> : (
        <div style={{ display:'grid', gap:'10px' }}>
          {todos.length === 0 && <div style={{ textAlign:'center', color:'var(--muted)', padding:'60px', background:'var(--surface)', borderRadius:'14px', border:'1px solid var(--border)' }}>No todos found!</div>}
          {todos.map(t => (
            <div key={t.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'16px 18px', display:'flex', alignItems:'flex-start', gap:'12px', transition:'box-shadow 0.15s' }}
              onMouseEnter={el=>el.currentTarget.style.boxShadow='var(--shadow)'}
              onMouseLeave={el=>el.currentTarget.style.boxShadow='none'}
            >
              <div onClick={() => handleToggle(t.id)} style={{ width:'18px', height:'18px', borderRadius:'5px', flexShrink:0, marginTop:'2px', border: t.status==='done' ? 'none' : '1.5px solid var(--border2)', background: t.status==='done' ? 'var(--green)' : t.status==='in_progress' ? 'var(--amber)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'10px', color:'white', transition:'all 0.15s' }}>{t.status!=='pending'?'✓':''}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'14px', fontWeight:500, color:'var(--text)', marginBottom:'5px', textDecoration:t.status==='done'?'line-through':'none', opacity:t.status==='done'?0.5:1 }}>{t.title}</div>
                {t.description && <div style={{ fontSize:'12px', color:'var(--muted)', marginBottom:'8px' }}>{t.description}</div>}
                <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'10.5px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background: t.priority==='high'?'var(--red-bg)':t.priority==='medium'?'var(--amber-bg)':'var(--green-bg)', color: t.priority==='high'?'var(--red)':t.priority==='medium'?'var(--amber)':'var(--green)', textTransform:'uppercase', letterSpacing:'0.4px' }}>{t.priority}</span>
                  <span style={{ fontSize:'10.5px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:statusBg[t.status], color:statusColor[t.status] }}>{t.status.replace('_',' ')}</span>
                  {t.due_date && <span style={{ fontSize:'11px', color:t.is_overdue?'var(--red)':'var(--muted2)', fontWeight:t.is_overdue?500:400 }}>{t.is_overdue?'⚠ ':''}{t.due_date}</span>}
                  {t.category && <span style={{ fontSize:'11px', color:'var(--muted2)' }}>#{t.category}</span>}
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                <button onClick={() => { setEditing(t.id); setForm({ title:t.title, description:t.description, priority:t.priority, category:t.category, due_date:t.due_date||'' }); setShowForm(true) }} style={{ padding:'5px 12px', borderRadius:'6px', border:'1px solid var(--border2)', background:'transparent', color:'var(--muted)', fontSize:'12px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Edit</button>
                <button onClick={() => handleDelete(t.id)} style={{ padding:'5px 12px', borderRadius:'6px', border:'none', background:'var(--red-bg)', color:'var(--red)', fontSize:'12px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}