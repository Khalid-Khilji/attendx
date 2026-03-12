import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Book, Hash, Tag } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Modal } from '../index'
import { createCourse, updateCourse } from '../../api/index'

const CourseModal = ({ isOpen, onClose, semId, editData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        course_code: '',
        short_name: ''
    })

    const queryClient = useQueryClient()

    useEffect(() => {
        if (editData) {
            setFormData({
                name: editData.name,
                course_code: editData.course_code || '',
                short_name: editData.short_name || ''
            })
        } else {
            setFormData({
                name: '',
                course_code: '',
                short_name: ''
            })
        }
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
            ...formData,
            name: formData.name.toLowerCase(),
            course_code: formData.course_code.toUpperCase(),
            short_name: formData.short_name.toUpperCase(),
            sem_id: semId,
            teachers: editData?.teachers || []
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                    {editData ? 'Edit' : 'Add'} Course
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Course Code"
                        name="courseCode"
                        icon={Hash}
                        value={formData.course_code}
                        onChange={(val) => setFormData({ ...formData, course_code: val })}
                        placeholder="e.g. ITC601"
                        autoComplete="off"
                        required
                    />
                    <Input
                        label="Course Name"
                        name="courseName"
                        icon={Book}
                        value={formData.name}
                        onChange={(val) => setFormData({ ...formData, name: val })}
                        placeholder="e.g. Data Structures"
                        autoComplete="off"
                        required
                        />
                    <Input
                        label="Short Name"
                        name="shortName"
                        icon={Tag}
                        value={formData.short_name}
                        onChange={(val) => setFormData({ ...formData, short_name: val })}
                        placeholder="e.g. DS"
                        autoComplete="off"
                    />
                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" className="flex-1" onClick={onClose} type="button">Cancel</Button>
                        <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
                            {editData ? 'Update' : 'Save'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </Modal>
    )
}

export default CourseModal