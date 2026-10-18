import { Link, Route, Routes } from 'react-router-dom'
import ClientDetailPage from './pages/ClientDetailPage'
import ClientFormPage from './pages/ClientFormPage'
import ClientListPage from './pages/ClientListPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="mx-auto max-w-4xl p-6">
        <header className="mb-6 border-b border-gray-200 pb-4">
          <Link to="/">
            <h1 className="text-2xl font-bold">Panel de Clientes</h1>
          </Link>
        </header>

        <Routes>
          <Route path="/" element={<ClientListPage />} />
          <Route path="/clientes/nuevo" element={<ClientFormPage />} />
          <Route path="/clientes/:id" element={<ClientDetailPage />} />
          <Route path="/clientes/:id/editar" element={<ClientFormPage />} />
          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
