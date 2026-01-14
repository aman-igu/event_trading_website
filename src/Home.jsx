import React, { useState, useEffect } from 'react'
import Login from './Login'
import Signup from './Signup'
import TradePanel from './TradePanel'
import AdminDashboard from './AdminDashboard'

export default function Home() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [showLogin, setShowLogin] = useState(true)

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch (err) {
        console.error('Failed to parse stored user:', err)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }
  }, [])

  function handleAuthSuccess(userData, authToken) {
    setUser(userData)
    setToken(authToken)
  }

  function handleLogout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  // Show login/signup if not authenticated
  if (!user || !token) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center p-6 overflow-auto">
        {showLogin ? (
          <Login
            onLogin={handleAuthSuccess}
            onSwitchToSignup={() => setShowLogin(false)}
          />
        ) : (
          <Signup
            onSignup={handleAuthSuccess}
            onSwitchToLogin={() => setShowLogin(true)}
          />
        )}
      </div>
    )
  }

  // Show admin dashboard for admin users
  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />
  }

  // Show trade panel for regular traders
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-start justify-center p-6 overflow-auto">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-2">Welcome, {user.username}</h3>
            <p className="text-sm text-slate-400 mb-1">Team: {user.team}</p>
            <p className="text-xs text-slate-500 mb-1">Email: {user.email}</p>
            <p className="text-xs text-slate-500 mb-4">Role: {user.role}</p>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="lg:col-span-2 col-span-1">
          <TradePanel user={user} token={token} />
        </div>
      </div>
    </div>
  )
}
