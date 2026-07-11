import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { check, done, tmpProject } from './helpers.ts'
import {
  hashBytes, globToRegExp, matchesAny, listFilesRecursive,
  listManagedFiles, readTemplateManifest, readProjectManifest, writeProjectManifest,
  buildScaffoldManifest,
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

done()
