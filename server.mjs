import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { WebSocketServer } from 'ws'

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3333', 10)
const MAX_WS_CONNECTIONS = 5

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

function parseCookies(cookieHeader) {
  const cookies = {}
  if (!cookieHeader) return cookies
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    cookies[name] = rest.join('=')
  })
  return cookies
}

// Lazy-load the auth validation (avoids importing TS at startup)
let validateTokenFn = null
async function getValidator() {
  if (!validateTokenFn) {
    // The auth module stores tokens in memory, we need to share that state
    // Since Next.js API routes and this server run in the same process,
    // the in-memory token store is shared
    try {
      const auth = await import('./src/lib/auth.ts')
      validateTokenFn = auth.validateToken
    } catch {
      // Fallback: accept all connections in dev mode if auth module can't load
      validateTokenFn = () => dev
    }
  }
  return validateTokenFn
}

async function main() {
  await app.prepare()

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Request error:', err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  const wss = new WebSocketServer({ noServer: true })
  let activeConnections = 0

  server.on('upgrade', async (request, socket, head) => {
    const { pathname } = parse(request.url, true)

    if (pathname !== '/ws/terminal') {
      socket.destroy()
      return
    }

    // Connection limit
    if (activeConnections >= MAX_WS_CONNECTIONS) {
      socket.write('HTTP/1.1 429 Too Many Connections\r\n\r\n')
      socket.destroy()
      return
    }

    // Auth check via cookie
    const cookies = parseCookies(request.headers.cookie)
    const token = cookies['cockpit-token']
    const validate = await getValidator()

    if (!validate(token)) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  })

  wss.on('connection', async (ws) => {
    activeConnections++
    let ptyProcess = null
    let projectPath = '/Users/richardechols/Apps'

    // Ping/pong for connection health
    const pingInterval = setInterval(() => {
      if (ws.readyState === 1) ws.ping()
    }, 30000)

    ws.on('pong', () => { /* connection alive */ })

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString())

        if (msg.type === 'init') {
          projectPath = msg.projectPath || projectPath

          const ptyModule = await import('node-pty')
          const pty = ptyModule.default || ptyModule

          ptyProcess = pty.spawn('/Users/richardechols/.local/bin/claude', ['--dangerously-skip-permissions'], {
            name: 'xterm-256color',
            cols: msg.cols || 80,
            rows: msg.rows || 24,
            cwd: projectPath,
            env: {
              ...process.env,
              TERM: 'xterm-256color',
              COLORTERM: 'truecolor',
              PATH: process.env.PATH + ':/Users/richardechols/.local/bin:/opt/homebrew/bin:/usr/local/bin',
            },
          })

          ptyProcess.onData((data) => {
            if (ws.readyState === 1) {
              ws.send(JSON.stringify({ type: 'output', data }))
            }
          })

          ptyProcess.onExit(({ exitCode }) => {
            if (ws.readyState === 1) {
              ws.send(JSON.stringify({ type: 'exit', code: exitCode }))
            }
          })

          ws.send(JSON.stringify({ type: 'ready' }))
        }

        if (msg.type === 'input' && ptyProcess) {
          ptyProcess.write(msg.data)
        }

        if (msg.type === 'resize' && ptyProcess) {
          ptyProcess.resize(msg.cols, msg.rows)
        }
      } catch (err) {
        console.error('WebSocket message error:', err)
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({ type: 'error', message: String(err.message || err) }))
        }
      }
    })

    ws.on('close', () => {
      activeConnections--
      clearInterval(pingInterval)
      if (ptyProcess) {
        try { ptyProcess.kill() } catch { /* ignore */ }
        ptyProcess = null
      }
    })

    ws.on('error', () => {
      activeConnections--
      clearInterval(pingInterval)
      if (ptyProcess) {
        try { ptyProcess.kill() } catch { /* ignore */ }
        ptyProcess = null
      }
    })
  })

  server.listen(port, hostname, () => {
    console.log(`\n  Claude Cockpit running at http://${hostname}:${port}`)
    console.log(`  Terminal WebSocket at ws://${hostname}:${port}/ws/terminal`)
    console.log(`  PIN: ${process.env.COCKPIT_PIN || '0000'}`)
    console.log(`  Press Ctrl+C to stop\n`)
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
