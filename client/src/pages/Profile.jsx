import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate, Link } from 'react-router-dom'
import API_URL from '../config'


const VIBES = ['fire', 'chaotic', 'important', 'cringe', 'wholesome']
const VIBE_EMOJI = { fire: '🔥', chaotic: '🤡', important: '📢', cringe: '💀', wholesome: '🫶' }
const VIBE_COLOR = { fire: '#ff3c00', chaotic: '#ff9900', important: '#ffcc00', cringe: '#aa00ff', wholesome: '#00cc88' }

export default function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uncovering, setUncovering] = useState(null)
  const token = localStorage.getItem('token')
  const currentUser = JSON.parse(localStorage.getItem('user'))
  const isOwnProfile = currentUser?.username === username

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/api/posts/user/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(res.data.user)
      setPosts(res.data.posts)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleUncover = async (postId) => {
    setUncovering(postId)
    try {
      await axios.patch(`http://localhost:5000/api/posts/${postId}/uncover`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchProfile()
    } catch (err) { console.error(err) }
    setUncovering(null)
  }

  const getHeatLevel = (score) => {
    if (score > 100) return { label: 'GLOBAL 🌍', color: '#ffcc00' }
    if (score > 40) return { label: 'NATIONAL 🌏', color: '#ff9900' }
    if (score > 10) return { label: 'TRENDING 📈', color: '#ff3c00' }
    return { label: 'FRESH ✨', color: '#555' }
  }

  if (loading) return (
    <div style={s.loadingPage}>
      <div style={s.loadingText}>loading profile...</div>
    </div>
  )

  if (!profile) return (
    <div style={s.loadingPage}>
      <div style={s.loadingText}>user not found.</div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.grain} />

      {/* NAV */}
      <nav style={s.nav}>
        <Link to="/" style={s.backBtn}>← back to feed</Link>
        <h1 style={s.logo}>Campus<span style={s.accent}>Raw</span></h1>
        <div style={s.navRight}>
          <button style={s.logoutBtn} onClick={() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigate('/login')
          }}>↩ logout</button>
        </div>
      </nav>

      {/* PROFILE HEADER */}
      <div style={s.header}>
        <div style={s.headerInner}>

          <div style={s.avatarWrap}>
            <div style={s.avatar}>
              {profile.username?.[0]?.toUpperCase() || '?'}
            </div>
            {isOwnProfile && (
              <div style={s.ownBadge}>YOU</div>
            )}
          </div>

          <div style={s.headerInfo}>
            <div style={s.headerTop}>
              <h2 style={s.profileUsername}>@{profile.username}</h2>
              <div style={s.roleBadge}>
                {profile.role === 'god' ? '👑 god' : profile.role === 'elevated' ? '⭐ elevated' : '🎓 student'}
              </div>
            </div>

            <div style={s.profileUni}>
              {profile.university} • {profile.country}
            </div>

            {profile.bio && (
              <p style={s.profileBio}>{profile.bio}</p>
            )}

            <div style={s.stats}>
              <div style={s.stat}>
                <div style={s.statNum}>{posts.length}</div>
                <div style={s.statLabel}>posts</div>
              </div>
              <div style={s.stat}>
                <div style={s.statNum}>{profile.followers?.length || 0}</div>
                <div style={s.statLabel}>followers</div>
              </div>
              <div style={s.stat}>
                <div style={s.statNum}>{profile.following?.length || 0}</div>
                <div style={s.statLabel}>following</div>
              </div>
              <div style={s.stat}>
                <div style={s.statNum}>
                  {posts.reduce((sum, p) => sum + (p.ratings?.length || 0), 0)}
                </div>
                <div style={s.statLabel}>total ratings</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* POSTS */}
      <div style={s.postsSection}>
        <div style={s.postsSectionHeader}>
          <h3 style={s.postsTitle}>
            {isOwnProfile ? 'your posts' : `posts by @${profile.username}`}
          </h3>
          <span style={s.postsCount}>{posts.length} total</span>
        </div>

        {posts.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📭</div>
            <p style={s.emptyText}>
              {isOwnProfile ? "you haven't posted anything yet." : "no posts yet."}
            </p>
          </div>
        )}

        <div style={s.postsList}>
          {posts.map((post, index) => {
            const heat = getHeatLevel(post.heatScore)
            const topVibe = VIBES.reduce((a, b) =>
              (post.ratings?.filter(r => r.vibe === b).length || 0) >
                (post.ratings?.filter(r => r.vibe === a).length || 0) ? b : a, 'fire')

            return (
              <div
                key={post._id}
                style={{
                  ...s.card,
                  borderLeft: `3px solid ${VIBE_COLOR[topVibe] || '#1e1e1e'}`
                }}
              >
                {/* ANON BANNER */}
                {post.isAnonymous && !post.isUncovered && isOwnProfile && (
                  <div style={s.anonBanner}>
                    <span>👻 this post is anonymous publicly</span>
                    <button
                      style={uncovering === post._id ? s.uncoverBtnLoading : s.uncoverBtn}
                      onClick={() => handleUncover(post._id)}
                      disabled={uncovering === post._id}
                    >
                      {uncovering === post._id ? 'revealing...' : '👀 reveal yourself'}
                    </button>
                  </div>
                )}

                {post.isUncovered && (
                  <div style={s.uncoveredBanner}>
                    ✅ you revealed yourself on this post
                  </div>
                )}

                <div style={s.cardTop}>
                  <div>
                    <h3 style={s.cardTitle}>{post.title}</h3>
                    {post.description && <p style={s.cardDesc}>{post.description}</p>}
                  </div>
                  <div style={s.badges}>
                    <span style={{ ...s.heatBadge, color: heat.color, borderColor: heat.color + '40' }}>
                      {heat.label}
                    </span>
                    <span style={s.typeBadge}>{post.type?.toUpperCase()}</span>
                  </div>
                </div>

                {/* VIDEO PLACEHOLDER */}
                <div style={s.videoBox}>
                  <div style={s.videoInner}>
                    <div style={s.videoPlayIcon}>▶</div>
                    <span style={s.videoType}>{post.type?.toUpperCase()}</span>
                  </div>
                </div>

                <div style={s.cardFooter}>
                  <span style={s.footerStat}>💬 {post.comments?.length || 0}</span>
                  <span style={s.footerStat}>⚡ {post.ratings?.length || 0} ratings</span>
                  <span style={s.footerStat}>🌡 {Math.round(post.heatScore)} heat</span>
                  <span style={{ ...s.visibilityBadge }}>
                    {post.visibility === 'global' ? '🌍' : post.visibility === 'national' ? '🌏' : '🏫'} {post.visibility}
                  </span>
                </div>

              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; }
        body { background: #0a0a0a; overflow-x: hidden; }
        a { text-decoration: none; }
      `}</style>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', width: '100%', background: '#0a0a0a', color: '#f0ece4', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  grain: { position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 100, opacity: 0.6 },
  loadingPage: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#333', letterSpacing: '0.1em' },

  nav: { position: 'sticky', top: 0, width: '100%', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e1e1e', padding: '14px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, boxSizing: 'border-box' },
  backBtn: { fontSize: '0.78rem', color: '#555', letterSpacing: '0.05em', cursor: 'pointer', transition: 'color 0.2s' },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '0.05em', color: '#f0ece4' },
  accent: { color: '#ff3c00' },
  navRight: { display: 'flex', alignItems: 'center' },
  logoutBtn: { background: 'transparent', border: '1px solid #1e1e1e', color: '#555', padding: '6px 14px', fontSize: '0.75rem', cursor: 'pointer' },

  header: { borderBottom: '1px solid #1e1e1e', background: '#0f0f0f' },
  headerInner: { maxWidth: '100%', padding: '60px 60px', display: 'flex', gap: '40px', alignItems: 'flex-start', boxSizing: 'border-box' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: '100px', height: '100px', background: '#1a1a1a', border: '2px solid #ff3c00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontFamily: "'Bebas Neue', sans-serif", color: '#ff3c00' },
  ownBadge: { position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#ff3c00', color: 'white', fontSize: '0.55rem', padding: '2px 8px', letterSpacing: '0.15em', fontWeight: '700', whiteSpace: 'nowrap' },

  headerInfo: { flex: 1 },
  headerTop: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' },
  profileUsername: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '0.02em', color: '#f0ece4' },
  roleBadge: { fontSize: '0.7rem', border: '1px solid #1e1e1e', padding: '4px 12px', color: '#555', letterSpacing: '0.08em' },
  profileUni: { fontSize: '0.82rem', color: '#555', marginBottom: '12px' },
  profileBio: { fontSize: '0.88rem', color: '#888', lineHeight: '1.6', marginBottom: '24px', fontWeight: '300', maxWidth: '500px' },
  stats: { display: 'flex', gap: '40px' },
  stat: {},
  statNum: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#f0ece4', lineHeight: '1' },
  statLabel: { fontSize: '0.62rem', color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' },

  postsSection: { padding: '40px 60px', boxSizing: 'border-box' },
  postsSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  postsTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '0.05em' },
  postsCount: { fontSize: '0.72rem', color: '#333', letterSpacing: '0.1em' },

  empty: { textAlign: 'center', padding: '80px 0' },
  emptyIcon: { fontSize: '3rem', marginBottom: '16px' },
  emptyText: { fontSize: '0.85rem', color: '#555' },

  postsList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { background: '#111', border: '1px solid #1e1e1e', padding: '28px', boxSizing: 'border-box' },

  anonBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,60,0,0.06)', border: '1px solid rgba(255,60,0,0.15)', padding: '12px 16px', marginBottom: '20px', fontSize: '0.78rem', color: '#888' },
  uncoverBtn: { background: '#ff3c00', color: 'white', border: 'none', padding: '6px 16px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em' },
  uncoverBtnLoading: { background: '#2a1a1a', color: '#555', border: 'none', padding: '6px 16px', fontSize: '0.75rem', cursor: 'not-allowed', fontFamily: "'DM Sans', sans-serif" },
  uncoveredBanner: { background: 'rgba(0,200,100,0.06)', border: '1px solid rgba(0,200,100,0.2)', padding: '10px 16px', marginBottom: '20px', fontSize: '0.75rem', color: '#00cc88' },

  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '0.02em', lineHeight: '1.1', marginBottom: '6px' },
  cardDesc: { fontSize: '0.85rem', color: '#888', lineHeight: '1.5', fontWeight: '300' },
  badges: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 },
  heatBadge: { fontSize: '0.65rem', padding: '3px 10px', border: '1px solid', letterSpacing: '0.08em', fontWeight: '600' },
  typeBadge: { fontSize: '0.65rem', color: '#555', border: '1px solid #1e1e1e', padding: '3px 10px', letterSpacing: '0.08em' },

  videoBox: { background: '#0a0a0a', border: '1px solid #1a1a1a', marginBottom: '16px' },
  videoInner: { height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', position: 'relative' },
  videoPlayIcon: { width: '40px', height: '40px', background: 'rgba(255,60,0,0.1)', border: '1px solid rgba(255,60,0,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#ff3c00' },
  videoType: { position: 'absolute', top: '10px', right: '10px', fontSize: '0.6rem', color: '#ff3c00', border: '1px solid rgba(255,60,0,0.3)', padding: '2px 8px', letterSpacing: '0.1em' },

  cardFooter: { display: 'flex', gap: '20px', alignItems: 'center', borderTop: '1px solid #1a1a1a', paddingTop: '14px' },
  footerStat: { fontSize: '0.75rem', color: '#444' },
  visibilityBadge: { marginLeft: 'auto', fontSize: '0.68rem', color: '#555', letterSpacing: '0.08em' },
}
