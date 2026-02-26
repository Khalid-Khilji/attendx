import { motion, AnimatePresence } from 'motion/react'
import { AlertCircle } from 'lucide-react'

const Input = ({ 
  label, 
  name,
  type = 'text', 
  value, 
  onChange, 
  onBlur, 
  error, 
  placeholder, 
  className = '',
  icon: Icon,
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`
            w-full rounded-xl border px-4 py-2.5 text-sm
            transition-colors outline-none
            text-black dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${Icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20 focus:border-red-500' 
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-violet-600 dark:focus:border-violet-400'
            }
          `}
          {...props}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1 text-red-500 text-xs ml-1"
          >
            <AlertCircle size={12} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Input