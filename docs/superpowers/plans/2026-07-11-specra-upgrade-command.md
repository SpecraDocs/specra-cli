# `specra upgrade` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `specra upgrade` command that re-delivers template-owned files into an existing docs site without clobbering the developer's edits, and fix the `modern` template so its sidebar renders badges.

**Architecture:** Templates declare owned paths in a root `specra.template.json`. Scaffolding records a hash per managed file in `.specra/manifest.json`. `upgrade` compares each managed file's on-disk hash against the manifest: pristine files are overwritten, edited files are surfaced as `<file>.new`, missing files are created. Sites with no manifest use "adopt mode", comparing against the shipped template directly.

**Tech Stack:** TypeScript (ESM), commander, prompts, picocolors, tsup (build), node:crypto (hashing). Tests run with `tsx` + `node:assert`. No new runtime deps.

## Global Constraints

- CLI entry point is `src/cli.ts` (the tsup entry). `src/index.ts` is a dead duplicate — do NOT edit it.
- `--version` reads `package.json` via `createRequire`; version bump = edit `package.json` only.
- No new runtime dependencies. Glob matching is hand-rolled (supports `*` and `**`).
- `upgrade` MUST never read or write outside a template's `managed` globs. Unmanaged: `src/routes/+page.svelte`, `docs/**`, `specra.config.json`, `static/**`, `package.json`, lockfiles, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `postcss.config.mjs`, root `+layout.svelte`.
- Managed globs for `modern`: `src/routes/docs/**`, `src/lib/components/*.svelte`. For `minimal`/`book-docs`/`jbrains-docs`: `src/routes/docs/**`.
- CLI version bump: `0.3.2 → 0.4.0`.
- `.new` targets are overwritten; `.bak` targets are never overwritten (suffix a counter).
- Manifest path: `<projectRoot>/.specra/manifest.json`. Template manifest: `<templateDir>/specra.template.json`.
- Commit after each task.

---

## File Structure

**Create:**
- `src/manifest.ts` — hashing, glob matching, file listing, manifest read/write, scaffold-manifest builder.
- `src/commands/upgrade.ts` — `planUpgrade`, `applyPlan`, `runUpgrade` (command entry).
- `templates/modern/specra.template.json`, `templates/minimal/specra.template.json`, `templates/book-docs/specra.template.json`, `templates/jbrains-docs/specra.template.json`
- `test/manifest.test.ts`, `test/upgrade.test.ts`, `test/helpers.ts`

**Modify:**
- `src/create-project.ts` — write `.specra/manifest.json` after copying the template.
- `src/cli.ts` — register the `upgrade` command.
- `templates/modern/src/lib/components/ModernSidebar.svelte` — render badges (additive).
- `package.json` — version `0.4.0`; add `tsx` devDep + `test` script.

---

### Task 1: Manifest & glob utilities

**Files:**
- Create: `src/manifest.ts`
- Create: `test/helpers.ts`
- Test: `test/manifest.test.ts`

**Interfaces:**
- Produces:
  - `interface ProjectManifest { template: string; templateVersion: string; files: Record<string,string> }`
  - `interface TemplateManifest { name: string; managed: string[] }`
  - `hashBytes(buf: Buffer): string` → `"sha256:<hex>"`
  - `hashFile(absPath: string): string`
  - `globToRegExp(pattern: string): RegExp`
  - `matchesAny(relPath: string, patterns: string[]): boolean`
  - `listFilesRecursive(root: string): string[]` (posix rel paths; skips `.specra`,`.git`,`node_modules`,`.svelte-kit`,`dist`)
  - `listManagedFiles(root: string, patterns: string[]): string[]`
  - `readTemplateManifest(templateDir: string): TemplateManifest`
  - `readProjectManifest(projectRoot: string): ProjectManifest | null`
  - `writeProjectManifest(projectRoot: string, m: ProjectManifest): void`

- [ ] **Step 1: Write the test helper**

Create `test/helpers.ts`:

```ts
import fs from 'fs'
import os from 'os'
import path from 'path'

let counter = 0

/** Make a throwaway temp dir with the given files (relPath -> contents). */
export function tmpProject(files: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `specra-test-${counter++}-`))
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, rel)
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, content)
  }
  return root
}

let passed = 0
let failed = 0

export function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok   ${name}`)
  } catch (err) {
    failed++
    console.log(`  FAIL ${name}\n       ${(err as Error).message.split('\n')[0]}`)
  }
}

export function done() {
  console.log(failed === 0 ? `\nALL PASS (${passed})` : `\n${failed} FAILED, ${passed} passed`)
  process.exit(failed === 0 ? 0 : 1)
}
```

- [ ] **Step 2: Write the failing test**

Create `test/manifest.test.ts`:

```ts
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { check, done, tmpProject } from './helpers.ts'
import {
  hashBytes, globToRegExp, matchesAny, listFilesRecursive,
  listManagedFiles, readTemplateManifest, readProjectManifest, writeProjectManifest,
} from '../src/manifest.ts'

check('hashBytes is stable and prefixed', () => {
  assert.equal(hashBytes(Buffer.from('a')), hashBytes(Buffer.from('a')))
  assert.ok(hashBytes(Buffer.from('a')).startsWith('sha256:'))
  assert.notEqual(hashBytes(Buffer.from('a')), hashBytes(Buffer.from('b')))
})

check('globToRegExp: ** matches across slashes', () => {
  const re = globToRegExp('src/routes/docs/**')
  assert.ok(re.test('src/routes/docs/[version]/[...slug]/+page.svelte'))
  assert.ok(!re.test('src/routes/+page.svelte'))
})

check('globToRegExp: * is single-segment', () => {
  const re = globToRegExp('src/lib/components/*.svelte')
  assert.ok(re.test('src/lib/components/ModernSidebar.svelte'))
  assert.ok(!re.test('src/lib/components/nested/Deep.svelte'))
  assert.ok(!re.test('src/lib/components/readme.md'))
})

check('matchesAny across a pattern list', () => {
  const pats = ['src/routes/docs/**', 'src/lib/components/*.svelte']
  assert.ok(matchesAny('src/lib/components/A.svelte', pats))
  assert.ok(matchesAny('src/routes/docs/x/y.ts', pats))
  assert.ok(!matchesAny('src/routes/+page.svelte', pats))
})

check('listFilesRecursive skips noise dirs and returns posix rel paths', () => {
  const root = tmpProject({
    'src/a.ts': '1', 'src/b/c.ts': '2',
    'node_modules/x.js': '3', '.git/HEAD': '4', '.specra/manifest.json': '5',
  })
  const files = listFilesRecursive(root).sort()
  assert.deepEqual(files, ['src/a.ts', 'src/b/c.ts'])
})

check('listManagedFiles filters by globs', () => {
  const root = tmpProject({
    'src/lib/components/A.svelte': '1',
    'src/lib/components/readme.md': '2',
    'src/routes/docs/p.svelte': '3',
    'src/routes/+page.svelte': '4',
  })
  const files = listManagedFiles(root, ['src/routes/docs/**', 'src/lib/components/*.svelte']).sort()
  assert.deepEqual(files, ['src/lib/components/A.svelte', 'src/routes/docs/p.svelte'])
})

check('readTemplateManifest parses name + managed', () => {
  const dir = tmpProject({ 'specra.template.json': JSON.stringify({ name: 'modern', managed: ['a/**'] }) })
  const m = readTemplateManifest(dir)
  assert.equal(m.name, 'modern')
  assert.deepEqual(m.managed, ['a/**'])
})

check('project manifest round-trips', () => {
  const root = tmpProject({})
  const m = { template: 'modern', templateVersion: '0.4.0', files: { 'x.svelte': 'sha256:abc' } }
  writeProjectManifest(root, m)
  assert.ok(fs.existsSync(path.join(root, '.specra/manifest.json')))
  assert.deepEqual(readProjectManifest(root), m)
})

check('readProjectManifest returns null when absent', () => {
  assert.equal(readProjectManifest(tmpProject({})), null)
})

done()
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx --yes tsx test/manifest.test.ts`
Expected: FAIL — `Cannot find module '../src/manifest.ts'`.

- [ ] **Step 4: Implement `src/manifest.ts`**

```ts
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
    .replace(/\*\*/g, ' ') // placeholder so the next line doesn't touch it
    .replace(/\*/g, '[^/]*')
    .replace(/ /g, '.*')
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx --yes tsx test/manifest.test.ts`
Expected: `ALL PASS (9)`

- [ ] **Step 6: Add tsx devDep + test script; typecheck**

Edit `package.json`: add `"tsx": "^4.19.0"` to `devDependencies` and this script:
```json
"test": "tsx test/manifest.test.ts && tsx test/upgrade.test.ts"
```
Run: `npm install` then `npm run typecheck`
Expected: install succeeds; typecheck exits 0.

- [ ] **Step 7: Commit**

```bash
git add src/manifest.ts test/helpers.ts test/manifest.test.ts package.json package-lock.json
git commit -m "feat(cli): manifest and glob utilities for upgrade"
```

---

### Task 2: Scaffold writes `.specra/manifest.json` + template manifests

**Files:**
- Modify: `src/manifest.ts` (add `buildScaffoldManifest`)
- Modify: `src/create-project.ts` (call it after copy)
- Create: `templates/modern/specra.template.json`, `templates/minimal/specra.template.json`, `templates/book-docs/specra.template.json`, `templates/jbrains-docs/specra.template.json`
- Test: `test/manifest.test.ts` (extend)

**Interfaces:**
- Consumes: `listManagedFiles`, `hashFile`, `readTemplateManifest` (Task 1)
- Produces: `buildScaffoldManifest(projectRoot: string, templateDir: string, templateVersion: string): ProjectManifest`

- [ ] **Step 1: Write the failing test** (append before `done()` in `test/manifest.test.ts`)

```ts
import { buildScaffoldManifest } from '../src/manifest.ts'

check('buildScaffoldManifest hashes exactly the managed files', () => {
  const tpl = tmpProject({
    'specra.template.json': JSON.stringify({ name: 'modern', managed: ['src/lib/components/*.svelte'] }),
    'src/lib/components/A.svelte': 'alpha',
    'src/routes/+page.svelte': 'landing', // unmanaged
  })
  const m = buildScaffoldManifest(tpl, tpl, '0.4.0')
  assert.equal(m.template, 'modern')
  assert.equal(m.templateVersion, '0.4.0')
  assert.deepEqual(Object.keys(m.files), ['src/lib/components/A.svelte'])
  assert.ok(m.files['src/lib/components/A.svelte'].startsWith('sha256:'))
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx --yes tsx test/manifest.test.ts`
Expected: FAIL — `buildScaffoldManifest` is not exported.

- [ ] **Step 3: Implement `buildScaffoldManifest` in `src/manifest.ts`**

```ts
export function buildScaffoldManifest(
  projectRoot: string,
  templateDir: string,
  templateVersion: string,
): ProjectManifest {
  const { name, managed } = readTemplateManifest(templateDir)
  const files: Record<string, string> = {}
  for (const rel of listManagedFiles(projectRoot, managed)) {
    files[rel] = hashFile(path.join(projectRoot, rel))
  }
  return { template: name, templateVersion, files }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx --yes tsx test/manifest.test.ts`
Expected: `ALL PASS (10)`

- [ ] **Step 5: Create the four template manifests**

`templates/modern/specra.template.json`:
```json
{
  "name": "modern",
  "managed": ["src/routes/docs/**", "src/lib/components/*.svelte"]
}
```

`templates/minimal/specra.template.json`:
```json
{ "name": "minimal", "managed": ["src/routes/docs/**"] }
```

`templates/book-docs/specra.template.json`:
```json
{ "name": "book-docs", "managed": ["src/routes/docs/**"] }
```

`templates/jbrains-docs/specra.template.json`:
```json
{ "name": "jbrains-docs", "managed": ["src/routes/docs/**"] }
```

- [ ] **Step 6: Wire manifest writing into `createProject`**

In `src/create-project.ts`, add to the imports:
```ts
import { buildScaffoldManifest, writeProjectManifest } from './manifest.js'
```
Then, immediately AFTER the `copyRecursive(templateDir, root)` line and BEFORE the `package.json` name-update block, insert:
```ts
  // Record which template files this project came from, so `specra upgrade`
  // can tell later which managed files the developer has since edited.
  const cliPkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
  )
  writeProjectManifest(root, buildScaffoldManifest(root, templateDir, cliPkg.version))
```
(`__dirname`, `fs`, `path` are already defined/imported in this file.)

- [ ] **Step 7: Typecheck + smoke-scaffold**

Run: `npm run typecheck && npm run build`
Then smoke test the scaffold writes a manifest (skip install/git for speed):
```bash
node -e "import('./dist/create-project.js').then(m=>m.createProject({projectName:'/tmp/specra-scaffold-smoke',template:'minimal',packageManager:'npm',skipInstall:true}))"
cat /tmp/specra-scaffold-smoke/.specra/manifest.json
rm -rf /tmp/specra-scaffold-smoke
```
Expected: typecheck+build pass; manifest lists `src/routes/docs/**` files with `sha256:` hashes and `"template": "minimal"`.

- [ ] **Step 8: Commit**

```bash
git add src/manifest.ts src/create-project.ts templates/*/specra.template.json test/manifest.test.ts
git commit -m "feat(cli): write .specra/manifest.json at scaffold time"
```

---

### Task 3: Upgrade engine (precise mode)

**Files:**
- Create: `src/commands/upgrade.ts`
- Test: `test/upgrade.test.ts`

**Interfaces:**
- Consumes: everything from `src/manifest.ts`
- Produces:
  - `type FileAction = 'create' | 'update' | 'review' | 'unchanged'`
  - `interface PlanItem { rel: string; action: FileAction }`
  - `interface UpgradePlan { items: PlanItem[]; adopt: boolean }`
  - `planUpgrade(args: { projectRoot: string; templateDir: string; manifest: ProjectManifest }): UpgradePlan`
  - `applyPlan(args: { projectRoot: string; templateDir: string; plan: UpgradePlan; manifest: ProjectManifest; templateVersion: string; force: boolean; dryRun: boolean }): void`

- [ ] **Step 1: Write the failing test**

Create `test/upgrade.test.ts`:

```ts
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { check, done, tmpProject } from './helpers.ts'
import { hashBytes } from '../src/manifest.ts'
import { planUpgrade, applyPlan } from '../src/commands/upgrade.ts'

const h = (s: string) => hashBytes(Buffer.from(s))

// A shipped template with managed .svelte components.
function template(managed: Record<string, string>): string {
  return tmpProject({
    'specra.template.json': JSON.stringify({ name: 'modern', managed: ['src/lib/components/*.svelte'] }),
    ...managed,
  })
}

check('pristine file is updated in place', () => {
  const tpl = template({ 'src/lib/components/A.svelte': 'v2' })
  // project scaffolded from an OLD template where A was 'v1'
  const proj = tmpProject({ 'src/lib/components/A.svelte': 'v1' })
  const manifest = { template: 'modern', templateVersion: '0.3.0',
    files: { 'src/lib/components/A.svelte': h('v1') } }
  const plan = planUpgrade({ projectRoot: proj, templateDir: tpl, manifest })
  assert.equal(plan.items.find(i => i.rel.endsWith('A.svelte'))!.action, 'update')
  applyPlan({ projectRoot: proj, templateDir: tpl, plan, manifest, templateVersion: '0.4.0', force: false, dryRun: false })
  assert.equal(fs.readFileSync(path.join(proj, 'src/lib/components/A.svelte'), 'utf8'), 'v2')
})

check('edited file is surfaced as .new, original untouched', () => {
  const tpl = template({ 'src/lib/components/A.svelte': 'v2' })
  const proj = tmpProject({ 'src/lib/components/A.svelte': 'MY EDIT' })
  // manifest records the ORIGINAL v1 hash; on-disk is 'MY EDIT' → edited
  const manifest = { template: 'modern', templateVersion: '0.3.0', files: { 'src/lib/components/A.svelte': 'sha256:deadbeef' } }
  const plan = planUpgrade({ projectRoot: proj, templateDir: tpl, manifest })
  assert.equal(plan.items.find(i => i.rel.endsWith('A.svelte'))!.action, 'review')
  applyPlan({ projectRoot: proj, templateDir: tpl, plan, manifest, templateVersion: '0.4.0', force: false, dryRun: false })
  assert.equal(fs.readFileSync(path.join(proj, 'src/lib/components/A.svelte'), 'utf8'), 'MY EDIT')
  assert.equal(fs.readFileSync(path.join(proj, 'src/lib/components/A.svelte.new'), 'utf8'), 'v2')
})

check('--force overwrites edited file after .bak backup', () => {
  const tpl = template({ 'src/lib/components/A.svelte': 'v2' })
  const proj = tmpProject({ 'src/lib/components/A.svelte': 'MY EDIT' })
  const manifest = { template: 'modern', templateVersion: '0.3.0', files: { 'src/lib/components/A.svelte': 'sha256:deadbeef' } }
  const plan = planUpgrade({ projectRoot: proj, templateDir: tpl, manifest })
  applyPlan({ projectRoot: proj, templateDir: tpl, plan, manifest, templateVersion: '0.4.0', force: true, dryRun: false })
  assert.equal(fs.readFileSync(path.join(proj, 'src/lib/components/A.svelte'), 'utf8'), 'v2')
  assert.equal(fs.readFileSync(path.join(proj, 'src/lib/components/A.svelte.bak'), 'utf8'), 'MY EDIT')
})

check('missing managed file is created', () => {
  const tpl = template({ 'src/lib/components/A.svelte': 'v2', 'src/lib/components/B.svelte': 'newfile' })
  const proj = tmpProject({ 'src/lib/components/A.svelte': 'v2' })
  const manifest = { template: 'modern', templateVersion: '0.3.0', files: { 'src/lib/components/A.svelte': h('v2') } }
  const plan = planUpgrade({ projectRoot: proj, templateDir: tpl, manifest })
  assert.equal(plan.items.find(i => i.rel.endsWith('B.svelte'))!.action, 'create')
  applyPlan({ projectRoot: proj, templateDir: tpl, plan, manifest, templateVersion: '0.4.0', force: false, dryRun: false })
  assert.equal(fs.readFileSync(path.join(proj, 'src/lib/components/B.svelte'), 'utf8'), 'newfile')
})

check('--dry-run writes nothing', () => {
  const tpl = template({ 'src/lib/components/A.svelte': 'v2' })
  const proj = tmpProject({ 'src/lib/components/A.svelte': 'v1' })
  const manifest = { template: 'modern', templateVersion: '0.3.0', files: { 'src/lib/components/A.svelte': h('v1') } }
  const plan = planUpgrade({ projectRoot: proj, templateDir: tpl, manifest })
  applyPlan({ projectRoot: proj, templateDir: tpl, plan, manifest, templateVersion: '0.4.0', force: false, dryRun: true })
  assert.equal(fs.readFileSync(path.join(proj, 'src/lib/components/A.svelte'), 'utf8'), 'v1')
})

check('unmanaged files are never touched', () => {
  const tpl = template({ 'src/lib/components/A.svelte': 'v2' })
  const proj = tmpProject({ 'src/lib/components/A.svelte': 'v1', 'src/routes/+page.svelte': 'LANDING' })
  const manifest = { template: 'modern', templateVersion: '0.3.0', files: { 'src/lib/components/A.svelte': h('v1') } }
  const plan = planUpgrade({ projectRoot: proj, templateDir: tpl, manifest })
  applyPlan({ projectRoot: proj, templateDir: tpl, plan, manifest, templateVersion: '0.4.0', force: false, dryRun: false })
  assert.equal(fs.readFileSync(path.join(proj, 'src/routes/+page.svelte'), 'utf8'), 'LANDING')
  assert.ok(!plan.items.some(i => i.rel.endsWith('+page.svelte')))
})

done()
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx --yes tsx test/upgrade.test.ts`
Expected: FAIL — `Cannot find module '../src/commands/upgrade.ts'`.

- [ ] **Step 3: Implement `src/commands/upgrade.ts` (engine only for now)**

```ts
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx --yes tsx test/upgrade.test.ts`
Expected: `ALL PASS (6)`

- [ ] **Step 5: Commit**

```bash
git add src/commands/upgrade.ts test/upgrade.test.ts
git commit -m "feat(cli): upgrade diff/apply engine (precise mode)"
```

---

### Task 4: Adopt mode (no manifest)

**Files:**
- Modify: `src/commands/upgrade.ts` (add `planAdopt`)
- Test: `test/upgrade.test.ts` (extend)

**Interfaces:**
- Produces: `planAdopt(args: { projectRoot: string; templateDir: string }): { plan: UpgradePlan; seededManifest: ProjectManifest }`
  - In adopt mode, an edited-vs-shipped file → `review`; identical → `unchanged`; missing → `create`. The seeded manifest records the project's CURRENT bytes as baseline.

- [ ] **Step 1: Write the failing test** (append before `done()` in `test/upgrade.test.ts`)

```ts
import { planAdopt } from '../src/commands/upgrade.ts'

check('adopt mode: differing file → review, manifest baselined to current bytes', () => {
  const tpl = tmpProject({
    'specra.template.json': JSON.stringify({ name: 'modern', managed: ['src/lib/components/*.svelte'] }),
    'src/lib/components/A.svelte': 'TEMPLATE v2 with badges',
  })
  const proj = tmpProject({ 'src/lib/components/A.svelte': 'USER EDITED with link()' })
  const { plan, seededManifest } = planAdopt({ projectRoot: proj, templateDir: tpl })
  assert.equal(plan.adopt, true)
  assert.equal(plan.items.find(i => i.rel.endsWith('A.svelte'))!.action, 'review')
  // baseline is the developer's current bytes, NOT the template's
  assert.equal(seededManifest.files['src/lib/components/A.svelte'], h('USER EDITED with link()'))

  applyPlan({ projectRoot: proj, templateDir: tpl, plan, manifest: seededManifest, templateVersion: '0.4.0', force: false, dryRun: false })
  assert.equal(fs.readFileSync(path.join(proj, 'src/lib/components/A.svelte'), 'utf8'), 'USER EDITED with link()')
  assert.equal(fs.readFileSync(path.join(proj, 'src/lib/components/A.svelte.new'), 'utf8'), 'TEMPLATE v2 with badges')
})

check('adopt mode: identical file → unchanged', () => {
  const tpl = tmpProject({
    'specra.template.json': JSON.stringify({ name: 'modern', managed: ['src/lib/components/*.svelte'] }),
    'src/lib/components/A.svelte': 'same',
  })
  const proj = tmpProject({ 'src/lib/components/A.svelte': 'same' })
  const { plan } = planAdopt({ projectRoot: proj, templateDir: tpl })
  assert.equal(plan.items.find(i => i.rel.endsWith('A.svelte'))!.action, 'unchanged')
})
```

(These use the `h()` helper and `planAdopt` import; ES module imports are hoisted, so the mid-file `import { planAdopt }` line is valid — keep it or move it up with the other imports.)

- [ ] **Step 2: Run to verify it fails**

Run: `npx --yes tsx test/upgrade.test.ts`
Expected: FAIL — `planAdopt` is not exported.

- [ ] **Step 3: Implement `planAdopt` in `src/commands/upgrade.ts`**

```ts
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx --yes tsx test/upgrade.test.ts`
Expected: `ALL PASS (8)`

- [ ] **Step 5: Commit**

```bash
git add src/commands/upgrade.ts test/upgrade.test.ts
git commit -m "feat(cli): adopt mode for sites without a manifest"
```

---

### Task 5: CLI wiring + `runUpgrade` + version bump

**Files:**
- Modify: `src/commands/upgrade.ts` (add `runUpgrade`)
- Modify: `src/cli.ts` (register command)
- Modify: `package.json` (version `0.4.0`)

**Interfaces:**
- Consumes: `planUpgrade`, `planAdopt`, `applyPlan`, `readProjectManifest`
- Produces: `runUpgrade(options: { dir?: string; template?: string; dryRun?: boolean; force?: boolean; yes?: boolean }): Promise<void>`

- [ ] **Step 1: Implement `runUpgrade` in `src/commands/upgrade.ts`**

Add imports at top: `import prompts from 'prompts'`, `import pc from 'picocolors'`, `import { fileURLToPath } from 'url'`, and extend the manifest import with `readProjectManifest`.

```ts
function resolveTemplateDir(templateName: string): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  // dist/commands/upgrade.js → ../../templates/<name>
  return path.join(here, '..', '..', 'templates', templateName)
}

function cliVersion(): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  return JSON.parse(fs.readFileSync(path.join(here, '..', '..', 'package.json'), 'utf8')).version
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

  const existing = readProjectManifest(projectRoot)
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

  if (options.dryRun) { console.log(pc.dim('\nDry run — nothing written.')); return }
  if (created.length + updated.length + review.length === 0) { console.log(pc.green('\nAlready up to date.')); return }

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
```

- [ ] **Step 2: Register the command in `src/cli.ts`**

After the `doctor` command block and before `program.parse()`, insert:

```ts
program
  .command('upgrade')
  .description('Update template-managed files from the current CLI version')
  .option('-d, --dir <directory>', 'Project directory to upgrade', '.')
  .option('-t, --template <name>', 'Template name (for sites with no manifest)')
  .option('--dry-run', 'Show the plan without writing anything')
  .option('--force', 'Overwrite edited files in place (backs up to .bak)')
  .option('-y, --yes', 'Skip the confirmation prompt')
  .action(async (options) => {
    const { runUpgrade } = await import('./commands/upgrade.js')
    await runUpgrade(options)
  })
```

- [ ] **Step 3: Bump version**

Edit `package.json`: `"version": "0.3.2"` → `"version": "0.4.0"`.

- [ ] **Step 4: Build + smoke test the real CLI**

```bash
npm run build
node dist/cli.js --version                       # → 0.4.0
node dist/cli.js upgrade --help                  # shows the flags
# scaffold a temp site, then dry-run upgrade it:
node -e "import('./dist/create-project.js').then(m=>m.createProject({projectName:'/tmp/specra-up-smoke',template:'minimal',packageManager:'npm',skipInstall:true}))"
node dist/cli.js upgrade --dir /tmp/specra-up-smoke --dry-run
rm -rf /tmp/specra-up-smoke
```
Expected: version prints `0.4.0`; `--help` lists options; dry-run prints `Already up to date.` (a freshly scaffolded site matches its template).

- [ ] **Step 5: Commit**

```bash
git add src/commands/upgrade.ts src/cli.ts package.json
git commit -m "feat(cli): specra upgrade command + bump to 0.4.0"
```

---

### Task 6: Modern template badge rendering

**Files:**
- Modify: `templates/modern/src/lib/components/ModernSidebar.svelte`

**Interfaces:**
- Consumes (from `specra` @ 0.2.68): `resolveBadges` (from `specra`), `SidebarBadge` (from `specra/components`)

- [ ] **Step 1: Add imports**

In the `<script lang="ts">` block, change:
```ts
  import { buildSidebarStructure, sortSidebarGroups, sortSidebarItems } from 'specra';
  import type { SpecraConfig } from 'specra';
  import SidebarSelect from './SidebarSelect.svelte';
```
to:
```ts
  import { buildSidebarStructure, sortSidebarGroups, sortSidebarItems, resolveBadges } from 'specra';
  import type { SpecraConfig } from 'specra';
  import { SidebarBadge } from 'specra/components';
  import SidebarSelect from './SidebarSelect.svelte';
```

- [ ] **Step 2: Render badges at all three doc-link sites**

There are three `<a class="sidebar-link" …>{doc.meta.title || doc.slug}</a>` blocks (standalone, group items, nested children). In EACH, replace the link body:
```svelte
          {doc.meta.title || doc.slug}
```
with:
```svelte
          <span class="sidebar-link-text">{doc.meta.title || doc.slug}</span>
          {#each resolveBadges(doc.meta?.badge) as badge (badge.text)}
            <SidebarBadge {badge} />
          {/each}
```
(Apply to all three occurrences — standalone `.sidebar-link`, group `.sidebar-link`, and nested `.sidebar-link.nested`.)

- [ ] **Step 3: Make the link a flex row so the badge sits inline**

In the component's `<style>`, find `.sidebar-link {` and add these properties to that rule (keep existing ones):
```css
    display: flex;
    align-items: center;
    gap: 0.5rem;
```
And add:
```css
  .sidebar-link-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
```

- [ ] **Step 4: Verify via the acceptance test (Task 7)**

This template file is not built in isolation; correctness is verified by Task 7 rendering it in umbra. For now, confirm the edits are syntactically present:
```bash
grep -c "resolveBadges\|SidebarBadge" templates/modern/src/lib/components/ModernSidebar.svelte
```
Expected: `>= 4` (2 imports + 3 render loops share the two identifiers).

- [ ] **Step 5: Commit**

```bash
git add templates/modern/src/lib/components/ModernSidebar.svelte
git commit -m "fix(modern): render sidebar badges via SDK resolveBadges + SidebarBadge"
```

---

### Task 7: Acceptance test on umbra/documentation

**Files:** none in the CLI repo — this exercises the built CLI against a real site.

- [ ] **Step 1: Snapshot the pre-state**

```bash
cd /home/dalmas/E/projects/umbra/documentation
git status --porcelain > /tmp/umbra-before.txt   # if a git repo; else `find src docs -type f | sort`
sha256sum src/routes/+page.svelte specra.config.json > /tmp/umbra-guard.txt
```

- [ ] **Step 2: Run adopt-mode upgrade (dry run first)**

```bash
node /home/dalmas/E/projects/documentation-system/specra/specra-cli/dist/cli.js \
  upgrade --dir /home/dalmas/E/projects/umbra/documentation --template modern --dry-run
```
Expected: reports `ModernSidebar.svelte` under "need review" (umbra's copy is edited), lists any pristine managed files as update/unchanged. Nothing written.

- [ ] **Step 3: Apply**

```bash
node /home/dalmas/E/projects/documentation-system/specra/specra-cli/dist/cli.js \
  upgrade --dir /home/dalmas/E/projects/umbra/documentation --template modern --yes
```

- [ ] **Step 4: Assert the safety guarantees**

```bash
cd /home/dalmas/E/projects/umbra/documentation
test -f .specra/manifest.json && echo "manifest: OK"
test -f src/lib/components/ModernSidebar.svelte.new && echo ".new emitted: OK"
grep -q "renderInlineCode" src/lib/components/ModernSidebar.svelte && echo "umbra edits preserved: OK"
grep -q "resolveBadges" src/lib/components/ModernSidebar.svelte.new && echo ".new has badges: OK"
sha256sum -c /tmp/umbra-guard.txt && echo "landing page + config untouched: OK"
```
Expected: all five lines print `OK` / pass.

- [ ] **Step 5: Reconcile the badge change and verify it renders**

Merge the badge additions from `ModernSidebar.svelte.new` into umbra's real `ModernSidebar.svelte` (add the two imports and the three `resolveBadges`/`SidebarBadge` loops; keep umbra's `link()`/`renderInlineCode()`), then:
```bash
rm src/lib/components/ModernSidebar.svelte.new
nohup npx vite dev --port 5212 >/tmp/umbra-vite.log 2>&1 &
sleep 25
curl -s http://localhost:5212/docs/v0.0.1/en/deployment/going-to-production -o /tmp/umbra-page.html
grep -o 'bg-green-500/10[^>]*>[[:space:]]*New' /tmp/umbra-page.html | head -1
pkill -f "vite dev --port 5212"
```
Expected: a green **New** pill appears in the sidebar for the `going-to-production` page.

- [ ] **Step 6: Record the result**

No commit in umbra unless the user asks. Report the acceptance outcome (all guards OK, badge renders) back to the user.

---

## Self-Review

**Spec coverage:**
- §1 template ownership → Task 2 (manifests) + Task 1 (glob matching). ✓
- §2 scaffold manifest → Task 2. ✓
- §3 command algorithm (create/update/review/unchanged, flags) → Tasks 3, 5. ✓
- §4 adopt mode → Task 4. ✓
- §5 modern badge fix → Task 6. ✓
- §6 version bump → Task 5. ✓
- Error handling (not-a-project, unknown template, `.bak` counter, `.new` overwrite) → Task 5 (`runUpgrade`) + Task 3 (`backupName`). ✓
- Testing (unit + umbra acceptance) → Tasks 1–4 unit, Task 7 acceptance. ✓

**Placeholder scan:** No TBD/TODO. All code steps show full code. The only manual reconciliation is Task 7 Step 5 (merging `.new`), which is inherent to the feature, not a plan gap.

**Type consistency:** `ProjectManifest`/`TemplateManifest` defined in Task 1 and imported unchanged in Tasks 2–5. `planUpgrade`/`planAdopt`/`applyPlan`/`runUpgrade` signatures in the Interfaces blocks match their call sites in `runUpgrade` and the tests. `FileAction` values (`create`/`update`/`review`/`unchanged`) are used identically across the engine and tests.

**Note on Task 3/4 tests:** manifest hashes are computed directly with `h(s) = hashBytes(Buffer.from(s))` rather than through `buildScaffoldManifest`, so each test's expected baseline is explicit and independent of glob expansion.
