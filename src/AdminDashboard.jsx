import React, { useState, useEffect } from 'react'
import { apiGet, apiPost, apiDelete, apiPut } from './utils/api'
import { TradingCardCreator } from './components/TradingCardCreator'

// Stock Card Component with Price Controls
function StockCard({ stock, onUpdate, onDelete }) {
    const [customPrice, setCustomPrice] = useState(stock.currentPrice)
    const [isEditing, setIsEditing] = useState(false)

    async function updatePrice(newPrice) {
        if (newPrice <= 0) {
            alert('❌ Price must be greater than 0')
            return
        }
        const { ok } = await apiPut(`/api/admin/stocks/${stock._id}/price`, { currentPrice: newPrice })
        if (ok) {
            onUpdate()
            setIsEditing(false)
            setCustomPrice(newPrice)
        }
    }

    async function adjustPrice(amount) {
        const newPrice = stock.currentPrice + amount
        await updatePrice(newPrice)
    }

    async function handleCustomPrice() {
        await updatePrice(parseFloat(customPrice))
    }

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-slate-700 hover:border-indigo-500 transition-all">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-2xl font-bold text-white">{stock.symbol}</h4>
                    <p className="text-sm text-slate-400">{stock.name}</p>
                </div>
                <button onClick={() => onDelete(stock._id)} className="text-red-400 hover:text-red-300 text-lg">🗑️</button>
            </div>

            {/* Current Price */}
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
                <p className="text-xs text-slate-400 mb-1">Current Price</p>
                <p className="text-3xl font-bold text-green-400">₹{stock.currentPrice.toFixed(2)}</p>
            </div>

            {/* Quick Adjust Buttons */}
            <div className="space-y-2 mb-4">
                <p className="text-xs text-slate-400 font-semibold">Quick Adjust</p>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => adjustPrice(10)} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm transition-all">+₹10</button>
                    <button onClick={() => adjustPrice(5)} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm transition-all">+₹5</button>
                    <button onClick={() => adjustPrice(1)} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm transition-all">+₹1</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => adjustPrice(-10)} className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-sm transition-all">-₹10</button>
                    <button onClick={() => adjustPrice(-5)} className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-sm transition-all">-₹5</button>
                    <button onClick={() => adjustPrice(-1)} className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-sm transition-all">-₹1</button>
                </div>
            </div>

            {/* Custom Price Input */}
            <div className="border-t border-slate-700 pt-4">
                <p className="text-xs text-slate-400 font-semibold mb-2">Set Custom Price</p>
                {isEditing ? (
                    <div className="flex gap-2">
                        <input
                            type="number"
                            step="0.01"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            className="flex-1 bg-slate-900 rounded-lg px-3 py-2 text-white text-sm"
                            autoFocus
                        />
                        <button onClick={handleCustomPrice} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold">✓</button>
                        <button onClick={() => { setIsEditing(false); setCustomPrice(stock.currentPrice) }} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">✗</button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-semibold">
                        Set Price
                    </button>
                )}
            </div>
        </div>
    )
}

export default function AdminDashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [stats, setStats] = useState(null)
    const [teams, setTeams] = useState([])
    const [stocks, setStocks] = useState([])
    const [trades, setTrades] = useState([])
    const [users, setUsers] = useState([])
    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(false)
    const [tradingSettings, setTradingSettings] = useState({ buyEnabled: true, sellEnabled: true })
    const [stockForm, setStockForm] = useState({ symbol: '', name: '', currentPrice: '', category: 'technology' })
    const [teamForm, setTeamForm] = useState({ teamName: '', initialBudget: 0 })
    const [memberForm, setMemberForm] = useState({ userId: '', teamName: '' })
    const [allocationForm, setAllocationForm] = useState({ teamName: '', totalAmount: 0, distributionType: 'equal' })

    useEffect(() => { loadData() }, [activeTab])

    async function loadData() {
        setLoading(true)
        try {
            if (activeTab === 'dashboard') {
                const { ok, data } = await apiGet('/api/admin/dashboard')
                if (ok) setStats(data.stats)
            } else if (activeTab === 'teams') {
                const [teamsRes, usersRes] = await Promise.all([
                    apiGet('/api/admin/teams'),
                    apiGet('/api/admin/users')
                ])
                if (teamsRes.ok) setTeams(teamsRes.data.teams || [])
                if (usersRes.ok) setUsers(usersRes.data.users || [])
            } else if (activeTab === 'stocks') {
                const { ok, data } = await apiGet('/api/admin/stocks')
                if (ok) setStocks(data.stocks || [])
            } else if (activeTab === 'trades') {
                const { ok, data } = await apiGet('/api/admin/trades')
                if (ok) setTrades(data.trades || [])
            } else if (activeTab === 'cards') {
                const [cardsRes, stocksRes] = await Promise.all([
                    apiGet('/api/admin/cards'),
                    apiGet('/api/admin/stocks')
                ])
                if (cardsRes.ok) setCards(cardsRes.data.cards || [])
                if (stocksRes.ok) setStocks(stocksRes.data.stocks || [])
            } else if (activeTab === 'settings') {
                const { ok, data } = await apiGet('/api/admin/settings/trading')
                if (ok) setTradingSettings(data.settings)
            }
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    async function handleCreateStock(e) {
        e.preventDefault()
        const { ok } = await apiPost('/api/admin/stocks', { ...stockForm, currentPrice: parseFloat(stockForm.currentPrice) })
        if (ok) {
            setStockForm({ symbol: '', name: '', currentPrice: '', category: 'technology' })
            loadData()
            alert('✅ Stock created!')
        }
    }

    async function handleDeleteStock(id) {
        if (!confirm('Delete?')) return
        const { ok } = await apiDelete(`/api/admin/stocks/${id}`)
        if (ok) { loadData(); alert('✅ Deleted!') }
    }

    async function handleCreateTeam(e) {
        e.preventDefault()
        const { ok, data } = await apiPost('/api/admin/teams', teamForm)
        if (ok) {
            alert(`✅ ${data.message}`)
            setTeamForm({ teamName: '', initialBudget: 0 })
            loadData()
        }
    }

    async function handleAddMember(e) {
        e.preventDefault()
        const { ok, data } = await apiPost('/api/admin/teams/members', memberForm)
        if (ok) {
            alert(`✅ ${data.message}`)
            setMemberForm({ userId: '', teamName: '' })
            loadData()
        }
    }

    async function handleAllocateMoney(e) {
        e.preventDefault()
        const { ok, data } = await apiPost('/api/admin/teams/allocate', {
            ...allocationForm,
            totalAmount: parseFloat(allocationForm.totalAmount)
        })
        if (ok) {
            alert(`✅ ${data.message}\n${data.membersUpdated} members updated`)
            setAllocationForm({ teamName: '', totalAmount: 0, distributionType: 'equal' })
            loadData()
        }
    }

    async function handleCreateCard(cardData) {
        const { ok, data } = await apiPost('/api/admin/cards', cardData)
        if (ok) {
            alert(`✅ ${data.message}`)
            loadData()
        }
    }

    async function handleActivateCard(cardId) {
        if (!confirm('⚡ Activate this card? This will change stock prices!')) return
        const { ok, data } = await apiPost(`/api/admin/cards/${cardId}/activate`, {})
        if (ok) {
            alert(`✅ ${data.message}\n\nPrice Changes:\n${data.priceChanges.map(pc => `${pc.symbol}: ₹${pc.oldPrice} → ₹${pc.newPrice} (${pc.changeType})`).join('\n')}`)
            loadData()
        }
    }

    async function handleToggleBuy() {
        const newValue = !tradingSettings.buyEnabled
        const { ok } = await apiPost('/api/admin/settings/trading/buy', { enabled: newValue })
        if (ok) {
            setTradingSettings(prev => ({ ...prev, buyEnabled: newValue }))
        }
    }

    async function handleToggleSell() {
        const newValue = !tradingSettings.sellEnabled
        const { ok } = await apiPost('/api/admin/settings/trading/sell', { enabled: newValue })
        if (ok) {
            setTradingSettings(prev => ({ ...prev, sellEnabled: newValue }))
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black">
            <div className="bg-slate-900 border-b border-slate-700">
                <div className="max-w-full px-4 md:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">🎯 Admin Dashboard</h1>
                    <button onClick={onLogout} className="px-6 py-2 bg-red-600 rounded text-white">Logout</button>
                </div>
            </div>

            <div className="max-w-full px-4 md:px-6 lg:px-8 py-6">
                <div className="flex gap-3 mb-6 overflow-x-auto">
                    {['dashboard', 'teams', 'stocks', 'cards', 'trades', 'settings'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-lg font-semibold capitalize whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                            {tab === 'cards' ? '🎴 Cards' : tab === 'settings' ? '⚙️ Settings' : tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'dashboard' && stats && (
                    <div className="grid grid-cols-4 gap-6">
                        <div className="bg-blue-600 rounded-xl p-6"><p className="text-white">Users</p><p className="text-4xl font-bold text-white">{stats.totalUsers}</p></div>
                        <div className="bg-cyan-600 rounded-xl p-6"><p className="text-white">Teams</p><p className="text-4xl font-bold text-white">{stats.totalTeams}</p></div>
                        <div className="bg-green-600 rounded-xl p-6"><p className="text-white">Stocks</p><p className="text-4xl font-bold text-white">{stats.totalStocks}</p></div>
                        <div className="bg-yellow-600 rounded-xl p-6"><p className="text-white">Trades</p><p className="text-4xl font-bold text-white">{stats.totalTrades}</p></div>
                    </div>
                )}

                {activeTab === 'teams' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-2 border-purple-600 rounded-xl p-6">
                            <h3 className="text-2xl font-bold text-white mb-4">➕ Create New Team</h3>
                            <form onSubmit={handleCreateTeam} className="grid grid-cols-3 gap-4">
                                <input placeholder="Team Name" value={teamForm.teamName} onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })} className="bg-slate-900 rounded-lg px-4 py-3 text-white" required />
                                <input placeholder="Initial Budget (₹)" type="number" value={teamForm.initialBudget} onChange={(e) => setTeamForm({ ...teamForm, initialBudget: e.target.value })} className="bg-slate-900 rounded-lg px-4 py-3 text-white" />
                                <button type="submit" className="bg-purple-600 rounded-lg px-6 py-3 text-white font-bold hover:bg-purple-700">Create Team</button>
                            </form>
                        </div>

                        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-2 border-cyan-600 rounded-xl p-6">
                            <h3 className="text-2xl font-bold text-white mb-4">👤 Add Member to Team</h3>
                            <form onSubmit={handleAddMember} className="grid grid-cols-3 gap-4">
                                <select value={memberForm.userId} onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })} className="bg-slate-900 rounded-lg px-4 py-3 text-white" required>
                                    <option value="">Select User</option>
                                    {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.email})</option>)}
                                </select>
                                <select value={memberForm.teamName} onChange={(e) => setMemberForm({ ...memberForm, teamName: e.target.value })} className="bg-slate-900 rounded-lg px-4 py-3 text-white" required>
                                    <option value="">Select Team</option>
                                    {teams.map(t => <option key={t.teamName} value={t.teamName}>{t.teamName}</option>)}
                                </select>
                                <button type="submit" className="bg-cyan-600 rounded-lg px-6 py-3 text-white font-bold hover:bg-cyan-700">Add Member</button>
                            </form>
                        </div>

                        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-2 border-green-600 rounded-xl p-6">
                            <h3 className="text-2xl font-bold text-white mb-4">💰 Allocate Money to Team</h3>
                            <form onSubmit={handleAllocateMoney} className="grid grid-cols-4 gap-4">
                                <select value={allocationForm.teamName} onChange={(e) => setAllocationForm({ ...allocationForm, teamName: e.target.value })} className="bg-slate-900 rounded-lg px-4 py-3 text-white" required>
                                    <option value="">Select Team</option>
                                    {teams.map(t => <option key={t.teamName} value={t.teamName}>{t.teamName}</option>)}
                                </select>
                                <input placeholder="Total Amount (₹)" type="number" step="0.01" value={allocationForm.totalAmount} onChange={(e) => setAllocationForm({ ...allocationForm, totalAmount: e.target.value })} className="bg-slate-900 rounded-lg px-4 py-3 text-white" required />
                                <select value={allocationForm.distributionType} onChange={(e) => setAllocationForm({ ...allocationForm, distributionType: e.target.value })} className="bg-slate-900 rounded-lg px-4 py-3 text-white">
                                    <option value="equal">Equal Distribution (+)</option>
                                    <option value="set">Set New Balance</option>
                                </select>
                                <button type="submit" className="bg-green-600 rounded-lg px-6 py-3 text-white font-bold hover:bg-green-700">Allocate Money</button>
                            </form>
                        </div>

                        <h2 className="text-3xl font-bold text-white">👥 All Teams ({teams.length})</h2>
                        {teams.length === 0 && <div className="bg-slate-800 rounded-xl p-12 text-center"><p className="text-slate-400 text-xl">📭 No teams yet</p></div>}
                        {teams.map(team => (
                            <div key={team.teamName} className="bg-slate-800 rounded-xl p-6">
                                <div className="flex justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-white">🏆 {team.teamName}</h3>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-400">Total Balance</p>
                                        <p className="text-3xl font-bold text-green-400">₹{(team.totalBalance || 0).toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">{team.memberCount || 0} members</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {team.members && team.members.map(member => (
                                        <div key={member.id} className="bg-slate-900 p-5 rounded-lg">
                                            <p className="text-white font-semibold">{member.username}</p>
                                            <p className="text-xs text-slate-400">{member.email}</p>
                                            <div className="flex justify-between mt-3">
                                                <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300">{member.role || 'trader'}</span>
                                                <span className="text-lg font-bold text-cyan-400">₹{(member.balance || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'stocks' && (
                    <div className="space-y-6">
                        <div className="bg-indigo-900/50 border-2 border-indigo-600 rounded-xl p-6">
                            <h3 className="text-2xl font-bold text-white mb-6">➕ Create New Stock</h3>
                            <form onSubmit={handleCreateStock} className="grid grid-cols-4 gap-4">
                                <input placeholder="Symbol (AAPL)" value={stockForm.symbol} onChange={(e) => setStockForm({ ...stockForm, symbol: e.target.value.toUpperCase() })} className="bg-slate-900 rounded-lg px-4 py-3 text-white" required />
                                <input placeholder="Name (Apple Inc.)" value={stockForm.name} onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })} className="bg-slate-900 rounded-lg px-4 py-3 text-white" required />
                                <input placeholder="Price (150)" type="number" step="0.01" value={stockForm.currentPrice} onChange={(e) => setStockForm({ ...stockForm, currentPrice: e.target.value })} className="bg-slate-900 rounded-lg px-4 py-3 text-white" required />
                                <button type="submit" className="bg-green-600 rounded-lg px-6 py-3 text-white font-bold">Create</button>
                            </form>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">💹 All Stocks ({stocks.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {stocks.map(stock => (
                                    <StockCard key={stock._id} stock={stock} onUpdate={loadData} onDelete={handleDeleteStock} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cards' && (
                    <TradingCardCreator
                        stocks={stocks}
                        cards={cards}
                        onCreateCard={handleCreateCard}
                        onActivateCard={handleActivateCard}
                    />
                )}

                {activeTab === 'trades' && (
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">📈 All Trades ({trades.length})</h2>
                        {trades.length > 0 ? (
                            <div className="bg-slate-800 rounded-xl overflow-hidden">
                                <table className="w-full text-white">
                                    <thead className="bg-slate-900"><tr className="text-left text-slate-400"><th className="p-4">User</th><th className="p-4">Stock</th><th className="p-4">Type</th><th className="p-4">Quantity</th><th className="p-4">Total</th></tr></thead>
                                    <tbody>
                                        {trades.map(trade => (
                                            <tr key={trade._id} className="border-b border-slate-700">
                                                <td className="p-4">{trade.user?.username}</td>
                                                <td className="p-4 font-bold text-cyan-400">{trade.stock?.symbol}</td>
                                                <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs ${trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{trade.type.toUpperCase()}</span></td>
                                                <td className="p-4">{trade.quantity}</td>
                                                <td className="p-4 font-bold">${trade.totalAmount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="text-slate-400 text-center py-12">No trades yet</p>}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white mb-6">⚙️ Trading Settings</h2>

                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-slate-700 rounded-xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-6">🔄 Trading Controls</h3>
                            <p className="text-slate-400 mb-8">Enable or disable buying and selling for all users. When disabled, users will see an error message when trying to trade.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Buy Toggle */}
                                <div className="bg-slate-900 rounded-xl p-6 border-2 border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-bold text-white">🛒 Buy Trading</h4>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {tradingSettings.buyEnabled ? 'Users can buy stocks' : 'Buying is disabled'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleToggleBuy}
                                            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-300 ${tradingSettings.buyEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                        >
                                            <span
                                                className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${tradingSettings.buyEnabled ? 'translate-x-11' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    <div className={`mt-4 px-4 py-2 rounded-lg text-center font-bold text-lg ${tradingSettings.buyEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {tradingSettings.buyEnabled ? '✅ ENABLED' : '❌ DISABLED'}
                                    </div>
                                </div>

                                {/* Sell Toggle */}
                                <div className="bg-slate-900 rounded-xl p-6 border-2 border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-bold text-white">💰 Sell Trading</h4>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {tradingSettings.sellEnabled ? 'Users can sell stocks' : 'Selling is disabled'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleToggleSell}
                                            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-300 ${tradingSettings.sellEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                        >
                                            <span
                                                className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${tradingSettings.sellEnabled ? 'translate-x-11' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    <div className={`mt-4 px-4 py-2 rounded-lg text-center font-bold text-lg ${tradingSettings.sellEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {tradingSettings.sellEnabled ? '✅ ENABLED' : '❌ DISABLED'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-2 border-amber-600 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">⚡ Quick Actions</h3>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={async () => {
                                        await apiPost('/api/admin/settings/trading/buy', { enabled: true })
                                        await apiPost('/api/admin/settings/trading/sell', { enabled: true })
                                        setTradingSettings({ buyEnabled: true, sellEnabled: true })
                                    }}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-colors"
                                >
                                    ✅ Enable All Trading
                                </button>
                                <button
                                    onClick={async () => {
                                        await apiPost('/api/admin/settings/trading/buy', { enabled: false })
                                        await apiPost('/api/admin/settings/trading/sell', { enabled: false })
                                        setTradingSettings({ buyEnabled: false, sellEnabled: false })
                                    }}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold transition-colors"
                                >
                                    ❌ Disable All Trading
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-slate-900 rounded-xl p-8 text-center"><div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-indigo-500"></div><p className="text-white mt-4">Loading...</p></div></div>}
            </div>
        </div>
    )
}