import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBatch } from '../../api/index';
import { Modal, Button, Input } from '../index';
import { Hash } from 'lucide-react';

const BatchModal = ({ isOpen, onClose, semId }) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createBatch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['batches', semId] });
            onClose();
        }
    });

    const form = useForm({
        defaultValues: {
            name: '',
        },
        onSubmit: async ({ value }) => {
            mutation.mutate({ sem_id: semId, name: value.name });
        },
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Batch" description="Define a new student group for this level">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-6 py-4"
            >
                <form.Field
                    name="name"
                    validators={{
                        onChange: ({ value }) => !value ? 'Batch name is required' : undefined,
                    }}
                    children={(field) => (
                        <Input
                            label="Batch Identifier"
                            placeholder="e.g. A1, B, or Lab-G1"
                            value={field.state.value}
                            onChange={(val) => field.handleChange(val)}
                            onBlur={field.handleBlur}
                            error={field.state.meta.errors[0]}
                            icon={Hash}
                        />
                    )}
                />
                <div className="flex gap-3 pt-4">
                    <Button
                        variant="ghost"
                        className="flex-1"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={!canSubmit}
                                isLoading={isSubmitting || mutation.isPending}
                            >
                                Create Batch
                            </Button>
                        )}
                    />
                </div>
            </form>
        </Modal>
    );
};

export default BatchModal;