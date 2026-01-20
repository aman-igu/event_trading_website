import React, { useState, useEffect } from 'react'
import { apiGet, apiPost } from './utils/api'

export default function TradePanel({ user, onLogout, onBalanceUpdate }) {
  const [stocks, setStocks] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [portfolioSummary, setPortfolioSummary] = useState(null)
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [userBalance, setUserBalance] = useState(user?.balance || 0)
  const [tradingSettings, setTradingSettings] = useState({ buyEnabled: true, sellEnabled: true })

  const [buyForm, setBuyForm] = useState({ stockId: '', quantity: '' })
  const [sellForm, setSellForm] = useState({ stockId: '', quantity: '' })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setUserBalance(user?.balance || 0)
  }, [user])

  async function loadData() {
    setLoading(true)
    try {
      const [stocksRes, portfolioRes, tradesRes, userRes, settingsRes] = await Promise.all([
        apiGet('/api/trading/stocks'),
        apiGet('/api/trading/portfolio'),
        apiGet('/api/trading/history'),
        apiGet('/api/auth/me'),
        apiGet('/api/trading/settings')
      ])
      console.log('📊 Portfolio API response:', portfolioRes)
      if (stocksRes.ok) setStocks(stocksRes.data.stocks || [])
      if (portfolioRes.ok) {
        console.log('📊 Portfolio data:', portfolioRes.data.portfolio)
        setPortfolio(portfolioRes.data.portfolio || [])
        setPortfolioSummary(portfolioRes.data.summary || null)
      } else {
        console.error('❌ Portfolio API error:', portfolioRes.error)
      }
      if (tradesRes.ok) setTrades(tradesRes.data.trades || [])
      if (userRes.ok && userRes.data.user) {
        setUserBalance(userRes.data.user.balance || 0)
        // Update localStorage with new balance
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            parsedUser.balance = userRes.data.user.balance
            localStorage.setItem('user', JSON.stringify(parsedUser))
          } catch (e) { }
        }
      }
      // Load trading settings
      if (settingsRes.ok && settingsRes.data) {
        setTradingSettings({
          buyEnabled: settingsRes.data.buyEnabled !== false,
          sellEnabled: settingsRes.data.sellEnabled !== false
        })
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  async function handleBuy(e) {
    e.preventDefault()
    const stock = stocks.find(s => s._id === buyForm.stockId)
    if (!stock) return alert('❌ Select a stock')

    const { ok, error, data } = await apiPost('/api/trading/buy', {
      stockId: buyForm.stockId,
      quantity: parseInt(buyForm.quantity)
    })

    if (ok) {
      alert(`✅ Bought ${buyForm.quantity} ${stock.symbol}!`)
      setBuyForm({ stockId: '', quantity: '' })
      // Update balance from response
      if (data?.newBalance !== undefined) {
        setUserBalance(data.newBalance)
        // Update localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            parsedUser.balance = data.newBalance
            localStorage.setItem('user', JSON.stringify(parsedUser))
          } catch (e) { }
        }
      }
      loadData()
    } else {
      alert('❌ ' + error)
    }
  }

  async function handleSell(e) {
    e.preventDefault()
    const portfolioItem = portfolio.find(p => p.stock._id === sellForm.stockId)
    if (!portfolioItem) return alert('❌ Select a stock')

    const qty = parseInt(sellForm.quantity)
    if (qty > portfolioItem.quantity) {
      return alert(`❌ You only have ${portfolioItem.quantity} shares of ${portfolioItem.stock.symbol}`)
    }

    const { ok, error, data } = await apiPost('/api/trading/sell', {
      stockId: sellForm.stockId,
      quantity: qty
    })

    if (ok) {
      const sellPrice = portfolioItem.currentPrice * qty
      alert(`✅ Sold ${sellForm.quantity} ${portfolioItem.stock.symbol} for ₹${sellPrice.toFixed(2)}!`)
      setSellForm({ stockId: '', quantity: '' })
      // Update balance from response
      if (data?.newBalance !== undefined) {
        setUserBalance(data.newBalance)
        // Update localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            parsedUser.balance = data.newBalance
            localStorage.setItem('user', JSON.stringify(parsedUser))
          } catch (e) { }
        }
      }
      loadData()
    } else {
      alert('❌ ' + error)
    }
  }

  // Get selected stock for sell preview
  const selectedSellItem = sellForm.stockId ? portfolio.find(p => p.stock._id === sellForm.stockId) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">💹 Trading Panel</h1>
              <p className="text-slate-400">Welcome, {user.username} ({user.team})</p>
              <p className="text-green-400 font-bold mt-1 text-xl">💰 Balance: ₹{userBalance.toFixed(2)}</p>
            </div>
            <button onClick={onLogout} className="px-6 py-2 bg-red-600 rounded-lg text-white">
              Logout
            </button>
          </div>
        </div>

        {/* Portfolio Summary Card */}
        {portfolioSummary && (
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">📈 Portfolio Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Total Invested</p>
                <p className="text-white text-xl font-bold">₹{portfolioSummary.totalInvested?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Current Value</p>
                <p className="text-cyan-400 text-xl font-bold">₹{portfolioSummary.totalCurrent?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Total Profit/Loss</p>
                <p className={`text-xl font-bold ${portfolioSummary.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioSummary.totalProfitLoss >= 0 ? '+' : ''}₹{portfolioSummary.totalProfitLoss?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Return %</p>
                <p className={`text-xl font-bold ${parseFloat(portfolioSummary.totalProfitLossPercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(portfolioSummary.totalProfitLossPercent) >= 0 ? '+' : ''}{portfolioSummary.totalProfitLossPercent || '0.00'}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Buy Form */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">🟢 Buy Stock</h2>
            <form onSubmit={handleBuy} className="space-y-4">
              <select
                value={buyForm.stockId}
                onChange={(e) => setBuyForm({ ...buyForm, stockId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                required
                disabled={!tradingSettings.buyEnabled}
              >
                <option value="">Select Stock</option>
                {stocks.map(stock => (
                  <option key={stock._id} value={stock._id}>
                    {stock.symbol} - {stock.name} (₹{stock.currentPrice.toFixed(2)})
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={buyForm.quantity}
                onChange={(e) => setBuyForm({ ...buyForm, quantity: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                min="1"
                required
                disabled={!tradingSettings.buyEnabled}
              />
              {buyForm.stockId && buyForm.quantity && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-400">Total Cost: <span className="text-yellow-400 font-bold">₹{(stocks.find(s => s._id === buyForm.stockId)?.currentPrice * buyForm.quantity).toFixed(2)}</span></p>
                  <p className="text-slate-500 text-sm mt-1">Balance after: ₹{(userBalance - (stocks.find(s => s._id === buyForm.stockId)?.currentPrice * buyForm.quantity)).toFixed(2)}</p>
                </div>
              )}
              <button
                type="submit"
                className={`w-full rounded-lg px-6 py-3 text-white font-bold ${!tradingSettings.buyEnabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                disabled={!tradingSettings.buyEnabled}
              >
                {tradingSettings.buyEnabled ? 'Buy' : 'Buy Disabled'}
              </button>
            </form>
          </div>

          {/* Sell Form */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">🔴 Sell Stock</h2>
            {portfolio.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No stocks to sell. Buy some first!</p>
            ) : (
              <form onSubmit={handleSell} className="space-y-4">
                <select
                  value={sellForm.stockId}
                  onChange={(e) => setSellForm({ ...sellForm, stockId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  required
                  disabled={!tradingSettings.sellEnabled}
                >
                  <option value="">Select Stock to Sell</option>
                  {portfolio.map(item => (
                    <option key={item.stock._id} value={item.stock._id}>
                      {item.stock.symbol} - Own: {item.quantity} | Current: ₹{item.currentPrice?.toFixed(2)}
                    </option>
                  ))}
                </select>

                {/* Show selected stock details */}
                {selectedSellItem && (
                  <div className="bg-slate-800/50 rounded-lg p-3 text-sm">
                    <p className="text-slate-400">You own: <span className="text-cyan-400 font-bold">{selectedSellItem.quantity} shares</span></p>
                    <p className="text-slate-400">Buy Avg: <span className="text-white">₹{selectedSellItem.averagePrice?.toFixed(2)}</span></p>
                    <p className="text-slate-400">Current Price: <span className="text-green-400 font-bold">₹{selectedSellItem.currentPrice?.toFixed(2)}</span></p>
                    <p className={`${selectedSellItem.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      P/L per share: ${((selectedSellItem.currentPrice - selectedSellItem.averagePrice)).toFixed(2)}
                    </p>
                  </div>
                )}

                <input
                  type="number"
                  placeholder="Quantity to Sell"
                  value={sellForm.quantity}
                  onChange={(e) => setSellForm({ ...sellForm, quantity: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  min="1"
                  max={selectedSellItem?.quantity || 1}
                  required
                  disabled={!tradingSettings.sellEnabled}
                />

                {sellForm.stockId && sellForm.quantity && selectedSellItem && (
                  <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-400 font-bold">
                      💵 You will receive: ${(selectedSellItem.currentPrice * parseInt(sellForm.quantity || 0)).toFixed(2)}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Balance after: ${(userBalance + (selectedSellItem.currentPrice * parseInt(sellForm.quantity || 0))).toFixed(2)}
                    </p>
                    <p className={`text-sm mt-1 ${(selectedSellItem.currentPrice - selectedSellItem.averagePrice) * parseInt(sellForm.quantity || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      Profit/Loss: ${((selectedSellItem.currentPrice - selectedSellItem.averagePrice) * parseInt(sellForm.quantity || 0)).toFixed(2)}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full rounded-lg px-6 py-3 text-white font-bold ${!tradingSettings.sellEnabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                  disabled={!tradingSettings.sellEnabled}
                >
                  {tradingSettings.sellEnabled ? 'Sell' : 'Sell Disabled'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Portfolio Holdings */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">📊 My Holdings</h2>
          {portfolio.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.map(item => {
                const profitLossPct = item.profitLossPercent || item.profitLossPercentage || 0
                return (
                  <div key={item.stock._id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white">{item.stock.symbol}</h3>
                        <p className="text-sm text-slate-400">{item.stock.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${parseFloat(profitLossPct) >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {parseFloat(profitLossPct) >= 0 ? '📈' : '📉'} {profitLossPct}%
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Quantity:</span>
                        <span className="text-cyan-400 font-bold">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Buy Price:</span>
                        <span className="text-white">${item.averagePrice?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Price:</span>
                        <span className="text-green-400 font-bold">${item.currentPrice?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Invested:</span>
                        <span className="text-white">${item.investedValue?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Value:</span>
                        <span className="text-cyan-400 font-bold">${item.currentValue?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                        <span className="text-slate-400">Profit/Loss:</span>
                        <span className={`font-bold ${item.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.profitLoss >= 0 ? '+' : ''}${item.profitLoss?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No holdings yet. Start buying stocks!</p>
          )}
        </div>

        {/* Trade History */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📜 Trade History</h2>
          {trades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="bg-slate-800">
                  <tr className="text-left text-slate-400">
                    <th className="p-3">Stock</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map(trade => (
                    <tr key={trade._id} className="border-b border-slate-700">
                      <td className="p-3 font-bold text-cyan-400">{trade.stock?.symbol}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs ${trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">{trade.quantity}</td>
                      <td className="p-3">${trade.pricePerUnit?.toFixed(2)}</td>
                      <td className="p-3 font-bold">${trade.totalAmount?.toFixed(2)}</td>
                      <td className="p-3 text-slate-400">{new Date(trade.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No trades yet</p>
          )}
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-indigo-500"></div>
              <p className="text-white mt-4">Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
