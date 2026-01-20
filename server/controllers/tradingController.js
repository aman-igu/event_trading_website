import { User, Stock, Trade, Portfolio, Settings } from '../data/store.js'

// Buy stock
export async function buyStock(req, res) {
    try {
        // Check if buying is enabled
        const buyEnabledSetting = await Settings.findOne({ key: 'buyEnabled' })
        if (buyEnabledSetting && buyEnabledSetting.value === false) {
            return res.status(403).json({
                ok: false,
                error: 'Buying is currently disabled by admin'
            })
        }

        const { stockId, quantity } = req.body

        // Validation
        if (!stockId || !quantity || quantity <= 0) {
            return res.status(400).json({
                ok: false,
                error: 'Valid stockId and quantity are required'
            })
        }

        // Get user
        const user = await User.findById(req.user.userId)
        if (!user) {
            return res.status(404).json({ ok: false, error: 'User not found' })
        }

        // Get stock
        const stock = await Stock.findById(stockId)
        if (!stock) {
            return res.status(404).json({ ok: false, error: 'Stock not found' })
        }

        if (!stock.available) {
            return res.status(400).json({ ok: false, error: 'Stock is not available for trading' })
        }

        // Calculate total cost
        const totalCost = stock.currentPrice * quantity

        // Check if user has enough balance
        if (user.balance < totalCost) {
            return res.status(400).json({
                ok: false,
                error: 'Insufficient balance',
                required: totalCost,
                available: user.balance
            })
        }

        // Deduct balance
        user.balance -= totalCost
        await user.save()

        // Create trade record
        const trade = await Trade.create({
            user: user._id,
            stock: stock._id,
            type: 'buy',
            quantity,
            pricePerUnit: stock.currentPrice,
            totalAmount: totalCost,
            team: user.team
        })

        // Update portfolio
        let portfolio = await Portfolio.findOne({ user: user._id, stock: stock._id })
        console.log('📦 Existing portfolio entry:', portfolio)

        if (portfolio) {
            // Update existing portfolio entry
            const totalQuantity = portfolio.quantity + quantity
            const totalValue = (portfolio.averagePrice * portfolio.quantity) + totalCost
            portfolio.quantity = totalQuantity
            portfolio.averagePrice = totalValue / totalQuantity
            await portfolio.save()
            console.log('📦 Updated portfolio:', portfolio)
        } else {
            // Create new portfolio entry
            portfolio = await Portfolio.create({
                user: user._id,
                stock: stock._id,
                quantity,
                averagePrice: stock.currentPrice,
                team: user.team
            })
            console.log('📦 Created new portfolio:', portfolio)
        }

        // Populate the trade
        const populatedTrade = await Trade.findById(trade._id)
            .populate('stock', 'symbol name currentPrice')

        return res.status(201).json({
            ok: true,
            message: 'Stock purchased successfully',
            trade: populatedTrade,
            newBalance: user.balance,
            portfolio: {
                quantity: portfolio.quantity,
                averagePrice: portfolio.averagePrice
            }
        })
    } catch (err) {
        console.error('buyStock error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Sell stock
export async function sellStock(req, res) {
    try {
        // Check if selling is enabled
        const sellEnabledSetting = await Settings.findOne({ key: 'sellEnabled' })
        if (sellEnabledSetting && sellEnabledSetting.value === false) {
            return res.status(403).json({
                ok: false,
                error: 'Selling is currently disabled by admin'
            })
        }

        const { stockId, quantity } = req.body

        // Validation
        if (!stockId || !quantity || quantity <= 0) {
            return res.status(400).json({
                ok: false,
                error: 'Valid stockId and quantity are required'
            })
        }

        // Get user
        const user = await User.findById(req.user.userId)
        if (!user) {
            return res.status(404).json({ ok: false, error: 'User not found' })
        }

        // Get stock
        const stock = await Stock.findById(stockId)
        if (!stock) {
            return res.status(404).json({ ok: false, error: 'Stock not found' })
        }

        // Check portfolio
        const portfolio = await Portfolio.findOne({ user: user._id, stock: stock._id })
        if (!portfolio || portfolio.quantity < quantity) {
            return res.status(400).json({
                ok: false,
                error: 'Insufficient stock quantity',
                available: portfolio ? portfolio.quantity : 0
            })
        }

        // Calculate total value
        const totalValue = stock.currentPrice * quantity

        // Add balance
        user.balance += totalValue
        await user.save()

        // Create trade record
        const trade = await Trade.create({
            user: user._id,
            stock: stock._id,
            type: 'sell',
            quantity,
            pricePerUnit: stock.currentPrice,
            totalAmount: totalValue,
            team: user.team
        })

        // Update portfolio
        portfolio.quantity -= quantity
        if (portfolio.quantity === 0) {
            await Portfolio.deleteOne({ _id: portfolio._id })
        } else {
            await portfolio.save()
        }

        // Populate the trade
        const populatedTrade = await Trade.findById(trade._id)
            .populate('stock', 'symbol name currentPrice')

        return res.status(200).json({
            ok: true,
            message: 'Stock sold successfully',
            trade: populatedTrade,
            newBalance: user.balance,
            remainingQuantity: portfolio.quantity
        })
    } catch (err) {
        console.error('sellStock error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Get user portfolio
export async function getPortfolio(req, res) {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.userId) {
            console.error('❌ getPortfolio: No user in request')
            return res.status(401).json({ ok: false, error: 'Not authenticated' })
        }

        console.log('📊 Getting portfolio for user:', req.user.userId)

        const rawPortfolio = await Portfolio.find({ user: req.user.userId })
        console.log('📊 Raw portfolio count (before populate):', rawPortfolio.length)

        // Populate stocks
        const populatedPortfolio = await Portfolio.find({ user: req.user.userId })
            .populate('stock', 'symbol name currentPrice')

        console.log('📊 Populated portfolio items:', populatedPortfolio.length)

        // Filter out items where stock population failed (stock might have been deleted)
        const validPortfolio = []
        for (const item of populatedPortfolio) {
            if (item.stock && item.stock.currentPrice !== undefined) {
                validPortfolio.push(item)
            } else {
                console.log('⚠️ Skipping portfolio item with missing/invalid stock:', item._id)
            }
        }

        console.log('📊 Valid portfolio items after filtering:', validPortfolio.length)

        // Calculate current values
        const enrichedPortfolio = validPortfolio.map(item => {
            const currentPrice = item.stock.currentPrice || 0
            const avgPrice = item.averagePrice || 0
            const qty = item.quantity || 0

            const currentValue = currentPrice * qty
            const investedValue = avgPrice * qty
            const profitLoss = currentValue - investedValue
            const profitLossPercent = investedValue > 0 ? ((profitLoss / investedValue) * 100).toFixed(2) : '0.00'

            return {
                stock: item.stock,
                quantity: qty,
                averagePrice: avgPrice,
                currentPrice: currentPrice,
                investedValue,
                currentValue,
                profitLoss,
                profitLossPercent
            }
        })

        // Calculate totals
        const totalInvested = enrichedPortfolio.reduce((sum, item) => sum + item.investedValue, 0)
        const totalCurrent = enrichedPortfolio.reduce((sum, item) => sum + item.currentValue, 0)
        const totalProfitLoss = totalCurrent - totalInvested

        console.log('📊 Returning portfolio with', enrichedPortfolio.length, 'items')

        return res.status(200).json({
            ok: true,
            portfolio: enrichedPortfolio,
            summary: {
                totalInvested,
                totalCurrent,
                totalProfitLoss,
                totalProfitLossPercent: totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) : 0
            }
        })
    } catch (err) {
        console.error('❌ getPortfolio error:', err.message)
        console.error('❌ Stack:', err.stack)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Get user trade history
export async function getTradeHistory(req, res) {
    try {
        const trades = await Trade.find({ user: req.user.userId })
            .populate('stock', 'symbol name')
            .sort({ createdAt: -1 })
            .limit(50)

        return res.status(200).json({
            ok: true,
            trades
        })
    } catch (err) {
        console.error('getTradeHistory error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Get trading settings (public for all authenticated users)
export async function getTradingSettings(req, res) {
    try {
        const buyEnabled = await Settings.findOne({ key: 'buyEnabled' })
        const sellEnabled = await Settings.findOne({ key: 'sellEnabled' })

        return res.status(200).json({
            ok: true,
            buyEnabled: buyEnabled ? buyEnabled.value : true,
            sellEnabled: sellEnabled ? sellEnabled.value : true
        })
    } catch (err) {
        console.error('getTradingSettings error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}
