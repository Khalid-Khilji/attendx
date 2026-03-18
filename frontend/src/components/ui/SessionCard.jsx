import { useState } from 'react'
import { Calendar, Eye } from 'lucide-react'
import { Button, RecordsModal } from '../index'

const SessionCard = ({ session }) => {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all group">
                <div className="w-12 h-12 rounded-[1.2rem] bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-800/50 group-hover:scale-110 transition-transform duration-500">
                    <Calendar size={18} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-tight">
                        {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[9px] font-mono text-zinc-400 uppercase mt-1">UUID: {session._id.slice(-8).toUpperCase()}</p>
                </div>
                <Button
                    variant="secondary"
                    icon={Eye}
                    onClick={() => setOpen(true)}
                    className="h-10 text-violet-600 bg-violet-50 dark:bg-violet-900/20 border-none shadow-none hover:bg-violet-600 hover:text-white"
                >
                    Audit
                </Button>
            </div>
            <RecordsModal isOpen={open} session={session} onClose={() => setOpen(false)} />
        </>
    )
}

export default SessionCard