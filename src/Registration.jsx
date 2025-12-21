import React, { useState } from "react"


export default function Registration({ onRegister }) {
  const [form, setForm] = useState({ username: "", team: "" })
  const [submitted, setSubmitted] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.username.trim() || !form.team.trim()) {
      setSubmitted({ ok: false, msg: "Both fields are required." })
      return
    }

    setSubmitted(null)
    // call backend register API
    ;(async () => {
      try {
        const apiBaseRaw = import.meta.env.VITE_API_URL || ''
        let apiBase = apiBaseRaw.trim()
        if (apiBase && !/^https?:\/\//i.test(apiBase)) apiBase = `http://${apiBase}`
        const url = apiBase ? `${apiBase.replace(/\/$/, '')}/api/register` : '/api/register'
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg = body.error || (body.errors && body.errors.join(', ')) || 'Registration failed'
          setSubmitted({ ok: false, msg })
          return
        }
        const user = body.user || body
        setSubmitted({ ok: true, msg: `Trader ${user.username} joined (${user.team})` })
        if (typeof onRegister === 'function') onRegister(user)
      } catch (err) {
        setSubmitted({ ok: false, msg: err.message || 'Network error' })
      }
    })()
  }

  return (
    <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Trading Desk Access</h2>
          <p className="text-sm text-slate-400 mt-1">
            Register to enter the trading floor
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 p-6 text-center">
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-xs text-slate-400">Markets</p>
            <p className="text-lg font-semibold text-green-400">Live</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-xs text-slate-400">Risk Level</p>
            <p className="text-lg font-semibold text-yellow-400">Medium</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-xs text-slate-400">Mode</p>
            <p className="text-lg font-semibold text-indigo-400">Demo</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400">
              Trader Name
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. AlexTrader"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400">
              Trading Team
            </label>
            <input
              name="team"
              value={form.team}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Quant Alpha"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition"
          >
            Enter Trading Floor
          </button>
        </form>

        {submitted && (
          <div
            className={`px-6 pb-6 text-sm font-medium ${
              submitted.ok ? "text-green-400" : "text-red-400"
            }`}
          >
            {submitted.msg}
          </div>
        )}
      </div>
    
  )
}
