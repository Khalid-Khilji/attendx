import { motion } from 'motion/react'
import { User, Mail, Hash, Building2, CameraOff, ShieldCheck, Clock, BadgeCheck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMyProfile } from '../../api/index'
import { InfoRow } from '../../components/index'
import {ProfileSkeleton} from '../../components/index'

const StudentProfile = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: getMyProfile,
    staleTime: Infinity
  })

  const faceRegistered = !!profile?.face_embedding

  if (isLoading) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <ProfileSkeleton />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-3xl mx-auto space-y-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden relative"
        >
          <div className="bg-linear-to-br from-indigo-600 via-violet-600 to-blue-500 h-32 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          </div>

          <div className="px-8 pb-8">
            <div className="-mt-12 mb-6 relative inline-block">
              {profile?.profile_pic ? (
                <img src={profile.profile_pic} alt="Profile" className="w-24 h-24 rounded-4xl object-cover border-4 border-white dark:border-zinc-900 shadow-2xl" />
              ) : (
                <div className="w-24 h-24 rounded-4xl bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-900 shadow-2xl flex items-center justify-center">
                  <span className="text-4xl font-black text-violet-600 uppercase">
                    {profile?.first_name?.[0]}
                  </span>
                </div>
              )}
              <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-white dark:border-zinc-900 rounded-full shadow-lg flex items-center justify-center ${faceRegistered ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {faceRegistered ? <BadgeCheck size={10} className="text-white" /> : <CameraOff size={10} className="text-white" />}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white capitalize tracking-tight leading-none">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    {profile?.roll_no}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${faceRegistered ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/5 text-rose-600 border-rose-500/20'}`}>
                    {faceRegistered ? 'Biometric Synced' : 'Sync Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-violet-600 rounded-full" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Student Registry</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <InfoRow icon={User} label="Identity Record" value={`${profile?.first_name} ${profile?.last_name}`} />
            <InfoRow icon={Hash} label="Institutional Roll" value={profile?.roll_no} />
            <InfoRow icon={Mail} label="Academic Email" value={profile?.email?.toLowerCase()} isEmail />
            <InfoRow icon={Building2} label="Department" value={profile?.dept_name || profile?.dept_id} />
            <InfoRow icon={ShieldCheck} label="System Access" value="Student Tier" />
            <InfoRow icon={Clock} label="Enrolled Since" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} />
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default StudentProfile