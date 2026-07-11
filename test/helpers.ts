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
