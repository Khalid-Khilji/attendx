import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard, ClipboardCheck, GraduationCap, Users, UserCog, BookOpen, Activity } from 'lucide-react'
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
        { name: 'Academics', path: '/admin/academics', icon: BookOpen },
        { name: 'Teachers', path: '/admin/teachers', icon: Users },
        { name: 'Students', path: '/admin/students', icon: GraduationCap },
        { name: 'Logs', path: '/admin/logs', icon: Activity }
      ]
    }
    if (user?.role === ROLES.TEACHER) {
      return [
        { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
        { name: 'Attendance', path: '/teacher/attendance', icon: ClipboardCheck },
        { name: 'Students', path: '/teacher/students', icon: GraduationCap },
      ]
    }
    if (user?.role === ROLES.STUDENT) {
      return [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'History', path: '/student/attendance', icon: ClipboardCheck },
        { name: 'Profile', path: '/student/profile', icon: UserCog },
      ]
    }
    return []
  }

  const navLinks = getNavLinks()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-2 py-3 md:px-6 md:py-4">
        <nav className="mx-auto max-w-7xl rounded-2xl border border-gray-200/50 bg-white/80 shadow-xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-950/80 transition-all duration-300">
          <div className="flex h-14 items-center justify-between px-4">

            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="rounded-lg bg-violet-600 p-1.5 text-white shadow-lg">
                <GraduationCap size={20} />
              </div>
              <span className="text-lg font-black uppercase tracking-tighter dark:text-white">
                Attend<span className="text-violet-600">x</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center gap-2 ${isActive
                      ? 'bg-violet-600 text-white shadow-lg'
                      : 'text-gray-500 hover:text-violet-600 dark:text-gray-400'
                    }`
                  }
                >
                  {link.icon && <link.icon size={14} strokeWidth={2.5} />}
                  {link.name}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={toggleMode}
                className={`h-9 w-9 p-0 border-none transition-all duration-300 ${isDark
                  ? 'bg-zinc-800 text-amber-400 hover:bg-zinc-700 shadow-lg shadow-amber-500/10'
                  : 'bg-zinc-100 text-violet-600 hover:bg-zinc-200 shadow-sm'
                  }`}
                icon={isDark ? Sun : Moon}
              />

              {user && (
                <Button
                  variant="ghost"
                  onClick={() => setIsLogoutOpen(true)}
                  className="h-9 w-9 p-0 border-none bg-red-500 text-white dark:text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-105 transition-all"
                  icon={LogOut}
                />
              )}

              {!user && (
                <div className="hidden sm:block">
                  <Button
                    onClick={() => setIsLoginOpen(true)}
                    variant="primary"
                    size="sm"
                    className="px-6 text-[10px] font-black"
                  >
                    Login
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden h-9 w-9 p-0 border-none bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                icon={isOpen ? X : Menu}
              />
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md"
              >
                <div className="grid grid-cols-2 gap-2 p-4">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all border ${isActive
                          ? 'bg-violet-600 text-white border-violet-600 shadow-lg'
                          : 'bg-gray-50 dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-zinc-400'
                        }`
                      }
                    >
                      {link.icon && <link.icon size={20} strokeWidth={2.5} />}
                      <span className="text-[9px] font-black uppercase tracking-widest">{link.name}</span>
                    </NavLink>
                  ))}

                  {!user && (
                    <div className="col-span-2 pt-2">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setIsOpen(false)
                          setIsLoginOpen(true)
                        }}
                        className="w-full py-4 text-[10px] font-black"
                      >
                        Login Now
                      </Button>
                    </div>
                  )}
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