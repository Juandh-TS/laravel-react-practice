import { useState } from 'react'
import Tasks from './Tasks'
import Users from './Users'
import Companies from './Companies'
import './App.css'

type Tab = 'tasks' | 'users' | 'companies'

function App() {
  const [tab, setTab] = useState<Tab>('tasks')

  return (
    <main className="app">
      <p className="brand">Laravel + React Practice</p>

      <nav className="tabs">
        <button
          type="button"
          className={tab === 'tasks' ? 'active' : ''}
          onClick={() => setTab('tasks')}
        >
          Tareas
        </button>
        <button
          type="button"
          className={tab === 'users' ? 'active' : ''}
          onClick={() => setTab('users')}
        >
          Usuarios
        </button>
        <button
          type="button"
          className={tab === 'companies' ? 'active' : ''}
          onClick={() => setTab('companies')}
        >
          Empresas
        </button>
      </nav>

      <div className="panel">
        {tab === 'tasks' && <Tasks />}
        {tab === 'users' && <Users />}
        {tab === 'companies' && <Companies />}
      </div>
    </main>
  )
}

export default App
