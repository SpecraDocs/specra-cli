import { Command } from 'commander'
import prompts from 'prompts'
import path from 'path'
import pc from 'picocolors'
import { createProject } from './create-project.js'
import { validateProjectName } from './utils.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

const program = new Command()

program
  .name('specra')
  .description('Specra CLI - Deploy and manage your documentation sites')
  .version(version)

program
  .command('create [project-directory]')
  .description('Create a new Specra documentation site')
  .option('--template <template>', 'Template to use (minimal, book-docs, jbrains-docs)')
  .option('--use-npm', 'Use npm as the package manager')
  .option('--use-pnpm', 'Use pnpm as the package manager')
  .option('--use-yarn', 'Use yarn as the package manager')
  .option('--skip-install', 'Skip package installation')
  .action(async (projectDirectory: string | undefined, options) => {
    console.log()
    console.log(pc.bold(pc.cyan('Create Specra Documentation Site')))
    console.log()

    let projectName = projectDirectory

    if (!projectName) {
      const response = await prompts({
        type: 'text',
        name: 'projectName',
        message: 'What is your project named?',
        initial: 'my-docs',
        validate: (name) => {
          const validation = validateProjectName(name)
          if (validation.valid) return true
          return validation.problems![0]
        },
      })

      if (!response.projectName) {
        console.log()
        console.log('Aborting.')
        process.exit(1)
      }

      projectName = response.projectName
    }

    const projectBaseName = path.basename(path.resolve(projectName!))
    const validation = validateProjectName(projectBaseName)
    if (!validation.valid) {
      console.error(
        pc.red(
          `Cannot create a project named ${pc.cyan(
            `"${projectBaseName}"`
          )} because of npm naming restrictions:\n`
        )
      )
      validation.problems!.forEach((p) =>
        console.error(`  ${pc.red('•')} ${p}`)
      )
      process.exit(1)
    }

    let template = options.template
    if (!template) {
      const response = await prompts({
        type: 'select',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: [
          { title: 'Minimal', value: 'minimal', description: 'Minimal setup to get started quickly' },
          { title: 'Book Docs', value: 'book-docs', description: 'Knowledge base style with dark theme and categorized sidebar' },
          { title: 'JBrains Docs', value: 'jbrains-docs', description: 'Reference docs style with light theme and tab groups' },
          { title: 'Modern', value: 'modern', description: 'Vite-inspired dark theme with flat sidebar and multi-product support' },
        ],
        initial: 0,
      })

      if (!response.template) {
        console.log()
        console.log('Aborting.')
        process.exit(1)
      }

      template = response.template
    }

    let packageManager = options.useNpm
      ? 'npm'
      : options.usePnpm
      ? 'pnpm'
      : options.useYarn
      ? 'yarn'
      : undefined

    if (!packageManager && !options.skipInstall) {
      const response = await prompts({
        type: 'select',
        name: 'packageManager',
        message: 'Which package manager do you want to use?',
        choices: [
          { title: 'npm', value: 'npm' },
          { title: 'yarn', value: 'yarn' },
          { title: 'pnpm', value: 'pnpm' },
        ],
        initial: 0,
      })

      if (!response.packageManager) {
        console.log()
        console.log('Aborting.')
        process.exit(1)
      }

      packageManager = response.packageManager
    }

    try {
      await createProject({
        projectName: projectName!,
        template: template || 'minimal',
        packageManager: packageManager || 'npm',
        skipInstall: options.skipInstall,
      })
    } catch (error) {
      console.error(pc.red('\nError creating project:'))
      console.error(error)
      process.exit(1)
    }
  })

program
  .command('login')
  .description('Authenticate with your Specra account')
  .option('-g, --global', 'Store credentials in ~/.specra/ instead of local specra.config.json')
  .action(async (options) => {
    const { login } = await import('./commands/login.js')
    await login(options)
  })

program
  .command('logout')
  .description('Clear stored credentials')
  .option('-g, --global', 'Clear credentials from ~/.specra/ instead of local specra.config.json')
  .action(async (options) => {
    const { logout } = await import('./commands/logout.js')
    await logout(options)
  })

program
  .command('deploy')
  .description('Deploy your docs project')
  .option('-p, --project <id>', 'Project ID to deploy to')
  .option('-d, --dir <directory>', 'Docs directory to deploy', '.')
  .option('-v, --verbose', 'Show detailed build output and logs')
  .action(async (options) => {
    const { deploy } = await import('./commands/deploy.js')
    await deploy(options)
  })

program
  .command('projects')
  .description('List your projects')
  .action(async () => {
    const { projects } = await import('./commands/projects.js')
    await projects()
  })

program
  .command('logs')
  .description('View deployment logs')
  .argument('<projectId>', 'Project ID')
  .option('--deployment <id>', 'Specific deployment ID')
  .action(async (projectId: string, options) => {
    const { logs } = await import('./commands/logs.js')
    await logs(projectId, options)
  })

program
  .command('doctor')
  .description('Check specra.config.json for issues')
  .option('-d, --dir <directory>', 'Project directory to check', '.')
  .action(async (options) => {
    const { doctor } = await import('./commands/doctor.js')
    await doctor(options)
  })

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

program.parse()

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(pc.red('Error:'), err)
  process.exit(1)
})
