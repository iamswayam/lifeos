import { useState, useEffect } from 'react'
import { getInterviews, createInterview, updateInterview, deleteInterview, addFeedback } from '../../api/interviews'
import toast from 'react-hot-toast'

const emptyForm = { company_name:'', role:'', package_offered:'', job_url:'', hr_name:'', hr_contact:'', round_number:1, round_type:'screening', mode:'online', platform:'meet', location:'', scheduled_at:'', follow_up_date:'', prep_notes:'' }

const ROUND_TYPES = ['screening','technical','hr','final','offer']
const MODES       = ['online','offline','hybrid']
const PLATFORMS   = ['zoom','teams','meet','on_site','phone','other']

export default function Interviews() {
  const [interviews, setInterviews] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(emptyForm)
  const [editing,    setEditing]    = useState(null)
  const [filter,     setFilter]     = useState('')
  const [feedback,   setFeedback]   = useState({ id:null, text:'', result:'waiting' })

  const load = async () => {
    try {
      const params = filter ? { status: filter } : {}
      const res = await getInterviews(params)
      setInterviews(res.data)
    } catch { toast.error('Failed to load interviews') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) { await updateInterview(editing, form); toast.success('Updated!') }
      else         { await createInterview(form);          toast.success('Interview added!') }
      setShowForm(false); setForm(emptyForm); setEditing(null); load()
    } catch (err) {
      toast.error(err.response?.data?.scheduled_at?.[0] || 'Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this interview?')) return
    try { await deleteInterview(id); toast.success('Deleted!'); load() }
    catch { toast.error('Failed to delete') }
  }

  const handleFeedback = async () => {
    try {
      await addFeedback(feedback.id, { feedback: feedback.text, result: feedback.result, status: 'completed' })
      toast.success('Feedback saved!')
      setFeedback({ id:null, text:'', result:'waiting' })
      load()
    } catch { toast.error('Failed to save feedback') }
  }

  const statusColor = { scheduled:'var(--accent)', completed:'var(--green)', cancelled:'var(--red)', no_show:'var(--amber)' }
  const statusBg    = { scheduled:'var(--accent-bg)', completed:'var(--green-bg)', cancelled:'var(--red-bg)', no_show:'var(--amber-bg)' }
  const resultColor = { waiting:'var(--muted)', selected:'var(--green)', rejected:'var(--red)', on_hold:'var(--amber)' }
  const resultBg    = { waiting:'var(--surface2)', selected:'var(--green-bg)', rejected:'var(--red-bg)', on_hold:'var(--amber-bg)' }

  const inp = (label, key, type='text', placeholder='') => (
    <div>
      <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder} style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif' }} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
    </div>
  )

  const sel = (label, key, options) => (
    <div>
      <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>{label}</label>
      <select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif' }}>
        {options.map(o => <option key={o} value={o}>{o.replace('_',' ')}</option>)}
      </select>
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px', paddingBottom:'22px', borderBottom:'1px solid var(--border)' }}>
        <div>
          <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'28px', letterSpacing:'-0.5px' }}>Interviews</div>
          <div style={{ fontSize:'13px', color:'var(--muted)', marginTop:'2px' }}>{interviews.length} tracked</div>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }} style={{ padding:'8px 18px', borderRadius:'8px', border:'none', background:'var(--accent)', color:'#0a0a0f', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>+ Add Interview</button>
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
        {[['','All'],['scheduled','Scheduled'],['completed','Completed'],['cancelled','Cancelled']].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding:'6px 14px', borderRadius:'20px', border:'1px solid var(--border2)', background: filter===val?'var(--accent)':'var(--surface)', color: filter===val?'#0a0a0f':'var(--muted)', fontSize:'12px', fontWeight:500, cursor:'pointer', fontFamily:'DM Sans, sans-serif', transition:'all 0.15s' }}>{label}</button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'24px', marginBottom:'20px' }}>
          <div style={{ fontSize:'16px', fontWeight:600, marginBottom:'20px' }}>{editing ? 'Edit Interview' : 'New Interview'}</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              {inp('Company Name *', 'company_name', 'text', 'Google')}
              {inp('Role *', 'role', 'text', 'Backend Engineer')}
              {inp('Package Offered', 'package_offered', 'text', '45 LPA')}
              {inp('Job URL', 'job_url', 'url', 'https://...')}
              {inp('HR Name', 'hr_name', 'text', 'Priya Sharma')}
              {inp('HR Contact', 'hr_contact', 'text', 'priya@google.com')}
              {inp('Scheduled At *', 'scheduled_at', 'datetime-local')}
              {inp('Follow Up Date', 'follow_up_date', 'date')}
              {sel('Round Type', 'round_type', ROUND_TYPES)}
              {sel('Mode', 'mode', MODES)}
              {sel('Platform', 'platform', PLATFORMS)}
              {inp('Location', 'location', 'text', 'Mumbai / Online')}
            </div>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Prep Notes</label>
              <textarea value={form.prep_notes} onChange={e=>setForm({...form,prep_notes:e.target.value})} rows={3} placeholder="Topics to prepare..." style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif', resize:'vertical' }} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border2)'} />
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button type="submit" style={{ padding:'9px 20px', borderRadius:'8px', border:'none', background:'var(--accent)', color:'#0a0a0f', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>{editing ? 'Update' : 'Add Interview'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }} style={{ padding:'9px 20px', borderRadius:'8px', border:'1px solid var(--border2)', background:'transparent', color:'var(--muted)', fontSize:'13px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback Modal */}
      {feedback.id && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'28px', width:'100%', maxWidth:'480px' }}>
            <div style={{ fontSize:'16px', fontWeight:600, marginBottom:'16px' }}>Add Feedback</div>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Result</label>
              <select value={feedback.result} onChange={e=>setFeedback({...feedback,result:e.target.value})} style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif' }}>
                {['waiting','selected','rejected','on_hold'].map(r=><option key={r} value={r}>{r.replace('_',' ')}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--muted)', marginBottom:'5px' }}>Feedback</label>
              <textarea rows={4} value={feedback.text} onChange={e=>setFeedback({...feedback,text:e.target.value})} placeholder="How did it go? What was asked?" style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)', background:'var(--surface2)', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'DM Sans, sans-serif', resize:'vertical' }} />
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={handleFeedback} style={{ padding:'9px 20px', borderRadius:'8px', border:'none', background:'var(--accent)', color:'#0a0a0f', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Save Feedback</button>
              <button onClick={() => setFeedback({ id:null, text:'', result:'waiting' })} style={{ padding:'9px 20px', borderRadius:'8px', border:'1px solid var(--border2)', background:'transparent', color:'var(--muted)', fontSize:'13px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? <div style={{ textAlign:'center', color:'var(--muted)', padding:'40px' }}>Loading...</div> : (
        <div style={{ display:'grid', gap:'12px' }}>
          {interviews.length === 0 && <div style={{ textAlign:'center', color:'var(--muted)', padding:'60px', background:'var(--surface)', borderRadius:'14px', border:'1px solid var(--border)' }}>No interviews tracked yet!</div>}
          {interviews.map(i => (
            <div key={i.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'18px', transition:'box-shadow 0.15s' }}
              onMouseEnter={el=>el.currentTarget.style.boxShadow='var(--shadow)'}
              onMouseLeave={el=>el.currentTarget.style.boxShadow='none'}
            >
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'8px' }}>
                <div>
                  <div style={{ fontFamily:'Instrument Serif, serif', fontSize:'18px', fontWeight:600, color:'var(--text)', marginBottom:'3px' }}>{i.company_name}</div>
                  <div style={{ fontSize:'13px', color:'var(--muted)', marginBottom:'8px' }}>{i.role}</div>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{ fontSize:'10.5px', fontWeight:600, padding:'2px 9px', borderRadius:'20px', background:statusBg[i.status], color:statusColor[i.status] }}>{i.status}</span>
                    <span style={{ fontSize:'10.5px', fontWeight:600, padding:'2px 9px', borderRadius:'20px', background:resultBg[i.result], color:resultColor[i.result] }}>{i.result.replace('_',' ')}</span>
                    <span style={{ fontSize:'10.5px', fontWeight:600, padding:'2px 9px', borderRadius:'20px', background:'var(--accent)', color:'#0a0a0f' }}>Round {i.round_number}</span>
                    <span style={{ fontSize:'11px', color:'var(--muted2)' }}>📅 {new Date(i.scheduled_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                    <span style={{ fontSize:'11px', color:'var(--muted2)' }}>🖥 {i.platform}</span>
                    {i.package_offered && <span style={{ fontSize:'11px', color:'var(--green)' }}>💰 {i.package_offered}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                  <button onClick={() => setFeedback({ id:i.id, text:i.feedback||'', result:i.result })} style={{ padding:'5px 12px', borderRadius:'6px', border:'1px solid var(--border2)', background:'transparent', color:'var(--accent)', fontSize:'12px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Feedback</button>
                  <button onClick={() => { setEditing(i.id); setForm({ company_name:i.company_name, role:i.role, package_offered:i.package_offered||'', job_url:i.job_url||'', hr_name:i.hr_name||'', hr_contact:i.hr_contact||'', round_number:i.round_number, round_type:i.round_type, mode:i.mode, platform:i.platform, location:i.location||'', scheduled_at:i.scheduled_at.slice(0,16), follow_up_date:i.follow_up_date||'', prep_notes:i.prep_notes||'' }); setShowForm(true) }} style={{ padding:'5px 12px', borderRadius:'6px', border:'1px solid var(--border2)', background:'transparent', color:'var(--muted)', fontSize:'12px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Edit</button>
                  <button onClick={() => handleDelete(i.id)} style={{ padding:'5px 12px', borderRadius:'6px', border:'none', background:'var(--red-bg)', color:'var(--red)', fontSize:'12px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Delete</button>
                </div>
              </div>
              {i.prep_notes && <div style={{ fontSize:'12px', color:'var(--muted)', padding:'10px 12px', background:'var(--surface2)', borderRadius:'8px', marginTop:'10px' }}>📝 {i.prep_notes}</div>}
              {i.feedback   && <div style={{ fontSize:'12px', color:'var(--muted)', padding:'10px 12px', background:'var(--green-bg)', borderRadius:'8px', marginTop:'8px' }}>💬 {i.feedback}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}