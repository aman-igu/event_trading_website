// Test script to create admin user
// Run this with: node create-admin.js

const apiUrl = 'http://localhost:4000'

async function createAdmin() {
    try {
        const response = await fetch(`${apiUrl}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Admin',
                email: 'admin@test.com',
                password: 'admin123',
                team: 'Admin Team',
                role: 'admin'  // This will make the user an admin
            })
        })

        const data = await response.json()

        if (data.ok) {
            console.log('✅ Admin user created successfully!')
            console.log('📧 Email: admin@test.com')
            console.log('🔑 Password: admin123')
            console.log('🎯 Role:', data.user.role)
            console.log('\n📱 Now login with these credentials to see Admin Dashboard')
        } else {
            console.log('❌ Error:', data.error || data.errors)
        }
    } catch (err) {
        console.error('❌ Failed to create admin:', err.message)
        console.log('\n⚠️  Make sure the server is running on port 4000')
    }
}

createAdmin()
