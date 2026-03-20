const ProfileSkeleton = () => (
    <div className="space-y-6">
        <div className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem] animate-pulse" />
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl animate-pulse" />
            ))}
        </div>
    </div>
)

export default ProfileSkeleton;