import { NextRequest } from 'next/server'
import { isAuthenticated, validateProjectPath, sanitizeFilename } from '@/lib/auth'
import { SYSTEM_PROMPT_APPEND } from '@/lib/constants'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  // Server-side auth check
  if (!(await isAuthenticated())) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const formData = await request.formData()
    const message = formData.get('message')
    const projectPath = formData.get('projectPath') as string || `${process.env.HOME || '/Users/richardecholsai'}/Apps`
    const sessionId = formData.get('sessionId') as string | null

    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate project path against allowed list
    if (!validateProjectPath(projectPath)) {
      return new Response(JSON.stringify({ error: 'Invalid project path' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Handle file uploads with validation
    const files = formData.getAll('files') as File[]
    const uploadedPaths: string[] = []

    if (files.length > 0) {
      const fs = await import('fs/promises')
      const path = await import('path')
      const uploadDir = path.join(projectPath, '.cockpit-uploads')
      await fs.mkdir(uploadDir, { recursive: true })

      for (const file of files) {
        if (file.size > 0 && file.size <= MAX_FILE_SIZE) {
          const safeName = sanitizeFilename(file.name)
          if (!safeName) continue
          const buffer = Buffer.from(await file.arrayBuffer())
          const filePath = path.join(uploadDir, safeName)
          await fs.writeFile(filePath, buffer)
          uploadedPaths.push(filePath)
        }
      }
    }

    let fullPrompt = message.trim()
    if (uploadedPaths.length > 0) {
      fullPrompt += '\n\nFiles uploaded to review:\n' + uploadedPaths.map(p => `- ${p}`).join('\n')
    }

    const { query } = await import('@anthropic-ai/claude-code')

    const abortController = new AbortController()

    // Abort SDK query if client disconnects
    request.signal.addEventListener('abort', () => {
      abortController.abort()
    })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let closed = false

        function send(data: unknown) {
          if (closed) return
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          } catch {
            closed = true
          }
        }

        try {
          const result = query({
            prompt: fullPrompt,
            options: {
              cwd: projectPath,
              permissionMode: 'bypassPermissions',
              includePartialMessages: true,
              abortController,
              systemPrompt: {
                type: 'preset',
                preset: 'claude_code',
                append: SYSTEM_PROMPT_APPEND,
              },
              ...(sessionId ? { resume: sessionId } : {}),
            } as Parameters<typeof query>[0]['options'],
          })

          for await (const event of result) {
            if (closed || abortController.signal.aborted) break
            send(event)
          }

          if (!closed) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          }
        } catch (err) {
          if (!closed && !abortController.signal.aborted) {
            send({ type: 'error', message: (err as Error).message })
          }
        } finally {
          if (!closed) {
            try { controller.close() } catch { /* already closed */ }
          }
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
