import type { Client, ClientInput } from '../types'

const API_URL = '/api/clients'

// Hace la petición y convierte cualquier respuesta de error en una excepción con mensaje.
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Error ${res.status}`)
  }
  if (res.status === 204) return undefined as T // borrar no devuelve cuerpo
  return res.json() as Promise<T>
}

function withBody(method: string, input: ClientInput): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }
}

export function listClients() {
  return request<Client[]>(API_URL)
}

export function getClient(id: string) {
  return request<Client>(`${API_URL}/${id}`)
}

export function createClient(input: ClientInput) {
  return request<Client>(API_URL, withBody('POST', input))
}

export function updateClient(id: string, input: ClientInput) {
  return request<Client>(`${API_URL}/${id}`, withBody('PUT', input))
}

export function deleteClient(id: string) {
  return request<void>(`${API_URL}/${id}`, { method: 'DELETE' })
}
