import { useState, useEffect } from 'react'
import { getEntries, createEntry, updateEntry, deleteEntry } from '../../api/journal'
import toast from 'react-hot-toast'

const MOODS = ['great','good','neutral','bad','terrible']
const MOOD_EMOJI = { great:'😊', good:'🙂', neutral:'😐', bad:'😔', terrible:'😢' }

const emptyForm = { title:'', content:'', mood:'good', tags:'', date: new Date().toISOString().split('T')[0] }

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [editing, setEditing]   = useState(null)
  const [filter, setFilter]     = useState('')

  const load = async () => {
    try {
      const params = filter ? { mood: filter } : {}
      const res = await getEntries(params)
      setEntries(res.data)
    } catch { toast.error('Failed to load entries') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] }
    try {
      if (editing) {
        await updateEntry(editing, data)
        toast.success('Entry updated!')
      } else {
        await createEntry(data)
        toast.success('Entry created!')
      }
      setShowForm(false); setForm(emptyForm); setEditing(null); load()
    } catch { toast.error('Failed to save entry') }
  }

  const handleEdit = (e) => {
    setEditing(e.id)
    setForm({ title: e.title, content: e.content, mood: e.mood, tags: e.tags.join(', '), date: e.date })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return
    try { await deleteEntry(id); toast.success('Deleted!'); load() }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px', paddingBottom:'22px', borderBottom:'1px solid var(--border)' }}>
        <div>
          <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'28px', letterSpacing:'-0.5px' }}>Journal</div>
          <div style={{ fontSize:'13px', color:'var(--muted)', marginTop:'2px' }}>{entries.length} entries</div>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }} style={{ padding:'8px 18px', borderRadius:'8px', border:'none', background:'var(--accent)', color:'#0a0a0f', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>+ New Entry</button>
      </div>

      {/* Mood Filter */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
        {['', ...MOODS].map(m => (
          <button key={m} onClick={() => setFilter(m)} style={{ padding:'6px 14px', borderRadius:'20px', border:'1px solid var(--border2)', background: filter===m ? 'var(--accent)' : 'var(--surface)', color: filter===m ? '#0a0a0f' : 'var(--muted)', fontSize:'12px', fontWeight:500, cursor:'pointer', fontFamily:'DM Sans, sans-serif', transition:'all 0.15s' }}>
            {m ? `${MOOD_EMOJI[m]} ${m}` : 'All'}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'24px', marginBottom:'20px' }}>
          <div style={{ fontSize:'16px', fontWeight:600, marginBottom:'20px', color:'var(--text)' }}>{editing ? 'Edit Entry' : 'New Entry'}</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Title</label>
                <input required value={form.title} onChange={e => setForm({...form, title:e.target.value})} style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif' }} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Mood</label>
                  <select value={form.mood} onChange={e => setForm({...form, mood:e.target.value})} style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif' }}>
                    {MOODS.map(m => <option key={m} value={m}>{MOOD_EMOJI[m]} {m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif' }} />
                </div>
              </div>
            </div>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Content</label>
              <textarea required value={form.content} onChange={e => setForm({...form, content:e.target.value})} rows={5} style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif', resize:'vertical' }} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
            </div>
            <div style={{ marginBottom:'18px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm({...form, tags:e.target.value})} placeholder="coding, learning, django" style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif' }} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button type="submit" style={{ padding:'9px 20px', borderRadius:'8px', border:'none', background:'var(--accent)', color:'#0a0a0f', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>{editing ? 'Update' : 'Save Entry'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }} style={{ padding:'9px 20px', borderRadius:'8px', border:'1px solid var(--border2)', background:'transparent', color:'var(--muted)', fontSize:'13px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      {loading ? <div style={{ textAlign:'center', color:'var(--muted)', padding:'40px' }}>Loading...</div> : (
        <div style={{ display:'grid', gap:'12px' }}>
          {entries.length === 0 && <div style={{ textAlign:'center', color:'var(--muted)', padding:'60px', background:'var(--surface)', borderRadius:'14px', border:'1px solid var(--border)' }}>No entries found. Write your first one!</div>}
          {entries.map(e => (
            <div key={e.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'18px', transition:'box-shadow 0.15s' }}
              onMouseEnter={el => el.currentTarget.style.boxShadow='var(--shadow)'}
              onMouseLeave={el => el.currentTarget.style.boxShadow='none'}
            >
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'8px' }}>
                <div>
                  <div style={{ fontSize:'15px', fontWeight:600, color:'var(--text)', marginBottom:'3px' }}>{e.title}</div>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'11px', fontWeight:500, padding:'2px 8px', borderRadius:'20px', background:'var(--green-bg)', color:'var(--green)' }}>{MOOD_EMOJI[e.mood]} {e.mood}</span>
                    <span style={{ fontSize:'11px', color:'var(--muted2)' }}>{e.date}</span>
                    <span style={{ fontSize:'11px', color:'var(--muted2)' }}>{e.word_count} words</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={() => handleEdit(e)} style={{ padding:'5px 12px', borderRadius:'6px', border:'1px solid var(--border2)', background:'transparent', color:'var(--muted)', fontSize:'12px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Edit</button>
                  <button onClick={() => handleDelete(e.id)} style={{ padding:'5px 12px', borderRadius:'6px', border:'1px solid var(--red-bg)', background:'var(--red-bg)', color:'var(--red)', fontSize:'12px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Delete</button>
                </div>
              </div>
              <div style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.7 }}>{e.content.slice(0, 200)}{e.content.length > 200 ? '...' : ''}</div>
              {e.tags.length > 0 && (
                <div style={{ display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap' }}>
                  {e.tags.map(t => <span key={t} style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'var(--surface2)', color:'var(--muted)', border:'1px solid var(--border)' }}>#{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}