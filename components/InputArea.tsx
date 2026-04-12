import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Mic, MicOff, Paperclip, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

interface InputAreaProps {
  onSend: (prompt: string) => void;
  disabled: boolean;
  isBetaMode?: boolean;
  onExitBeta?: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled, isBetaMode = false, onExitBeta }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{name: string, content: string}[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [angle, setAngle] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setAngle(prev => (prev + 2) % 360);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 50, y: 50 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachedFiles.length > 0) && !disabled) {
      let finalPrompt = input;
      if (attachedFiles.length > 0) {
        finalPrompt += '\n\n--- Attached Files ---\n';
        attachedFiles.forEach(f => {
          finalPrompt += `\nFile: ${f.name}\n\`\`\`\n${f.content}\n\`\`\`\n`;
        });
      }
      onSend(finalPrompt);
      setInput('');
      setAttachedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedFiles(prev => [...prev, { name: file.name, content: event.target!.result as string }]);
        }
      };
      reader.readAsText(file);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-8">
      <form 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onSubmit={handleSubmit} 
        className="relative group"
      >
        <div 
          className="absolute -inset-0.5 rounded-2xl opacity-30 group-hover:opacity-60 transition duration-300 blur"
          style={{
            background: `conic-gradient(from ${angle}deg at ${mousePos.x}% ${mousePos.y}%, #06b6d4, #a855f7, #f59e0b, #06b6d4)`,
          }}
        ></div>
        <div className="relative bg-gray-900 rounded-2xl p-2 flex flex-col gap-2 border border-white/10 shadow-2xl">
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-2 pt-2">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-cyan-900/30 text-cyan-200 text-xs px-2 py-1 rounded border border-cyan-500/30">
                    <Paperclip size={10} />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button type="button" onClick={() => removeFile(idx)} className="hover:text-red-400 ml-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 w-full">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                autoFocus
                placeholder={isBetaMode ? "Describe the team of experts you want to assemble..." : "Ask the Infinite Intelligence..."}
                className={`w-full bg-transparent text-gray-100 placeholder-gray-500 text-lg px-4 py-3 min-h-[60px] max-h-[200px] resize-none focus:outline-none scrollbar-hide ${isBetaMode ? 'text-emerald-400' : ''}`}
                rows={1}
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept=".txt,.md,.json,.csv,.js,.ts,.html,.css" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="p-3 rounded-xl flex items-center justify-center transition-all duration-300 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                title="Attach Document"
              >
                <Paperclip size={20} />
              </button>
              <button
                type="button"
                onClick={toggleListening}
                disabled={disabled}
                className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 mr-1
                  ${isListening 
                    ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' 
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                type="submit"
                disabled={(!input.trim() && attachedFiles.length === 0) || disabled}
                className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300
                  ${(!input.trim() && attachedFiles.length === 0) || disabled 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-cyan-50 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105'
                  }`}
              >
                {disabled ? (
                  <Sparkles 
                    size={20} 
                    className="animate-pulse text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
                  />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
        </div>
        <div className="mt-2 flex items-center justify-between relative px-2">
            <div className="w-24"></div> {/* Spacer for centering */}
            <p className={`text-[10px] uppercase tracking-[0.2em] font-medium ${isBetaMode ? 'text-fuchsia-500 font-mono' : 'text-gray-500'}`}>
              {isBetaMode ? 'Agent Forge Active' : 'Orchestrated Multi-Agent System'}
            </p>
            <div className="w-24 flex justify-end">
              {isBetaMode && (
                <button 
                  type="button"
                  onClick={() => setShowExitConfirm(true)}
                  className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] uppercase tracking-widest font-black text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all flex items-center gap-1"
                >
                  <X size={12} />
                  Exit Forge
                </button>
              )}
            </div>
        </div>
      </form>

      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0b0f1a] rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-red-500/10">
                <AlertTriangle className="text-red-400" size={24} />
                <h2 className="text-lg font-bold text-white">Exit Agent Forge?</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-300 text-sm">
                  Are you sure you want to exit the Agent Forge? Your current work may be lost.
                </p>
              </div>
              <div className="p-4 border-t border-white/5 bg-white/5 flex justify-end gap-3">
                <button 
                  onClick={() => setShowExitConfirm(false)}
                  className="px-4 py-2 rounded-xl hover:bg-white/5 text-sm font-bold text-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowExitConfirm(false);
                    if (onExitBeta) {
                      onExitBeta();
                    } else {
                      navigate('/home');
                    }
                  }}
                  className="px-6 py-2 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
