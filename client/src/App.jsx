import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import './App.css'

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e2d4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <h1>Content Planner</h1>

      <SignedOut>
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
      </SignedOut>

      <SignedIn>
        <p>You're signed in.</p>
        <UserButton />
      </SignedIn>
    </div>
  )
}

export default App