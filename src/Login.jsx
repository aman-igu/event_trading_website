import React, { useState } from "react"

export default function Login({ onLogin, onSwitchToSignup }) {
    const [form, setForm] = useState({ email: "", password: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setError(null) // Clear error on input change
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (!form.email.trim() || !form.password.trim()) {
            setError("All fields are required")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const apiBaseRaw = import.meta.env.VITE_API_URL || ''
            let apiBase = apiBaseRaw.trim()
            if (apiBase && !/^https?:\/\//i.test(apiBase)) apiBase = `http://${apiBase}`
            const url = apiBase ? `${apiBase.replace(/\/$/, '')}/api/auth/login` : '/api/auth/login'

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            const body = await res.json()

            if (!res.ok) {
                const msg = body.error || (body.errors && body.errors.join(', ')) || 'Login failed'
                setError(msg)
                setLoading(false)
                return
            }

            // Save token to localStorage
            if (body.token) {
                localStorage.setItem('authToken', body.token)
                localStorage.setItem('user', JSON.stringify(body.user))
            }

            setLoading(false)
            if (typeof onLogin === 'function') onLogin(body.user, body.token)
        } catch (err) {
            setError(err.message || 'Network error')
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                <p className="text-sm text-slate-400 mt-1">
                    Login to access your trading account
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        placeholder="trader@example.com"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        placeholder="••••••••"
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Logging in...' : 'Login to Trading Floor'}
                </button>
            </form>

            {/* Switch to Signup */}
            <div className="px-6 pb-6 text-center">
                <p className="text-sm text-slate-400">
                    Don't have an account?{' '}
                    <button
                        onClick={onSwitchToSignup}
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                    >
                        Sign up here
                    </button>
                </p>
            </div>
        </div>
    )
}
