import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Book } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Modal } from '../index'
import { createCourse, updateCourse } from '../../api/index'

const CourseModal = ({ isOpen, onClose, semId, editData = null }) => {
    const [courseName, setCourseName] = useState('')
    const queryClient = useQueryClient()

    useEffect(() => {
        if (editData) setCourseName(editData.name)
        else setCourseName('')
    }, [editData, isOpen])

    const mutation = useMutation({
        mutationFn: (data) => editData
            ? updateCourse(editData._id, data)
            : createCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['courses'])
            onClose()
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        mutation.mutate({
            name: courseName.toLowerCase(),
            sem_id: semId,
            teachers: editData?.teachers || []
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                    {editData ? 'Rename' : 'Quick Add'} Course
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Course Name"
                        icon={Book}
                        value={courseName}
                        onChange={(val) => setCourseName(val)}
                        placeholder="e.g. Data Structures"
                        required
                        autoFocus
                    />
                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
                            {editData ? 'Update' : 'Add Course'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </Modal>
    )
}

export default CourseModal