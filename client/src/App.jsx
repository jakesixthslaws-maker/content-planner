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
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="brand-wrapper">
          <div className="brand-icon">⚡</div>
          <h1 className="dashboard-title">Content Planner</h1>
        </div>
        <UserButton />
      </div>

      <div className="add-post-card">
        <div className="add-post-row">
          <input
            className="text-input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Write a new post title or idea..."
          />
          <button className="btn-primary" onClick={createPost}>
            + Add Post
          </button>
        </div>
      </div>

      {analytics && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Posts</div>
            <div className="stat-value">{analytics.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Posted</div>
            <div className="stat-value accent">{analytics.byStatus.POSTED}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Pipeline</div>
            <div className="stat-value">{analytics.byStatus.SCRIPTED + analytics.byStatus.FILMED + analytics.byStatus.IDEA}</div>
          </div>
        </div>
      )}

      <div className="ai-panel">
        <div className="ai-panel-header">
          <span className="ai-panel-title">✨ Gemini AI Assistant</span>
        </div>
        <div className="ai-panel-row">
          <input
            className="ai-panel-input"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="Topic (e.g. 5 productivity tips for developers)"
          />
          <input
            className="ai-panel-input"
            value={aiTone}
            onChange={(e) => setAiTone(e.target.value)}
            placeholder="Tone (e.g. Casual, Professional)"
          />
          <button className="btn-primary btn-ai" onClick={generateIdeas} disabled={aiLoading}>
            {aiLoading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>
        {aiIdeas && <pre className="ai-output">{aiIdeas}</pre>}
      </div>

      {loading && <p className="status-message loading">Loading post pipeline...</p>}
      {error && <p className="status-message error">Error: {error}</p>}

      {!loading && !error && (
        <div className="board">
          {STATUSES.map((status) => {
            const filteredPosts = posts.filter(p => p.status === status)
            return (
              <div key={status} className="board-column">
                <div className="column-header">
                  <div className="column-title-group">
                    <span className={`status-dot ${status}`}></span>
                    <h3 className="column-title">{status}</h3>
                  </div>
                  <span className="column-badge">{filteredPosts.length}</span>
                </div>
                <div className="column-posts">
                  {filteredPosts.length === 0 ? (
                    <div className="empty-state">No items in {status.toLowerCase()}</div>
                  ) : (
                    filteredPosts.map((post) => (
                      <div key={post.id} className="post-card">
                        <p className="post-title">{post.title}</p>
                        <div className="post-controls">
                          <select
                            className="status-select"
                            value={post.status}
                            onChange={(e) => updatePostStatus(post.id, e.target.value)}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button className="delete-btn" onClick={() => deletePost(post.id)} title="Delete Post">
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <div className="app-shell">
      <SignedOut>
        <div className="auth-screen">
          <span className="auth-badge">Content Creation Platform</span>
          <h1 className="auth-title">Content Planner</h1>
          <p className="auth-subtitle">Plan, manage, and scale your social media pipeline with built-in AI assistance.</p>
          <div className="auth-buttons">
            <SignInButton mode="modal">
              <button className="btn-primary">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-secondary">Sign Up</button>
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