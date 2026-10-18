import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { listClients } from '../api/clients'
import type { Client } from '../types'
import ClientListPage from './ClientListPage'

// Reemplaza todas las funciones de la API por versiones falsas: no se llama a Go.
vi.mock('../api/clients')

function makeClient(id: string, nombre: string, email: string): Client {
  return {
    id,
    nombre,
    email,
    telefono: '',
    direccion: '',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }
}

function renderPage() {
  // MemoryRouter = router sin navegador real; los <Link> de la página lo necesitan.
  return render(
    <MemoryRouter>
      <ClientListPage />
    </MemoryRouter>,
  )
}

describe('ClientListPage', () => {
  it('muestra los clientes que devuelve la API', async () => {
    vi.mocked(listClients).mockResolvedValue([
      makeClient('1', 'Ana Pérez', 'ana@x.com'),
      makeClient('2', 'Luis Gómez', 'luis@x.com'),
    ])

    renderPage()

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument()
  })

  it('muestra un mensaje de error si la API falla', async () => {
    vi.mocked(listClients).mockRejectedValue(new Error('Error 500'))

    renderPage()

    expect(await screen.findByText(/No se pudo cargar la lista: Error 500/)).toBeInTheDocument()
  })
})
