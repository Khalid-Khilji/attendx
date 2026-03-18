import { Camera, CameraOff } from 'lucide-react'

const StudentRow = ({ student }) => (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
        <div className="relative shrink-0">
            {student.profile_pic ? (
                <img src={student.profile_pic} alt="" className="w-10 h-10 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
            ) : (
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-xs font-black shadow-sm group-hover:bg-violet-600 group-hover:text-white transition-all">
                    {student.first_name?.[0].toUpperCase()}
                </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${student.face_embedding ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        </div>

        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 capitalize truncate group-hover:text-violet-600 transition-colors">
                {student.first_name} {student.last_name}
            </p>
            <p className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-tighter">{student.roll_no}</p>
        </div>

        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all ${student.face_embedding
            ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20'
            : 'bg-rose-500/5 text-rose-500 border-rose-500/20'}`}>
            {student.face_embedding ? <Camera size={10} /> : <CameraOff size={10} />}
            {student.face_embedding ? 'Registered' : 'Pending'}
        </div>
    </div>
)

export default StudentRow;