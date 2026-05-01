import React from 'react';
import Editor from 'react-simple-code-editor';
// @ts-ignore - prismjs types are tricky
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';
import { useEditor } from '../../context/EditorContext';

const CodeEditor: React.FC = () => {
  const { code, activeLanguage, updateCode } = useEditor();

  const getGrammar = () => {
    switch (activeLanguage) {
      case 'html': return languages.markup;
      case 'css': return languages.css;
      case 'javascript': return languages.javascript;
      default: return languages.markup;
    }
  };

  const currentCode = activeLanguage === 'javascript' ? code.js : code[activeLanguage];

  return (
    <div className="flex-1 overflow-auto bg-panel-bg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
          Editing {activeLanguage}
        </span>
      </div>
      <div className="flex-1 relative font-mono text-sm border border-editor-line rounded-lg group overflow-auto">
        <Editor
          value={currentCode}
          onValueChange={code => updateCode(activeLanguage, code)}
          highlight={code => highlight(code, getGrammar(), activeLanguage)}
          padding={20}
          className="outline-none"
          style={{
            fontFamily: '"Fira Code", monospace',
            fontSize: 14,
            minHeight: '100%',
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
