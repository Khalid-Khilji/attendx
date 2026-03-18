import TimetableSlot from './TimetableSlot'

const dayConfig = {
    Monday: { bg: 'bg-violet-50/50 dark:bg-violet-900/10', border: 'border-violet-100 dark:border-violet-800/50', text: 'text-violet-600' },
    Tuesday: { bg: 'bg-blue-50/50 dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-800/50', text: 'text-blue-600' },
    Wednesday: { bg: 'bg-emerald-50/50 dark:bg-emerald-900/10', border: 'border-emerald-100 dark:border-emerald-800/50', text: 'text-emerald-600' },
    Thursday: { bg: 'bg-amber-50/50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-800/50', text: 'text-amber-600' },
    Friday: { bg: 'bg-rose-50/50 dark:bg-rose-900/10', border: 'border-rose-100 dark:border-rose-800/50', text: 'text-rose-600' },
    Saturday: { bg: 'bg-zinc-100/50 dark:bg-zinc-800/20', border: 'border-zinc-200 dark:border-zinc-700', text: 'text-zinc-500' },
}

const TimetableDayGroup = ({ day, slots }) => {
    const isToday = new Date().toLocaleDateString('en-IN', { weekday: 'long' }) === day
    const config = dayConfig[day]

    return (
        <div className={`rounded-[2.5rem] border-2 p-6 transition-all ${config.bg} ${config.border} ${isToday ? 'ring-4 ring-violet-500/10 border-violet-500/50' : ''}`}>
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${config.text}`}>{day}</h3>
                    {isToday && (
                        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white bg-violet-600 px-3 py-1 rounded-full shadow-lg shadow-violet-600/20">
                            <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                            Active Now
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-black text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    {slots.length} SESSIONS
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot, idx) => (
                    <TimetableSlot key={slot._id} slot={slot} idx={idx} />
                ))}
            </div>
        </div>
    )
}

export default TimetableDayGroup;