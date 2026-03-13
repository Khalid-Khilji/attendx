import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Upload, X, Fingerprint } from 'lucide-react';
import { uploadFace } from '../../api/index';
import { Modal, Button } from '../../components/index';

const FaceModal = ({ isOpen, onClose, student }) => {
    const queryClient = useQueryClient();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const mutation = useMutation({
        mutationFn: () => uploadFace(student._id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            handleClose();
        }
    });

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreview(null);
        onClose();
    };

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        <Fingerprint size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-tight">Face ID Registration</h2>
                        <p className="text-xs font-bold text-violet-600 capitalize">{student?.first_name} {student?.last_name}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="relative group">
                        <label
                            htmlFor="face-upload"
                            className={`
                                block w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
                                ${preview
                                    ? 'border-violet-500 bg-zinc-50 dark:bg-zinc-800'
                                    : 'border-zinc-200 dark:border-zinc-700 hover:border-violet-400 bg-zinc-50 dark:bg-zinc-800/50'
                                }
                            `}
                        >
                            <AnimatePresence mode="wait">
                                {preview ? (
                                    <motion.div
                                        key="preview"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative w-full h-full"
                                    >
                                        <img src={preview} alt="Face Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-[10px] font-black uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">Change Photo</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center"
                                    >
                                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-violet-500 transition-colors">
                                            <Camera size={32} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Click to capture or upload</p>
                                            <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">Clear face view required for AI recognition</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </label>
                        <input
                            id="face-upload"
                            name="face-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFile}
                            autoComplete="off"
                        />
                    </div>

                    {student?.face_embedding && !preview && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">✓ Student already has a registered face. Uploading will replace it.</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1" onClick={handleClose}>Cancel</Button>
                        <Button
                            className="flex-1"
                            disabled={!file}
                            isLoading={mutation.isPending}
                            onClick={() => mutation.mutate()}
                            icon={Upload}
                        >
                            Register Face
                        </Button>
                    </div>
                </div>
            </motion.div>
        </Modal>
    );
};

export default FaceModal;