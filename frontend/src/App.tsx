import { useState } from 'react'
import { CursorEffect } from '@/components/common/CursorEffect'
import { Header } from '@/components/layout/Header'
import { NavigationTabs, type TabType } from '@/components/layout/NavigationTabs'
import { PageContainer } from '@/components/layout/PageContainer'
import { TasksPage } from '@/features/tasks/TasksPage'
import { UsersPage } from '@/features/users/UsersPage'
import { CompaniesPage } from '@/features/companies/CompaniesPage'
import './App.css'

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('tasks')

  return (
    <>
      <CursorEffect />
      <main className="app">
        <Header />
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <PageContainer>
          {activeTab === 'tasks' && <TasksPage />}
          {activeTab === 'users' && <UsersPage />}
          {activeTab === 'companies' && <CompaniesPage />}
        </PageContainer>
      </main>
    </>
  )
}

export default App
