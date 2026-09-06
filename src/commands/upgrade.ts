import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import prompts from 'prompts'
import pc from 'picocolors'
import {
  ProjectManifest, hashFile, hashBytes, readTemplateManifest,
  listManagedFiles, writeProjectManifest, readProjectManifest,
} from '../manifest.js'

export type FileAction = 'create' | 'update' | 'review' | 'unchanged'
export interface PlanItem { rel: string; action: FileAction }
export interface UpgradePlan { items: PlanItem[]; adopt: boolean }

/** Pick a `.bak` name that does not exist yet, so no backup is ever overwritten. */
function backupName(abs: string): string {
  let candidate = abs + '.bak'
  let n = 2
  while (fs.existsSync(candidate)) candidate = `${abs}.bak${n++}`
  return candidate
}

export function planUpgrade(args: {
  projectRoot: string
  templateDir: string
  manifest: ProjectManifest
}): UpgradePlan {
  const { projectRoot, templateDir, manifest } = args
  const { managed } = readTemplateManifest(templateDir)
  const items: PlanItem[] = []

  for (const rel of listManagedFiles(templateDir, managed)) {
    const projAbs = path.join(projectRoot, rel)
    const tplAbs = path.join(templateDir, rel)

    if (!fs.existsSync(projAbs)) {
      items.push({ rel, action: 'create' })
      continue
    }
    const projHash = hashFile(projAbs)
    const tplHash = hashFile(tplAbs)
    if (projHash === tplHash) {
      items.push({ rel, action: 'unchanged' })
    } else if (projHash === manifest.files[rel]) {
      // Unedited since scaffold, but the template moved on → safe to overwrite.
      items.push({ rel, action: 'update' })
    } else {
      // Developer edited it → never clobber.
      items.push({ rel, action: 'review' })
    }
  }
  return { items, adopt: false }
}

export function planAdopt(args: {
  projectRoot: string
  templateDir: string
}): { plan: UpgradePlan; seededManifest: ProjectManifest } {
  const { projectRoot, templateDir } = args
  const { name, managed } = readTemplateManifest(templateDir)
  const items: PlanItem[] = []
  const files: Record<string, string> = {}

  for (const rel of listManagedFiles(templateDir, managed)) {
    const projAbs = path.join(projectRoot, rel)
    const tplAbs = path.join(templateDir, rel)
    if (!fs.existsSync(projAbs)) {
      items.push({ rel, action: 'create' })
      continue
    }
    // Baseline the manifest to the developer's CURRENT bytes.
    files[rel] = hashFile(projAbs)
    items.push({ rel, action: hashFile(projAbs) === hashFile(tplAbs) ? 'unchanged' : 'review' })
  }

  return {
    plan: { items, adopt: true },
    seededManifest: { template: name, templateVersion: '', files },
  }
}

export function applyPlan(args: {
  projectRoot: string
  templateDir: string
  plan: UpgradePlan
  manifest: ProjectManifest
  templateVersion: string
  force: boolean
  dryRun: boolean
}): void {
  const { projectRoot, templateDir, plan, manifest, templateVersion, force, dryRun } = args
  const nextFiles: Record<string, string> = { ...manifest.files }

  for (const item of plan.items) {
    const projAbs = path.join(projectRoot, item.rel)
    const tplAbs = path.join(templateDir, item.rel)
    const tplBytes = fs.existsSync(tplAbs) ? fs.readFileSync(tplAbs) : null

    if (item.action === 'create' && tplBytes) {
      if (!dryRun) {
        fs.mkdirSync(path.dirname(projAbs), { recursive: true })
        fs.writeFileSync(projAbs, tplBytes)
      }
      nextFiles[item.rel] = hashBytes(tplBytes)
    } else if (item.action === 'update' && tplBytes) {
      if (!dryRun) fs.writeFileSync(projAbs, tplBytes)
      nextFiles[item.rel] = hashBytes(tplBytes)
    } else if (item.action === 'review' && tplBytes) {
      if (force) {
        if (!dryRun) {
          fs.copyFileSync(projAbs, backupName(projAbs))
          fs.writeFileSync(projAbs, tplBytes)
        }
        nextFiles[item.rel] = hashBytes(tplBytes)
      } else if (!dryRun) {
        fs.writeFileSync(projAbs + '.new', tplBytes)
        // manifest hash for this file is left unchanged: it still describes
        // the developer's current (edited) file's provenance baseline.
      }
    }
    // 'unchanged' → nothing.
  }

  if (!dryRun) {
    writeProjectManifest(projectRoot, {
      template: manifest.template,
      templateVersion,
      files: nextFiles,
    })
  }
}

function resolveTemplateDir(templateName: string): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  // dist/cli.js (tsup bundles everything into one file) → ../templates/<name>
  return path.join(here, '..', 'templates', templateName)
}

function cliVersion(): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  return JSON.parse(fs.readFileSync(path.join(here, '..', 'package.json'), 'utf8')).version
}

function inferTemplate(projectRoot: string): string | null {
  if (fs.existsSync(path.join(projectRoot, 'src/lib/components/ModernSidebar.svelte'))) return 'modern'
  return null
}

export async function runUpgrade(options: {
  dir?: string; template?: string; dryRun?: boolean; force?: boolean; yes?: boolean
}): Promise<void> {
  const projectRoot = path.resolve(options.dir || '.')
  if (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
    console.error(pc.red('Not a project directory (no package.json). Run this from your docs site root.'))
    process.exit(1)
  }

  let existing
  try {
    existing = readProjectManifest(projectRoot)
  } catch (e) {
    console.error(pc.red((e as Error).message))
    process.exit(1)
  }
  const templateName = existing?.template || options.template || inferTemplate(projectRoot)
  if (!templateName) {
    console.error(pc.red('Could not determine the template. Re-run with --template <name> (minimal | modern | book-docs | jbrains-docs).'))
    process.exit(1)
  }

  const templateDir = resolveTemplateDir(templateName)
  if (!fs.existsSync(templateDir)) {
    console.error(pc.red(`Template ${pc.cyan(templateName)} not found in this CLI version.`))
    process.exit(1)
  }

  const version = cliVersion()
  let plan, manifest
  if (existing) {
    plan = planUpgrade({ projectRoot, templateDir, manifest: existing })
    manifest = existing
  } else {
    console.log(pc.yellow(`No .specra/manifest.json found — adopting this site as a ${pc.cyan(templateName)} project.`))
    const adopted = planAdopt({ projectRoot, templateDir })
    plan = adopted.plan
    manifest = adopted.seededManifest
  }

  const created = plan.items.filter(i => i.action === 'create')
  const updated = plan.items.filter(i => i.action === 'update')
  const review = plan.items.filter(i => i.action === 'review')

  console.log()
  console.log(pc.bold('Upgrade plan:'))
  console.log(`  ${pc.green(String(created.length))} to create, ${pc.green(String(updated.length))} to update, ${pc.yellow(String(review.length))} need review${options.force ? ' (will overwrite with .bak)' : ' (.new)'}`)
  for (const i of [...created, ...updated]) console.log(`    ${pc.dim(i.action)} ${i.rel}`)
  for (const i of review) console.log(`    ${pc.yellow(options.force ? 'overwrite' : 'review')} ${i.rel}`)

  // empty plan first — "nothing to do" is true regardless of dry-run
  if (created.length + updated.length + review.length === 0) {
    if (plan.adopt && !options.dryRun) {
      // Adopt even when nothing needs changing, so future upgrades are precise.
      writeProjectManifest(projectRoot, {
        template: manifest.template,
        templateVersion: version,
        files: manifest.files,
      })
    }
    console.log(pc.green('\nAlready up to date.'))
    return
  }
  if (options.dryRun) {
    console.log(pc.dim('\nDry run — nothing written.'))
    return
  }

  if (!options.yes) {
    const { go } = await prompts({ type: 'confirm', name: 'go', message: 'Apply these changes?', initial: true })
    if (!go) { console.log('Aborted.'); return }
  }

  applyPlan({ projectRoot, templateDir, plan, manifest, templateVersion: version, force: !!options.force, dryRun: false })

  console.log(pc.green('\nDone.'))
  if (review.length && !options.force) {
    console.log(pc.yellow(`${review.length} file(s) written as .new next to your edited copies — review and merge them.`))
  }
}
