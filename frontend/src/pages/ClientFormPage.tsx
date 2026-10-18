import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createClient, getClient, updateClient } from '../api/clients'
import ClientForm from '../ClientForm'
import type { Client, ClientInput } from '../types'

// Sirve para dos rutas: /clientes/nuevo (sin id) y /clientes/:id/editar (con id).
function ClientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(id !== undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id === undefined) return
    getClient(id)
      .then(setClient)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave(input: ClientInput) {
    if (id === undefined) {
      await createClient(input)
    } else {
      await updateClient(id, input)
    }
    navigate('/')
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>
  if (error) return <p className="text-red-700">No se pudo cargar el cliente: {error}</p>

  return <ClientForm client={client} onSave={handleSave} onCancel={() => navigate('/')} />
}

export default ClientFormPage
