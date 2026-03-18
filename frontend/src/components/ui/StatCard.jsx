import { motion } from 'motion/react'

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm hover:shadow-xl hover:shadow-zinc-500/5 transition-all group"
    >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500 ${color}`}>
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="space-y-0.5">
            <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{value ?? '0'}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{label}</p>
        </div>
    </motion.div>
)

export default StatCard;