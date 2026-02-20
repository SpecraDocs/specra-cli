import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs'
import { join, resolve } from 'path'
import { homedir } from 'os'

// Global config: ~/.specra/config.json
const GLOBAL_CONFIG_DIR = join(homedir(), '.specra')
const GLOBAL_CONFIG_FILE = join(GLOBAL_CONFIG_DIR, 'config.json')

interface GlobalConfig {
  apiUrl: string
  token?: string
  defaultProject?: string
}

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  apiUrl: 'https://specra-docs.com',
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
  return config?.auth?.token
}

export function saveLocalToken(token: string, dir?: string) {
  const configPath = getLocalConfigPath(dir)
  if (!existsSync(configPath)) {
    throw new Error(`specra.config.json not found in ${resolve(dir || '.')}. Are you in a Specra project?`)
  }
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))
  config.auth = { ...config.auth, token }
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
}

export function clearLocalToken(dir?: string) {
  const configPath = getLocalConfigPath(dir)
  if (!existsSync(configPath)) return
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    if (config.auth) {
      delete config.auth.token
      if (Object.keys(config.auth).length === 0) {
        delete config.auth
      }
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

/** Save token to local config (default) or global config */
export function saveToken(token: string, options?: { global?: boolean; dir?: string }) {
  if (options?.global) {
    saveGlobalConfig({ token })
  } else {
    saveLocalToken(token, options?.dir)
  }
}

/** Clear token from local config (default) or global config */
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
