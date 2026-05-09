import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import API_URL from '../config'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/auth/login', form)
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

          <div style={s.leftContent}>
            <h1 style={s.bigLogo}>Campus<br /><span style={s.bigAccent}>Raw.</span></h1>

            <div style={s.quoteBlock}>
              <div style={s.quoteText}>
                "finally somewhere i can post the stuff instagram deletes and tiktok shadowbans."
              </div>
              <div style={s.quoteAuthor}>— IIT Kharagpur, 3rd year</div>
            </div>

            <div style={s.quoteBlock}>
              <div style={s.quoteText}>
                "our college fests are legendary and nobody outside knows. this is the fix."
              </div>
              <div style={s.quoteAuthor}>— NIT Trichy, Cultural Sec</div>
            </div>

            <div style={s.quoteBlock}>
              <div style={s.quoteText}>
                "youtube feels like it was built by 50 year olds who've never set foot in a dorm."
              </div>
              <div style={s.quoteAuthor}>— UC Berkeley, 2nd year</div>
            </div>
          </div>

          <div style={s.leftBottom}>
            don't have an account?{' '}
            <Link to="/signup" style={s.leftLink}>sign up →</Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={s.right}>
        <div style={s.formWrap}>

          <div style={s.formHeader}>
            <div style={s.formTag}>👋 WELCOME BACK</div>
            <h2 style={s.formTitle}>Log back in.</h2>
            <p style={s.formSub}>the chaos missed you.</p>
          </div>

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
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div style={s.error}>
                <span>⚠</span> {error}
              </div>
            )}

            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'logging in...' : 'enter campusraw →'}
            </button>

          </form>

          {/* DIVIDER */}
          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>or</span>
            <div style={s.dividerLine} />
          </div>

          <div style={s.bottomLinks}>
            <Link to="/signup" style={s.bottomLink}>create new account</Link>
          </div>

          {/* LIVE ACTIVITY */}
          <div style={s.activityWrap}>
            <div style={s.activityLabel}>🔴 happening right now</div>
            {[
              { uni: 'IIT Bombay', text: 'someone just went live from the canteen' },
              { uni: 'Oxford', text: 'new clip dropping — 4.2k views in 3 mins' },
              { uni: 'BITS Pilani', text: 'oasis night 3 just hit 28k views' },
            ].map((item, i) => (
              <div key={i} style={s.activityItem}>
                <div style={s.activityDot} />
                <div>
                  <span style={s.activityUni}>{item.uni} </span>
                  <span style={s.activityText}>{item.text}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        * { box- sizing: border - box; margin: 0; padding: 0;
    }
        html, body, #root { width: 100 %; min - height: 100vh; }
        body { background: #0a0a0a; overflow - x: hidden; }
    input::placeholder { color: #333; }
    input:focus { outline: none; border - color: #ff3c00!important; }
    @keyframes blink { 0 %, 100 % { opacity: 1; } 50 % { opacity: 0.3; } }
    `}</style>

    </div>
  )
}

const s = {
  page: { display: 'flex', minHeight: '100vh', width: '100%', background: '#0a0a0a', color: '#f0ece4', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  grain: { position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 100, opacity: 0.6 },

  // LEFT
  left: { width: '45%', background: '#0f0f0f', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  leftInner: { display: 'flex', flexDirection: 'column', height: '100%' },
  leftContent: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 60px', gap: '32px' },
  bigLogo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(4rem, 7vw, 6rem)', lineHeight: '0.9', color: '#f0ece4', marginBottom: '8px' },
  bigAccent: { color: '#ff3c00' },
  quoteBlock: { borderLeft: '2px solid #1e1e1e', paddingLeft: '20px' },
  quoteText: { fontSize: '0.85rem', color: '#555', lineHeight: '1.6', fontWeight: '300', fontStyle: 'italic', marginBottom: '6px' },
  quoteAuthor: { fontSize: '0.7rem', color: '#333', letterSpacing: '0.08em' },
  leftBottom: { padding: '24px 60px', borderTop: '1px solid #1e1e1e', fontSize: '0.8rem', color: '#444' },
  leftLink: { color: '#ff3c00', textDecoration: 'none', fontWeight: '500' },

  // RIGHT
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', overflowY: 'auto' },
  formWrap: { width: '100%', maxWidth: '440px' },
  formHeader: { marginBottom: '36px' },
  formTag: { display: 'inline-block', background: 'rgba(255,60,0,0.1)', border: '1px solid rgba(255,60,0,0.2)', color: '#ff3c00', fontSize: '0.65rem', letterSpacing: '0.15em', padding: '5px 12px', marginBottom: '16px' },
  formTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', lineHeight: '1', marginBottom: '8px' },
  formSub: { fontSize: '0.82rem', color: '#555', fontWeight: '300' },

  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.65rem', color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600' },
  input: { background: '#0a0a0a', border: '1px solid #1e1e1e', color: '#f0ece4', padding: '14px 16px', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif", width: '100%', transition: 'border-color 0.2s' },
  error: { background: 'rgba(255,60,0,0.08)', border: '1px solid rgba(255,60,0,0.2)', color: '#ff3c00', padding: '12px 16px', fontSize: '0.82rem', display: 'flex', gap: '8px', alignItems: 'center' },
  btn: { background: '#ff3c00', color: 'white', border: 'none', padding: '16px', fontSize: '0.88rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: '8px', transition: 'background 0.2s' },

  divider: { display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' },
  dividerLine: { flex: 1, height: '1px', background: '#1e1e1e' },
  dividerText: { fontSize: '0.72rem', color: '#333', letterSpacing: '0.1em' },

  bottomLinks: { textAlign: 'center', marginBottom: '32px' },
  bottomLink: { color: '#555', fontSize: '0.82rem', textDecoration: 'none', borderBottom: '1px solid #1e1e1e', paddingBottom: '2px' },

  activityWrap: { background: '#0f0f0f', border: '1px solid #1e1e1e', padding: '20px' },
  activityLabel: { fontSize: '0.65rem', color: '#ff3c00', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: '600' },
  activityItem: { display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' },
  activityDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#ff3c00', marginTop: '5px', flexShrink: 0, animation: 'blink 2s ease infinite' },
  activityUni: { fontSize: '0.75rem', fontWeight: '600', color: '#f0ece4' },
  activityText: { fontSize: '0.75rem', color: '#555', fontWeight: '300' },
}
