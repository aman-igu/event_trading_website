import { User, Activity, nowISO } from '../data/store.js'

export function validateRegisterBody(body) {
  const errors = []
  if (!body) errors.push('missing body')
  else {
    if (!body.username || String(body.username).trim() === '') errors.push('username is required')
    if (!body.team || String(body.team).trim() === '') errors.push('team is required')
  }
  return errors
}

export async function register(req, res) {
  try {
    const errors = validateRegisterBody(req.body)
    if (errors.length) return res.status(400).json({ ok: false, errors })

    const { username, team } = req.body
    const user = await User.create({ username: String(username).trim(), team: String(team).trim() })
    await Activity.create({ type: 'register', user: user._id, time: nowISO() })

    return res.status(201).json({ ok: true, user })
  } catch (err) {
    console.error('register error:', err)
    return res.status(500).json({ ok: false, error: 'internal_server_error' })
  }
}
