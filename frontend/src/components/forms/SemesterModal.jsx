import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { GraduationCap } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Modal } from '../index'
import { createSemester, updateSemester } from '../../api/academics'

const SemesterModal = ({ isOpen, onClose, deptId, editData = null }) => {
    const [formData, setFormData] = useState({ dept_id: '', sem_number: '', is_active: true })
    const queryClient = useQueryClient()

    useEffect(() => {
        if (editData) setFormData({ dept_id: editData.dept_id, sem_number: editData.sem_number, is_active: editData.is_active })
        else setFormData({ dept_id: deptId || '', sem_number: '', is_active: true })
    }, [editData, isOpen, deptId])

    const mutation = useMutation({
        mutationFn: (data) => editData
            ? updateSemester(editData._id, data)
            : createSemester(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['semesters'])
            onClose()
        }
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                    {editData ? 'Update' : 'Configure'} Semester
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4">
                    <Input
                        label="Semester Number"
                        type="number"
                        icon={GraduationCap}
                        value={formData.sem_number}
                        onChange={(val) => setFormData({ ...formData, sem_number: parseInt(val) })}
                        required
                    />
                    <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 accent-violet-600 rounded-lg"
                        />
                        <label htmlFor="is_active" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Active Status</label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
                            {editData ? 'Update Sem' : 'Add Semester'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </Modal>
    )
}

export default SemesterModal