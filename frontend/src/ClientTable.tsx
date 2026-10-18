import { Link } from 'react-router-dom'
import type { Client } from './types'
import { btnDanger, btnSecondary } from './ui'

interface ClientTableProps {
  clients: Client[]
  onDelete: (client: Client) => void
}

function ClientTable({ clients, onDelete }: ClientTableProps) {
  if (clients.length === 0) {
    return <p className="text-gray-500">No hay clientes todavía.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-4 py-3 font-semibold">Nombre</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Teléfono</th>
            <th className="px-4 py-3 font-semibold">Dirección</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-t border-gray-200">
              <td className="px-4 py-3">
                <Link
                  to={`/clientes/${client.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {client.nombre}
                </Link>
              </td>
              <td className="px-4 py-3">{client.email}</td>
              <td className="px-4 py-3">{client.telefono}</td>
              <td className="px-4 py-3">{client.direccion}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link to={`/clientes/${client.id}/editar`} className={btnSecondary}>
                    Editar
                  </Link>
                  <button onClick={() => onDelete(client)} className={btnDanger}>
                    Borrar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ClientTable
