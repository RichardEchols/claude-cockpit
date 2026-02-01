import { NextResponse } from 'next/server'
import { access } from 'fs/promises'
import { isAuthenticated } from '@/lib/auth'
import { PROJECTS } from '@/lib/constants'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const verified = await Promise.all(
    PROJECTS.map(async (project) => {
      try {
        await access(project.path)
        return { ...project, exists: true }
      } catch {
        return { ...project, exists: false }
      }
    })
  )

  return NextResponse.json(verified)
}
