import { Command } from 'commander'
import prompts from 'prompts'
import { createProject } from './create-project.js'
import { validateProjectName } from './utils.js'
import pc from 'picocolors'

const program = new Command()

program
  .name('create-specra')
  .description('Specra CLI - Create, deploy, and manage your documentation sites')
  .version('0.1.8')

// init command - create a new project (default when no subcommand given)
const initCmd = program
  .command('init [project-directory]', { isDefault: true })
  .description('Create a new Specra documentation site')
  .option('--template <template>', 'Template to use (minimal)')
  .option('--use-npm', 'Use npm as the package manager')
  .option('--use-pnpm', 'Use pnpm as the package manager')
  .option('--use-yarn', 'Use yarn as the package manager')
  .option('--skip-install', 'Skip package installation')
  .action(async (projectDirectory: string | undefined, options) => {
    console.log()
    console.log(pc.bold(pc.cyan('Create Specra Documentation Site')))
    console.log()

    let projectName = projectDirectory

    // Prompt for project name if not provided
    if (!projectName) {
      const response = await prompts({
        type: 'text',
        name: 'projectName',
        message: 'What is your project named?',
        initial: 'my-docs',
        validate: (name) => {
          const validation = validateProjectName(name)
          if (validation.valid) {
            return true
          }
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

    // Validate project name
    const validation = validateProjectName(projectName!)
    if (!validation.valid) {
      console.error(
        pc.red(
          `Cannot create a project named ${pc.cyan(
            `"${projectName}"`
          )} because of npm naming restrictions:\n`
        )
      )
      validation.problems!.forEach((p) =>
        console.error(`  ${pc.red('•')} ${p}`)
      )
      process.exit(1)
    }

    // Prompt for template if not provided
    let template = options.template

    if (!template) {
      const response = await prompts({
        type: 'select',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: [
          {
            title: 'Minimal',
            value: 'minimal',
            description: 'Minimal setup to get started quickly',
          },
          {
            title: 'Book Docs',
            value: 'book-docs',
            description: 'Knowledge base style with dark theme and categorized sidebar',
          },
          {
            title: 'JBrains Docs',
            value: 'jbrains-docs',
            description: 'Reference docs style with light theme and tab groups',
          },
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

    // Detect or prompt for package manager
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

    // Create the project
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

// login
program
  .command('login')
  .description('Authenticate with your Specra account')
  .option('-g, --global', 'Store credentials in ~/.specra/ instead of local specra.config.json')
  .action(async (options) => {
    const { login } = await import('./commands/login.js')
    await login(options)
  })

// logout
program
  .command('logout')
  .description('Clear stored credentials')
  .option('-g, --global', 'Clear credentials from ~/.specra/ instead of local specra.config.json')
  .action(async (options) => {
    const { logout } = await import('./commands/logout.js')
    await logout(options)
  })

// deploy
program
  .command('deploy')
  .description('Deploy your docs project')
  .option('-p, --project <id>', 'Project ID to deploy to')
  .option('-d, --dir <directory>', 'Docs directory to deploy', '.')
  .action(async (options) => {
    const { deploy } = await import('./commands/deploy.js')
    await deploy(options)
  })

// projects
program
  .command('projects')
  .description('List your projects')
  .action(async () => {
    const { projects } = await import('./commands/projects.js')
    await projects()
  })

// logs
program
  .command('logs')
  .description('View deployment logs')
  .argument('<projectId>', 'Project ID')
  .option('--deployment <id>', 'Specific deployment ID')
  .action(async (projectId: string, options) => {
    const { logs } = await import('./commands/logs.js')
    await logs(projectId, options)
  })

// doctor
program
  .command('doctor')
  .description('Check specra.config.json for issues')
  .option('-d, --dir <directory>', 'Project directory to check', '.')
  .action(async (options) => {
    const { doctor } = await import('./commands/doctor.js')
    await doctor(options)
  })

program.parse()

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(pc.red('Error:'), err)
  process.exit(1)
})
