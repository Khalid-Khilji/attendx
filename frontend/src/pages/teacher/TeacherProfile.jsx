import { motion } from 'motion/react'
import { User, Mail, Hash, Building2, BookOpen, Users, CalendarCheck, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getTeacherProfile } from '../../api/index'
import { StatCard, InfoRow } from '../../components/index'

const Skeleton = ({ h = 'h-16', w = 'w-full' }) => (
  <div className={`animate-pulse ${h} ${w} rounded-2xl bg-zinc-100 dark:bg-zinc-800`} />
)

const TeacherProfile = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['teacher-profile'],
    queryFn: getTeacherProfile,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-3xl mx-auto space-y-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden relative"
        >
          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 h-32 relative" />
          <div className="px-8 pb-8">
            <div className="-mt-12 mb-6 relative inline-block">
              {isLoading ? <Skeleton h="w-24 h-24" /> : (
                <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-900 shadow-2xl flex items-center justify-center text-4xl font-black text-violet-600">
                  {profile?.first_name?.[0]}
                </div>
              )}
              {!isLoading && <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-zinc-900 rounded-full" />}
            </div>

            {isLoading ? <div className="space-y-2"><Skeleton h="h-8" w="w-48" /><Skeleton h="h-4" w="w-32" /></div> : (
              <div>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white capitalize tracking-tight">{profile?.first_name} {profile?.last_name}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700">{profile?.faculty_id}</span>
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${profile?.is_active ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' : 'bg-red-500/5 text-red-600 border-red-500/20'}`}>
                    {profile?.is_active ? 'Active Index' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {isLoading ? [...Array(3)].map((_, i) => <Skeleton key={i} h="h-32" />) : <>
            <StatCard icon={BookOpen} label="Courses" value={profile?.stats?.total_courses} color="bg-violet-100 dark:bg-violet-900/30 text-violet-600" delay={0.1} />
            <StatCard icon={Users} label="Learners" value={profile?.stats?.total_students} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" delay={0.15} />
            <StatCard icon={CalendarCheck} label="Sessions" value={profile?.stats?.total_sessions} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" delay={0.2} />
          </>}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-violet-600 rounded-full" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Registry Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {isLoading ? <div className="col-span-2 space-y-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} h="h-14" />)}</div> : <>
              <InfoRow icon={User} label="Identity" value={`${profile?.first_name} ${profile?.last_name}`} />
              <InfoRow icon={Hash} label="Faculty ID" value={profile?.faculty_id} />
              <InfoRow icon={Mail} label="Email" value={profile?.email} isEmail />
              <InfoRow icon={Building2} label="Division" value={`${profile?.dept_name} (${profile?.dept_short?.toUpperCase()})`} />
              <InfoRow icon={Clock} label="Joined" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} />
            </>}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TeacherProfile;