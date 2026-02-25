import pc from 'picocolors'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'

interface DoctorOptions {
  dir: string
}

interface DiagnosticResult {
  label: string
  status: 'pass' | 'warn' | 'fail'
  message: string
}

export async function doctor(options: DoctorOptions) {
  const dir = resolve(options.dir)
  const results: DiagnosticResult[] = []

  console.log()
  console.log(pc.bold('Specra Doctor'))
  console.log(pc.dim(`Checking project in ${dir}`))
  console.log()

  // 1. Check specra.config.json exists
  const configPath = join(dir, 'specra.config.json')
  if (!existsSync(configPath)) {
    results.push({
      label: 'specra.config.json',
      status: 'fail',
      message: 'File not found. Run `create-specra init` to create a new project.',
    })
    printResults(results)
    return
  }

  results.push({
    label: 'specra.config.json',
    status: 'pass',
    message: 'Found',
  })

  // 2. Parse config
  let config: Record<string, any>
  try {
    const raw = readFileSync(configPath, 'utf-8')
    config = JSON.parse(raw)
  } catch (err) {
    results.push({
      label: 'Config parsing',
      status: 'fail',
      message: `Invalid JSON: ${err instanceof Error ? err.message : err}`,
    })
    printResults(results)
    return
  }

  results.push({
    label: 'Config parsing',
    status: 'pass',
    message: 'Valid JSON',
  })

  // 3. Check required: site
  if (!config.site) {
    results.push({
      label: 'site',
      status: 'fail',
      message: 'Missing required "site" section',
    })
  } else {
    // Check site.title
    if (!config.site.title || typeof config.site.title !== 'string') {
      results.push({
        label: 'site.title',
        status: 'fail',
        message: 'Missing required "site.title" (string)',
      })
    } else {
      results.push({
        label: 'site.title',
        status: 'pass',
        message: config.site.title,
      })
    }

    // Check site.description
    if (!config.site.description) {
      results.push({
        label: 'site.description',
        status: 'warn',
        message: 'No description set. Recommended for SEO.',
      })
    } else {
      results.push({
        label: 'site.description',
        status: 'pass',
        message: 'Set',
      })
    }

    // Check site.url
    if (!config.site.url) {
      results.push({
        label: 'site.url',
        status: 'warn',
        message: 'No URL set. Recommended for canonical URLs and SEO.',
      })
    } else {
      results.push({
        label: 'site.url',
        status: 'pass',
        message: config.site.url,
      })
    }
  }

  // 4. Check versioning + docs directory
  const versioning = config.features?.versioning !== false
  const docsDir = join(dir, 'docs')

  if (existsSync(docsDir)) {
    results.push({
      label: 'docs/ directory',
      status: 'pass',
      message: 'Found',
    })

    if (versioning) {
      // Check for version directories
      const entries = readdirSync(docsDir, { withFileTypes: true })
      const versionDirs = entries.filter((e) => e.isDirectory())

      if (versionDirs.length === 0) {
        results.push({
          label: 'Version directories',
          status: 'fail',
          message: 'Versioning enabled but no version directories found in docs/ (e.g., docs/v1.0.0/)',
        })
      } else {
        const names = versionDirs.map((d) => d.name).join(', ')
        results.push({
          label: 'Version directories',
          status: 'pass',
          message: `Found: ${names}`,
        })

        // Check activeVersion matches a directory
        if (config.site?.activeVersion) {
          const hasMatch = versionDirs.some((d) => d.name === config.site.activeVersion)
          if (!hasMatch) {
            results.push({
              label: 'site.activeVersion',
              status: 'warn',
              message: `"${config.site.activeVersion}" does not match any docs directory (${names})`,
            })
          } else {
            results.push({
              label: 'site.activeVersion',
              status: 'pass',
              message: config.site.activeVersion,
            })
          }
        } else {
          results.push({
            label: 'site.activeVersion',
            status: 'warn',
            message: 'Not set. The first version directory will be used as default.',
          })
        }
      }
    }
  } else {
    results.push({
      label: 'docs/ directory',
      status: 'fail',
      message: 'Not found. Create a docs/ directory with your documentation files.',
    })
  }

  // 5. Check search config
  if (config.search?.provider === 'meilisearch') {
    if (!config.search.meilisearch?.host) {
      results.push({
        label: 'search.meilisearch.host',
        status: 'fail',
        message: 'Meilisearch provider selected but no host configured',
      })
    }
    if (!config.search.meilisearch?.indexName) {
      results.push({
        label: 'search.meilisearch.indexName',
        status: 'fail',
        message: 'Meilisearch provider selected but no indexName configured',
      })
    }
    if (config.search.meilisearch?.host && config.search.meilisearch?.indexName) {
      results.push({
        label: 'Search (Meilisearch)',
        status: 'pass',
        message: `${config.search.meilisearch.host} / ${config.search.meilisearch.indexName}`,
      })
    }
  }

  // 6. Check i18n config
  if (config.features?.i18n && typeof config.features.i18n === 'object') {
    const i18n = config.features.i18n
    if (!i18n.defaultLocale) {
      results.push({
        label: 'i18n.defaultLocale',
        status: 'fail',
        message: 'i18n enabled but no defaultLocale set',
      })
    }
    if (!i18n.locales || !Array.isArray(i18n.locales) || i18n.locales.length === 0) {
      results.push({
        label: 'i18n.locales',
        status: 'fail',
        message: 'i18n enabled but no locales array defined',
      })
    }
    if (i18n.defaultLocale && i18n.locales?.length) {
      results.push({
        label: 'Internationalization',
        status: 'pass',
        message: `${i18n.locales.join(', ')} (default: ${i18n.defaultLocale})`,
      })
    }
  }

  // 7. Check package.json for specra dependency
  const pkgPath = join(dir, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      if (deps['specra']) {
        results.push({
          label: 'specra dependency',
          status: 'pass',
          message: `${deps['specra']}`,
        })
      } else {
        results.push({
          label: 'specra dependency',
          status: 'fail',
          message: 'specra package not found in dependencies. Run `npm install specra`.',
        })
      }
    } catch {
      // ignore parse errors
    }
  }

  // 8. Check auth configuration
  if (config.auth?.token) {
    results.push({
      label: 'auth.token in config',
      status: 'warn',
      message: 'Raw token found in specra.config.json. Run `specra login` again to migrate it to .env.',
    })
  } else if (config.auth?.tokenEnv) {
    // Check the .env file has the referenced var
    const envPath = join(dir, '.env')
    if (existsSync(envPath)) {
      try {
        const envContent = readFileSync(envPath, 'utf-8')
        const hasVar = envContent.split('\n').some((line: string) => line.trim().startsWith(`${config.auth.tokenEnv}=`))
        if (hasVar) {
          results.push({
            label: 'Auth',
            status: 'pass',
            message: `Token stored in .env as ${config.auth.tokenEnv}`,
          })
        } else {
          results.push({
            label: 'Auth',
            status: 'fail',
            message: `specra.config.json references ${config.auth.tokenEnv} but it's not set in .env. Run \`specra login\`.`,
          })
        }
      } catch {
        results.push({
          label: 'Auth',
          status: 'fail',
          message: `.env file unreadable. Run \`specra login\` to re-authenticate.`,
        })
      }
    } else {
      results.push({
        label: 'Auth',
        status: 'fail',
        message: `No .env file found but specra.config.json references ${config.auth.tokenEnv}. Run \`specra login\`.`,
      })
    }
  } else if (config.auth?.source === 'global') {
    results.push({
      label: 'Auth',
      status: 'pass',
      message: 'Using global credentials from ~/.specra/config.json',
    })
  }

  // 9. Check navigation.tabGroups have required fields
  if (config.navigation?.tabGroups && Array.isArray(config.navigation.tabGroups)) {
    const tabGroups = config.navigation.tabGroups
    const invalid = tabGroups.filter((t: any) => !t.id || !t.label)
    if (invalid.length > 0) {
      results.push({
        label: 'navigation.tabGroups',
        status: 'fail',
        message: `${invalid.length} tab group(s) missing required "id" or "label" fields`,
      })
    } else {
      results.push({
        label: 'navigation.tabGroups',
        status: 'pass',
        message: `${tabGroups.length} tab group(s) configured`,
      })
    }
  }

  printResults(results)
}

function printResults(results: DiagnosticResult[]) {
  const icons = {
    pass: pc.green('✓'),
    warn: pc.yellow('⚠'),
    fail: pc.red('✗'),
  }

  for (const r of results) {
    const icon = icons[r.status]
    const label = r.status === 'fail' ? pc.red(r.label) : r.status === 'warn' ? pc.yellow(r.label) : r.label
    console.log(`  ${icon} ${label}: ${pc.dim(r.message)}`)
  }

  const fails = results.filter((r) => r.status === 'fail').length
  const warns = results.filter((r) => r.status === 'warn').length
  const passes = results.filter((r) => r.status === 'pass').length

  console.log()
  if (fails > 0) {
    console.log(pc.red(`  ${fails} error(s)`), warns > 0 ? pc.yellow(`${warns} warning(s)`) : '', pc.green(`${passes} passed`))
  } else if (warns > 0) {
    console.log(pc.yellow(`  ${warns} warning(s)`), pc.green(`${passes} passed`))
  } else {
    console.log(pc.green(`  All ${passes} checks passed!`))
  }
  console.log()
}
