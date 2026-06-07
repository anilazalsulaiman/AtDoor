 
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'atdoor_secret_key'

export const generateToken = (
  userId: number,
  rememberMe: boolean = false
): string => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '7d' }
  )
}

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET)
}