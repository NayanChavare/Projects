import React, { createContext, useContext, useState, useEffect } from 'react';
import { EditorState, Language, Project } from '../types';

interface EditorContextType {
  activeLanguage: Language;
  setActiveLanguage: (lang: Language) => void;
  code: EditorState;
  updateCode: (lang: Language, value: string) => void;
  resetCode: () => void;
  projects: Project[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  createProject: (name: string) => void;
  deleteProject: (id: string) => void;
  updateProjectName: (id: string, name: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isSaving: boolean;
}

const DEFAULT_CODE: EditorState = {
  html: `<!-- Welcome to CodeCraft Studio -->
<div class="hero">
  <h1>CodeCraft Playground</h1>
  <p>Edit HTML, CSS, and JS to see changes live!</p>
  <button id="cta">Click Me</button>
</div>`,
  css: `/* Add your styles here */
body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #111;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
}

.hero {
  text-align: center;
  padding: 2rem;
  border: 1px solid #333;
  border-radius: 12px;
  background: #1a1a1a;
}

h1 {
  color: #3b82f6;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;
}

button:hover {
  opacity: 0.8;
}`,
  js: `/* Add your scripts here */
const btn = document.getElementById('cta');

btn.addEventListener('click', () => {
  console.log('Happy Coding! 🚀');
  console.log('Button clicked at:', new Date().toLocaleTimeString());
});`
};

const CLEAN_CODE: EditorState = {
  html: '',
  css: '',
  js: ''
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLanguage, setActiveLanguage] = useState<Language>('html');
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('code-craft-projects');
    if (saved) return JSON.parse(saved);
    return [{ id: 'default', name: 'My First Project', code: DEFAULT_CODE, updatedAt: Date.now() }];
  });
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return localStorage.getItem('code-craft-active-id') || 'default';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('code-craft-theme');
    return saved ? saved === 'dark' : true;
  });
  const [isSaving, setIsSaving] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const code = activeProject.code;

  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem('code-craft-projects', JSON.stringify(projects));
    const timeout = setTimeout(() => setIsSaving(false), 500);
    return () => clearTimeout(timeout);
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('code-craft-active-id', activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem('code-craft-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const updateCode = (lang: Language, value: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          code: {
            ...p.code,
            [lang === 'javascript' ? 'js' : lang]: value
          },
          updatedAt: Date.now()
        };
      }
      return p;
    }));
  };

  const createProject = (name: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newProject: Project = {
      id: newId,
      name,
      code: CLEAN_CODE,
      updatedAt: Date.now()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newId);
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) {
      return;
    }
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    if (activeProjectId === id) {
      setActiveProjectId(remaining[0].id);
    }
  };

  const updateProjectName = (id: string, name: string) => {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name, updatedAt: Date.now() } : p));
  };

  const resetCode = () => {
    // Factory Reset
    const factoryState: Project[] = [{ 
      id: 'default', 
      name: 'My First Project', 
      code: DEFAULT_CODE, 
      updatedAt: Date.now() 
    }];
    setProjects(factoryState);
    setActiveProjectId('default');
    localStorage.removeItem('code-craft-projects');
    localStorage.removeItem('code-craft-active-id');
  };

  return (
    <EditorContext.Provider value={{
      activeLanguage,
      setActiveLanguage,
      code,
      updateCode,
      resetCode,
      projects,
      activeProjectId,
      setActiveProjectId,
      createProject,
      deleteProject,
      updateProjectName,
      isDarkMode,
      toggleTheme,
      isSaving
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
