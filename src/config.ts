import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const CONFIG_DIR = join(homedir(), '.specra')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')

interface SpecraConfig {
  apiUrl: string
  token?: string
  defaultProject?: string
}

const DEFAULT_CONFIG: SpecraConfig = {
  apiUrl: 'https://specra-docs.com',
}

export function getConfig(): SpecraConfig {
  try {
    const raw = readFileSync(CONFIG_FILE, 'utf-8')
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveConfig(config: Partial<SpecraConfig>) {
  mkdirSync(CONFIG_DIR, { recursive: true })
  const current = getConfig()
  const merged = { ...current, ...config }
  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2))
}

export function clearConfig() {
  if (existsSync(CONFIG_FILE)) {
    unlinkSync(CONFIG_FILE)
  }
}

export function getToken(): string | undefined {
  return getConfig().token
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
