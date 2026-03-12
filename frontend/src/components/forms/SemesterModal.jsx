import { useState, useEffect } from 'react'
import { GraduationCap } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Button, Input, Modal } from '../index'
import { createSemester, updateSemester, getCurrentAcademicYear } from '../../api/index'

const SemesterModal = ({ isOpen, onClose, deptId, editData = null }) => {
    const [semNumber, setSemNumber] = useState('')
    const queryClient = useQueryClient()

    const { data: currentYear } = useQuery({
        queryKey: ['academic-year-current'],
        queryFn: getCurrentAcademicYear,
        enabled: isOpen,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry: false,
    })

    useEffect(() => {
        if (editData) setSemNumber(editData.sem_number)
        else setSemNumber('')
    }, [editData, isOpen])

    const mutation = useMutation({
        mutationFn: (num) => {
            const payload = {
                dept_id: deptId,
                sem_number: parseInt(num),
                academic_year_id: currentYear?._id
            }
            return editData ? updateSemester(editData._id, payload) : createSemester(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['semesters'])
            onClose()
        }
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                {editData ? 'Modify' : 'Configure'} Semester
            </h2>
            {currentYear && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
                    Academic Year: <span className="text-violet-600">{currentYear.label}</span>
                </p>
            )}
            {!currentYear && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-4">
                    No current academic year set — create one first
                </p>
            )}
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(semNumber); }} className="space-y-4">
                <Input label="Semester Number" name="semNumber" type="number" autoComplete="off" icon={GraduationCap} value={semNumber} onChange={(v) => setSemNumber(v)} required />
                <div className="flex gap-3 pt-4">
                    <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" isLoading={mutation.isPending} disabled={!currentYear}>Confirm</Button>
                </div>
            </form>
        </Modal>
    )
}

export default SemesterModal