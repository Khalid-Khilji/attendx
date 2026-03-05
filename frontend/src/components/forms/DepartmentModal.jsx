import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Building2, Hash } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Modal } from '../index'
import { createDepartment, updateDepartment } from '../../api/academics'

const DepartmentModal = ({ isOpen, onClose, editData = null }) => {
    const [formData, setFormData] = useState({ name: '', short_name: '' })
    const queryClient = useQueryClient()

    useEffect(() => {
        if (editData) setFormData({ name: editData.name, short_name: editData.short_name })
        else setFormData({ name: '', short_name: '' })
    }, [editData, isOpen])

    const mutation = useMutation({
        mutationFn: (data) => editData
            ? updateDepartment(editData._id, data)
            : createDepartment(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['departments'])
            onClose()
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        mutation.mutate({
            name: formData.name.toLowerCase(),
            short_name: formData.short_name.toLowerCase()
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                    {editData ? 'Update' : 'Create'} Department
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Department Name"
                        icon={Building2}
                        value={formData.name}
                        onChange={(val) => setFormData({ ...formData, name: val })}
                        placeholder="e.g. Computer Science"
                        required
                    />
                    <Input
                        label="Short Name"
                        icon={Hash}
                        value={formData.short_name}
                        onChange={(val) => setFormData({ ...formData, short_name: val })}
                        placeholder="e.g. CSE"
                        required
                    />
                    <div className="flex gap-3 pt-4">
                        <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
                            {editData ? 'Save Changes' : 'Create Dept'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </Modal>
    )
}

export default DepartmentModal