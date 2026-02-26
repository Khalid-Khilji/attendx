import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header, Footer, ScrollToTop } from './components'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useThemeStore from './stores/theme'

function App() {
  const { isDark } = useThemeStore()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <Header />
      <ScrollToTop />

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme={isDark ? 'dark' : 'light'}
      />

      <main className="pt-28 min-h-[calc(100vh-80px)] px-4">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App