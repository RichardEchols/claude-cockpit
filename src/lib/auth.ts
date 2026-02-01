import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { PROJECTS } from './constants'

const TOKEN_COOKIE = 'cockpit-token'
const SECRET = process.env.COCKPIT_SECRET || 'kiyomi-default-secret-change-me'

export function createAuthToken(pin: string): string | null {
  const correctPin = process.env.COCKPIT_PIN || '0000'
  if (pin !== correctPin) return null

  // Create HMAC-signed token: expiry.signature (no server state needed)
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  const signature = createHmac('sha256', SECRET).update(`${correctPin}:${expiry}`).digest('hex')
  return `${expiry}.${signature}`
}

export function validateToken(token: string | undefined | null): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [expiryStr, signature] = parts
  const expiry = parseInt(expiryStr, 10)
  if (isNaN(expiry) || Date.now() > expiry) return false

  // Verify signature matches
  const correctPin = process.env.COCKPIT_PIN || '0000'
  const expected = createHmac('sha256', SECRET).update(`${correctPin}:${expiry}`).digest('hex')
  return signature === expected
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
  const home = process.env.HOME || '/Users'
  // Allow any path under home directory, or any path in PROJECTS
  return path.startsWith(home) || path.startsWith('/tmp') || PROJECTS.some(p => path === p.path || path.startsWith(p.path + '/'))
}

export function sanitizeFilename(filename: string): string {
  // Remove path traversal characters and only keep safe characters
  return filename
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
}

