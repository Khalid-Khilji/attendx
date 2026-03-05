import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Book, Users2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Modal } from '../index'
import { createCourse, updateCourse } from '../../api/academics'

const CourseModal = ({ isOpen, onClose, semId, editData = null }) => {
    const [formData, setFormData] = useState({ name: '', sem_id: '', teachers: [] })
    const queryClient = useQueryClient()

    useEffect(() => {
        if (editData) setFormData({ name: editData.name, sem_id: editData.sem_id, teachers: editData.teachers || [] })
        else setFormData({ name: '', sem_id: semId || '', teachers: [] })
    }, [editData, isOpen, semId])

    const mutation = useMutation({
        mutationFn: (data) => editData
            ? updateCourse(editData._id, data)
            : createCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['courses'])
            onClose()
        }
    })

    const handleTeacherChange = (val) => {
        const teacherList = val.split(',').map(t => t.trim()).filter(t => t !== '')
        setFormData({ ...formData, teachers: teacherList })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                    {editData ? 'Modify' : 'New'} Course
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ ...formData, name: formData.name.toLowerCase() }); }} className="space-y-4">
                    <Input
                        label="Course Name"
                        icon={Book}
                        value={formData.name}
                        onChange={(val) => setFormData({ ...formData, name: val })}
                        placeholder="e.g. Machine Learning"
                        required
                    />
                    <Input
                        label="Assigned Teachers"
                        icon={Users2}
                        value={formData.teachers.join(', ')}
                        onChange={handleTeacherChange}
                        placeholder="Enter Employee IDs (T-101, T-102)"
                    />
                    <div className="flex gap-3 pt-4">
                        <Button variant="ghost" className="flex-1" onClick={onClose}>Discard</Button>
                        <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
                            {editData ? 'Save Course' : 'Create Course'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </Modal>
    )
}

export default CourseModal