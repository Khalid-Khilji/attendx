import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { Users, GraduationCap, BookOpen, Building2, Camera, CameraOff, Calendar, ClipboardList, Activity, History } from 'lucide-react'
import { getAdminDashboard } from '../../api/dashboard'

const actionColor = {
    CREATE: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    UPDATE: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    DELETE: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    PROMOTE: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
}

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
            </div>
        </div>
        <p className="text-2xl font-black text-zinc-800 dark:text-white">{value ?? '—'}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">{label}</p>
        {sub && <p className="text-[10px] text-zinc-400 mt-0.5">{sub}</p>}
    </motion.div>
)

const SkeletonCard = () => (
    <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-32" />
)

const AdminDashboard = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: getAdminDashboard,
        staleTime: 1000 * 60 * 5, // 5 mins cache
        refetchOnWindowFocus: false
    })

    const counts = data?.counts
    const deptStats = data?.dept_stats || []
    const logs = data?.recent_logs || []
    const currentYear = data?.current_year

    const facePercent = counts ? Math.round((counts.face_registered / (counts.students || 1)) * 100) : 0

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
            <div className="max-w-7xl mx-auto space-y-6">

                <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 px-6 py-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white">
                            Admin <span className="text-violet-600">Dashboard</span>
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-0.5">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    {currentYear && (
                        <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 px-4 py-2 rounded-xl">
                            <Calendar size={14} className="text-violet-600" />
                            <span className="text-xs font-black text-violet-600 uppercase tracking-wider">{currentYear.label}</span>
                        </div>
                    )}
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {isLoading ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />) : <>
                        <StatCard icon={Users} label="Teachers" value={counts?.teachers} color="bg-violet-100 dark:bg-violet-900/30 text-violet-600" delay={0.05} />
                        <StatCard icon={GraduationCap} label="Students" value={counts?.students} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" delay={0.1} />
                        <StatCard icon={Building2} label="Departments" value={counts?.departments} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" delay={0.15} />
                        <StatCard icon={BookOpen} label="Courses" value={counts?.courses} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600" delay={0.2} />
                        <StatCard icon={ClipboardList} label="Active Enrollments" value={counts?.active_enrollments} color="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600" delay={0.25} />
                        <StatCard icon={Camera} label="Face Registered" value={counts?.face_registered} sub={`${facePercent}% of students`} color="bg-teal-100 dark:bg-teal-900/30 text-teal-600" delay={0.3} />
                        <StatCard icon={CameraOff} label="Face Pending" value={counts?.face_not_registered} color="bg-rose-100 dark:bg-rose-900/30 text-rose-500" delay={0.35} />
                        <StatCard icon={Activity} label="Today's Sessions" value={counts?.todays_sessions} color="bg-orange-100 dark:bg-orange-900/30 text-orange-600" delay={0.4} />
                    </>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Department wise Students</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            {isLoading ? [...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
                            )) : deptStats.length === 0 ? (
                                <p className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-700 py-8">No departments</p>
                            ) : deptStats.map((dept, i) => {
                                const max = Math.max(...deptStats.map(d => d.student_count), 1)
                                const pct = Math.round((dept.student_count / max) * 100)
                                return (
                                    <div key={dept._id}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 capitalize">{dept.name}</span>
                                            <span className="text-[10px] font-black text-zinc-400">{dept.student_count} students</span>
                                        </div>
                                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                                                className="h-full bg-violet-500 rounded-full" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>

                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-zinc-50 dark:border-zinc-800 flex items-center gap-3">
                            <History size={16} className="text-violet-600" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Audit Log</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-50 dark:divide-zinc-800/50 overflow-y-auto max-h-[420px] hide-scrollbar">
                            {isLoading ? [...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse flex gap-3 p-4 h-20 bg-zinc-50/50" />
                            )) : logs.map((log, i) => (
                                <motion.div
                                    key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.03 }}
                                    className="p-4 flex items-center gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors border-b border-zinc-50 dark:border-zinc-800/50"
                                >
                                    <div className={`w-10 h-8 rounded-lg text-[7px] font-black uppercase flex items-center justify-center border shrink-0 ${actionColor[log.action] || 'text-zinc-500 bg-zinc-100'}`}>
                                        {log.action}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 truncate uppercase tracking-tight">{log.entity_name || log.entity}</p>
                                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{log.actor_role} · {log.entity}</p>
                                    </div>
                                    {log.created_at && (
                                        <div className="text-right shrink-0">
                                            <p className="text-[9px] font-bold text-zinc-400">
                                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-4">Face Registration Status</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${facePercent}%` }} transition={{ delay: 0.7, duration: 0.8 }}
                                className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full" />
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="text-center">
                                <p className="text-lg font-black text-emerald-600">{facePercent}%</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Registered</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black text-rose-500">{100 - facePercent}%</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Pending</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    )
}

export default AdminDashboard;