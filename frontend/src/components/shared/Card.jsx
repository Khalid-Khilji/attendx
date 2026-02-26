import { motion } from 'motion/react'

const Card = ({ children, className = '', onClick, hover = true }) => {
  return (
    <motion.div
      whileHover={hover && onClick ? { y: -5, scale: 1.01 } : {}}
      whileTap={hover && onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm 
        transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900/50 
        ${onClick ? 'cursor-pointer hover:shadow-xl hover:border-violet-500/30' : ''} 
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 ${className}`}>
    {children}
  </div>
)

const CardBody = ({ children, className = '' }) => (
  <div className={`px-5 py-4 ${className}`}>
    {children}
  </div>
)

const CardFooter = ({ children, className = '' }) => (
  <div className={`px-5 py-3 bg-zinc-50/50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 ${className}`}>
    {children}
  </div>
)

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card