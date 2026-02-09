import { getConfig, getToken } from './config.js'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
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
