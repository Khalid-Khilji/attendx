import { useState, useEffect } from 'react'
import { Building2, Hash } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Modal } from '../index'
import { createDepartment, updateDepartment } from '../../api/index'

const DepartmentModal = ({ isOpen, onClose, editData = null }) => {
    const [formData, setFormData] = useState({ name: '', short_name: '' })
    const queryClient = useQueryClient()

    useEffect(() => {
        if (editData) setFormData({ name: editData.name, short_name: editData.short_name })
        else setFormData({ name: '', short_name: '' })
    }, [editData, isOpen])

    const mutation = useMutation({
        mutationFn: (data) => editData ? updateDepartment(editData._id, data) : createDepartment(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['departments'])
            onClose()
        }
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                {editData ? 'Update' : 'New'} Department
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ name: formData.name.toLowerCase(), short_name: formData.short_name.toLowerCase() }); }} className="space-y-4">
                <Input label="Name" name="name" icon={Building2} autoComplete="off" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
                <Input label="Short Name" name="shortName" icon={Hash} autoComplete="off" value={formData.short_name} onChange={(v) => setFormData({ ...formData, short_name: v })} required />
                <div className="flex gap-3 pt-4">
                    <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" isLoading={mutation.isPending}>{editData ? 'Save' : 'Create'}</Button>
                </div>
            </form>
        </Modal>
    )
}

export default DepartmentModal