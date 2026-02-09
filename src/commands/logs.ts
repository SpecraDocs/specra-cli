import pc from 'picocolors'
import { apiRequest } from '../api-client.js'
import { isAuthenticated } from '../config.js'

interface Deployment {
  id: string
  status: string
  buildLogs: string | null
  containerLogs?: string
  trigger: string
  createdAt: string
}

interface DeploymentList {
  deployments: Deployment[]
}

export async function logs(
  projectId: string,
  options: { deployment?: string }
) {
  if (!isAuthenticated()) {
    console.error(pc.red('Not authenticated. Run `specra login` first.'))
    process.exit(1)
  }

  if (options.deployment) {
    // Get specific deployment
    const deploy = await apiRequest<Deployment>(
      `/api/projects/${projectId}/deployments/${options.deployment}`
    )

    printDeployment(deploy)
  } else {
    // Get latest deployment
    const data = await apiRequest<DeploymentList>(
      `/api/projects/${projectId}/deployments?limit=1`
    )

    if (data.deployments.length === 0) {
      console.log(pc.yellow('No deployments found.'))
      return
    }

    // Fetch full details with logs
    const deploy = await apiRequest<Deployment>(
      `/api/projects/${projectId}/deployments/${data.deployments[0].id}`
    )

    printDeployment(deploy)
  }
}

function printDeployment(deploy: Deployment) {
  console.log(pc.bold(`Deployment ${deploy.id.slice(0, 8)}`))
  console.log(`  Status:  ${colorStatus(deploy.status)}`)
  console.log(`  Trigger: ${deploy.trigger.toLowerCase()}`)
  console.log(`  Created: ${new Date(deploy.createdAt).toLocaleString()}`)
  console.log()

  if (deploy.buildLogs) {
    console.log(pc.bold('Build Logs:'))
    console.log(pc.dim('─'.repeat(60)))
    console.log(deploy.buildLogs)
    console.log(pc.dim('─'.repeat(60)))
  }

  if (deploy.containerLogs) {
    console.log()
    console.log(pc.bold('Container Logs:'))
    console.log(pc.dim('─'.repeat(60)))
    console.log(deploy.containerLogs)
    console.log(pc.dim('─'.repeat(60)))
  }
}

function colorStatus(status: string) {
  switch (status) {
    case 'RUNNING':
      return pc.green(status.toLowerCase())
    case 'FAILED':
      return pc.red(status.toLowerCase())
    case 'BUILDING':
    case 'DEPLOYING':
      return pc.yellow(status.toLowerCase())
    default:
      return pc.dim(status.toLowerCase())
  }
}
