export type HttpMethod = "GET" | "POST"

export type MockHttpResponse<T> = {
  ok: boolean
  status: number
  data: T
}

export type MockHttpRoute = {
  method: HttpMethod
  path: string
  handler: () => unknown
}

export type MockHttpClientConfig = {
  routes: MockHttpRoute[]
  minDelayMs?: number
  maxDelayMs?: number
}

export type MockHttpClient = {
  get: <T>(path: string) => Promise<MockHttpResponse<T>>
  post: <T>(path: string, body?: unknown) => Promise<MockHttpResponse<T>>
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const resolveDelay = (minDelayMs: number, maxDelayMs: number) => {
  if (minDelayMs >= maxDelayMs) return minDelayMs
  return Math.floor(minDelayMs + Math.random() * (maxDelayMs - minDelayMs))
}

export const createMockHttpClient = (config: MockHttpClientConfig): MockHttpClient => {
  const minDelayMs = config.minDelayMs ?? 200
  const maxDelayMs = config.maxDelayMs ?? 800
  const routes = new Map<string, MockHttpRoute["handler"]>(
    config.routes.map((route) => [`${route.method} ${route.path}`, route.handler]),
  )

  const respond = async <T>(method: HttpMethod, path: string): Promise<MockHttpResponse<T>> => {
    const delayMs = resolveDelay(minDelayMs, maxDelayMs)
    if (delayMs > 0) await wait(delayMs)

    const handler = routes.get(`${method} ${path}`)
    if (!handler) {
      return { ok: false, status: 404, data: null as unknown as T }
    }

    try {
      const data = handler() as T
      return { ok: true, status: 200, data }
    } catch {
      return { ok: false, status: 500, data: null as unknown as T }
    }
  }

  return {
    get: (path) => respond("GET", path),
    post: (path) => respond("POST", path),
  }
}
