import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Users, Star, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getAllStudents } from '../../api/index'
import { Input } from '../index'
import StudentRow from './StudentRow'

const CourseCard = ({ course }) => {
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['sem-students', course.sem_id],
    queryFn: () => getAllStudents({ semId: course.sem_id }),
    enabled: expanded,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim()
    return students.filter(s =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      s.roll_no.toLowerCase().includes(q)
    )
  }, [students, search])

  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className={`bg-white dark:bg-zinc-900 rounded-4xl border transition-all duration-300 ${expanded ? 'border-violet-600/30 shadow-2xl shadow-violet-500/5' : 'border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-violet-200'}`}>

      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-center gap-5 text-left">
        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-xs font-black shrink-0 transition-all duration-500 ${expanded ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/20 rotate-6' : 'bg-zinc-50 dark:bg-zinc-800 text-violet-600 shadow-inner'}`}>
          {course.course_code.slice(-3)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight truncate">
              {course.name}
            </p>
            {course.is_primary && (
              <div className="bg-amber-500/10 p-1 rounded-md">
                <Star size={12} className="text-amber-500 fill-amber-500" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-md">
              {course.course_code}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase">SEM {course.sem_number}</span>
          </div>
        </div>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} className="text-zinc-400" />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-6 pb-6 pt-2 border-t border-zinc-50 dark:border-zinc-800/50">

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-zinc-50/50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex -space-x-3 overflow-hidden">
                    {students.slice(0, 3).map((s, i) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-zinc-200 overflow-hidden">
                        {s.profile_pic ? <img src={s.profile_pic} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[8px] font-bold">{s.first_name[0]}</div>}
                      </div>
                    ))}
                    {students.length > 3 && (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-violet-600 text-[8px] font-black text-white">+{students.length - 3}</div>
                    )}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {students.filter(s => s.face_embedding).length}/{students.length} Indexed
                  </div>
                </div>
                <div className="w-full sm:w-64">
                  <Input icon={Search} placeholder="Search batch..." value={search} onChange={setSearch} className="h-10 text-xs" />
                </div>
              </div>

              <div className="max-h-87.5 overflow-y-auto hide-scrollbar rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl" />)}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="py-20 text-center opacity-40">
                    <Users size={32} strokeWidth={1} className="mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No roster data</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {filteredStudents.map(s => <StudentRow key={s._id} student={s} />)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default CourseCard;