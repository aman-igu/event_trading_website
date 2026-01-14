import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export function authMiddleware(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                ok: false,
                error: 'Access denied. No token provided.'
            })
        }

        // Extract token
        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET)

        // Attach user info to request
        req.user = decoded

        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                ok: false,
                error: 'Token expired. Please login again.'
            })
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                ok: false,
                error: 'Invalid token.'
            })
        }
        return res.status(500).json({
            ok: false,
            error: 'Internal server error during authentication.'
        })
    }
}

// Optional middleware to check specific roles
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                ok: false,
                error: 'Authentication required.'
            })
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                ok: false,
                error: 'Insufficient permissions.'
            })
        }

        next()
    }
}
