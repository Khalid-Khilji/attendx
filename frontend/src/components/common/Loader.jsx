import { motion } from 'motion/react'
import { Loader2 } from 'lucide-react'

const Loader = ({ 
  size = 'md', 
  fullPage = false, 
  text = 'Loading...', 
  variant = 'primary',
  type = 'rect',
  className = "" 
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

  if (variant === 'skeleton') {
    const skeletonStyles = {
      circle: "rounded-full",
      rect: "rounded-2xl",
      text: "rounded-lg h-4 w-full"
    }

    return (
      <div className={`relative overflow-hidden bg-zinc-200 dark:bg-zinc-800 ${skeletonStyles[type]} ${className}`}>
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 dark:via-zinc-700/30 to-transparent"
        />
      </div>
    )
  }

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
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
          className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500"
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