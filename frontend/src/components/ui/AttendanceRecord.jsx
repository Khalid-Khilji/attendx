import { useMemo } from 'react'
import { Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSessionRecords, reviewAttendanceRecord } from '../../api/index'
import { Modal, Button, Loader } from '../index'

const statusConfig = {
    present: { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100', icon: CheckCircle },
    absent: { color: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100', icon: XCircle },
    review: { color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100', icon: AlertCircle },
}

const AttendanceRecords = ({ isOpen, sessionId, onClose }) => {
    const queryClient = useQueryClient()
    const { data: records = [], isLoading } = useQuery({
        queryKey: ['session-records', sessionId],
        queryFn: () => getSessionRecords(sessionId),
        enabled: !!sessionId && isOpen,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const mutation = useMutation({
        mutationFn: ({ id, status }) => reviewAttendanceRecord(id, { status }),
        onSuccess: () => queryClient.invalidateQueries(['session-records', sessionId])
    })

    const stats = useMemo(() => ({
        present: records.filter(r => r.status === 'present').length,
        absent: records.filter(r => r.status === 'absent').length,
        review: records.filter(r => r.status === 'review').length
    }), [records])

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <h2 className="text-xl font-black uppercase tracking-tight dark:text-white mb-6">Session Registry</h2>

            <div className="grid grid-cols-3 gap-3 mb-8">
                {Object.entries(stats).map(([label, value]) => (
                    <div key={label} className={`rounded-2xl p-4 text-center border ${statusConfig[label].color}`}>
                        <p className="text-2xl font-black">{value}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest mt-1">{label}</p>
                    </div>
                ))}
            </div>

            <div className="overflow-y-auto max-h-[400px] min-h-[300px] pr-2 custom-scrollbar">
                {isLoading ? <div className="py-20 flex justify-center"><Loader text="Indexing..." /></div> :
                    records.length === 0 ? (
                        <div className="py-20 text-center opacity-30">
                            <Users size={48} className="mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-widest">No data indexed</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {records.map(r => {
                                const cfg = statusConfig[r.status] || statusConfig.absent
                                const Icon = cfg.icon
                                return (
                                    <div key={r._id} className="py-4 flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 capitalize truncate">{r.first_name} {r.last_name}</p>
                                            <p className="text-[10px] font-mono text-zinc-400 uppercase">{r.roll_no}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full border flex items-center gap-1.5 ${cfg.color}`}>
                                                <Icon size={10} /> {r.status}
                                            </span>
                                            <Button variant="secondary" size="sm" className="h-8 text-[9px] rounded-xl"
                                                onClick={() => mutation.mutate({ id: r._id, status: r.status === 'present' ? 'absent' : 'present' })}
                                                isLoading={mutation.isPending && mutation.variables?.id === r._id}>
                                                Flip
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
            </div>
        </Modal>
    )
}

export default AttendanceRecords