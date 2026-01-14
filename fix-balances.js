import mongoose from 'mongoose'

const MONGO_URI = 'mongodb://127.0.0.1:27017/event-trading'

async function fixBalances() {
    try {
        await mongoose.connect(MONGO_URI)
        console.log('✅ Connected to MongoDB')

        const UserModel = mongoose.connection.collection('users')

        // Update all users without balance
        const result = await UserModel.updateMany(
            { $or: [{ balance: { $exists: false } }, { balance: null }] },
            { $set: { balance: 10000 } }
        )

        console.log(`✅ Updated ${result.modifiedCount} users`)

        // Show all users
        const users = await UserModel.find({}).toArray()
        console.log('\n📊 All Users:')
        users.forEach(u => {
            console.log(`  - ${u.username} (${u.email}): ₹${u.balance || 0}`)
        })

        await mongoose.disconnect()
    } catch (err) {
        console.error('❌ Error:', err)
    }
}

fixBalances()
