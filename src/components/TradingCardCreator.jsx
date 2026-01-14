// Trading Card Creator Component
import React, { useState } from 'react'

export function TradingCardCreator({ stocks, onCreateCard, onActivateCard, cards }) {
    const [cardName, setCardName] = useState('')
    const [cardDescription, setCardDescription] = useState('')
    const [cardType, setCardType] = useState('custom')
    const [selectedModifiers, setSelectedModifiers] = useState({})

    function handleAddModifier(stockId, symbol) {
        setSelectedModifiers({
            ...selectedModifiers,
            [stockId]: { stock: stockId, stockSymbol: symbol, changeType: 'same', changePercent: 0 }
        })
    }

    function handleRemoveModifier(stockId) {
        const newModifiers = { ...selectedModifiers }
        delete newModifiers[stockId]
        setSelectedModifiers(newModifiers)
    }

    function handleUpdateModifier(stockId, field, value) {
        setSelectedModifiers({
            ...selectedModifiers,
            [stockId]: { ...selectedModifiers[stockId], [field]: value }
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (Object.keys(selectedModifiers).length === 0) {
            alert('❌ Please add at least one stock price modifier')
            return
        }

        const priceModifiers = Object.values(selectedModifiers)
        await onCreateCard({
            name: cardName,
            description: cardDescription,
            cardType,
            priceModifiers
        })

        // Reset form
        setCardName('')
        setCardDescription('')
        setCardType('custom')
        setSelectedModifiers({})
    }

    return (
        <div className="space-y-6">
            {/* Create Card Form */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-600 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-6">🎴 Create Trading Card</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            placeholder="Card Name (e.g., Bull Market Rally)"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="bg-slate-900 rounded-lg px-4 py-3 text-white"
                            required
                        />
                        <select
                            value={cardType}
                            onChange={(e) => setCardType(e.target.value)}
                            className="bg-slate-900 rounded-lg px-4 py-3 text-white"
                        >
                            <option value="custom">Custom</option>
                            <option value="bull">Bull Market (All Up)</option>
                            <option value="bear">Bear Market (All Down)</option>
                            <option value="mixed">Mixed Market</option>
                            <option value="neutral">Neutral (No Change)</option>
                        </select>
                    </div>

                    <textarea
                        placeholder="Card Description"
                        value={cardDescription}
                        onChange={(e) => setCardDescription(e.target.value)}
                        className="w-full bg-slate-900 rounded-lg px-4 py-3 text-white"
                        rows="2"
                    />

                    {/* Stock Selector */}
                    <div className="bg-slate-900/50 rounded-lg p-4">
                        <p className="text-white font-semibold mb-3">Select Stocks & Set Price Changes:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                            {stocks.map(stock => (
                                <button
                                    key={stock._id}
                                    type="button"
                                    onClick={() => selectedModifiers[stock._id] ? handleRemoveModifier(stock._id) : handleAddModifier(stock._id, stock.symbol)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedModifiers[stock._id]
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {stock.symbol} {selectedModifiers[stock._id] && '✓'}
                                </button>
                            ))}
                        </div>

                        {/* Price Modifiers for Selected Stocks */}
                        {Object.keys(selectedModifiers).length > 0 && (
                            <div className="space-y-3 mt-4">
                                <p className="text-slate-400 text-sm font-semibold">Configure Price Changes:</p>
                                {Object.entries(selectedModifiers).map(([stockId, modifier]) => {
                                    const stock = stocks.find(s => s._id === stockId)
                                    return (
                                        <div key={stockId} className="bg-slate-800 rounded-lg p-4 grid grid-cols-3 gap-3 items-center">
                                            <div>
                                                <p className="text-white font-bold">{stock?.symbol}</p>
                                                <p className="text-xs text-slate-400">₹{stock?.currentPrice.toFixed(2)}</p>
                                            </div>
                                            <select
                                                value={modifier.changeType}
                                                onChange={(e) => handleUpdateModifier(stockId, 'changeType', e.target.value)}
                                                className="bg-slate-900 rounded-lg px-3 py-2 text-white text-sm"
                                            >
                                                <option value="increase">📈 Increase</option>
                                                <option value="decrease">📉 Decrease</option>
                                                <option value="same">➡️ Same</option>
                                            </select>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder="% (e.g., 10)"
                                                value={modifier.changePercent}
                                                onChange={(e) => handleUpdateModifier(stockId, 'changePercent', parseFloat(e.target.value) || 0)}
                                                className="bg-slate-900 rounded-lg px-3 py-2 text-white text-sm"
                                                disabled={modifier.changeType === 'same'}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 rounded-lg px-6 py-4 text-white font-bold text-lg">
                        🎴 Create Card
                    </button>
                </form>
            </div>

            {/* Cards List */}
            <div>
                <h3 className="text-2xl font-bold text-white mb-4">📚 All Trading Cards ({cards.length})</h3>
                {cards.length === 0 ? (
                    <div className="bg-slate-800 rounded-xl p-12 text-center">
                        <p className="text-slate-400 text-xl">No trading cards yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cards.map(card => (
                            <TradingCardDisplay key={card._id} card={card} onActivate={onActivateCard} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function TradingCardDisplay({ card, onActivate }) {
    const cardTypeColors = {
        bull: 'from-green-900/50 to-emerald-900/50 border-green-600',
        bear: 'from-red-900/50 to-rose-900/50 border-red-600',
        neutral: 'from-slate-800 to-slate-900 border-slate-600',
        mixed: 'from-orange-900/50 to-yellow-900/50 border-orange-600',
        custom: 'from-purple-900/50 to-indigo-900/50 border-purple-600'
    }

    const cardTypeIcons = {
        bull: '📈',
        bear: '📉',
        neutral: '➡️',
        mixed: '🎲',
        custom: '🎴'
    }

    return (
        <div className={`bg-gradient-to-br ${cardTypeColors[card.cardType]} border-2 rounded-xl p-6 ${card.isActive ? 'opacity-60' : ''}`}>
            {/* Card Header */}
            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-bold text-white">{cardTypeIcons[card.cardType]} {card.name}</h4>
                    {card.isActive && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ Activated</span>}
                </div>
                {card.description && <p className="text-sm text-slate-300">{card.description}</p>}
            </div>

            {/* Price Modifiers */}
            <div className="space-y-2 mb-4">
                <p className="text-xs text-slate-400 font-semibold">Price Changes:</p>
                {card.priceModifiers.map((pm, idx) => (
                    <div key={idx} className="bg-slate-900/50 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-white font-semibold">{pm.stockSymbol}</span>
                        <div className="flex items-center gap-2">
                            {pm.changeType === 'increase' && (
                                <span className="text-green-400 text-sm font-bold">📈 +{pm.changePercent}%</span>
                            )}
                            {pm.changeType === 'decrease' && (
                                <span className="text-red-400 text-sm font-bold">📉 -{pm.changePercent}%</span>
                            )}
                            {pm.changeType === 'same' && (
                                <span className="text-slate-400 text-sm font-bold">➡️ No Change</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Activate Button */}
            {!card.isActive && (
                <button
                    onClick={() => onActivate(card._id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all"
                >
                    ⚡ Activate Card
                </button>
            )}

            {card.isActive && card.activatedAt && (
                <p className="text-xs text-slate-400 text-center">
                    Activated on {new Date(card.activatedAt).toLocaleString()}
                </p>
            )}
        </div>
    )
}
