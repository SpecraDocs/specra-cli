import { getConfig, getToken } from './config.js'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const STATUS_HINTS: Record<number, string> = {
  401: 'Try running `specra login` to re-authenticate.',
  403: 'You may not have permission for this action. Check your plan or project access.',
  502: 'The server is temporarily unavailable. Try again in a moment.',
  503: 'The server is temporarily unavailable. Try again in a moment.',
}

/** Format an error for CLI display (no stack traces). */
export function formatError(context: string, err: unknown): string {
  const prefix = context ? `${context}: ` : ''
  if (err instanceof ApiError) {
    const hint = STATUS_HINTS[err.status] || ''
    return `${prefix}${err.message} (${err.status})${hint ? `\n  ${hint}` : ''}`
  }
  if (err instanceof Error) {
    return `${prefix}${err.message}`
  }
  return `${prefix}${String(err)}`
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getConfig()
  const token = getToken()

  if (!token) {
    throw new Error('Not authenticated. Run `specra login` first.')
  }

  const url = `${config.apiUrl}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    let message: string
    try {
      const data = (await res.json()) as Record<string, string>
      message = data.error || res.statusText
    } catch {
      message = res.statusText
    }
    throw new ApiError(res.status, message)
  }

  return res.json() as Promise<T>
}

export async function apiUpload(
  path: string,
  body: Buffer | ReadableStream,
  headers: Record<string, string> = {}
): Promise<unknown> {
  const config = getConfig()
  const token = getToken()

  if (!token) {
    throw new Error('Not authenticated. Run `specra login` first.')
  }

  const url = `${config.apiUrl}${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      ...headers,
    },
    body,
  })

  if (!res.ok) {
    let message: string
    try {
      const data = (await res.json()) as Record<string, string>
      message = data.error || res.statusText
    } catch {
      message = res.statusText
    }
    throw new ApiError(res.status, message)
  }

  return res.json()
}
