import validateNpmPackageName from 'validate-npm-package-name'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export function validateProjectName(name: string) {
  const validation = validateNpmPackageName(name)

  if (validation.validForNewPackages) {
    return { valid: true }
  }

  return {
    valid: false,
    problems: [
      ...(validation.errors || []),
      ...(validation.warnings || []),
    ],
  }
}

export function isWriteable(directory: string): boolean {
  try {
    fs.accessSync(directory, fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

export function isFolderEmpty(path: string): boolean {
  const files = fs.readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

export function getPackageManagerCommand(packageManager: string): {
  install: string
  run: (script: string) => string
} {
  switch (packageManager) {
    case 'yarn':
      return {
        install: 'yarn install',
        run: (script) => `yarn ${script}`,
      }
    case 'pnpm':
      return {
        install: 'pnpm install',
        run: (script) => `pnpm ${script}`,
      }
    case 'npm':
    default:
      return {
        install: 'npm install',
        run: (script) => `npm run ${script}`,
      }
  }
}

export function detectPackageManager(dir: string): string {
  // 1. Check specra.config.json for explicit setting
  const configPath = path.join(dir, 'specra.config.json')
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    if (config.packageManager) return config.packageManager
  } catch {
    // ignore
  }

  // 2. Detect from lockfiles
  if (fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) return 'pnpm'
  if (fs.existsSync(path.join(dir, 'yarn.lock'))) return 'yarn'
  return 'npm'
}

export function tryGitInit(root: string): boolean {
  try {
    execSync('git --version', { stdio: 'ignore' })
    execSync('git init', { cwd: root, stdio: 'ignore' })
    execSync('git add -A', { cwd: root, stdio: 'ignore' })
    execSync('git commit -m "Initial commit from create-specra"', {
      cwd: root,
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

export function copyRecursive(src: string, dest: string) {
  const stat = fs.statSync(src)

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    const entries = fs.readdirSync(src)

    for (const entry of entries) {
      const srcPath = path.join(src, entry)
      const destPath = path.join(dest, entry)
      copyRecursive(srcPath, destPath)
    }
  } else {
    fs.copyFileSync(src, dest)
  }
}
