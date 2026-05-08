import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '', password: '', username: '',
    university: '', country: '', isAnonymous: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    }
    setLoading(false)
  }

  return (
    <div style={s.page}>

      {/* GRAIN */}
      <div style={s.grain} />

      {/* LEFT PANEL */}
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.marqueeWrap}>
            <div style={s.marquee}>
              {['UNFILTERED','•','REAL','•','CAMPUS','•','CHAOS','•','UNFILTERED','•','REAL','•','CAMPUS','•','CHAOS','•'].map((w,i) => (
                <span key={i} style={w === '•' ? s.dot : s.marqueeWord}>{w}</span>
              ))}
            </div>
          </div>

          <div style={s.leftContent}>
            <h1 style={s.bigLogo}>Campus<br /><span style={s.bigAccent}>Raw.</span></h1>
            <p style={s.leftTagline}>Real college.<br />No filter.<br />No polish.<br />No parents.</p>

            <div style={s.leftStats}>
              <div style={s.leftStat}>
                <div style={s.leftStatNum}>1,247</div>
                <div style={s.leftStatLabel}>students waiting</div>
              </div>
              <div style={s.leftStat}>
                <div style={s.leftStatNum}>0%</div>
                <div style={s.leftStatLabel}>corporate filter</div>
              </div>
              <div style={s.leftStat}>
                <div style={s.leftStatNum}>∞</div>
                <div style={s.leftStatLabel}>chaos potential</div>
              </div>
            </div>
          </div>

          <div style={s.leftBottom}>
            already have an account?{' '}
            <Link to="/login" style={s.leftLink}>log in →</Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={s.right}>
        <div style={s.formWrap}>

          <div style={s.formHeader}>
            <div style={s.formTag}>🎥 JOIN THE CHAOS</div>
            <h2 style={s.formTitle}>Create your account</h2>
            <p style={s.formSub}>use your university email to get verified instantly.</p>
          </div>

          {/* ACCOUNT TYPE TOGGLE */}
          <div style={s.toggleWrap}>
            <button
              type="button"
              style={!form.isAnonymous ? s.toggleActive : s.toggleInactive}
              onClick={() => setForm({ ...form, isAnonymous: false })}
            >
              👤 Named Account
            </button>
            <button
              type="button"
              style={form.isAnonymous ? s.toggleActive : s.toggleInactive}
              onClick={() => setForm({ ...form, isAnonymous: true })}
            >
              👻 Go Anonymous
            </button>
          </div>

          {form.isAnonymous && (
            <div style={s.anonNote}>
              <span style={s.anonIcon}>👻</span>
              <div>
                <div style={s.anonTitle}>anonymous mode</div>
                <div style={s.anonDesc}>
                  you'll appear as <b>Anonymous • {form.university || 'Your University'}</b> publicly.
                  we still verify your identity on the backend. you can reveal yourself anytime.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>

            <div style={s.inputGroup}>
              <label style={s.label}>university email</label>
              <input
                style={s.input}
                type="email" name="email"
                placeholder="you@university.ac.in"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>password</label>
              <input
                style={s.input}
                type="password" name="password"
                placeholder="make it strong"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {!form.isAnonymous && (
              <div style={s.inputGroup}>
                <label style={s.label}>username (public)</label>
                <input
                  style={s.input}
                  type="text" name="username"
                  placeholder="what should we call you?"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div style={s.inputRow}>
              <div style={{...s.inputGroup, flex: 1}}>
                <label style={s.label}>university</label>
                <input
                  style={s.input}
                  type="text" name="university"
                  placeholder="IIT Bombay"
                  value={form.university}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{...s.inputGroup, flex: 1}}>
                <label style={s.label}>country</label>
                <input
                  style={s.input}
                  type="text" name="country"
                  placeholder="India"
                  value={form.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && (
              <div style={s.error}>
                <span>⚠</span> {error}
              </div>
            )}

            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'creating your account...' : 'join campusraw →'}
            </button>

          </form>

          <p style={s.terms}>
            by signing up you agree to keep it real and not be boring.
          </p>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; }
        body { background: #0a0a0a; overflow-x: hidden; }
        input::placeholder { color: #333; }
        input:focus { outline: none; border-color: #ff3c00 !important; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

    </div>
  )
}

const s = {
  page: { display: 'flex', minHeight: '100vh', width: '100%', background: '#0a0a0a', color: '#f0ece4', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  grain: { position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 100, opacity: 0.6 },

  // LEFT
  left: { width: '42%', background: '#0f0f0f', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  leftInner: { display: 'flex', flexDirection: 'column', height: '100%', padding: '0' },
  marqueeWrap: { borderBottom: '1px solid #1e1e1e', padding: '12px 0', overflow: 'hidden', background: '#111' },
  marquee: { display: 'flex', gap: '32px', animation: 'marquee 18s linear infinite', width: 'max-content' },
  marqueeWord: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', letterSpacing: '0.2em', color: '#222', whiteSpace: 'nowrap' },
  dot: { color: '#ff3c00', fontSize: '0.8rem' },
  leftContent: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 60px' },
  bigLogo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(4rem, 8vw, 7rem)', lineHeight: '0.9', color: '#f0ece4', marginBottom: '40px' },
  bigAccent: { color: '#ff3c00' },
  leftTagline: { fontSize: '1.1rem', color: '#444', lineHeight: '2', fontWeight: '300', marginBottom: '60px' },
  leftStats: { display: 'flex', gap: '40px' },
  leftStat: {},
  leftStatNum: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#f0ece4', lineHeight: '1' },
  leftStatLabel: { fontSize: '0.65rem', color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' },
  leftBottom: { padding: '24px 60px', borderTop: '1px solid #1e1e1e', fontSize: '0.8rem', color: '#444' },
  leftLink: { color: '#ff3c00', textDecoration: 'none', fontWeight: '500' },

  // RIGHT
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', overflowY: 'auto' },
  formWrap: { width: '100%', maxWidth: '480px' },
  formHeader: { marginBottom: '36px' },
  formTag: { display: 'inline-block', background: 'rgba(255,60,0,0.1)', border: '1px solid rgba(255,60,0,0.2)', color: '#ff3c00', fontSize: '0.65rem', letterSpacing: '0.15em', padding: '5px 12px', marginBottom: '16px' },
  formTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', lineHeight: '1', marginBottom: '8px' },
  formSub: { fontSize: '0.82rem', color: '#555', fontWeight: '300' },

  toggleWrap: { display: 'flex', marginBottom: '20px', border: '1px solid #1e1e1e' },
  toggleActive: { flex: 1, padding: '12px', background: '#ff3c00', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', letterSpacing: '0.05em', fontFamily: "'DM Sans', sans-serif" },
  toggleInactive: { flex: 1, padding: '12px', background: 'transparent', color: '#555', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500', fontFamily: "'DM Sans', sans-serif" },

  anonNote: { display: 'flex', gap: '14px', background: 'rgba(255,60,0,0.05)', border: '1px solid rgba(255,60,0,0.15)', padding: '16px', marginBottom: '20px' },
  anonIcon: { fontSize: '1.4rem', flexShrink: 0 },
  anonTitle: { fontSize: '0.78rem', fontWeight: '600', color: '#ff3c00', marginBottom: '4px', letterSpacing: '0.05em' },
  anonDesc: { fontSize: '0.75rem', color: '#666', lineHeight: '1.6' },

  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputRow: { display: 'flex', gap: '16px' },
  label: { fontSize: '0.65rem', color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600' },
  input: { background: '#0a0a0a', border: '1px solid #1e1e1e', color: '#f0ece4', padding: '14px 16px', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif", width: '100%', transition: 'border-color 0.2s' },
  error: { background: 'rgba(255,60,0,0.08)', border: '1px solid rgba(255,60,0,0.2)', color: '#ff3c00', padding: '12px 16px', fontSize: '0.82rem', display: 'flex', gap: '8px', alignItems: 'center' },
  btn: { background: '#ff3c00', color: 'white', border: 'none', padding: '16px', fontSize: '0.88rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: '8px', transition: 'background 0.2s' },
  terms: { marginTop: '20px', fontSize: '0.72rem', color: '#333', textAlign: 'center', fontStyle: 'italic' }
}
