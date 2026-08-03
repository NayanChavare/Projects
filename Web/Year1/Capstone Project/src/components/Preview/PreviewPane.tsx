import React, { useState, useEffect, useRef } from 'react';
import { useEditor } from '../../context/EditorContext';
import { Maximize2, RotateCcw, Monitor, Tablet, Smartphone, Terminal as TerminalIcon, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Log {
  type: 'log' | 'error' | 'warn' | 'info';
  messages: any[];
  timestamp: string;
}

const PreviewPane: React.FC = () => {
  const { code } = useEditor();
  const [srcCode, setSrcCode] = useState('');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [logs, setLogs] = useState<Log[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        const newLog: Log = {
          type: event.data.method,
          messages: event.data.arguments,
          timestamp: new Date().toLocaleTimeString(),
        };
        setLogs(prev => [...prev, newLog]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (isConsoleOpen && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isConsoleOpen]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const consoleScript = `
        <script>
          (function() {
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn,
              info: console.info
            };

            const sendLog = (method, args) => {
              window.parent.postMessage({
                type: 'console',
                method: method,
                arguments: Array.from(args).map(arg => {
                  try {
                    return typeof arg === 'object' ? JSON.parse(JSON.stringify(arg)) : arg;
                  } catch (e) {
                    return String(arg);
                  }
                })
              }, '*');
            };

            console.log = function() { originalConsole.log.apply(console, arguments); sendLog('log', arguments); };
            console.error = function() { originalConsole.error.apply(console, arguments); sendLog('error', arguments); };
            console.warn = function() { originalConsole.warn.apply(console, arguments); sendLog('warn', arguments); };
            console.info = function() { originalConsole.info.apply(console, arguments); sendLog('info', arguments); };

            window.onerror = function(message, source, lineno, colno, error) {
              sendLog('error', [message + ' (line ' + lineno + ')']);
            };
          })();
        </script>
      `;

      const combined = `
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; }
              ${code.css}
            </style>
            ${consoleScript}
          </head>
          <body>
            ${code.html}
            <script>${code.js}</script>
          </body>
        </html>
      `;
      setSrcCode(combined);
      setLogs([]); // Clear logs on re-run
    }, 500);

    return () => clearTimeout(timeout);
  }, [code]);

  const getWidth = () => {
    switch (viewMode) {
      case 'desktop': return '100%';
      case 'tablet': return '768px';
      case 'mobile': return '375px';
      default: return '100%';
    }
  };

  const clearLogs = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogs([]);
  };

  const handleRefresh = () => {
    const current = srcCode;
    setSrcCode('');
    setTimeout(() => setSrcCode(current), 10);
    setLogs([]);
  };

  const handleMaximize = () => {
    setIsFullscreenMode(!isFullscreenMode);
  };

  return (
    <div className={`flex flex-col border-l border-editor-line bg-[#000] transition-all duration-300 ${isFullscreenMode ? 'fixed inset-0 z-[500]' : 'flex-1 overflow-hidden relative'}`}>
      <div className="h-12 border-b border-editor-line flex items-center justify-between px-4 bg-sidebar-bg shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono uppercase text-gray-500">Live Preview {isFullscreenMode && '(Fullscreen)'}</span>
          <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-md border border-editor-line">
            <button 
              onClick={() => setViewMode('desktop')}
              title="Desktop View"
              className={`p-1 rounded transition-colors ${viewMode === 'desktop' ? 'bg-accent text-white' : 'text-gray-500 hover:text-primary'}`}
            >
              <Monitor size={14} />
            </button>
            <button 
              onClick={() => setViewMode('tablet')}
              title="Tablet View"
              className={`p-1 rounded transition-colors ${viewMode === 'tablet' ? 'bg-accent text-white' : 'text-gray-500 hover:text-primary'}`}
            >
              <Tablet size={14} />
            </button>
            <button 
              onClick={() => setViewMode('mobile')}
              title="Mobile View"
              className={`p-1 rounded transition-colors ${viewMode === 'mobile' ? 'bg-accent text-white' : 'text-gray-500 hover:text-primary'}`}
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleRefresh}
                title="Refresh Preview"
                className="p-1.5 text-gray-500 hover:text-primary transition-colors"
            >
                <RotateCcw size={14} />
            </button>
            <button 
                onClick={handleMaximize}
                title={isFullscreenMode ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className={`p-1.5 transition-colors ${isFullscreenMode ? 'text-accent hover:text-accent/80' : 'text-gray-500 hover:text-primary'}`}
            >
                <Maximize2 size={14} />
            </button>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center items-center p-4 bg-[#0a0a0a] overflow-auto relative">
        <motion.div 
          layout
          className="bg-white rounded shadow-2xl overflow-hidden transition-all duration-300"
          style={{ width: getWidth(), height: '100%' }}
        >
          <iframe
            srcDoc={srcCode}
            title="preview"
            sandbox="allow-scripts"
            width="100%"
            height="100%"
            className="border-none"
          />
        </motion.div>
      </div>

      {/* Console Panel */}
      <div className={`flex flex-col border-t border-editor-line bg-sidebar-bg transition-all duration-300 ${isConsoleOpen ? 'h-48' : 'h-10'}`}>
        <div 
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className="h-10 flex items-center justify-between px-4 cursor-pointer hover:bg-editor-bg transition-colors shrink-0"
        >
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <TerminalIcon size={14} />
                <span>Console ({logs.length})</span>
            </div>
            <div className="flex items-center gap-3">
                {isConsoleOpen && (
                    <button 
                        onClick={clearLogs}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        title="Clear console"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
                {isConsoleOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronUp size={14} className="text-gray-500" />}
            </div>
        </div>
        
        <div className="flex-1 overflow-auto p-2 font-mono text-[11px]">
            {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-600 italic">
                    No console messages
                </div>
            ) : (
                <div className="space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className={`flex gap-3 py-1 border-b border-editor-line/50 last:border-0 ${
                            log.type === 'error' ? 'text-red-400 bg-red-400/5 px-2 -mx-2' : 
                            log.type === 'warn' ? 'text-yellow-400 bg-yellow-400/5 px-2 -mx-2' : 
                            'text-gray-300'
                        }`}>
                            <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                            <div className="flex-1 break-all">
                                {log.messages.map((msg, j) => (
                                    <span key={j} className="mr-2">
                                        {typeof msg === 'object' ? JSON.stringify(msg, null, 2) : String(msg)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div ref={consoleEndRef} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPane;
