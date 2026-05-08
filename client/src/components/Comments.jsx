import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Comments({ post, token, onNewComment }) {
  const [comments, setComments] = useState(post.comments || [])
  const [text, setText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const user = JSON.parse(localStorage.getItem('user'))

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comment`,
        { text, isAnonymous },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setComments([...comments, res.data])
      if (onNewComment) onNewComment()
      setText('')
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div style={s.wrap}>

      {/* COMMENT LIST */}
      <div style={s.list}>
        {comments.length === 0 && (
          <div style={s.empty}>no comments yet. say something.</div>
        )}
        {comments.map((c, i) => (
          <div key={i} style={s.comment}>
            <div style={s.commentAvatar}>
              {c.isAnonymous ? '👻' : (c.user?.username?.[0]?.toUpperCase() || '?')}
            </div>
            <div style={s.commentBody}>
              <div style={s.commentMeta}>
                <span style={s.commentAuthor}>
                  {c.isAnonymous ? 'anonymous' : `@${c.user?.username || 'unknown'}`}
                </span>
                <span style={s.commentTime}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={s.commentText}>{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div style={s.inputWrap}>
        <div style={s.anonToggle}>
          <button
            type="button"
            style={!isAnonymous ? s.toggleActive : s.toggleInactive}
            onClick={() => setIsAnonymous(false)}
          >👤</button>
          <button
            type="button"
            style={isAnonymous ? s.toggleActive : s.toggleInactive}
            onClick={() => setIsAnonymous(true)}
          >👻</button>
        </div>
        <input
          style={s.input}
          placeholder={isAnonymous ? 'comment anonymously...' : 'say something...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          maxLength={300}
        />
        <button
          style={loading || !text.trim() ? s.sendBtnDisabled : s.sendBtn}
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
        >
          {loading ? '...' : '↑'}
        </button>
      </div>

    </div>
  )
}

const s = {
  wrap: { borderTop: '1px solid #1a1a1a', marginTop: '16px', paddingTop: '20px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', maxHeight: '320px', overflowY: 'auto' },
  empty: { fontSize: '0.78rem', color: '#333', textAlign: 'center', padding: '20px 0', fontStyle: 'italic' },
  comment: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  commentAvatar: { width: '30px', height: '30px', background: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 },
  commentBody: { flex: 1 },
  commentMeta: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' },
  commentAuthor: { fontSize: '0.75rem', fontWeight: '600', color: '#f0ece4' },
  commentTime: { fontSize: '0.65rem', color: '#333' },
  commentText: { fontSize: '0.82rem', color: '#888', lineHeight: '1.5', fontWeight: '300' },
  inputWrap: { display: 'flex', gap: '8px', alignItems: 'center' },
  anonToggle: { display: 'flex', border: '1px solid #1e1e1e', flexShrink: 0 },
  toggleActive: { padding: '8px 10px', background: '#ff3c00', border: 'none', cursor: 'pointer', fontSize: '0.8rem' },
  toggleInactive: { padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem' },
  input: { flex: 1, background: '#0a0a0a', border: '1px solid #1e1e1e', color: '#f0ece4', padding: '10px 14px', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' },
  sendBtn: { background: '#ff3c00', color: 'white', border: 'none', width: '40px', height: '40px', fontSize: '1rem', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { background: '#1a1a1a', color: '#333', border: 'none', width: '40px', height: '40px', fontSize: '1rem', cursor: 'not-allowed', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
