// Cleanup script to remove orphaned portfolio entries
// Run this once: node server/cleanup-portfolio.js

import { connectDB, Portfolio, Stock } from './data/store.js'

async function cleanup() {
    await connectDB()
    console.log('🔧 Starting portfolio cleanup...')

    // Find all portfolio entries
    const allPortfolio = await Portfolio.find({})
    console.log(`📦 Total portfolio entries: ${allPortfolio.length}`)

    let deletedCount = 0

    for (const entry of allPortfolio) {
        // Check if the stock exists
        const stock = await Stock.findById(entry.stock)
        if (!stock) {
            console.log(`🗑️ Deleting orphaned entry: User ${entry.user}, Stock ID ${entry.stock}`)
            await Portfolio.deleteOne({ _id: entry._id })
            deletedCount++
        }
    }

    console.log(`✅ Cleanup complete. Deleted ${deletedCount} orphaned entries.`)

    // Show remaining portfolio
    const remaining = await Portfolio.find({}).populate('stock', 'symbol name')
    console.log(`📊 Remaining portfolio entries: ${remaining.length}`)
    remaining.forEach(p => {
        console.log(`   - User: ${p.user}, Stock: ${p.stock?.symbol || 'UNKNOWN'}, Qty: ${p.quantity}`)
    })

    process.exit(0)
}

cleanup().catch(err => {
    console.error('Error:', err)
    process.exit(1)
})
