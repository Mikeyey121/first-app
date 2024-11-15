import jwt from 'jsonwebtoken'

interface DecodedToken {
  id: number
  email: string
  role: string
  first_name: string
}

export const verifyToken = (token: string): DecodedToken | null => {
  if (typeof token !== 'string') {
    console.error('Token must be a string, received:', typeof token)
    return null
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token.trim(), secret) as DecodedToken
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}
