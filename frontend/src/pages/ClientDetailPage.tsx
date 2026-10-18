import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getClient } from '../api/clients'
import type { Client } from '../types'
import { btnPrimary, btnSecondary } from '../ui'

function ClientDetailPage() {
  const { id } = useParams()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id === undefined) return
    getClient(id)
      .then(setClient)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-gray-500">Cargando...</p>
  if (error || client === null) {
    return <p className="text-red-700">No se pudo cargar el cliente: {error}</p>
  }

  return (
    <section className="max-w-lg space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{client.nombre}</h2>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="font-medium text-gray-500">Email</dt>
          <dd>{client.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Teléfono</dt>
          <dd>{client.telefono || '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Dirección</dt>
          <dd>{client.direccion || '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Creado</dt>
          <dd>{new Date(client.created_at).toLocaleString()}</dd>
        </div>
      </dl>
      <div className="flex gap-2">
        <Link to={`/clientes/${client.id}/editar`} className={btnPrimary}>
          Editar
        </Link>
        <Link to="/" className={btnSecondary}>
          Volver
        </Link>
      </div>
    </section>
  )
}

export default ClientDetailPage
