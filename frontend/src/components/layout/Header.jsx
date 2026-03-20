import { useState, useMemo, lazy, Suspense } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Menu, X, Sun, Moon, LogOut, LayoutDashboard, ClipboardCheck,
  GraduationCap, Users, UserCog, BookOpen, Activity, Calendar
} from 'lucide-react'
import { Button } from '../index'
import { ROLES } from '../../utils/constants'
import useAuthStore from '../../stores/auth'
import useThemeStore from '../../stores/theme'

const Login = lazy(() => import('../index').then(m => ({ default: m.Login })))
const Logout = lazy(() => import('../index').then(m => ({ default: m.Logout })))

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)

  const { user, logout } = useAuthStore()
  const { isDark, toggleMode } = useThemeStore()
  const navigate = useNavigate()

  const handleLogoutConfirm = () => {
    logout()
    setIsLogoutOpen(false)
    setIsOpen(false)
    navigate('/')
  }

  const navLinks = useMemo(() => {
    if (!user) return [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
      { name: 'Contact', path: '/contact' },
    ]

    const baseLinks = {
      [ROLES.ADMIN]: [
        { name: 'Dash', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Core', path: '/admin/academics', icon: BookOpen },
        { name: 'Staff', path: '/admin/teachers', icon: Users },
        { name: 'Students', path: '/admin/students', icon: GraduationCap },
        { name: 'Schedule', path: '/admin/timetable', icon: Calendar },
        { name: 'Attendance', path: '/admin/attendance', icon: ClipboardCheck },
        { name: 'Audit', path: '/admin/logs', icon: Activity }
      ],
      [ROLES.TEACHER]: [
        { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
        { name: 'Mark', path: '/teacher/attendance', icon: ClipboardCheck },
        { name: 'Courses', path: '/teacher/courses', icon: GraduationCap },
        { name: 'Schedule', path: '/teacher/timetable', icon: Calendar },
        { name: 'Profile', path: '/teacher/profile', icon: UserCog },
      ],
      [ROLES.STUDENT]: [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Attendance', path: '/student/attendance', icon: ClipboardCheck },
        { name: 'Schedule', path: '/student/timetable', icon: Calendar },
        { name: 'Profile', path: '/student/profile', icon: UserCog },
      ]
    }
    return baseLinks[user.role] || []
  }, [user])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-4 md:px-8">
        <nav className="mx-auto max-w-7xl rounded-3xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur-2xl dark:border-zinc-800/50 dark:bg-zinc-950/70 transition-all duration-500 overflow-hidden">
          <div className="flex h-16 items-center justify-between px-6">

            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 p-2 text-white shadow-lg shadow-violet-500/20"
              >
                <GraduationCap size={22} strokeWidth={2.5} />
              </motion.div>
              <span className="text-xl font-black uppercase tracking-tighter dark:text-white">
                Attend<span className="text-violet-600">x</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl flex items-center gap-2.5 ${isActive
                      ? 'bg-violet-600 text-white shadow-xl shadow-violet-500/20'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`
                  }
                >
                  {link.icon && <link.icon size={14} strokeWidth={3} />}
                  {link.name}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={toggleMode}
                className="h-10 w-10 p-0 rounded-2xl border-none bg-zinc-100 dark:bg-zinc-800"
                icon={isDark ? Sun : Moon}
              />

              {user ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLogoutOpen(true)}
                  className="h-10 w-10 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <LogOut size={18} strokeWidth={2.5} />
                </motion.button>
              ) : (
                <div className="hidden sm:block">
                  <Button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-8 rounded-2xl text-[10px] font-black shadow-violet-600/20"
                  >
                    Portal Login
                  </Button>
                </div>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden h-10 w-10 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              >
                <div className="grid grid-cols-2 gap-3 p-6">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex flex-col items-center justify-center gap-3 p-5 rounded-4xl transition-all border-2 ${isActive
                          ? 'bg-violet-600 border-violet-600 text-white shadow-2xl'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-transparent text-zinc-500 dark:text-zinc-400'
                        }`
                      }
                    >
                      {link.icon && <link.icon size={22} strokeWidth={2.5} />}
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{link.name}</span>
                    </NavLink>
                  ))}

                  {!user && (
                    <div className="col-span-2 pt-2">
                      <Button
                        onClick={() => { setIsOpen(false); setIsLoginOpen(true); }}
                        className="w-full py-6 rounded-4xl text-xs font-black uppercase tracking-[0.2em]"
                      >
                        Enter Portal
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      <Suspense fallback={null}>
        <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        <Logout isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={handleLogoutConfirm} />
      </Suspense>
    </>
  )
}

export default Header