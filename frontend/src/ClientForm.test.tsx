import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ClientForm from './ClientForm'

describe('ClientForm', () => {
  it('envía los datos escritos al guardar', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ClientForm client={null} onSave={onSave} onCancel={() => {}} />)

    await user.type(screen.getByLabelText('Nombre'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Email'), 'ana@x.com')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith({
      nombre: 'Ana Pérez',
      email: 'ana@x.com',
      telefono: '',
      direccion: '',
    })
  })
})
