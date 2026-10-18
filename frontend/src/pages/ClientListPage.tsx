import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteClient, listClients } from '../api/clients'
import ClientTable from '../ClientTable'
import type { Client } from '../types'
import { btnPrimary } from '../ui'

function ClientListPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listClients()
      .then(setClients)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(client: Client) {
    if (!window.confirm(`¿Borrar a ${client.nombre}?`)) return

    try {
      await deleteClient(client.id)
      setClients((current) => current.filter((c) => c.id !== client.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo borrar')
    }
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>
  if (error) return <p className="text-red-700">No se pudo cargar la lista: {error}</p>

  return (
    <section className="space-y-4">
      <div className="flex justify-end">
        <Link to="/clientes/nuevo" className={btnPrimary}>
          Nuevo cliente
        </Link>
      </div>
      <ClientTable clients={clients} onDelete={handleDelete} />
    </section>
  )
}

export default ClientListPage
