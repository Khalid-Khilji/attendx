import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { motion } from 'motion/react'

const statusConfig = {
    present: { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800', icon: CheckCircle },
    absent: { color: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800', icon: XCircle },
    review: { color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800', icon: AlertCircle },
}

const AttendanceRow = ({ record, index }) => {
    const cfg = statusConfig[record.status] || statusConfig.absent
    const Icon = cfg.icon

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="px-6 py-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group"
        >
            <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase truncate group-hover:text-violet-600 transition-colors">
                    {record.course_code} — {record.course_name}
                </p>
                <p className="text-[10px] font-bold text-zinc-400 mt-0.5 tracking-wider">
                    {record.date ? new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </p>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border flex items-center gap-2 shrink-0 ${cfg.color}`}>
                <Icon size={12} /> {record.status}
            </span>
        </motion.div>
    )
}

export default AttendanceRow