import { useState } from 'react'
import Tasks from './Tasks'
import Users from './Users'
import './App.css'

type Tab = 'tasks' | 'users'

function App() {
  const [tab, setTab] = useState<Tab>('tasks')

  return (
    <main className="app">
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
      </nav>

      {tab === 'tasks' ? <Tasks /> : <Users />}
    </main>
  )
}

export default App
