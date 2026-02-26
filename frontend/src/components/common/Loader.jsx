import { motion } from 'motion/react'
import { Loader2 } from 'lucide-react'

const Loader = ({ 
  size = 'md', 
  fullPage = false, 
  text = 'Loading...', 
  variant = 'primary' 
}) => {
  
  const sizes = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }

  const colors = {
    primary: "text-violet-600",
    secondary: "text-zinc-500",
    white: "text-white"
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className={`${sizes[size]} ${colors[variant]}`}
        >
          <Loader2 className="w-full h-full" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0.5, scale: 0.8 }}
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.8, 1.1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`absolute inset-0 blur-xl ${colors[variant]} opacity-30`}
        />
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          {text}
        </motion.p>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-999 flex items-center justify-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}

export default Loader