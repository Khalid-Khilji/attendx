const InfoRow = ({ icon: Icon, label, value, isEmail = false }) => (
    <div className="flex items-center gap-4 py-4 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 group">
        <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Icon size={16} className="text-zinc-500 group-hover:text-violet-600 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-0.5">{label}</p>
            <p className={`text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate ${isEmail ? 'lowercase' : 'capitalize'}`}>
                {value || '—'}
            </p>
        </div>
    </div>
)

export default InfoRow;