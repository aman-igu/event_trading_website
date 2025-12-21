import React, { useState } from 'react'
import Registration from './Registration'
import TradePanel from './TradePanel'

export default function Home() {
  const [user, setUser] = useState(null)

  // when not registered show registration modal (posts to DB)
  if (!user) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center p-6 overflow-auto">
        <Registration onRegister={setUser} />
      </div>
    )
  }

  // when registered show trade panel with a small user summary
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-start justify-center p-6 overflow-auto">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-2">Welcome, {user.username}</h3>
            <p className="text-sm text-slate-400">Team: {user.team}</p>
            <button onClick={() => setUser(null)} className="mt-4 px-3 py-2 bg-slate-700 rounded text-white">Logout</button>
          </div>
        </div>
        <div className="lg:col-span-2 col-span-1">
          <TradePanel user={user} />
        </div>
      </div>
    </div>
  )
}
