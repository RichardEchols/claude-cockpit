import { NextRequest, NextResponse } from 'next/server'
import { createAuthToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 })
    }

    const token = createAuthToken(pin)
    if (!token) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('cockpit-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
