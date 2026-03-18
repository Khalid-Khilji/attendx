import { motion } from 'motion/react'
import { LogOut, AlertTriangle } from 'lucide-react'
import { Modal, Button } from '../index'
import useAuthStore from '../../stores/auth'
import { toast } from 'react-toastify'
import useAdminStore from '../../stores/admin'

const Logout = ({ isOpen, onClose }) => {
  const { logout } = useAuthStore()
  const { clearAcademicData } = useAdminStore();

  const handleLogout = () => {
    logout()
    clearAcademicData();
    onClose()
    toast.success('Logged out successfully', {
      autoClose: 2000,
      theme: "colored",
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-2"
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 mb-6"
        >
          <AlertTriangle size={32} />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-bold text-gray-900 dark:text-white"
        >
          Confirm Logout
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 px-4 leading-relaxed"
        >
          Are you sure you want to leave? Any unsaved changes might be lost.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mt-10 w-full"
        >
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="flex-1 rounded-xl font-bold"
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={handleLogout}
            icon={LogOut}
            className="flex-1 rounded-xl font-bold shadow-lg shadow-red-500/20"
          >
            Logout
          </Button>
        </motion.div>
      </motion.div>
    </Modal>
  )
}

export default Logout