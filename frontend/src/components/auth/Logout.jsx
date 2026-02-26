import { LogOut, AlertTriangle } from 'lucide-react'
import { Modal, Button } from '../index'

const Logout = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Logout" size="sm">
      <div className="flex flex-col items-center py-4">
        <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 mb-4">
          <AlertTriangle size={32} />
        </div>
        
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Oh no! You're leaving?</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-2 px-6">
          Are you sure you want to log out from Attendx? You will need to login again to access your dashboard.
        </p>

        <div className="flex flex-col w-full gap-3 mt-8">
          <Button 
            variant="danger" 
            size="md" 
            onClick={onConfirm}
            className="w-full rounded-xl py-6 font-bold shadow-lg shadow-red-500/20"
          >
            <LogOut size={18} className="mr-2" />
            Yes, Log Me Out
          </Button>
          
          <Button 
            variant="ghost" 
            size="md" 
            onClick={onClose}
            className="w-full rounded-xl font-bold text-zinc-500"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default Logout