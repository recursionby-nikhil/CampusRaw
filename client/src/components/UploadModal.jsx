import { useState } from 'react'
import axios from 'axios'
import API_URL from '../config'

export default function UploadModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'clip',
    isAnonymous: false,
    visibility: 'campus'
  })
  const [videoFile, setVideoFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('video/')) { setError('please upload a video file.'); return; }
    if (file.size > 500 * 1024 * 1024) { setError('file too large. max 500MB.'); return; }
    setVideoFile(file)
    setPreview(URL.createObjectURL(file))
    setStep(2)
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (!file.type.startsWith('video/')) { setError('please upload a video file.'); return; }
    setVideoFile(file)
    setPreview(URL.createObjectURL(file))
    setStep(2)
    setError('')
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('give your post a title.'); return; }
    setUploading(true)
    setError('')
    try {
      const res = await axios.post(${ API_URL } / api / posts', {
        ...form,
        videoUrl: preview || 'https://placeholder.com/video'
      }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    onSuccess(res.data)
    onClose()
  } catch (err) {
    setError(err.response?.data?.message || 'upload failed.')
  }
  setUploading(false)
}

return (
  <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div style={s.modal}>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <h2 style={s.title}>
            {step === 1 ? 'drop your content' : 'tell us about it'}
          </h2>
          <span style={s.stepLabel}>step {step} of 2</span>
        </div>
        <button style={s.closeBtn} onClick={onClose}>✕</button>
      </div>

      {/* STEP 1 — FILE PICK */}
      {step === 1 && (
        <div
          style={s.dropzone}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFile}
            style={{ display: 'none' }}
            id="videoInput"
          />
          <label htmlFor="videoInput" style={s.dropzoneInner}>
            <div style={s.dropIcon}>🎬</div>
            <div style={s.dropTitle}>drag & drop your video</div>
            <div style={s.dropSub}>or click to browse</div>
            <div style={s.dropFormats}>mp4 • mov • avi • max 500MB</div>
            {error && <div style={s.dropError}>⚠ {error}</div>}
          </label>
        </div>
      )}

      {/* STEP 2 — DETAILS */}
      {step === 2 && (
        <div style={s.detailsWrap}>

          {/* LEFT — VIDEO PREVIEW */}
          <div style={s.previewWrap}>
            {preview
              ? <video src={preview} style={s.videoPreview} controls />
              : <div style={s.videoPlaceholder}>🎬</div>
            }
            <button
              style={s.changeBtn}
              onClick={() => { setStep(1); setPreview(null); setVideoFile(null); }}
            >
              ↩ change video
            </button>
          </div>

          {/* RIGHT — FORM */}
          <div style={s.detailsForm}>

            {/* ANON TOGGLE */}
            <div style={s.anonToggle}>
              <button
                type="button"
                style={!form.isAnonymous ? s.toggleActive : s.toggleInactive}
                onClick={() => setForm({ ...form, isAnonymous: false })}
              >👤 named</button>
              <button
                type="button"
                style={form.isAnonymous ? s.toggleActive : s.toggleInactive}
                onClick={() => setForm({ ...form, isAnonymous: true })}
              >👻 anonymous</button>
            </div>

            {form.isAnonymous && (
              <div style={s.anonNote}>
                👻 posts as <b>Anonymous • {user?.university}</b>. you can reveal yourself later.
              </div>
            )}

            <div style={s.inputGroup}>
              <label style={s.label}>title *</label>
              <input
                style={s.input}
                name="title"
                placeholder="what's happening?"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
              />
              <span style={s.charCount}>{form.title.length}/120</span>
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>description</label>
              <textarea
                style={s.textarea}
                name="description"
                placeholder="add some context... or don't."
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={500}
              />
            </div>

            <div style={s.rowInputs}>
              <div style={s.inputGroup}>
                <label style={s.label}>type</label>
                <select style={s.select} name="type" value={form.type} onChange={handleChange}>
                  <option value="clip">⚡ Short Clip</option>
                  <option value="video">🎬 Long Video</option>
                  <option value="story">👻 Story</option>
                </select>
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>visibility</label>
                <select style={s.select} name="visibility" value={form.visibility} onChange={handleChange}>
                  <option value="campus">🏫 My Campus</option>
                  <option value="national">🌏 National</option>
                  <option value="global">🌍 Global</option>
                </select>
              </div>
            </div>

            {error && <div style={s.error}>⚠ {error}</div>}

            <button
              style={uploading ? s.btnDisabled : s.btn}
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? 'uploading...' : 'post it 🔥'}
            </button>

          </div>
        </div>
      )}

    </div>

    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #333; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #ff3c00 !important; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>
  </div>
)
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal: { background: '#111', border: '1px solid #1e1e1e', width: '100%', maxWidth: '860px', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeIn 0.2s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #1e1e1e' },
  headerLeft: { display: 'flex', alignItems: 'baseline', gap: '14px' },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#f0ece4', letterSpacing: '0.02em' },
  stepLabel: { fontSize: '0.7rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' },
  closeBtn: { background: 'transparent', border: '1px solid #1e1e1e', color: '#555', width: '36px', height: '36px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" },

  dropzone: { padding: '40px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dropzoneInner: { width: '100%', height: '260px', border: '2px dashed #1e1e1e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: 'border-color 0.2s' },
  dropIcon: { fontSize: '3rem' },
  dropTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#f0ece4', letterSpacing: '0.05em' },
  dropSub: { fontSize: '0.82rem', color: '#555' },
  dropFormats: { fontSize: '0.7rem', color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase' },
  dropError: { color: '#ff3c00', fontSize: '0.8rem', marginTop: '8px' },

  detailsWrap: { display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '500px' },
  previewWrap: { borderRight: '1px solid #1e1e1e', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  videoPreview: { width: '100%', aspectRatio: '400px', background: '#0a0a0a', objectFit: 'contain' },
  videoPlaceholder: { width: '100%', aspectRatio: '16/9', background: '#0a0a0a', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' },
  changeBtn: { background: 'transparent', border: '1px solid #1e1e1e', color: '#555', padding: '8px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },

  detailsForm: { padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  anonToggle: { display: 'flex', border: '1px solid #1e1e1e' },
  toggleActive: { flex: 1, padding: '10px', background: '#ff3c00', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif" },
  toggleInactive: { flex: 1, padding: '10px', background: 'transparent', color: '#555', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif" },
  anonNote: { background: 'rgba(255,60,0,0.05)', border: '1px solid rgba(255,60,0,0.15)', padding: '10px 14px', fontSize: '0.75rem', color: '#666', lineHeight: '1.5' },

  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' },
  label: { fontSize: '0.62rem', color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600' },
  input: { background: '#0a0a0a', border: '1px solid #1e1e1e', color: '#f0ece4', padding: '12px 14px', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif", width: '100%', transition: 'border-color 0.2s' },
  textarea: { background: '#0a0a0a', border: '1px solid #1e1e1e', color: '#f0ece4', padding: '12px 14px', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", width: '100%', resize: 'vertical', transition: 'border-color 0.2s' },
  charCount: { fontSize: '0.62rem', color: '#333', textAlign: 'right' },
  rowInputs: { display: 'flex', gap: '12px' },
  select: { background: '#0a0a0a', border: '1px solid #1e1e1e', color: '#f0ece4', padding: '12px 14px', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", width: '100%', cursor: 'pointer' },
  error: { background: 'rgba(255,60,0,0.08)', border: '1px solid rgba(255,60,0,0.2)', color: '#ff3c00', padding: '10px 14px', fontSize: '0.8rem' },
  btn: { background: '#ff3c00', color: 'white', border: 'none', padding: '14px', fontSize: '0.88rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 'auto' },
  btnDisabled: { background: '#2a1a1a', color: '#555', border: 'none', padding: '14px', fontSize: '0.88rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'not-allowed', fontFamily: "'DM Sans', sans-serif", marginTop: 'auto' },
}
