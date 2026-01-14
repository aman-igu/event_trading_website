// API utility for making authenticated requests

const getApiBase = () => {
    const apiBaseRaw = import.meta.env.VITE_API_URL || ''
    let apiBase = apiBaseRaw.trim()
    if (apiBase && !/^https?:\/\//i.test(apiBase)) {
        apiBase = `http://${apiBase}`
    }
    return apiBase
}

export async function apiRequest(endpoint, options = {}) {
    const apiBase = getApiBase()
    const url = apiBase ? `${apiBase.replace(/\/$/, '')}${endpoint}` : endpoint

    console.log('🌐 API Request:', endpoint, 'URL:', url)

    // Get token from localStorage
    const token = localStorage.getItem('authToken')
    console.log('🎫 Token exists:', !!token)

    // Merge headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    // Add authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const config = {
        ...options,
        headers,
    }

    try {
        const response = await fetch(url, config)
        console.log('📡 Response status:', response.status)

        const data = await response.json().catch(() => ({}))
        console.log('📦 Response data:', data)

        if (!response.ok) {
            console.error('❌ API Error:', response.status, data)

            // Handle token expiration
            if (response.status === 401 && data.error?.includes('expired')) {
                localStorage.removeItem('authToken')
                localStorage.removeItem('user')
                window.location.reload()
            }

            throw new Error(data.error || data.errors?.join(', ') || 'Request failed')
        }

        console.log('✅ API Success:', endpoint)
        return { ok: true, data }
    } catch (error) {
        console.error('💥 API Exception:', error)
        return { ok: false, error: error.message }
    }
}

// Helper for GET requests
export async function apiGet(endpoint) {
    return apiRequest(endpoint, { method: 'GET' })
}

// Helper for POST requests
export async function apiPost(endpoint, body) {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

// Helper for PUT requests
export async function apiPut(endpoint, body) {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    })
}

// Helper for DELETE requests
export async function apiDelete(endpoint) {
    return apiRequest(endpoint, { method: 'DELETE' })
}
