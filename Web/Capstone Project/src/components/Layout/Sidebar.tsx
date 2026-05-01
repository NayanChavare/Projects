import React from 'react';
import { 
  Plus, 
  Files, 
  RotateCcw, 
  Download, 
  Moon,
  Sun
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import ProjectDrawer from './ProjectDrawer';
import NameModal from '../ui/NameModal';

const Sidebar: React.FC = () => {
    const { resetCode, code, createProject, isDarkMode, toggleTheme } = useEditor();
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleDownload = () => {
        const fullHtml = `
<!DOCTYPE html>
<html>
<head>
<style>${code.css}</style>
</head>
<body>
${code.html}
<script>${code.js}</script>
</body>
</html>`;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'codecraft-project.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleNewProject = () => {
        setIsModalOpen(true);
    };

    const confirmCreate = (name: string) => {
        createProject(name);
    };

    const actions = [
        { 
            icon: Plus, 
            label: 'New', 
            onClick: handleNewProject 
        },
        { icon: Files, label: 'Projects', onClick: () => setIsDrawerOpen(true) },
        { icon: RotateCcw, label: 'Reset', onClick: resetCode, color: 'hover:text-red-400' },
    ];

    return (
        <>
            <aside className="w-16 flex flex-col items-center py-4 border-r border-editor-line bg-sidebar-bg shrink-0 transition-colors duration-300">
            <div className="flex-1 flex flex-col gap-4">
                {actions.map((action, i) => (
                    <button
                        key={i}
                        onClick={action.onClick}
                        title={action.label}
                        className={`p-3 rounded-xl transition-all group relative border border-transparent hover:border-editor-line hover:bg-editor-bg ${action.color || 'text-gray-500 hover:text-primary'}`}
                    >
                        <action.icon size={20} strokeWidth={2} />
                        <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-4">
                 <button 
                    onClick={toggleTheme}
                    title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    className="p-3 text-gray-500 hover:text-primary transition-colors rounded-xl border border-transparent hover:border-editor-line hover:bg-editor-bg group relative"
                 >
                    {isDarkMode ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
                    <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </span>
                </button>
            </div>
        </aside>
        <ProjectDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        <NameModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={confirmCreate}
            title="Create New Project"
            initialValue=""
        />
        </>
    );
};

export default Sidebar;
