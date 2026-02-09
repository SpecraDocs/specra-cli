import pc from 'picocolors'
import { clearConfig, isAuthenticated } from '../config.js'

export async function logout() {
  if (!isAuthenticated()) {
    console.log(pc.yellow('Not currently logged in.'))
    return
  }

  clearConfig()
  console.log(pc.green('Logged out successfully.'))
}
