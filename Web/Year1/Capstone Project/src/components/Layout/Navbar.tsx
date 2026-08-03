import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { Code2, Hash, Braces, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

const Navbar: React.FC = () => {
  const { activeLanguage, setActiveLanguage, projects, activeProjectId, isDarkMode } = useEditor();
  const activeProject = projects.find(p => p.id === activeProjectId);

  const tabs = [
    { id: 'html', label: 'HTML', icon: Code2, color: 'text-orange-500' },
    { id: 'css', label: 'CSS', icon: Hash, color: 'text-blue-500' },
    { id: 'javascript', label: 'JS', icon: Braces, color: 'text-yellow-500' },
  ];

  return (
    <header className="h-14 border-b border-editor-line bg-sidebar-bg flex items-center justify-between px-6 z-10 shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-8 h-full">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                <Terminal className="text-white" size={18} />
            </div>
            <div className="flex flex-col hidden sm:flex">
                <span className="text-[10px] text-gray-500 font-mono leading-none mb-1">PROJECT</span>
                <span className="font-bold tracking-tight leading-none truncate max-w-[120px] text-primary">{activeProject?.name}</span>
            </div>
        </div>

        <nav className="flex h-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveLanguage(tab.id as any)}
              className={`
                relative px-6 flex items-center gap-2 text-sm font-medium transition-all
                ${activeLanguage === tab.id ? 'text-primary' : 'text-gray-500 hover:text-primary'}
              `}
            >
              <tab.icon size={16} className={tab.color} />
              {tab.label}
              {activeLanguage === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
          <div className="h-6 w-[1px] bg-editor-line mx-2" />
      </div>
    </header>
  );
};

export default Navbar;
