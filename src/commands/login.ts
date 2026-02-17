import pc from 'picocolors'
import open from 'open'
import { createServer } from 'http'
import { getConfig, saveConfig } from '../config.js'
import { apiRequest } from '../api-client.js'
import { randomBytes } from 'crypto'

export async function login() {
  console.log(pc.bold('Specra Login'))
  console.log()

  const state = randomBytes(16).toString('hex')
  const port = 9876
  const { apiUrl } = getConfig()

  return new Promise<void>((resolve) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url!, `http://localhost:${port}`)

      // Backend redirects to root path with token as query param
      const token = url.searchParams.get('token')
      const returnedState = url.searchParams.get('state')

      if (token || returnedState) {
        if (returnedState !== state) {
          res.writeHead(400, { 'Content-Type': 'text/html' })
          res.end('<html><body><h1>State mismatch. Please try again.</h1></body></html>')
          server.close()
          resolve()
          return
        }

        if (token) {
          saveConfig({ token })

          // Verify the token works
          try {
            const user = await apiRequest<{ email: string }>('/api/auth/verify')
            console.log(pc.green(`Authenticated as ${user.email}`))
          } catch {
            console.log(pc.green('Token saved.'))
          }

          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(
            '<html><body><h1>Authenticated!</h1><p>You can close this window and return to the terminal.</p></body></html>'
          )
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' })
          res.end('<html><body><h1>Authentication failed.</h1></body></html>')
        }

        server.close()
        resolve()
      }
    })

    server.listen(port, () => {
      const loginUrl = `${apiUrl}/auth/cli?port=${port}&state=${state}`
      console.log(`Opening browser to authenticate...`)
      console.log(pc.dim(`If the browser doesn't open, visit: ${loginUrl}`))
      console.log()
      open(loginUrl)
    })

    // Timeout after 5 minutes
    setTimeout(() => {
      console.log(pc.yellow('Login timed out.'))
      server.close()
      resolve()
    }, 300000)
  })
}
