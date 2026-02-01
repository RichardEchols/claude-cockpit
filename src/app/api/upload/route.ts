import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { isAuthenticated, validateProjectPath, sanitizeFilename } from '@/lib/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectPath = formData.get('projectPath') as string || '/Users/richardechols/Apps'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    if (!validateProjectPath(projectPath)) {
      return NextResponse.json({ error: 'Invalid project path' }, { status: 403 })
    }

    const safeName = sanitizeFilename(file.name)
    if (!safeName) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const uploadDir = join(projectPath, '.cockpit-uploads')
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = join(uploadDir, safeName)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      path: filePath,
      name: safeName,
      size: file.size,
      type: file.type,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
