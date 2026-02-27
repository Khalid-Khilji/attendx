import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard, ClipboardCheck, GraduationCap, Users, UserCog, Settings } from 'lucide-react'
import { Button, Login, Logout } from '../index'
import { ROLES } from '../../utils/constants'
import useAuthStore from '../../stores/auth'
import useThemeStore from '../../stores/theme'

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

  const getNavLinks = () => {
    if (!user) {
      return [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
      ]
    }

    if (user?.role === ROLES.ADMIN) {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Teachers', path: '/admin/teachers', icon: Users },
        { name: 'Students', path: '/admin/students', icon: GraduationCap },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
    
    if (user?.role === ROLES.TEACHER) {
      return [
        { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
        { name: 'Take Attendance', path: '/teacher/attendance', icon: ClipboardCheck },
        { name: 'Students', path: '/teacher/students', icon: GraduationCap },
      ]
    }
    
    if (user?.role === ROLES.STUDENT) {
      return [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'My Attendance', path: '/student/attendance', icon: ClipboardCheck },
        { name: 'Profile', path: '/student/profile', icon: UserCog },
      ]
    }

    return []
  }

  const navLinks = getNavLinks()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-3 md:px-6 md:py-4">
        <nav className="mx-auto max-w-7xl rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-950/80">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">

            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-violet-600 p-1.5 text-white">
                <GraduationCap size={20} />
              </div>
              <span className="text-lg font-bold uppercase tracking-tight dark:text-white">
                Attend<span className="text-violet-600">x</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-2 ${
                      isActive 
                        ? 'bg-violet-600 text-white' 
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`
                  }
                >
                  {link.icon && <link.icon size={16} />}
                  {link.name}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMode}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white/50 text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="hidden sm:flex items-center gap-2">
                {user ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsLogoutOpen(true)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700"
                  >
                    Login
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white/50 text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {isOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden border-t border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                <div className="flex flex-col p-3 space-y-1">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `px-4 py-2.5 text-sm font-medium rounded-lg flex items-center gap-3 ${
                          isActive 
                            ? 'bg-violet-600 text-white' 
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
                        }`
                      }
                    >
                      {link.icon && <link.icon size={16} />}
                      {link.name}
                    </NavLink>
                  ))}

                  <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800">
                    {user ? (
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          setIsLogoutOpen(true)
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 rounded-lg"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          setIsLoginOpen(true)
                        }}
                        className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                      >
                        Login
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Logout isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={handleLogoutConfirm} />
    </>
  )
}

export default Header