import { useState, useEffect } from 'react'
import { GraduationCap } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Modal } from '../index'
import { createSemester, updateSemester } from '../../api/index'

const SemesterModal = ({ isOpen, onClose, deptId, editData = null }) => {
    const [semNumber, setSemNumber] = useState('')
    const queryClient = useQueryClient()

    useEffect(() => {
        if (editData) setSemNumber(editData.sem_number)
        else setSemNumber('')
    }, [editData, isOpen])

    const mutation = useMutation({
        mutationFn: (num) => {
            const payload = { dept_id: deptId, sem_number: parseInt(num) }
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
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(semNumber); }} className="space-y-4">
                <Input label="Semester Number" type="number" icon={GraduationCap} value={semNumber} onChange={(v) => setSemNumber(v)} required />
                <div className="flex gap-3 pt-4">
                    <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" isLoading={mutation.isPending}>Confirm</Button>
                </div>
            </form>
        </Modal>
    )
}

export default SemesterModal