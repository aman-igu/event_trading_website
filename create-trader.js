// Create test trader
const apiUrl = 'http://localhost:4000'

async function createTrader() {
    try {
        const response = await fetch(`${apiUrl}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Trader1',
                email: 'trader1@test.com',
                password: 'trader123',
                team: 'Alpha Team'
                // No role specified = defaults to 'trader'
            })
        })

        const data = await response.json()

        if (data.ok) {
            console.log('✅ Trader user created!')
            console.log('📧 Email: trader1@test.com')
            console.log('🔑 Password: trader123')
            console.log('💰 Balance: ₹', data.user.balance ?? 0)
        } else {
            console.log('❌ Error:', data.error || data.errors)
        }
    } catch (err) {
        console.error('❌ Failed:', err.message)
    }
}

createTrader()
