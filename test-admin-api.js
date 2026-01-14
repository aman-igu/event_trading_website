// Test if admin APIs are working
const apiUrl = 'https://event-trading-website-1.onrender.com'

// First login to get token
async function testAdminAPIs() {
    try {
        console.log('🔐 Step 1: Logging in as admin...')

        const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'admin123'
            })
        })

        const loginData = await loginRes.json()

        if (!loginData.ok) {
            console.log('❌ Login failed:', loginData.error)
            return
        }

        console.log('✅ Login successful!')
        const token = loginData.token
        console.log('🎫 Token:', token.substring(0, 20) + '...')

        // Test Teams API
        console.log('\n👥 Step 2: Testing Teams API...')
        const teamsRes = await fetch(`${apiUrl}/api/admin/teams`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const teamsData = await teamsRes.json()
        console.log('Teams Response:', JSON.stringify(teamsData, null, 2))

        // Test Stocks API
        console.log('\n💹 Step 3: Testing Stocks API...')
        const stocksRes = await fetch(`${apiUrl}/api/admin/stocks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const stocksData = await stocksRes.json()
        console.log('Stocks Response:', JSON.stringify(stocksData, null, 2))

        // Test Dashboard API
        console.log('\n📊 Step 4: Testing Dashboard API...')
        const dashRes = await fetch(`${apiUrl}/api/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const dashData = await dashRes.json()
        console.log('Dashboard Response:', JSON.stringify(dashData, null, 2))

    } catch (err) {
        console.error('❌ Error:', err.message)
    }
}

testAdminAPIs()
