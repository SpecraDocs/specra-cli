import { Command } from 'commander'
import prompts from 'prompts'
import { createProject } from './create-project.js'
import { validateProjectName } from './utils.js'
import pc from 'picocolors'

const program = new Command()

program
  .name('create-specra')
  .description('Create a new Specra documentation site')
  .argument('[project-directory]', 'Directory to create the project in')
  .option('--template <template>', 'Template to use (default, minimal, api-focused)')
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
          // {
          //   title: 'Default',
          //   value: 'default',
          //   description: 'Full-featured documentation site with examples',
          // },
          {
            title: 'Minimal',
            value: 'minimal',
            description: 'Minimal setup to get started quickly',
          },
          // {
          //   title: 'API-Focused',
          //   value: 'api-focused',
          //   description: 'Optimized for API documentation',
          // },
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
        template: template || 'default',
        packageManager: packageManager || 'npm',
        skipInstall: options.skipInstall,
      })
    } catch (error) {
      console.error(pc.red('\nError creating project:'))
      console.error(error)
      process.exit(1)
    }
  })

program.parse()
