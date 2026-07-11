import fs from 'fs'
import path from 'path'
import {
  ProjectManifest, hashFile, hashBytes, readTemplateManifest,
  listManagedFiles, writeProjectManifest,
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
