import { User, Stock, Trade, Portfolio, TradingCard } from '../data/store.js'

// Get all teams with members and balances
export async function getAllTeams(req, res) {
    try {
        // Aggregate users by team
        const teams = await User.aggregate([
            {
                $group: {
                    _id: '$team',
                    members: {
                        $push: {
                            id: '$_id',
                            username: '$username',
                            email: '$email',
                            role: '$role',
                            balance: '$balance',
                            createdAt: '$createdAt'
                        }
                    },
                    totalBalance: { $sum: '$balance' },
                    memberCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    teamName: '$_id',
                    members: 1,
                    totalBalance: 1,
                    memberCount: 1
                }
            },
            { $sort: { totalBalance: -1 } }
        ])

        return res.status(200).json({
            ok: true,
            teams,
            totalTeams: teams.length
        })
    } catch (err) {
        console.error('getAllTeams error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Get all users
export async function getAllUsers(req, res) {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 })

        return res.status(200).json({
            ok: true,
            users,
            totalUsers: users.length
        })
    } catch (err) {
        console.error('getAllUsers error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Create new stock (admin only)
export async function createStock(req, res) {
    try {
        const { symbol, name, description, currentPrice, category } = req.body

        // Validation
        if (!symbol || !name || !currentPrice) {
            return res.status(400).json({
                ok: false,
                error: 'symbol, name, and currentPrice are required'
            })
        }

        if (currentPrice <= 0) {
            return res.status(400).json({
                ok: false,
                error: 'currentPrice must be greater than 0'
            })
        }

        // Check if stock already exists
        const existingStock = await Stock.findOne({ symbol: symbol.toUpperCase() })
        if (existingStock) {
            return res.status(409).json({
                ok: false,
                error: 'Stock with this symbol already exists'
            })
        }

        // Create stock
        const stock = await Stock.create({
            symbol: symbol.toUpperCase(),
            name,
            description: description || '',
            currentPrice,
            initialPrice: currentPrice,
            category: category || 'general',
            createdBy: req.user.userId
        })

        return res.status(201).json({
            ok: true,
            message: 'Stock created successfully',
            stock
        })
    } catch (err) {
        console.error('createStock error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Get all stocks
export async function getAllStocks(req, res) {
    try {
        const stocks = await Stock.find().populate('createdBy', 'username email').sort({ createdAt: -1 })

        return res.status(200).json({
            ok: true,
            stocks,
            totalStocks: stocks.length
        })
    } catch (err) {
        console.error('getAllStocks error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Update stock price
export async function updateStockPrice(req, res) {
    try {
        const { stockId } = req.params
        const { currentPrice } = req.body

        if (!currentPrice || currentPrice <= 0) {
            return res.status(400).json({
                ok: false,
                error: 'Valid currentPrice is required'
            })
        }

        const stock = await Stock.findByIdAndUpdate(
            stockId,
            { currentPrice },
            { new: true }
        )

        if (!stock) {
            return res.status(404).json({ ok: false, error: 'Stock not found' })
        }

        return res.status(200).json({
            ok: true,
            message: 'Stock price updated',
            stock
        })
    } catch (err) {
        console.error('updateStockPrice error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Delete stock
export async function deleteStock(req, res) {
    try {
        const { stockId } = req.params

        const stock = await Stock.findByIdAndDelete(stockId)

        if (!stock) {
            return res.status(404).json({ ok: false, error: 'Stock not found' })
        }

        return res.status(200).json({
            ok: true,
            message: 'Stock deleted successfully'
        })
    } catch (err) {
        console.error('deleteStock error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Get all trades
export async function getAllTrades(req, res) {
    try {
        const trades = await Trade.find()
            .populate('user', 'username email team')
            .populate('stock', 'symbol name')
            .sort({ createdAt: -1 })
            .limit(100) // Limit to recent 100 trades

        return res.status(200).json({
            ok: true,
            trades,
            totalTrades: trades.length
        })
    } catch (err) {
        console.error('getAllTrades error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Get dashboard statistics
export async function getDashboardStats(req, res) {
    try {
        const [
            totalUsers,
            totalStocks,
            totalTrades,
            teams,
            recentTrades
        ] = await Promise.all([
            User.countDocuments(),
            Stock.countDocuments(),
            Trade.countDocuments(),
            User.aggregate([
                {
                    $group: {
                        _id: '$team',
                        count: { $sum: 1 },
                        totalBalance: { $sum: '$balance' }
                    }
                }
            ]),
            Trade.find()
                .populate('user', 'username team')
                .populate('stock', 'symbol name')
                .sort({ createdAt: -1 })
                .limit(10)
        ])

        return res.status(200).json({
            ok: true,
            stats: {
                totalUsers,
                totalStocks,
                totalTrades,
                totalTeams: teams.length,
                teams,
                recentTrades
            }
        })
    } catch (err) {
        console.error('getDashboardStats error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Update user balance (admin only)
export async function updateUserBalance(req, res) {
    try {
        const { userId } = req.params
        const { balance } = req.body

        if (balance === undefined || balance < 0) {
            return res.status(400).json({
                ok: false,
                error: 'Valid balance is required'
            })
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { balance },
            { new: true }
        ).select('-password')

        if (!user) {
            return res.status(404).json({ ok: false, error: 'User not found' })
        }

        return res.status(200).json({
            ok: true,
            message: 'User balance updated',
            user
        })
    } catch (err) {
        console.error('updateUserBalance error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Create a new team (admin only)
export async function createTeam(req, res) {
    try {
        const { teamName, initialBudget } = req.body

        if (!teamName || !teamName.trim()) {
            return res.status(400).json({
                ok: false,
                error: 'Team name is required'
            })
        }

        // Check if team name already exists
        const existingTeam = await User.findOne({ team: teamName.trim() })
        if (existingTeam) {
            return res.status(409).json({
                ok: false,
                error: 'Team with this name already exists'
            })
        }

        return res.status(201).json({
            ok: true,
            message: 'Team created successfully. Add members to the team to activate it.',
            teamName: teamName.trim(),
            initialBudget: initialBudget || 0
        })
    } catch (err) {
        console.error('createTeam error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Add member to team (admin only)
export async function addMemberToTeam(req, res) {
    try {
        const { userId, teamName } = req.body

        if (!userId || !teamName) {
            return res.status(400).json({
                ok: false,
                error: 'userId and teamName are required'
            })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ ok: false, error: 'User not found' })
        }

        // Update user's team
        user.team = teamName.trim()
        await user.save()

        return res.status(200).json({
            ok: true,
            message: `${user.username} added to team ${teamName}`,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                team: user.team,
                balance: user.balance
            }
        })
    } catch (err) {
        console.error('addMemberToTeam error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Allocate money to team members (admin only)
export async function allocateTeamMoney(req, res) {
    try {
        const { teamName, totalAmount, distributionType } = req.body

        if (!teamName || totalAmount === undefined || totalAmount <= 0) {
            return res.status(400).json({
                ok: false,
                error: 'teamName and valid totalAmount are required'
            })
        }

        // Get all team members
        const teamMembers = await User.find({ team: teamName })

        if (teamMembers.length === 0) {
            return res.status(404).json({
                ok: false,
                error: 'No members found in this team'
            })
        }

        let updatedMembers = []

        if (distributionType === 'equal') {
            // Distribute equally among all members
            const amountPerMember = totalAmount / teamMembers.length

            for (const member of teamMembers) {
                member.balance = (member.balance || 0) + amountPerMember
                await member.save()
                updatedMembers.push({
                    id: member._id,
                    username: member.username,
                    balance: member.balance,
                    allocated: amountPerMember
                })
            }
        } else {
            // Default: set total balance for the whole team
            const amountPerMember = totalAmount / teamMembers.length

            for (const member of teamMembers) {
                member.balance = amountPerMember
                await member.save()
                updatedMembers.push({
                    id: member._id,
                    username: member.username,
                    balance: member.balance,
                    allocated: amountPerMember
                })
            }
        }

        return res.status(200).json({
            ok: true,
            message: `₹${totalAmount} allocated to team ${teamName}`,
            teamName,
            totalAmount,
            distributionType: distributionType || 'set',
            membersUpdated: updatedMembers.length,
            updatedMembers
        })
    } catch (err) {
        console.error('allocateTeamMoney error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// ============ TRADING CARD FUNCTIONS ============

// Create a trading card (admin only)
export async function createTradingCard(req, res) {
    try {
        const { name, description, cardType, priceModifiers } = req.body

        if (!name || !priceModifiers || !Array.isArray(priceModifiers)) {
            return res.status(400).json({
                ok: false,
                error: 'name and priceModifiers array are required'
            })
        }

        // Validate all stock IDs exist
        const stockIds = priceModifiers.map(pm => pm.stock)
        const stocks = await Stock.find({ _id: { $in: stockIds } })

        if (stocks.length !== stockIds.length) {
            return res.status(404).json({
                ok: false,
                error: 'One or more stocks not found'
            })
        }

        // Add stock symbols to modifiers
        const enrichedModifiers = priceModifiers.map(pm => {
            const stock = stocks.find(s => s._id.toString() === pm.stock)
            return {
                ...pm,
                stockSymbol: stock.symbol
            }
        })

        const card = await TradingCard.create({
            name,
            description: description || '',
            cardType: cardType || 'custom',
            priceModifiers: enrichedModifiers,
            createdBy: req.user.userId
        })

        return res.status(201).json({
            ok: true,
            message: 'Trading card created successfully',
            card
        })
    } catch (err) {
        console.error('createTradingCard error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Get all trading cards
export async function getAllTradingCards(req, res) {
    try {
        const cards = await TradingCard.find()
            .populate('priceModifiers.stock', 'symbol name currentPrice')
            .populate('createdBy', 'username')
            .populate('activatedBy', 'username')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            ok: true,
            cards,
            totalCards: cards.length
        })
    } catch (err) {
        console.error('getAllTradingCards error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Activate a trading card (applies price changes to stocks)
export async function activateTradingCard(req, res) {
    try {
        const { cardId } = req.params

        const card = await TradingCard.findById(cardId).populate('priceModifiers.stock')

        if (!card) {
            return res.status(404).json({ ok: false, error: 'Card not found' })
        }

        // Apply price changes to all stocks in the card
        const priceChanges = []

        for (const modifier of card.priceModifiers) {
            const stock = await Stock.findById(modifier.stock)

            if (!stock) continue

            const oldPrice = stock.currentPrice
            let newPrice = oldPrice

            if (modifier.changeType === 'increase') {
                newPrice = oldPrice * (1 + modifier.changePercent / 100)
            } else if (modifier.changeType === 'decrease') {
                newPrice = oldPrice * (1 - modifier.changePercent / 100)
            }
            // If 'same', newPrice stays as oldPrice

            // Update stock price
            stock.currentPrice = Math.max(0.01, newPrice) // Minimum price of 0.01
            await stock.save()

            priceChanges.push({
                symbol: stock.symbol,
                oldPrice: oldPrice.toFixed(2),
                newPrice: stock.currentPrice.toFixed(2),
                changeType: modifier.changeType,
                changePercent: modifier.changePercent
            })
        }

        // Mark card as activated
        card.isActive = true
        card.activatedAt = new Date()
        card.activatedBy = req.user.userId
        await card.save()

        return res.status(200).json({
            ok: true,
            message: 'Trading card activated! Stock prices updated.',
            cardName: card.name,
            priceChanges
        })
    } catch (err) {
        console.error('activateTradingCard error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Delete a trading card
export async function deleteTradingCard(req, res) {
    try {
        const { cardId } = req.params

        const card = await TradingCard.findByIdAndDelete(cardId)

        if (!card) {
            return res.status(404).json({ ok: false, error: 'Card not found' })
        }

        return res.status(200).json({
            ok: true,
            message: 'Trading card deleted successfully'
        })
    } catch (err) {
        console.error('deleteTradingCard error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

