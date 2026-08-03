import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface NameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
    title: string;
    initialValue?: string;
}

const NameModal: React.FC<NameModalProps> = ({ isOpen, onClose, onConfirm, title, initialValue = '' }) => {
    const [name, setName] = useState(initialValue);

    useEffect(() => {
        if (isOpen) {
            setName(initialValue);
        }
    }, [isOpen, initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onConfirm(name.trim());
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md bg-sidebar-bg border border-editor-line rounded-xl shadow-2xl overflow-hidden z-[1000]"
                    >
                        <div className="p-4 border-b border-editor-line flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">{title}</h3>
                            <button onClick={onClose} className="text-gray-500 hover:text-primary transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2 font-medium">Name</label>
                                <input
                                    autoFocus
                                    className="w-full bg-editor-bg border border-editor-line rounded-lg px-4 py-3 text-primary outline-none focus:border-accent transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter name..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm text-gray-500 hover:text-primary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NameModal;
