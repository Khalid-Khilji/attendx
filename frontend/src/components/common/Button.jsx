import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-[10px]"

  const variants = {
    primary: "bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500 shadow-lg shadow-violet-500/25",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
    outline: "border-2 border-violet-600 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
  }

  const sizes = {
    sm: "px-3 py-1.5 gap-1.5",
    md: "px-5 py-2.5 gap-2",
    lg: "px-6 py-4 text-sm gap-2.5 w-full",
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <div className="flex items-center justify-center gap-2 pointer-events-none">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon size={16} strokeWidth={2.5} />}
            {children && <span>{children}</span>}
            {Icon && iconPosition === 'right' && <Icon size={16} strokeWidth={2.5} />}
          </>
        )}
      </div>
    </motion.button>
  )
}

export default Button