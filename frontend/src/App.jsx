import { useEffect, useMemo, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header, Footer, ScrollToTop, Loader } from './components'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useThemeStore from './stores/theme'
import { motion, AnimatePresence } from 'motion/react'

function App() {
  const { isDark } = useThemeStore()
  const location = useLocation()

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove("dark")
      root.style.colorScheme = 'light'
    }
  }, [isDark])

  const toastTheme = useMemo(() => (isDark ? 'dark' : 'light'), [isDark])

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors duration-500 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-violet-500/30">
      <Header />
      <ScrollToTop />

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        theme={toastTheme}
        toastClassName={() => "relative flex p-1 min-h-10 rounded-xl justify-between overflow-hidden cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl"}
      />

      <main className="pt-24 md:pt-28 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mx-auto max-w-7xl px-4 md:px-8"
          >
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}

export default App