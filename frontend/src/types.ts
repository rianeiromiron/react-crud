// Forma de un cliente tal como lo devuelve la API en Go.
export interface Client {
  id: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  created_at: string
  updated_at: string
}

// Lo que enviamos a la API al crear o editar (sin id ni fechas: los pone el servidor).
export interface ClientInput {
  nombre: string
  email: string
  telefono: string
  direccion: string
}
