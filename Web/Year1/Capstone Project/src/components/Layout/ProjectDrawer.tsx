import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Calendar, FileCode, Edit2 } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import NameModal from '../ui/NameModal';

interface ProjectDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProjectDrawer: React.FC<ProjectDrawerProps> = ({ isOpen, onClose }) => {
    const { projects, activeProjectId, setActiveProjectId, createProject, deleteProject, updateProjectName } = useEditor();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<{id: string, name: string} | null>(null);

    const handleCreateProject = () => {
        if (newName.trim()) {
            createProject(newName.trim());
            setNewName('');
            setIsCreating(false);
        }
    };

    const startEditing = (id: string, currentName: string) => {
        setSelectedProject({ id, name: currentName });
        setIsRenameModalOpen(true);
    };

    const confirmRename = (newName: string) => {
        if (selectedProject) {
            updateProjectName(selectedProject.id, newName);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-80 bg-sidebar-bg border-r border-editor-line z-[101] flex flex-col shadow-2xl transition-colors duration-300"
                    >
                        <div className="p-6 border-b border-editor-line flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">Your Projects</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-primary transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 space-y-2">
                             {isCreating ? (
                                 <div className="w-full p-2 mb-4 bg-editor-bg border border-accent rounded-lg flex items-center gap-2">
                                     <input 
                                        autoFocus
                                        className="bg-transparent border-none outline-none text-sm text-primary flex-1 px-1"
                                        placeholder="Project name..."
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleCreateProject();
                                            if (e.key === 'Escape') setIsCreating(false);
                                        }}
                                     />
                                     <button 
                                        onClick={() => setIsCreating(false)}
                                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                     >
                                         <X size={14} />
                                     </button>
                                     <button 
                                        onClick={handleCreateProject}
                                        className="p-1.5 bg-accent text-white rounded hover:bg-blue-600 transition-colors"
                                     >
                                         <Plus size={14} />
                                     </button>
                                 </div>
                             ) : (
                                <button 
                                    onClick={() => setIsCreating(true)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-editor-line text-gray-500 hover:text-accent hover:border-accent transition-all text-sm mb-4"
                                >
                                    <Plus size={16} />
                                    New Project
                                </button>
                             )}

                            {projects.map((project) => (
                                <div 
                                    key={project.id}
                                    className={`group flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${activeProjectId === project.id ? 'bg-accent/10 border-accent text-accent' : 'border-transparent hover:bg-editor-bg text-gray-400 hover:text-primary'}`}
                                    onClick={() => {
                                        setActiveProjectId(project.id);
                                        onClose();
                                    }}
                                >
                                    <div className={`p-2 rounded shrink-0 ${activeProjectId === project.id ? 'bg-accent text-white' : 'bg-editor-line text-gray-400'}`}>
                                        <FileCode size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{project.name}</div>
                                        <div className="text-[10px] opacity-50 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(project.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEditing(project.id, project.name);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-accent transition-all"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        {projects.length > 1 && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteProject(project.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-editor-line bg-editor-bg/50">
                            <div className="text-[10px] text-gray-600 font-mono text-center">
                                total projects: {projects.length}
                            </div>
                        </div>
                    </motion.div>

                    <NameModal 
                        isOpen={isRenameModalOpen}
                        onClose={() => setIsRenameModalOpen(false)}
                        onConfirm={confirmRename}
                        title="Rename Project"
                        initialValue={selectedProject?.name}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

export default ProjectDrawer;
