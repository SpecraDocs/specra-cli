import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import pc from 'picocolors'
import {
  isWriteable,
  isFolderEmpty,
  getPackageManagerCommand,
  tryGitInit,
  copyRecursive,
} from './utils.js'

interface CreateProjectOptions {
  projectName: string
  template: string
  packageManager: string
  skipInstall: boolean
}

export async function createProject({
  projectName,
  template,
  packageManager,
  skipInstall,
}: CreateProjectOptions) {
  const root = path.resolve(projectName)
  const appName = path.basename(root)

  // Check if directory exists
  if (fs.existsSync(root)) {
    if (!isWriteable(root)) {
      console.error(
        pc.red(`The directory ${pc.cyan(projectName)} is not writable.`)
      )
      process.exit(1)
    }

    if (!isFolderEmpty(root)) {
      console.error(
        pc.red(
          `The directory ${pc.cyan(
            projectName
          )} contains files that could conflict. Please use a new directory.`
        )
      )
      process.exit(1)
    }
  } else {
    fs.mkdirSync(root, { recursive: true })
  }

  console.log(`Creating a new Specra documentation site (SvelteKit) in ${pc.cyan(root)}`)
  console.log()

  // Create project structure based on template
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const templateDir = path.join(__dirname, '..', 'templates', template)

  if (!fs.existsSync(templateDir)) {
    console.error(pc.red(`Template ${pc.cyan(template)} not found.`))
    process.exit(1)
  }

  console.log(`Using template: ${pc.cyan(template)}`)
  console.log()

  // Copy template files
  copyRecursive(templateDir, root)

  // Update package.json with project name
  const packageJsonPath = path.join(root, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  packageJson.name = appName
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  // Rename gitignore
  const gitignorePath = path.join(root, 'gitignore')
  if (fs.existsSync(gitignorePath)) {
    fs.renameSync(gitignorePath, path.join(root, '.gitignore'))
  }

  // Install dependencies
  if (!skipInstall) {
    console.log('Installing dependencies...')
    console.log()

    const command = getPackageManagerCommand(packageManager)

    try {
      execSync(command.install, { cwd: root, stdio: 'inherit' })
    } catch (error) {
      console.error(pc.red('Failed to install dependencies.'))
      process.exit(1)
    }

    console.log()
  }

  // Initialize git
  if (tryGitInit(root)) {
    console.log('Initialized a git repository.')
    console.log()
  }

  // Success message
  console.log(pc.green('Success!') + ` Created ${appName} at ${root}`)
  console.log()
  console.log('Inside that directory, you can run several commands:')
  console.log()

  const command = getPackageManagerCommand(packageManager)

  console.log(pc.cyan(`  ${command.run('dev')}`))
  console.log('    Starts the development server.')
  console.log()
  console.log(pc.cyan(`  ${command.run('build')}`))
  console.log('    Builds the app for production.')
  console.log()
  console.log(pc.cyan(`  ${command.run('preview')}`))
  console.log('    Previews the built app locally.')
  console.log()
  console.log('We suggest that you begin by typing:')
  console.log()
  console.log(pc.cyan('  cd'), projectName)
  console.log(`  ${pc.cyan(command.run('dev'))}`)
  console.log()
}
