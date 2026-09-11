import { useState } from 'react'
import { CursorEffect } from '@/components/common/CursorEffect'
import { Spinner } from '@/components/common/Spinner'
import { Header } from '@/components/layout/Header'
import { NavigationTabs, type TabType } from '@/components/layout/NavigationTabs'
import { PageContainer } from '@/components/layout/PageContainer'
import { AuthPage } from '@/features/auth/components/AuthPage'
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext'
import { TasksPage } from '@/features/tasks/TasksPage'
import { UsersPage } from '@/features/users/UsersPage'
import { CompaniesPage } from '@/features/companies/CompaniesPage'
import './App.css'

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="app">
        <Spinner message="Cargando sesión..." />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="app">
        <AuthPage />
      </main>
    )
  }

  return (
    <main className="app">
      <Header />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <PageContainer>
        {activeTab === 'tasks' && <TasksPage />}
        {activeTab === 'users' && <UsersPage />}
        {activeTab === 'companies' && <CompaniesPage />}
      </PageContainer>
    </main>
  )
}

export function App() {
  return (
    <AuthProvider>
      <CursorEffect />
      <AppShell />
    </AuthProvider>
  )
}

export default App
