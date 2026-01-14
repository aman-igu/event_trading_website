import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, Activity, nowISO } from '../data/store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const JWT_EXPIRES_IN = '7d'

// Validation helpers
export function validateSignupBody(body) {
    const errors = []
    if (!body) {
        errors.push('missing body')
        return errors
    }

    if (!body.username || String(body.username).trim() === '') {
        errors.push('username is required')
    }
    if (!body.email || String(body.email).trim() === '') {
        errors.push('email is required')
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.email)) {
            errors.push('invalid email format')
        }
    }
    if (!body.password || String(body.password).trim() === '') {
        errors.push('password is required')
    } else if (body.password.length < 6) {
        errors.push('password must be at least 6 characters')
    }
    if (!body.team || String(body.team).trim() === '') {
        errors.push('team is required')
    }

    return errors
}

export function validateLoginBody(body) {
    const errors = []
    if (!body) {
        errors.push('missing body')
        return errors
    }

    if (!body.email || String(body.email).trim() === '') {
        errors.push('email is required')
    }
    if (!body.password || String(body.password).trim() === '') {
        errors.push('password is required')
    }

    return errors
}

// Signup handler
export async function signup(req, res) {
    try {
        const errors = validateSignupBody(req.body)
        if (errors.length) {
            return res.status(400).json({ ok: false, errors })
        }

        const { username, email, password, team, role } = req.body

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
        if (existingUser) {
            return res.status(409).json({ ok: false, error: 'User with this email already exists' })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create user
        const user = await User.create({
            username: String(username).trim(),
            email: String(email).toLowerCase().trim(),
            password: hashedPassword,
            team: String(team).trim(),
            role: role || 'trader'
        })

        // Log activity
        await Activity.create({
            type: 'signup',
            user: user._id,
            time: nowISO()
        })

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                team: user.team,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        )

        // Return user without password
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            team: user.team,
            role: user.role,
            balance: user.balance || 0,
            createdAt: user.createdAt
        }

        return res.status(201).json({
            ok: true,
            message: 'Signup successful',
            user: userResponse,
            token
        })
    } catch (err) {
        console.error('signup error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Login handler
export async function login(req, res) {
    try {
        const errors = validateLoginBody(req.body)
        if (errors.length) {
            return res.status(400).json({ ok: false, errors })
        }

        const { email, password } = req.body

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() })
        if (!user) {
            return res.status(401).json({ ok: false, error: 'Invalid email or password' })
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ ok: false, error: 'Invalid email or password' })
        }

        // Log activity
        await Activity.create({
            type: 'login',
            user: user._id,
            time: nowISO()
        })

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                team: user.team,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        )

        // Return user without password
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            team: user.team,
            role: user.role,
            balance: user.balance || 0,
            createdAt: user.createdAt
        }

        return res.status(200).json({
            ok: true,
            message: 'Login successful',
            user: userResponse,
            token
        })
    } catch (err) {
        console.error('login error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}

// Get current user (protected route)
export async function getMe(req, res) {
    try {
        // req.user is set by auth middleware
        const user = await User.findById(req.user.userId).select('-password')

        if (!user) {
            return res.status(404).json({ ok: false, error: 'User not found' })
        }

        return res.status(200).json({
            ok: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                team: user.team,
                role: user.role,
                balance: user.balance || 0,
                createdAt: user.createdAt
            }
        })
    } catch (err) {
        console.error('getMe error:', err)
        return res.status(500).json({ ok: false, error: 'internal_server_error' })
    }
}
