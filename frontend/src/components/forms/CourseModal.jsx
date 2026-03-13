import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Book, Hash, Tag } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { Button, Input, Modal } from '../index'
import { createCourse, updateCourse } from '../../api/index'

const CourseModal = ({ isOpen, onClose, semId, editData = null }) => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (data) => editData
            ? updateCourse(editData._id, data)
            : createCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
            onClose()
        }
    })

    const form = useForm({
        defaultValues: {
            name: editData?.name || '',
            course_code: editData?.course_code || '',
            short_name: editData?.short_name || ''
        },
        onSubmit: async ({ value }) => {
            mutation.mutate({
                ...value,
                name: value.name.toLowerCase().trim(),
                course_code: value.course_code.toUpperCase().trim(),
                short_name: value.short_name.toUpperCase().trim(),
                sem_id: semId,
                teachers: editData?.teachers || []
            })
        }
    })

    useEffect(() => {
        if (isOpen) {
            form.reset({
                name: editData?.name || '',
                course_code: editData?.course_code || '',
                short_name: editData?.short_name || ''
            })
        }
    }, [editData, isOpen])

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                        {editData ? 'Modify' : 'Create'} Course
                    </h2>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                        className="space-y-5"
                    >
                        <form.Field
                            name="course_code"
                            children={(field) => (
                                <Input
                                    label="Course Code"
                                    name={field.name}
                                    id={field.name}
                                    icon={Hash}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    placeholder="e.g. ITC601"
                                    autoComplete="off"
                                    required
                                />
                            )}
                        />

                        <form.Field
                            name="name"
                            children={(field) => (
                                <Input
                                    label="Course Name"
                                    name={field.name}
                                    id={field.name}
                                    icon={Book}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    placeholder="e.g. Data Structures"
                                    autoComplete="off"
                                    required
                                />
                            )}
                        />

                        <form.Field
                            name="short_name"
                            children={(field) => (
                                <Input
                                    label="Short Name / Tag"
                                    name={field.name}
                                    id={field.name}
                                    icon={Tag}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    placeholder="e.g. DS"
                                    autoComplete="off"
                                />
                            )}
                        />

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={onClose}
                                type="button"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                isLoading={mutation.isPending}
                            >
                                {editData ? 'Update' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </AnimatePresence>
        </Modal>
    )
}

export default CourseModal