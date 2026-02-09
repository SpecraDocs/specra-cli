import { Command } from 'commander'
import pc from 'picocolors'

const program = new Command()

program
  .name('specra')
  .description('Specra CLI - Deploy and manage your documentation sites')
  .version('0.1.0')

program
  .command('login')
  .description('Authenticate with your Specra account')
  .action(async () => {
    const { login } = await import('./commands/login.js')
    await login()
  })

program
  .command('logout')
  .description('Clear stored credentials')
  .action(async () => {
    const { logout } = await import('./commands/logout.js')
    await logout()
  })

program
  .command('deploy')
  .description('Deploy your docs project')
  .option('-p, --project <id>', 'Project ID to deploy to')
  .option('-d, --dir <directory>', 'Docs directory to deploy', '.')
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

program.parse()

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(pc.red('Error:'), err)
  process.exit(1)
})
