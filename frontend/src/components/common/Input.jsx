import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import Button from './Button'

const Input = ({
  label,
  id,
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
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
          {label}
        </label>
      )}

      <div className="relative group">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors z-10">
            <Icon size={18} />
          </div>
        )}

        <input
          id={id || name}
          name={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`
            w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none
            text-black dark:text-white bg-white dark:bg-gray-900
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${Icon ? 'pl-11' : ''}
            ${isPassword ? 'pr-12' : ''}
            ${error
              ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20 focus:border-red-500'
              : 'border-gray-200 dark:border-gray-800 focus:border-violet-600 dark:focus:border-violet-400 focus:ring-4 focus:ring-violet-500/5'
            }
          `}
          {...props}
        />

        {isPassword && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0! border-none bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => setShowPassword(!showPassword)}
              icon={showPassword ? EyeOff : Eye}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1 text-red-500 text-[11px] font-bold ml-1 mt-0.5"
          >
            <AlertCircle size={12} strokeWidth={3} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Input