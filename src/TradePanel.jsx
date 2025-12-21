import React, { useState } from 'react'

function timeNow() {
  return new Date().toLocaleTimeString()
}

export default function TradePanel({ user }) {
  const [activities, setActivities] = useState([])
  const [trade, setTrade] = useState({ side: 'Buy', asset: '', qty: '', price: '' })
  const [listing, setListing] = useState({ asset: '', price: '' })

  function addActivity(entry) {
    setActivities(prev => [entry, ...prev].slice(0, 20))
  }

  function handleTradeChange(e) {
    const { name, value } = e.target
    setTrade(prev => ({ ...prev, [name]: value }))
  }

  function handleListingChange(e) {
    const { name, value } = e.target
    setListing(prev => ({ ...prev, [name]: value }))
  }

  function submitTrade(e) {
    e.preventDefault()
    if (!trade.asset || !trade.qty) return
    const entry = {
      type: 'trade',
      side: trade.side,
      asset: trade.asset,
      qty: trade.qty,
      price: trade.price || 'market',
      time: timeNow(),
    }
    addActivity(entry)
    setTrade({ side: 'Buy', asset: '', qty: '', price: '' })
  }

  function submitListing(e) {
    e.preventDefault()
    if (!listing.asset || !listing.price) return
    const entry = {
      type: 'listing',
      asset: listing.asset,
      price: listing.price,
      time: timeNow(),
    }
    addActivity(entry)
    setListing({ asset: '', price: '' })
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Buy / Sell</h3>
          {user && (
            <div className="text-sm text-slate-300">{user.username} — <span className="text-slate-400">{user.team}</span></div>
          )}
        </div>
        <form onSubmit={submitTrade} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select name="side" value={trade.side} onChange={handleTradeChange} className="col-span-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-white">
            <option>Buy</option>
            <option>Sell</option>
          </select>
          <input name="asset" value={trade.asset} onChange={handleTradeChange} placeholder="Asset (e.g. BTC)" className="col-span-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-white" />
          <input name="qty" value={trade.qty} onChange={handleTradeChange} placeholder="Quantity" className="col-span-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-white" />
          <div className="col-span-1 flex gap-2">
            <input name="price" value={trade.price} onChange={handleTradeChange} placeholder="Price (optional)" className="flex-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-white" />
            <button type="submit" className="px-4 py-2 bg-green-600 rounded-md text-white">Send</button>
          </div>
        </form>
      </div>

      <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Create Listing</h3>
        <form onSubmit={submitListing} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input name="asset" value={listing.asset} onChange={handleListingChange} placeholder="Asset name" className="col-span-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-white" />
          <input name="price" value={listing.price} onChange={handleListingChange} placeholder="Price" className="col-span-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-white" />
          <div className="col-span-1">
            <button type="submit" className="w-full px-4 py-2 bg-indigo-600 rounded-md text-white">List</button>
          </div>
        </form>
      </div>

      <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-4 shadow-lg">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Activities</h4>
        <div className="space-y-2 max-h-56 overflow-auto">
          {activities.length === 0 && <div className="text-sm text-slate-400">No recent activity</div>}
          {activities.map((a, i) => (
            <div key={i} className="flex items-start justify-between bg-slate-800 rounded-md p-2">
              <div>
                <div className="text-sm text-slate-200">
                  {a.type === 'trade' ? `${a.side} ${a.qty} ${a.asset} @ ${a.price}` : `Listing ${a.asset} @ ${a.price}`}
                </div>
                <div className="text-xs text-slate-400 mt-1">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
