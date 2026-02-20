import * as tar from 'tar'
import { existsSync, statSync } from 'fs'
import { resolve } from 'path'

export async function createArchive(dir: string): Promise<Buffer> {
  const absDir = resolve(dir)

  if (!existsSync(absDir)) {
    throw new Error(`Directory not found: ${absDir}`)
  }

  if (!statSync(absDir).isDirectory()) {
    throw new Error(`Not a directory: ${absDir}`)
  }

  const chunks: Buffer[] = []

  const stream = tar.create(
    {
      gzip: true,
      cwd: absDir,
    },
    ['.']
  )

  for await (const chunk of stream) {
    chunks.push(chunk as Buffer)
  }

  const result = Buffer.concat(chunks)
  if (result.length === 0) {
    throw new Error('Archive is empty — no files found in the build output')
  }

  return result
}
