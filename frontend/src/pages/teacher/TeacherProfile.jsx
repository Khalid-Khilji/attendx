import { motion } from 'motion/react'
import { User, Mail, Hash, Building2, BookOpen, Users, CalendarCheck, Clock, Calendar, Award, Trophy, Target, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getTeacherProfile } from '../../api/index'

const formatName = (str) => {
  if (!str) return ''
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

const Skeleton = ({ h = 'h-16', w = 'w-full' }) => (
  <div className={`animate-pulse ${h} ${w} rounded-2xl bg-zinc-100 dark:bg-zinc-800`} />
)

const TeacherProfile = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['teacher-profile'],
    queryFn: getTeacherProfile,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  })

  const getInitials = () => {
    if (!profile) return ''
    return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
  }

  const getJoinDate = () => {
    if (!profile?.created_at) return '—'
    return new Date(profile.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
      >
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 h-28 relative" />
        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4 relative inline-block">
            {isLoading ? (
              <div className="w-24 h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 border-4 border-white dark:border-zinc-900 shadow-2xl flex items-center justify-center text-3xl font-black text-white">
                {getInitials()}
              </div>
            )}
            {!isLoading && (
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-3 border-white dark:border-zinc-900 rounded-full shadow-md" />
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton h="h-8" w="w-48" />
              <Skeleton h="h-4" w="w-32" />
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                {formatName(profile?.first_name)} {formatName(profile?.last_name)}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-600 dark:text-zinc-400">
                  {profile?.faculty_id}
                </span>
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${profile?.is_active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
                  }`}>
                  {profile?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} h="h-28" />)
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-center hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center mx-auto mb-2">
                <BookOpen size={18} className="text-violet-600" />
              </div>
              <p className="text-2xl font-black text-violet-700 dark:text-violet-400">{profile?.stats?.total_courses || 0}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Courses</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-center hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center mx-auto mb-2">
                <Users size={18} className="text-blue-600" />
              </div>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{profile?.stats?.total_students || 0}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Students</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-center hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-2">
                <CalendarCheck size={18} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{profile?.stats?.total_sessions || 0}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sessions</p>
            </motion.div>
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Sparkles size={16} className="text-violet-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">Faculty Details</h3>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} h="h-14" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center">
                  <User size={14} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Full Name</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {formatName(profile?.first_name)} {formatName(profile?.last_name)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                  <Hash size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Faculty ID</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 font-mono">{profile?.faculty_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                  <Mail size={14} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Email</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                  <Building2 size={14} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Department</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {profile?.dept_name} ({profile?.dept_short?.toUpperCase()})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 md:col-span-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
                  <Clock size={14} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Joined On</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{getJoinDate()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {!isLoading && profile?.stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 rounded-2xl p-6 border border-violet-100 dark:border-violet-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-600">Teaching Summary</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Award size={20} className="text-violet-600 mx-auto mb-1" />
              <p className="text-xl font-black text-violet-700 dark:text-violet-400">{profile.stats.total_courses}</p>
              <p className="text-[8px] font-bold text-zinc-500 uppercase">Active Courses</p>
            </div>
            <div className="text-center">
              <Target size={20} className="text-emerald-600 mx-auto mb-1" />
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{profile.stats.total_students}</p>
              <p className="text-[8px] font-bold text-zinc-500 uppercase">Students Mentored</p>
            </div>
            <div className="text-center">
              <CalendarCheck size={20} className="text-blue-600 mx-auto mb-1" />
              <p className="text-xl font-black text-blue-700 dark:text-blue-400">{profile.stats.total_sessions}</p>
              <p className="text-[8px] font-bold text-zinc-500 uppercase">Sessions Taken</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default TeacherProfile