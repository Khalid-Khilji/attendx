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

const RecordsModal = ({ isOpen, session, onClose }) => {
    const queryClient = useQueryClient()

    const { data: records = [], isLoading } = useQuery({
        queryKey: ['session-records', session?._id],
        queryFn: () => getSessionRecords(session._id),
        enabled: !!session?._id && isOpen,
        staleTime: 1000 * 60 * 2
    })

    const mutation = useMutation({
        mutationFn: ({ recordId, status }) => reviewAttendanceRecord(recordId, { status }),
        onSuccess: () => queryClient.invalidateQueries(['session-records', session._id])
    })

    const stats = useMemo(() => ({
        present: records.filter(r => r.status === 'present').length,
        absent: records.filter(r => r.status === 'absent').length,
        review: records.filter(r => r.status === 'review').length
    }), [records])

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-none">Session Registry</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                    {session?.date ? new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
                {Object.entries(stats).map(([label, value]) => (
                    <div key={label} className={`rounded-2xl p-4 text-center border-2 border-zinc-50 dark:border-zinc-800 ${statusConfig[label].color}`}>
                        <p className="text-2xl font-black leading-none">{value}</p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-2">{label}</p>
                    </div>
                ))}
            </div>

            <div className="overflow-y-auto max-h-[450px] pr-2 custom-scrollbar min-h-[300px]">
                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader text="Indexing Records..." /></div>
                ) : records.length === 0 ? (
                    <div className="py-20 text-center opacity-30">
                        <Users size={48} strokeWidth={1} className="mx-auto mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Batch Data</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {records.map(record => {
                            const cfg = statusConfig[record.status] || statusConfig.absent
                            const StatusIcon = cfg.icon
                            return (
                                <div key={record._id} className="py-4 flex items-center gap-4 group">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 capitalize truncate group-hover:text-violet-600 transition-colors">
                                            {record.first_name} {record.last_name}
                                        </p>
                                        <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">{record.roll_no}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border flex items-center gap-2 ${cfg.color}`}>
                                            <StatusIcon size={10} /> {record.status}
                                        </span>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 w-12 rounded-lg border-none bg-zinc-100 dark:bg-zinc-800 hover:bg-violet-600 hover:text-white"
                                            onClick={() => mutation.mutate({ recordId: record._id, status: record.status === 'present' ? 'absent' : 'present' })}
                                            isLoading={mutation.isPending && mutation.variables?.recordId === record._id}
                                        >
                                            Flip
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t dark:border-zinc-800">
                <Button variant="ghost" onClick={onClose} className="w-full h-12 rounded-xl text-[10px] font-black">Close Sequence</Button>
            </div>
        </Modal>
    )
}

export default RecordsModal