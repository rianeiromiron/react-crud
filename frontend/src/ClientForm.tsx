import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Client, ClientInput } from './types'
import { btnPrimary, btnSecondary } from './ui'

interface ClientFormProps {
  client: Client | null // null = crear, con valor = editar
  onSave: (input: ClientInput) => Promise<void>
  onCancel: () => void
}

const labelClass = 'block text-sm font-medium text-gray-700'
const inputClass =
  'mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [values, setValues] = useState<ClientInput>({
    nombre: client?.nombre ?? '',
    email: client?.email ?? '',
    telefono: client?.telefono ?? '',
    direccion: client?.direccion ?? '',
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault() // evita que el navegador recargue la página

    if (values.nombre.trim() === '') {
      setError('El nombre es obligatorio')
      return
    }
    if (!values.email.includes('@')) {
      setError('El email no es válido')
      return
    }

    setError(null)
    setSaving(true)
    try {
      await onSave(values)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">{client ? 'Editar cliente' : 'Nuevo cliente'}</h2>

      <label className={labelClass}>
        Nombre
        <input name="nombre" value={values.nombre} onChange={handleChange} className={inputClass} />
      </label>
      <label className={labelClass}>
        Email
        <input name="email" value={values.email} onChange={handleChange} className={inputClass} />
      </label>
      <label className={labelClass}>
        Teléfono
        <input
          name="telefono"
          value={values.telefono}
          onChange={handleChange}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Dirección
        <input
          name="direccion"
          value={values.direccion}
          onChange={handleChange}
          className={inputClass}
        />
      </label>

      {error && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default ClientForm
