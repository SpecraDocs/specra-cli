import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface ProjectManifest {
  template: string
  templateVersion: string
  files: Record<string, string>
}

export interface TemplateManifest {
  name: string
  managed: string[]
}

const SKIP_DIRS = new Set(['.specra', '.git', 'node_modules', '.svelte-kit', 'dist', '.turbo'])

export function hashBytes(buf: Buffer): string {
  return 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex')
}

export function hashFile(absPath: string): string {
  return hashBytes(fs.readFileSync(absPath))
}

/** Glob → RegExp. `**` matches across slashes; `*` matches within one segment. */
export function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/\\/g, '/').replace(/[.+?^${}()|[\]]/g, '\\$&')
  const body = escaped
    .replace(/\*\*/g, ' ') // placeholder so the next line doesn't touch it
    .replace(/\*/g, '[^/]*')
    .replace(/ /g, '.*')
  return new RegExp('^' + body + '$')
}

export function matchesAny(relPath: string, patterns: string[]): boolean {
  return patterns.some((p) => globToRegExp(p).test(relPath))
}

export function listFilesRecursive(root: string, sub = ''): string[] {
  const dir = path.join(root, sub)
  if (!fs.existsSync(dir)) return []
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      out.push(...listFilesRecursive(root, path.posix.join(sub, entry.name)))
    } else {
      out.push(path.posix.join(sub, entry.name))
    }
  }
  return out
}

export function listManagedFiles(root: string, patterns: string[]): string[] {
  return listFilesRecursive(root).filter((rel) => matchesAny(rel, patterns))
}

export function readTemplateManifest(templateDir: string): TemplateManifest {
  const p = path.join(templateDir, 'specra.template.json')
  if (!fs.existsSync(p)) {
    // Default: own the docs route scaffolding only.
    return { name: path.basename(templateDir), managed: ['src/routes/docs/**'] }
  }
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'))
  return { name: raw.name ?? path.basename(templateDir), managed: raw.managed ?? ['src/routes/docs/**'] }
}

export function readProjectManifest(projectRoot: string): ProjectManifest | null {
  const p = path.join(projectRoot, '.specra', 'manifest.json')
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8')) as ProjectManifest
}

export function writeProjectManifest(projectRoot: string, m: ProjectManifest): void {
  const dir = path.join(projectRoot, '.specra')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(m, null, 2) + '\n')
}
