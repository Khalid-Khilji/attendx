import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Building2, Hash } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { Button, Input, Modal } from '../index'
import { createDepartment, updateDepartment } from '../../api/index'

const DepartmentModal = ({ isOpen, onClose, editData = null }) => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (values) => {
            const payload = {
                name: values.name.toLowerCase().trim(),
                short_name: values.short_name.toLowerCase().trim()
            }
            return editData ? updateDepartment(editData._id, payload) : createDepartment(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })
            onClose()
        }
    })

    const form = useForm({
        defaultValues: {
            name: editData?.name || '',
            short_name: editData?.short_name || '',
        },
        onSubmit: async ({ value }) => {
            mutation.mutate(value)
        },
    })

    useEffect(() => {
        if (isOpen) {
            form.reset({
                name: editData?.name || '',
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
                        {editData ? 'Update' : 'New'} Department
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
                            name="name"
                            children={(field) => (
                                <Input
                                    label="Department Name"
                                    id={field.name}
                                    name={field.name}
                                    icon={Building2}
                                    autoComplete="organization"
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    placeholder="e.g. Computer Science"
                                    required
                                />
                            )}
                        />

                        <form.Field
                            name="short_name"
                            children={(field) => (
                                <Input
                                    label="Short Name / Code"
                                    id={field.name}
                                    name={field.name}
                                    icon={Hash}
                                    autoComplete="off"
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    required
                                    placeholder="e.g. CS"
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
                                {editData ? 'Save Changes' : 'Create Department'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </AnimatePresence>
        </Modal>
    )
}

export default DepartmentModal