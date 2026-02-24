import { Outlet } from 'react-router-dom'
import { Header, Footer, ScrollToTop } from './components'
import { ToastContainer } from 'react-toastify'

function App() {
  return (
    <>
      <Header />
      <ScrollToTop />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
      />
      <Outlet />
      <Footer />
    </>
  )
}

export default App