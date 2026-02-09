import pc from 'picocolors'
import { apiRequest } from '../api-client.js'
import { isAuthenticated } from '../config.js'

interface Project {
  id: string
  name: string
  subdomain: string
  customDomain: string | null
  deployments: Array<{ status: string }>
}

export async function projects() {
  if (!isAuthenticated()) {
    console.error(pc.red('Not authenticated. Run `specra login` first.'))
    process.exit(1)
  }

  const list = await apiRequest<Project[]>('/api/projects')

  if (list.length === 0) {
    console.log(pc.yellow('No projects found.'))
    console.log(
      `Create one at ${pc.dim('https://specra.dev/dashboard/projects/new')}`
    )
    return
  }

  console.log(pc.bold(`Projects (${list.length}):`))
  console.log()

  for (const p of list) {
    const status = p.deployments[0]?.status || 'NOT_DEPLOYED'
    const statusColor =
      status === 'RUNNING'
        ? pc.green
        : status === 'FAILED'
        ? pc.red
        : pc.dim

    console.log(
      `  ${pc.bold(p.name)} ${pc.dim(`(${p.id.slice(0, 8)})`)}  ${statusColor(status.toLowerCase())}`
    )
    console.log(`    ${pc.dim(`${p.subdomain}.docs.specra.dev`)}`)
    if (p.customDomain) {
      console.log(`    ${pc.dim(p.customDomain)}`)
    }
    console.log()
  }
}
