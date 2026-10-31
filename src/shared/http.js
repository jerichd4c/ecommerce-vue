const BASE_URL = import.meta.env.VITE_API_URL

let getToken = () => null

// auth registra aquí de dónde sacar el token, así http.js no depende de auth
export function setTokenProvider(fn) {
  getToken = fn
}

export async function http(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`)
  return data
}
