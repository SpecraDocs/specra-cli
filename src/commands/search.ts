import pc from 'picocolors'
import ora from 'ora'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MeiliSearch } from 'meilisearch'
import { extractSearchText } from '../search-text.js'

interface SearchOptions {
  dir: string
  host?: string
  apiKey?: string
  indexName?: string
}

interface MeiliSettings {
  host: string
  apiKey: string
  indexName: string
}

interface SearchDocument {
  id: string
  title: string
  content: string
  slug: string
  version: string
  locale: string
  category?: string
  tags?: string[]
  tab_group?: string
}

/** Read and parse the project's specra.config.json, or exit with a clear error. */
function loadConfig(dir: string): any {
  const configPath = path.join(dir, 'specra.config.json')
  if (!fs.existsSync(configPath)) {
    console.error(pc.red(`No specra.config.json found in ${dir}.`))
    console.error(pc.dim('Run this from your project root, or pass --dir <path>.'))
    process.exit(1)
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch (err) {
    console.error(pc.red(`Invalid JSON in specra.config.json: ${err instanceof Error ? err.message : err}`))
    process.exit(1)
  }
}

/** Resolve Meilisearch connection settings from config + CLI overrides. */
function resolveMeili(config: any, options: SearchOptions): MeiliSettings {
  const search = config.search
  if (!search?.enabled) {
    console.error(pc.red('Search is disabled.') + pc.dim(' Set search.enabled to true in specra.config.json.'))
    process.exit(1)
  }
  if (search.provider !== 'meilisearch') {
    console.error(pc.red(`Search provider is "${search.provider ?? 'local'}", not "meilisearch".`))
    console.error(pc.dim('Set search.provider to "meilisearch" to index into a Meilisearch server.'))
    process.exit(1)
  }

  const host = options.host || search.meilisearch?.host
  const indexName = options.indexName || search.meilisearch?.indexName
  const apiKey = options.apiKey || search.meilisearch?.apiKey || ''

  if (!host || !indexName) {
    console.error(pc.red('Meilisearch is not fully configured.'))
    console.error(pc.dim('Need search.meilisearch.host and search.meilisearch.indexName (or pass --host / --index-name).'))
    process.exit(1)
  }
  return { host, apiKey, indexName }
}

/** Walk docs/, build locale-aware search documents (mirrors the docs renderer). */
function collectDocuments(docsDir: string, config: any): SearchDocument[] {
  const i18nRaw = config.features?.i18n
  const i18nConfig = i18nRaw && typeof i18nRaw === 'object' ? i18nRaw : null
  const locales: string[] = i18nConfig?.locales ?? []
  const defaultLocale: string = i18nConfig?.defaultLocale ?? 'en'
  const prefixDefault: boolean = i18nConfig?.prefixDefault ?? false

  const documents: SearchDocument[] = []

  function processDirectory(dir: string, version: string) {
    for (const file of fs.readdirSync(dir)) {
      const filePath = path.join(dir, file)
      if (fs.statSync(filePath).isDirectory()) {
        processDirectory(filePath, version)
        continue
      }
      if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue

      const { data, content: mdxContent } = matter(fs.readFileSync(filePath, 'utf-8'))

      const rawPath = path
        .relative(path.join(docsDir, version), filePath)
        .replace(/\.(mdx|md)$/, '')
        .replace(/\\/g, '/')

      // Locale suffix on the filename (e.g. about.de) → locale + logical slug.
      let logicalSlug = rawPath
      let locale = defaultLocale
      if (i18nConfig) {
        const parts = rawPath.split('.')
        const lastPart = parts[parts.length - 1]
        if (locales.includes(lastPart)) {
          locale = lastPart
          logicalSlug = parts.slice(0, -1).join('.')
        }
      }

      // Canonical slug: locale is a path prefix (matches how docs route).
      const usePrefix = i18nConfig && (prefixDefault || locale !== defaultLocale)
      const slug = usePrefix ? `${locale}/${logicalSlug}` : logicalSlug

      const pathParts = logicalSlug.split('/')
      const category = pathParts.length > 1 ? pathParts[0] : undefined

      // tab_group from frontmatter, else the parent _category_.json.
      let tabGroup = data.tab_group
      if (!tabGroup && pathParts.length > 1) {
        const folderPath = pathParts.slice(0, -1).join('/')
        const categoryPath = path.join(docsDir, version, folderPath, '_category_.json')
        if (fs.existsSync(categoryPath)) {
          try {
            tabGroup = JSON.parse(fs.readFileSync(categoryPath, 'utf-8')).tab_group
          } catch {
            // ignore malformed _category_.json
          }
        }
      }

      // Meilisearch ids allow only [A-Za-z0-9_-].
      const docId = slug.replace(/\//g, '-').replace(/[^a-zA-Z0-9_-]/g, '_')

      documents.push({
        id: docId,
        title: data.title || logicalSlug,
        content: extractSearchText(mdxContent),
        slug,
        version,
        locale,
        category,
        tags: data.tags || [],
        tab_group: tabGroup,
      })
    }
  }

  const versions = fs
    .readdirSync(docsDir)
    .filter((item) => fs.statSync(path.join(docsDir, item)).isDirectory())

  for (const version of versions) {
    processDirectory(path.join(docsDir, version), version)
  }
  return documents
}

export async function searchIndex(options: SearchOptions) {
  const dir = path.resolve(options.dir)
  const config = loadConfig(dir)
  const meili = resolveMeili(config, options)

  const docsDir = path.join(dir, 'docs')
  if (!fs.existsSync(docsDir)) {
    console.error(pc.red(`No docs/ directory found in ${dir}.`))
    process.exit(1)
  }

  console.log()
  console.log(pc.bold('Specra search index'))
  console.log(pc.dim(`${meili.host} → index "${meili.indexName}"`))
  console.log()

  const collectSpinner = ora('Reading docs…').start()
  let documents: SearchDocument[]
  try {
    documents = collectDocuments(docsDir, config)
  } catch (err) {
    collectSpinner.fail('Failed to read docs')
    console.error(pc.red(err instanceof Error ? err.message : String(err)))
    process.exit(1)
  }
  collectSpinner.succeed(`Collected ${documents.length} document${documents.length === 1 ? '' : 's'}`)

  const client = new MeiliSearch({ host: meili.host, apiKey: meili.apiKey })
  const index = client.index(meili.indexName)

  const spinner = ora('Updating index settings…').start()
  try {
    await index.updateSearchableAttributes(['title', 'content', 'tags'])
    await index.updateFilterableAttributes(['version', 'locale', 'category', 'tags'])
    await index.updateSortableAttributes(['title'])
    await index.updateDistinctAttribute('id')
    await index.updateSettings({
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    })

    spinner.text = 'Clearing old documents…'
    await index.deleteAllDocuments()

    spinner.text = 'Uploading documents…'
    const task = await index.addDocuments(documents, { primaryKey: 'id' })
    spinner.succeed(`Sent ${documents.length} documents for indexing (task ${task.taskUid})`)
  } catch (err) {
    spinner.fail('Indexing failed')
    console.error(pc.red(err instanceof Error ? err.message : String(err)))
    console.error(pc.dim('Is the Meilisearch server running and reachable, and is the API key allowed to index?'))
    process.exit(1)
  }

  console.log()
  console.log(pc.dim('Meilisearch processes the batch in the background.'))
  console.log(pc.dim('Verify with: ') + pc.cyan('npx specra search test'))
  console.log()
}

export async function searchTest(options: SearchOptions) {
  const dir = path.resolve(options.dir)
  const config = loadConfig(dir)
  const meili = resolveMeili(config, options)

  const client = new MeiliSearch({ host: meili.host, apiKey: meili.apiKey })
  const index = client.index(meili.indexName)

  console.log()
  console.log(pc.bold('Specra search test'))
  console.log(pc.dim(`${meili.host} → index "${meili.indexName}"`))

  try {
    const stats = await index.getStats()
    console.log()
    console.log(pc.bold('Index'))
    console.log(`  Documents: ${pc.cyan(stats.numberOfDocuments)}`)
    console.log(`  Indexing:  ${stats.isIndexing ? pc.yellow('in progress') : pc.green('idle')}`)

    if (stats.numberOfDocuments === 0) {
      console.log()
      console.log(pc.yellow('Index is empty.') + pc.dim(' Run ') + pc.cyan('npx specra search index') + pc.dim(' first.'))
      return
    }

    console.log()
    console.log(pc.bold('Sample queries'))
    for (const query of ['documentation', 'getting', 'guide']) {
      const results = await index.search(query, { limit: 3 })
      const first = results.hits[0] as any
      console.log(
        `  ${pc.cyan(`"${query}"`)} → ${results.hits.length} hit${results.hits.length === 1 ? '' : 's'} ` +
          pc.dim(`(${results.processingTimeMs}ms)`) +
          (first ? pc.dim(` · top: ${first.title}`) : '')
      )
    }

    const searchable = (await index.getSearchableAttributes()) ?? []
    const filterable = (await index.getFilterableAttributes()) ?? []
    console.log()
    console.log(pc.bold('Settings'))
    console.log(`  Searchable: ${pc.dim(searchable.join(', '))}`)
    console.log(`  Filterable: ${pc.dim(filterable.join(', '))}`)
    console.log()
    console.log(pc.green('✓ Search is working.'))
    console.log()
  } catch (err) {
    console.log()
    console.error(pc.red('Could not query the index.'))
    console.error(pc.red(err instanceof Error ? err.message : String(err)))
    console.error(pc.dim('Is the Meilisearch server running, and has the index been created with ') + pc.cyan('npx specra search index') + pc.dim('?'))
    process.exit(1)
  }
}
