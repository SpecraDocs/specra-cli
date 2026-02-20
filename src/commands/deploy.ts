import pc from 'picocolors'
import ora from 'ora'
import { createArchive } from '../archive.js'
import { apiUpload, apiRequest, formatError } from '../api-client.js'
import { isAuthenticated, getConfig } from '../config.js'
import { existsSync, readFileSync } from 'fs'
import { join, resolve } from 'path'

interface DeployOptions {
  project?: string
  dir: string
}

export async function deploy(options: DeployOptions) {
  if (!isAuthenticated()) {
    console.error(pc.red('Not authenticated. Run `specra login` first.'))
    process.exit(1)
  }

  const dir = resolve(options.dir)
  let projectId = options.project

  // If no project specified, try to read from specra.config.json
  if (!projectId) {
    const configPath = join(dir, 'specra.config.json')
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf-8'))
        projectId = config.projectId
      } catch {
        // ignore
      }
    }
  }

  if (!projectId) {
    // List projects and ask user to pick
    let projects: Array<{ id: string; name: string; subdomain: string }>
    try {
      projects = await apiRequest<Array<{ id: string; name: string; subdomain: string }>>(
        '/api/projects'
      )
    } catch (err) {
      console.error(pc.red(formatError('Failed to fetch projects', err)))
      process.exit(1)
    }

    if (projects.length === 0) {
      console.error(
        pc.red('No projects found. Create one at https://specra-docs.com/dashboard/projects/new')
      )
      process.exit(1)
    }

    console.log(pc.bold('Select a project to deploy to:'))
    projects.forEach((p, i) => {
      console.log(`  ${pc.dim(`${i + 1}.`)} ${p.name} ${pc.dim(`(${p.subdomain}.docs.specra.dev)`)}`)
    })

    const prompts = await import('prompts')
    const response = await prompts.default({
      type: 'select',
      name: 'project',
      message: 'Project',
      choices: projects.map((p) => ({
        title: p.name,
        value: p.id,
        description: `${p.subdomain}.docs.specra.dev`,
      })),
    })

    if (!response.project) {
      console.log('Aborted.')
      process.exit(1)
    }

    projectId = response.project
  }

  const spinner = ora('Building project...').start()

  try {
    // 1. Build the project locally
    const buildDir = join(dir, 'build')
    const { execSync } = await import('child_process')

    try {
      execSync('npm run build', { cwd: dir, stdio: 'pipe' })
    } catch (err) {
      const stderr = err instanceof Error && 'stderr' in err
        ? (err as { stderr: Buffer }).stderr?.toString()
        : ''
      throw new Error(`Build failed:\n${stderr}`)
    }

    if (!existsSync(buildDir)) {
      throw new Error(
        'Build output not found. Expected a `build/` directory.\n' +
        'Make sure your project uses @sveltejs/adapter-static.'
      )
    }

    // 2. Archive the build output
    spinner.text = 'Packaging build output...'
    const archive = await createArchive(buildDir)
    spinner.text = `Uploading (${(archive.length / 1024).toFixed(0)}KB)...`

    // 3. Get git commit SHA if available
    let commitSha: string | undefined
    try {
      commitSha = execSync('git rev-parse HEAD', { cwd: dir })
        .toString()
        .trim()
    } catch {
      // not a git repo
    }

    // 4. Upload as pre-built
    const result = await apiUpload(
      `/api/projects/${projectId}/deploy`,
      archive,
      {
        'X-Deploy-Trigger': 'CLI',
        'X-Pre-Built': 'true',
        ...(commitSha ? { 'X-Commit-Sha': commitSha } : {}),
      }
    ) as { deploymentId: string }

    spinner.succeed(pc.green('Deployed!'))
    console.log()
    console.log(`  Deployment ID: ${pc.cyan(result.deploymentId)}`)

    const config = getConfig()
    console.log(
      `  View status:   ${pc.dim(`${config.apiUrl}/dashboard/projects/${projectId}/deployments`)}`
    )
    console.log()
  } catch (err) {
    spinner.fail(pc.red('Deploy failed'))
    console.error(pc.red(formatError('', err)))
    process.exit(1)
  }
}
