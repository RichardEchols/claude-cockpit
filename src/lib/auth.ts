import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { PROJECTS } from './constants'

const TOKEN_COOKIE = 'cockpit-token'
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

// Stored in memory on the server (resets on restart)
const validTokens = new Map<string, number>()

export function createAuthToken(pin: string): string | null {
  const correctPin = process.env.COCKPIT_PIN || '0000'
  if (pin !== correctPin) return null

  const token = generateToken()
  validTokens.set(token, Date.now() + TOKEN_EXPIRY_MS)
  return token
}

export function validateToken(token: string | undefined | null): boolean {
  if (!token) return false
  const expiry = validTokens.get(token)
  if (!expiry) return false
  if (Date.now() > expiry) {
    validTokens.delete(token)
    return false
  }
  return true
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_COOKIE)?.value || null
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken()
  return validateToken(token)
}

export function validateProjectPath(path: string): boolean {
  return PROJECTS.some(p => path === p.path || path.startsWith(p.path + '/'))
}

export function sanitizeFilename(filename: string): string {
  // Remove path traversal characters and only keep safe characters
  return filename
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
}

