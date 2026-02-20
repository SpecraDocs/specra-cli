import * as tar from 'tar'
import { existsSync, statSync } from 'fs'
import { join, resolve } from 'path'

export async function createArchive(dir: string): Promise<Buffer> {
  const absDir = resolve(dir)

  if (!existsSync(absDir)) {
    throw new Error(`Directory not found: ${absDir}`)
  }

  if (!statSync(absDir).isDirectory()) {
    throw new Error(`Not a directory: ${absDir}`)
  }

  // Check for docs content - look for common indicators
  const hasPackageJson = existsSync(join(absDir, 'package.json'))
  const hasDocsDir = existsSync(join(absDir, 'docs'))
  const hasSpecraConfig = existsSync(join(absDir, 'specra.config.json'))

  if (!hasPackageJson && !hasDocsDir && !hasSpecraConfig) {
    throw new Error(
      'No Specra project found. Ensure the directory contains package.json, docs/, or specra.config.json'
    )
  }

  // Build the file list — include relevant files, exclude node_modules/.next/.git
  const chunks: Buffer[] = []

  const stream = tar.create(
    {
      gzip: true,
      cwd: absDir,
      filter: (path: string) => {
        if (path.includes('node_modules/')) return false
        if (path.includes('.next/')) return false
        if (path.includes('.git/')) return false
        if (path.includes('.env')) return false
        return true
      },
    },
    ['.']
  )

  for await (const chunk of stream) {
    chunks.push(chunk as Buffer)
  }

  return Buffer.concat(chunks)
}
