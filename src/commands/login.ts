import pc from 'picocolors'
import open from 'open'
import { createServer } from 'http'
import { saveToken, getGlobalConfig } from '../config.js'
import { randomBytes } from 'crypto'

interface LoginOptions {
  global?: boolean
}

export async function login(options: LoginOptions = {}) {
  console.log(pc.bold('Specra Login'))
  console.log()

  if (options.global) {
    console.log(pc.dim('Storing credentials globally in ~/.specra/'))
  } else {
    console.log(pc.dim('Storing credentials in local specra.config.json'))
  }
  console.log()

  const state = randomBytes(16).toString('hex')
  const port = 9876
  const apiUrl = getGlobalConfig().apiUrl

  return new Promise<void>((resolve) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url!, `http://localhost:${port}`)

      if (url.pathname === '/callback') {
        const token = url.searchParams.get('token')
        const returnedState = url.searchParams.get('state')

        if (returnedState !== state) {
          res.writeHead(400, { 'Content-Type': 'text/html' })
          res.end('<html><body><h1>State mismatch. Please try again.</h1></body></html>')
          server.close()
          resolve()
          return
        }

        if (token) {
          try {
            saveToken(token, { global: options.global })
            console.log(pc.green('Token saved.'))
          } catch (err) {
            if (!options.global) {
              console.log(pc.yellow(`Could not save to local config: ${err instanceof Error ? err.message : err}`))
              console.log(pc.yellow('Falling back to global ~/.specra/ config'))
              saveToken(token, { global: true })
              console.log(pc.green('Token saved globally.'))
            } else {
              throw err
            }
          }

          // Verify the token works
          try {
            const { apiRequest } = await import('../api-client.js')
            const user = await apiRequest<{ email: string }>('/api/auth/verify')
            console.log(pc.green(`Authenticated as ${user.email}`))
          } catch {
            // verification is optional
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
