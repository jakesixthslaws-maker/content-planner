import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/clerk-react'
import './App.css'

const STATUSES = ['IDEA', 'SCRIPTED', 'FILMED', 'POSTED']
function Dashboard() {
  const { getToken } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [aiTopic, setAiTopic] = useState('')
  const [aiTone, setAiTone] = useState('')
  const [aiIdeas, setAiIdeas] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const syncUser = async () => {
    try {
      const token = await getToken()
      await fetch('http://localhost:5000/api/users/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      console.error('Sync error:', err.message)
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await fetch('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      setPosts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const token = await getToken()
      const res = await fetch('http://localhost:5000/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Analytics fetch error:', err.message)
    }
  }

  const generateIdeas = async () => {
    if (!aiTopic.trim()) return
    setAiLoading(true)
    setAiIdeas('')
    try {
      const token = await getToken()
      const res = await fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ topic: aiTopic, tone: aiTone })
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      setAiIdeas(data.ideas)
    } catch (err) {
      setAiIdeas(`Error: ${err.message}`)
    } finally {
      setAiLoading(false)
    }
  }

  const createPost = async () => {
    if (!newTitle.trim()) return
    try {
      const token = await getToken()
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle, contentBody: '', status: 'IDEA' })
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setNewTitle('')
      fetchPosts()
      fetchAnalytics()
    } catch (err) {
      setError(err.message)
    }
  }

  const updatePostStatus = async (postId, newStatus) => {
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      fetchPosts()
      fetchAnalytics()
    } catch (err) {
      setError(err.message)
    }
  }

  const deletePost = async (postId) => {
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      fetchPosts()
      fetchAnalytics()
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    syncUser().then(() => {
      fetchPosts()
      fetchAnalytics()
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e2d4', padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Content Planner</h1>
        <UserButton />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New post title..."
          style={{ flex: 1, padding: '8px 12px', background: '#141210', border: '1px solid #26221b', borderRadius: '6px', color: '#e8e2d4' }}
        />
        <button
          onClick={createPost}
          style={{ padding: '8px 16px', background: '#c9a227', color: '#0a0a0a', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Add
        </button>
      </div>

      {analytics && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#141210', border: '1px solid #26221b', borderRadius: '8px', padding: '12px 16px' }}>
            <div style={{ fontSize: '11px', color: '#8a8578', textTransform: 'uppercase' }}>Total Posts</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{analytics.total}</div>
          </div>
          <div style={{ background: '#141210', border: '1px solid #26221b', borderRadius: '8px', padding: '12px 16px' }}>
            <div style={{ fontSize: '11px', color: '#8a8578', textTransform: 'uppercase' }}>Posted</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#c9a227' }}>{analytics.byStatus.POSTED}</div>
          </div>
          <div style={{ background: '#141210', border: '1px solid #26221b', borderRadius: '8px', padding: '12px 16px' }}>
            <div style={{ fontSize: '11px', color: '#8a8578', textTransform: 'uppercase' }}>In Progress</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{analytics.byStatus.SCRIPTED + analytics.byStatus.FILMED}</div>
          </div>
        </div>
      )}

      <div style={{ background: '#141210', border: '1px solid #26221b', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#c9a227' }}>✨ Generate content ideas</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="Topic (e.g. morning workout routine)"
            style={{ flex: 1, padding: '8px 12px', background: '#0a0a0a', border: '1px solid #26221b', borderRadius: '6px', color: '#e8e2d4' }}
          />
          <input
            value={aiTone}
            onChange={(e) => setAiTone(e.target.value)}
            placeholder="Tone (optional)"
            style={{ flex: 1, padding: '8px 12px', background: '#0a0a0a', border: '1px solid #26221b', borderRadius: '6px', color: '#e8e2d4' }}
          />
          <button
            onClick={generateIdeas}
            disabled={aiLoading}
            style={{ padding: '8px 16px', background: '#c9a227', color: '#0a0a0a', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            {aiLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {aiIdeas && (
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#8a8578', marginTop: '12px' }}>{aiIdeas}</pre>
        )}
      </div>

      {loading && <p style={{ color: '#8a8578' }}>Loading posts...</p>}
      {error && <p style={{ color: '#c96a6a' }}>Error: {error}</p>}

      {!loading && !error && (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
          {STATUSES.map((status) => (
            <div key={status} style={{ minWidth: '260px', flex: '0 0 260px' }}>
              <h3 style={{ fontSize: '14px', color: '#c9a227', marginBottom: '10px' }}>
                {status} ({posts.filter(p => p.status === status).length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {posts.filter(p => p.status === status).map((post) => (
                  <div key={post.id} style={{ background: '#141210', border: '1px solid #26221b', borderRadius: '8px', padding: '12px' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '14px' }}>{post.title}</p>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <select
                        value={post.status}
                        onChange={(e) => updatePostStatus(post.id, e.target.value)}
                        style={{ flex: 1, background: '#0a0a0a', color: '#e8e2d4', border: '1px solid #26221b', borderRadius: '4px', padding: '4px', fontSize: '12px' }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button
                        onClick={() => deletePost(post.id)}
                        style={{ background: 'transparent', color: '#8a8578', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e2d4' }}>
      <SignedOut>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <h1>Content Planner</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <SignInButton mode="modal">
              <button style={{ padding: '10px 20px', background: '#c9a227', color: '#0a0a0a', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{ padding: '10px 20px', background: 'transparent', color: '#e8e2d4', border: '1px solid #26221b', borderRadius: '6px', cursor: 'pointer' }}>
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <Dashboard />
      </SignedIn>
    </div>
  )
}

export default App
