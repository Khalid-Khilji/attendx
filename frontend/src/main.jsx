import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom"
import { Home, About, Contact, AdminDashboard, StudentDashboard, TeacherDashboard, Unauthorized, NotFound, Academic, Teacher, Student, AdminLog } from './pages/index.js'
import RoleGuard from './components/guards/RoleGuard'
import { ROLES } from './utils/constants'

const queryClient = new QueryClient()

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index element={<Home />} />
      <Route path='about' element={<About />} />
      <Route path='contact' element={<Contact />} />

      <Route path='admin' element={<RoleGuard allowedRoles={[ROLES.ADMIN]} />}>
        <Route path='dashboard' element={<AdminDashboard />} />
        <Route path='academics' element={<Academic />} />
        <Route path='teachers' element={<Teacher />} />
        <Route path='students' element={<Student />} />
        <Route path='logs' element={<AdminLog />} />
      </Route>

      <Route path='teacher' element={<RoleGuard allowedRoles={[ROLES.TEACHER]} />}>
        <Route path='dashboard' element={<TeacherDashboard />} />
      </Route>

      <Route path='student' element={<RoleGuard allowedRoles={[ROLES.STUDENT]} />}>
        <Route path='dashboard' element={<StudentDashboard />} />
      </Route>

      <Route path='unauthorized' element={<Unauthorized />} />
      <Route path='*' element={<NotFound />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
