import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard, ClipboardCheck, GraduationCap, Users } from 'lucide-react'
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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ]

  const getRoleLinks = () => {
    if (user?.role === ROLES.ADMIN) return [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Teachers', path: '/admin/teachers', icon: Users },
      { name: 'Students', path: '/admin/students', icon: GraduationCap }
    ]
    if (user?.role === ROLES.TEACHER) return [
      { name: 'Portal', path: '/teacher/dashboard', icon: LayoutDashboard },
      { name: 'Attendance', path: '/teacher/attendance', icon: ClipboardCheck }
    ]
    return [
      { name: 'My Attendance', path: '/student/dashboard', icon: LayoutDashboard }
    ]
  }

  const roleLinks = getRoleLinks()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-100 w-full p-3 md:p-6">
        <nav className="mx-auto max-w-7xl rounded-xl md:rounded-3xl border border-zinc-200/50 bg-white/80 shadow-lg backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
          <div className="flex h-14 md:h-18 items-center justify-between px-4 md:px-8">

            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-violet-600 p-1.5 rounded-lg text-white">
                <GraduationCap size={18} className="md:w-6 md:h-6" />
              </div>
              <span className="text-lg md:text-2xl font-black tracking-tight dark:text-white uppercase">
                Attend<span className="text-violet-600">x</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative px-5 py-1.5 text-sm font-bold transition-all duration-300 rounded-xl ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{link.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-violet-600 rounded-xl shadow-md"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={toggleMode}
                className="rounded-lg md:rounded-2xl h-9 w-9 md:h-11 md:w-11 p-0 border border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDark ? 'dark' : 'light'}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-violet-600" />}
                  </motion.div>
                </AnimatePresence>
              </Button>

              <div className="hidden sm:flex items-center gap-2">
                {user ? (
                  <div className="flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-xl">
                    <NavLink to={roleLinks[0].path} className="px-4 py-1.5 rounded-lg text-sm font-bold bg-violet-600 text-white">
                      Dashboard
                    </NavLink>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setIsLogoutOpen(true)} // Open Logout Modal
                      className="rounded-lg h-8 w-8 p-0"
                    >
                      <LogOut size={14} />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsLoginOpen(true)} variant="primary" size="sm" className="rounded-xl px-6 font-bold bg-violet-600 border-none">
                    Login
                  </Button>
                )}
              </div>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
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
                className="md:hidden border-t border-zinc-100 dark:border-zinc-800 overflow-hidden"
              >
                <div className="flex flex-col gap-1 p-3">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${isActive ? 'bg-violet-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  ))}

                  <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    {user ? (
                      <>
                        {roleLinks.map((r) => (
                          <NavLink key={r.path} to={r.path} onClick={() => setIsOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${isActive ? 'bg-violet-600 text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                            <r.icon size={16} /> {r.name}
                          </NavLink>
                        ))}
                        <Button variant="danger" className="w-full h-10 rounded-lg text-xs font-bold" onClick={() => setIsLogoutOpen(true)}>
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => { setIsOpen(false); setIsLoginOpen(true); }} className="w-full h-10 rounded-lg text-sm font-bold shadow-md">
                        Login Now
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Logout
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  )
}

export default Header