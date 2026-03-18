import { motion } from 'motion/react'
import { Clock } from 'lucide-react'

const TimetableSlot = ({ slot, idx }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group"
    >
        <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-black text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {slot.course_code}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">SEM {slot.sem_number}</span>
        </div>

        <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase leading-tight mb-4 truncate group-hover:text-violet-600 transition-colors">
            {slot.course_name}
        </h4>

        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl">
            <Clock size={12} className="text-violet-500" />
            <span>{slot.start_time} — {slot.end_time}</span>
        </div>
    </motion.div>
)

export default TimetableSlot;