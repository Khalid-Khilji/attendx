import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom"
import { ROLES } from './utils/constants'
import { Loader } from './components'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
})

const App = lazy(() => import('./App.jsx'))
const RoleGuard = lazy(() => import('./components/guards/RoleGuard'))

const Home = lazy(() => import('./pages/guest/Home'))
const About = lazy(() => import('./pages/guest/About'))
const Contact = lazy(() => import('./pages/guest/Contact'))

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const Academic = lazy(() => import('./pages/admin/Academic'))
const Teacher = lazy(() => import('./pages/admin/Teacher'))
const Student = lazy(() => import('./pages/admin/Student'))
const AdminTimetable = lazy(() => import('./pages/admin/AdminTimetable'))
const AdminAttendance = lazy(() => import('./pages/admin/AdminAttendance'))
const AdminLog = lazy(() => import('./pages/admin/AdminLog'))

const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'))
const TeacherTimetable = lazy(() => import('./pages/teacher/TeacherTimetable'))
const TeacherAttendance = lazy(() => import('./pages/teacher/TeacherAttendance'))
const TeacherProfile = lazy(() => import('./pages/teacher/TeacherProfile'))
const TeacherCourses = lazy(() => import('./pages/teacher/TeacherCourses'))

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const StudentAttendance = lazy(() => import('./pages/student/StudentAttendance'))
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'))
const StudentTimetable = lazy(() => import('./pages/student/StudentTimetable'))

const Unauthorized = lazy(() => import('./pages/errors/Unauthorized'))
const NotFound = lazy(() => import('./pages/errors/NotFound'))

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Suspense fallback={<Loader fullPage />}><App /></Suspense>}>
      <Route index element={<Home />} />
      <Route path='about' element={<About />} />
      <Route path='contact' element={<Contact />} />

      <Route path='admin' element={<RoleGuard allowedRoles={[ROLES.ADMIN]} />}>
        <Route path='dashboard' element={<AdminDashboard />} />
        <Route path='academics' element={<Academic />} />
        <Route path='teachers' element={<Teacher />} />
        <Route path='students' element={<Student />} />
        <Route path='timetable' element={<AdminTimetable />} />
        <Route path='attendance' element={<AdminAttendance />} />
        <Route path='logs' element={<AdminLog />} />
      </Route>

      <Route path='teacher' element={<RoleGuard allowedRoles={[ROLES.TEACHER]} />}>
        <Route path='dashboard' element={<TeacherDashboard />} />
        <Route path='timetable' element={<TeacherTimetable />} />
        <Route path='attendance' element={<TeacherAttendance />} />
        <Route path='profile' element={<TeacherProfile />} />
        <Route path='courses' element={<TeacherCourses />} />
      </Route>

      <Route path='student' element={<RoleGuard allowedRoles={[ROLES.STUDENT]} />}>
        <Route path='dashboard' element={<StudentDashboard />} />
        <Route path='attendance' element={<StudentAttendance />} />
        <Route path='profile' element={<StudentProfile />} />
        <Route path='timetable' element={<StudentTimetable />} />
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
  </StrictMode>
)