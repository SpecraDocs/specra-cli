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
