import pc from 'picocolors'
import { clearToken, isAuthenticated } from '../config.js'

interface LogoutOptions {
  global?: boolean
}

export async function logout(options: LogoutOptions = {}) {
  if (!isAuthenticated()) {
    console.log(pc.yellow('Not currently logged in.'))
    return
  }

  clearToken({ global: options.global })

  if (options.global) {
    console.log(pc.green('Logged out globally (cleared ~/.specra/ credentials).'))
  } else {
    console.log(pc.green('Logged out (cleared local project credentials).'))
  }
}
