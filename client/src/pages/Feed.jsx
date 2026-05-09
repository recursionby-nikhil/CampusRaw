import { useState, useEffect } from 'react'
import axios from 'axios'
// import { useNavigate } from 'react-router-dom'
import { useNavigate, Link } from 'react-router-dom'
import UploadModal from '../components/UploadModal'
import Comments from '../components/Comments'

const VIBES = ['fire', 'chaotic', 'important', 'cringe', 'wholesome']
const VIBE_EMOJI = { fire: '🔥', chaotic: '🤡', important: '📢', cringe: '💀', wholesome: '🫶' }
const VIBE_COLOR = { fire: '#ff3c00', chaotic: '#ff9900', important: '#ffcc00', cringe: '#aa00ff', wholesome: '#00cc88' }

export default function Feed() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('campus')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratingPost, setRatingPost] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [openComments, setOpenComments] = useState(null)
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    setTimeout(() => setMounted(true), 50)
    fetchFeed(tab)
  }, [tab])

  const fetchFeed = async (feedType) => {
    setLoading(true)
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/feed/${feedType}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPosts(res.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleVibe = async (postId, vibe) => {
    setRatingPost(postId)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/rate`,
        { vibe },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await fetchFeed(tab)
    } catch (err) { console.error(err) }
    setRatingPost(null)
  }

  const handleFlag = async (postId) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/flag`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (err) { console.error(err) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const getHeatLevel = (score) => {
    if (score > 100) return { label: 'GLOBAL 🌍', color: '#ffcc00' }
    if (score > 40) return { label: 'NATIONAL 🌏', color: '#ff9900' }
    if (score > 10) return { label: 'TRENDING 📈', color: '#ff3c00' }
    return { label: 'FRESH ✨', color: '#555' }
  }

  return (
    <div style={s.page}>

      <div style={s.grain} />

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <h1 style={s.logo}>Campus<span style={s.accent}>Raw</span></h1>
          <div style={s.liveDot} />
          <span style={s.liveText}>LIVE</span>
        </div>
        <div style={s.navRight}>
          <div style={s.userChip}>
            <span style={s.userDot}>{user?.isAnonymous ? '👻' : '●'}</span>
            <span style={s.userName}>
              {user?.isAnonymous ? 'anonymous' : `@${user?.username}`}
            </span>
            <span style={s.userUni}>• {user?.university}</span>
          </div>
          <button style={s.uploadNavBtn} onClick={() => setShowUpload(true)}>
            + upload
          </button>
          <button style={s.logoutBtn} onClick={handleLogout}>↩ logout</button>
        </div>
      </nav>

      {/* HERO STRIP */}
      <div style={s.heroStrip}>
        <div style={s.heroStripInner}>
          {['UNFILTERED', 'REAL', 'CAMPUS', 'CHAOS', 'UNFILTERED', 'REAL', 'CAMPUS', 'CHAOS',
            'UNFILTERED', 'REAL', 'CAMPUS', 'CHAOS', 'UNFILTERED', 'REAL', 'CAMPUS', 'CHAOS'].map((word, i) => (
              <span key={i} style={i % 2 === 0 ? s.heroStripText : s.heroStripDot}>
                {i % 2 === 0 ? word : '•'}
              </span>
            ))}
        </div>
      </div>

      {/* TABS */}
      <div style={s.tabsWrap}>
        <div style={s.tabs}>
          {[
            { key: 'campus', label: '🏫 MY CAMPUS' },
            { key: 'national', label: '🌏 NATIONAL' },
            { key: 'global', label: '🌍 GLOBAL' }
          ].map(t => (
            <button
              key={t.key}
              style={tab === t.key ? s.tabActive : s.tab}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={s.postCount}>
          {!loading && <span>{posts.length} posts</span>}
        </div>
      </div>

      {/* FEED */}
      <div style={s.feed}>

        {loading && (
          <div style={s.loadingWrap}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ ...s.skeleton, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📭</div>
            <h3 style={s.emptyTitle}>nothing here yet.</h3>
            <p style={s.emptySub}>be the first one from {user?.university} to post.</p>
            <button style={s.emptyUploadBtn} onClick={() => setShowUpload(true)}>
              + upload the first post
            </button>
          </div>
        )}

        {!loading && posts.map((post, index) => {
          const heat = getHeatLevel(post.heatScore)
          const topVibe = VIBES.reduce((a, b) =>
            (post.ratings?.filter(r => r.vibe === b).length || 0) >
              (post.ratings?.filter(r => r.vibe === a).length || 0) ? b : a, 'fire')
          const isRating = ratingPost === post._id

          return (
            <div
              key={post._id}
              style={{
                ...s.card,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`,
                borderLeft: `3px solid ${VIBE_COLOR[topVibe] || '#1e1e1e'}`
              }}
            >
              <div style={s.cardTop}>
                <div style={s.authorWrap}>
                  <div style={s.authorAvatar}>
                    {post.isAnonymous && !post.isUncovered
                      ? '👻'
                      : (post.author?.username?.[0]?.toUpperCase() || '?')}
                  </div>
                  <div>
                    <div style={s.authorName}>
                      {post.isAnonymous && !post.isUncovered
                        ? 'anonymous'
                        : <Link to={`/profile/${post.author?.username}`} style={{ color: '#f0ece4', textDecoration: 'none' }}>
                          @{post.author?.username || 'unknown'}
                        </Link>
                      }
                    </div>
                    <div style={s.authorUni}>
                      {post.university} • {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={s.badges}>
                  <span style={{ ...s.heatBadge, color: heat.color, borderColor: heat.color + '40' }}>
                    {heat.label}
                  </span>
                  <span style={s.scoreBadge}>🌡 {Math.round(post.heatScore)}</span>
                </div>
              </div>

              <h2 style={s.cardTitle}>{post.title}</h2>
              {post.description && <p style={s.cardDesc}>{post.description}</p>}


              {/* CLOUDFLARE R2 needed here for video streaming */}
              <div style={s.videoBox}>
                {post.videoUrl && post.videoUrl.startsWith('blob:') ? (
                  <video
                    src={post.videoUrl}
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#0a0a0a' }}
                    controls
                  />
                ) : (
                  <div style={s.videoInner}>
                    <div style={s.videoPlayIcon}>▶</div>
                    <span style={s.videoLabel}>video player — coming soon</span>
                    <span style={s.videoType}>{post.type?.toUpperCase()}</span>
                  </div>
                )}
              </div>

              <div style={s.vibeSection}>
                <span style={s.vibeLabel}>RATE THE VIBE</span>
                <div style={s.vibes}>
                  {VIBES.map(vibe => {
                    const count = post.ratings?.filter(r => r.vibe === vibe).length || 0
                    return (
                      <button
                        key={vibe}
                        style={{
                          ...s.vibeBtn,
                          borderColor: count > 0 ? VIBE_COLOR[vibe] + '60' : '#1e1e1e',
                          color: count > 0 ? VIBE_COLOR[vibe] : '#555',
                          opacity: isRating ? 0.5 : 1
                        }}
                        onClick={() => handleVibe(post._id, vibe)}
                        disabled={isRating}
                      >
                        <span>{VIBE_EMOJI[vibe]}</span>
                        <span style={s.vibeName}>{vibe}</span>
                        {count > 0 && (
                          <span style={{
                            ...s.vibeCount,
                            background: VIBE_COLOR[vibe] + '20',
                            color: VIBE_COLOR[vibe]
                          }}>{count}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={s.cardFooter}>
                <div style={s.footerLeft}>
                  <button
                    style={s.commentToggleBtn}
                    onClick={() => setOpenComments(openComments === post._id ? null : post._id)}
                  >
                    💬 {openComments === post._id ? '▲' : '▼'} {post.comments?.length || 0} comments
                  </button>
                  <span style={s.footerStat}>👁 {post.views || 0}</span>
                  <span style={s.footerStat}>⚡ {post.ratings?.length || 0} ratings</span>
                </div>
                <button style={s.flagBtn} onClick={() => handleFlag(post._id)}>
                  ⚑ flag
                </button>
              </div>

              {openComments === post._id && (
                <Comments post={post} token={token} onNewComment={() => fetchFeed(tab)} />
              )}

            </div>
          )
        })}
      </div>

      {/* UPLOAD MODAL */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(newPost) => {
            setPosts([newPost, ...posts])
            setShowUpload(false)
          }}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; }
        body { background: #0a0a0a; overflow-x: hidden; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes shimmer { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

    </div>
  )
}

const s = {
  page: { minHeight: '100vh', width: '100%', background: '#0a0a0a', color: '#f0ece4', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflowX: 'hidden' },
  grain: { position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 100, opacity: 0.6 },
  nav: { position: 'sticky', top: 0, width: '100%', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e1e1e', padding: '14px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, boxSizing: 'border-box' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '0.05em', color: '#f0ece4' },
  accent: { color: '#ff3c00' },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#ff3c00', animation: 'blink 1.5s ease infinite' },
  liveText: { fontSize: '0.6rem', color: '#ff3c00', letterSpacing: '0.2em', fontWeight: '600' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  userChip: { display: 'flex', alignItems: 'center', gap: '6px', background: '#111', border: '1px solid #1e1e1e', padding: '6px 14px' },
  userDot: { fontSize: '0.7rem', color: '#ff3c00' },
  userName: { fontSize: '0.78rem', fontWeight: '500', color: '#f0ece4' },
  userUni: { fontSize: '0.72rem', color: '#555' },
  uploadNavBtn: { background: '#ff3c00', color: 'white', border: 'none', padding: '8px 20px', fontSize: '0.78rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  logoutBtn: { background: 'transparent', border: '1px solid #1e1e1e', color: '#555', padding: '6px 14px', fontSize: '0.75rem', cursor: 'pointer', letterSpacing: '0.05em' },
  heroStrip: { width: '100%', background: '#111', borderBottom: '1px solid #1e1e1e', padding: '10px 0', overflow: 'hidden', boxSizing: 'border-box' },
  heroStripInner: { display: 'flex', gap: '40px', animation: 'marquee 18s linear infinite', width: 'max-content' },
  heroStripText: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '0.2em', color: '#2a2a2a', whiteSpace: 'nowrap' },
  heroStripDot: { color: '#ff3c00', fontSize: '0.85rem' },
  tabsWrap: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e1e1e', padding: '0 60px', position: 'sticky', top: '57px', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)', zIndex: 49, boxSizing: 'border-box' },
  tabs: { display: 'flex' },
  tab: { background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: '#555', padding: '16px 24px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.1em' },
  tabActive: { background: 'transparent', border: 'none', borderBottom: '2px solid #ff3c00', color: '#f0ece4', padding: '16px 24px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.1em' },
  postCount: { fontSize: '0.72rem', color: '#333', letterSpacing: '0.1em' },
  feed: { width: '100%', padding: '40px 60px', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' },
  loadingWrap: { display: 'flex', flexDirection: 'column', gap: '20px' },
  skeleton: { height: '300px', background: '#111', border: '1px solid #1e1e1e', animation: 'shimmer 1.5s ease infinite' },
  empty: { textAlign: 'center', padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  emptyIcon: { fontSize: '3rem' },
  emptyTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem' },
  emptySub: { fontSize: '0.85rem', color: '#555' },
  emptyUploadBtn: { background: '#ff3c00', color: 'white', border: 'none', padding: '12px 28px', fontSize: '0.82rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: '8px' },
  card: { width: '100%', background: '#111', border: '1px solid #1e1e1e', padding: '28px', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  authorWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  authorAvatar: { width: '40px', height: '40px', background: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 },
  authorName: { fontSize: '0.88rem', fontWeight: '600', color: '#f0ece4', marginBottom: '2px' },
  authorUni: { fontSize: '0.72rem', color: '#555' },
  badges: { display: 'flex', gap: '8px', alignItems: 'center' },
  heatBadge: { fontSize: '0.65rem', padding: '3px 10px', border: '1px solid', letterSpacing: '0.08em', fontWeight: '600' },
  scoreBadge: { fontSize: '0.65rem', color: '#555', border: '1px solid #1e1e1e', padding: '3px 10px' },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', letterSpacing: '0.02em', lineHeight: '1.1', marginBottom: '10px' },
  cardDesc: { fontSize: '0.88rem', color: '#888', lineHeight: '1.6', marginBottom: '20px', fontWeight: '300' },
  videoBox: { background: '#0a0a0a', border: '1px solid #1a1a1a', marginBottom: '20px', position: 'relative', overflow: 'hidden' },
  videoInner: { height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', position: 'relative' },
  videoPlayIcon: { width: '48px', height: '48px', background: 'rgba(255,60,0,0.1)', border: '1px solid rgba(255,60,0,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#ff3c00' },
  videoLabel: { fontSize: '0.72rem', color: '#333', letterSpacing: '0.1em' },
  videoType: { position: 'absolute', top: '12px', right: '12px', fontSize: '0.6rem', color: '#ff3c00', border: '1px solid rgba(255,60,0,0.3)', padding: '3px 8px', letterSpacing: '0.1em' },
  vibeSection: { marginBottom: '20px' },
  vibeLabel: { fontSize: '0.6rem', color: '#333', letterSpacing: '0.2em', fontWeight: '600', display: 'block', marginBottom: '10px' },
  vibes: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  vibeBtn: { background: '#0a0a0a', border: '1px solid', padding: '7px 14px', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" },
  vibeName: { textTransform: 'capitalize', letterSpacing: '0.03em' },
  vibeCount: { fontSize: '0.68rem', padding: '1px 7px', borderRadius: '20px', fontWeight: '600' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a1a1a', paddingTop: '16px' },
  footerLeft: { display: 'flex', gap: '16px' },
  footerStat: { fontSize: '0.75rem', color: '#444' },

  flagBtn: { background: 'transparent', border: 'none', color: '#2a2a2a', fontSize: '0.72rem', cursor: 'pointer', letterSpacing: '0.05em' },
  commentToggleBtn: { background: 'transparent', border: 'none', color: '#555', fontSize: '0.75rem', cursor: 'pointer', padding: '0', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.03em' },
}
