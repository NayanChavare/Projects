import React from 'react';
import { EditorProvider } from './context/EditorContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import CodeEditor from './components/Editor/CodeEditor';
import PreviewPane from './components/Preview/PreviewPane';
import { motion } from 'motion/react';

export default function App() {
  return (
    <EditorProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-editor-bg">
        <Navbar />
        
        <main className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <div className="flex flex-1 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col min-w-[300px]"
            >
              <CodeEditor />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col min-w-[300px]"
            >
              <PreviewPane />
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </EditorProvider>
  );
}
