import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { Cloud, Check } from 'lucide-react';

const Footer: React.FC = () => {
  const { isSaving } = useEditor();

  return (
    <footer className="h-8 border-t border-editor-line bg-sidebar-bg flex items-center justify-between px-4 shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {isSaving ? (
          <span className="flex items-center gap-1.5 text-[10px] text-accent font-mono animate-pulse">
            <Cloud size={12} />
            Saving...
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
            <Check size={12} className="text-green-500" />
            Saved
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 text-[10px] text-gray-600 font-mono">
         <span>Ln 1, Col 1</span>
         <span>Spaces: 2</span>
      </div>
    </footer>
  );
};

export default Footer;
