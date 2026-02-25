import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs'
import { join, resolve } from 'path'
import { homedir } from 'os'

// Global config: ~/.specra/config.json
const GLOBAL_CONFIG_DIR = join(homedir(), '.specra')
const GLOBAL_CONFIG_FILE = join(GLOBAL_CONFIG_DIR, 'config.json')

const DEFAULT_TOKEN_ENV = 'SPECRA_TOKEN'

interface GlobalConfig {
  apiUrl: string
  token?: string
  defaultProject?: string
}

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  apiUrl: 'https://specra-docs.com',
}

// --------------- .env file helpers ---------------

function getEnvFilePath(dir?: string): string {
  return join(resolve(dir || '.'), '.env')
}

function readEnvFile(dir?: string): Record<string, string> {
  const envPath = getEnvFilePath(dir)
  try {
    const content = readFileSync(envPath, 'utf-8')
    const env: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      env[key] = value
    }
    return env
  } catch {
    return {}
  }
}

function writeEnvVar(key: string, value: string, dir?: string) {
  const envPath = getEnvFilePath(dir)
  let content = ''
  try {
    content = readFileSync(envPath, 'utf-8')
  } catch {
    // file doesn't exist yet
  }

  const lines = content.split('\n')
  let found = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith(`${key}=`)) {
      lines[i] = `${key}=${value}`
      found = true
      break
    }
  }

  if (!found) {
    // Ensure trailing newline before appending
    if (lines.length > 0 && lines[lines.length - 1] !== '') {
      lines.push('')
    }
    lines.push(`${key}=${value}`)
  }

  writeFileSync(envPath, lines.join('\n') + '\n')
}

function removeEnvVar(key: string, dir?: string) {
  const envPath = getEnvFilePath(dir)
  try {
    const content = readFileSync(envPath, 'utf-8')
    const lines = content.split('\n').filter(line => !line.trim().startsWith(`${key}=`))
    writeFileSync(envPath, lines.join('\n'))
  } catch {
    // file doesn't exist, nothing to remove
  }
}

function ensureGitignore(dir?: string) {
  const gitignorePath = join(resolve(dir || '.'), '.gitignore')
  try {
    let content = ''
    try {
      content = readFileSync(gitignorePath, 'utf-8')
    } catch {
      // no .gitignore yet
    }
    if (!content.split('\n').some(line => line.trim() === '.env')) {
      const newline = content && !content.endsWith('\n') ? '\n' : ''
      writeFileSync(gitignorePath, content + newline + '.env\n')
    }
  } catch {
    // ignore
  }
}

// --------------- Global config ---------------

export function getGlobalConfig(): GlobalConfig {
  try {
    const raw = readFileSync(GLOBAL_CONFIG_FILE, 'utf-8')
    return { ...DEFAULT_GLOBAL_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_GLOBAL_CONFIG
  }
}

export function saveGlobalConfig(config: Partial<GlobalConfig>) {
  mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true })
  const current = getGlobalConfig()
  const merged = { ...current, ...config }
  writeFileSync(GLOBAL_CONFIG_FILE, JSON.stringify(merged, null, 2))
}

export function clearGlobalToken() {
  const config = getGlobalConfig()
  delete config.token
  mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true })
  writeFileSync(GLOBAL_CONFIG_FILE, JSON.stringify(config, null, 2))
}

// --------------- Local config (specra.config.json) ---------------

function getLocalConfigPath(dir?: string): string {
  return join(resolve(dir || '.'), 'specra.config.json')
}

function readLocalConfig(dir?: string): Record<string, any> | null {
  const configPath = getLocalConfigPath(dir)
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8'))
  } catch {
    return null
  }
}

export function getLocalToken(dir?: string): string | undefined {
  const config = readLocalConfig(dir)
  if (!config?.auth) return undefined

  // Env var reference: auth.tokenEnv → read from process.env, then .env file
  if (config.auth.tokenEnv) {
    const envName = config.auth.tokenEnv
    if (process.env[envName]) return process.env[envName]
    const envVars = readEnvFile(dir)
    return envVars[envName]
  }

  // Global reference: auth.source === "global" → read from ~/.specra/config.json
  if (config.auth.source === 'global') {
    return getGlobalConfig().token
  }

  // Legacy: direct auth.token (backwards compat for existing projects)
  return config.auth.token
}

export function saveLocalToken(token: string, dir?: string) {
  const configPath = getLocalConfigPath(dir)
  if (!existsSync(configPath)) {
    throw new Error(`specra.config.json not found in ${resolve(dir || '.')}. Are you in a Specra project?`)
  }

  // Save the actual token to .env
  writeEnvVar(DEFAULT_TOKEN_ENV, token, dir)

  // Point specra.config.json at the env var (never store raw token)
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))
  config.auth = { tokenEnv: DEFAULT_TOKEN_ENV }
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')

  // Make sure .env is gitignored
  ensureGitignore(dir)
}

export function clearLocalToken(dir?: string) {
  // Remove token from .env
  removeEnvVar(DEFAULT_TOKEN_ENV, dir)

  // Clean up auth section from specra.config.json
  const configPath = getLocalConfigPath(dir)
  if (!existsSync(configPath)) return
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    if (config.auth) {
      delete config.auth
    }
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
  } catch {
    // ignore parse errors
  }
}

// --------------- Unified accessors ---------------

/** Get token: checks local specra.config.json first, then global ~/.specra/config.json */
export function getToken(dir?: string): string | undefined {
  return getLocalToken(dir) || getGlobalConfig().token
}

/** Get the API URL from global config */
export function getConfig(): GlobalConfig {
  return getGlobalConfig()
}

export function isAuthenticated(dir?: string): boolean {
  return !!getToken(dir)
}

/** Save token to local .env (default) or global ~/.specra/config.json */
export function saveToken(token: string, options?: { global?: boolean; dir?: string }) {
  if (options?.global) {
    saveGlobalConfig({ token })
    // If specra.config.json exists locally, point it at global
    const configPath = getLocalConfigPath(options?.dir)
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf-8'))
        config.auth = { source: 'global' }
        writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
      } catch {
        // ignore
      }
    }
  } else {
    saveLocalToken(token, options?.dir)
  }
}

/** Clear token from local .env (default) or global config */
export function clearToken(options?: { global?: boolean; dir?: string }) {
  if (options?.global) {
    clearGlobalToken()
  } else {
    clearLocalToken(options?.dir)
  }
}

// Legacy exports for backwards compat
export function saveConfig(config: Partial<GlobalConfig>) {
  saveGlobalConfig(config)
}

export function clearConfig() {
  if (existsSync(GLOBAL_CONFIG_FILE)) {
    unlinkSync(GLOBAL_CONFIG_FILE)
  }
}
