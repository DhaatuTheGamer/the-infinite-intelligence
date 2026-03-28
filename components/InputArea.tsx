import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface InputAreaProps {
  onSend: (prompt: string) => void;
  disabled: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-8">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 rounded-2xl opacity-30 group-hover:opacity-60 transition duration-500 blur"></div>
        <div className="relative bg-gray-900 rounded-2xl p-2 flex items-end gap-2 border border-white/10 shadow-2xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              autoFocus
              placeholder="Ask the Infinite Intelligence..."
              className="w-full bg-transparent text-gray-100 placeholder-gray-500 text-lg px-4 py-3 min-h-[60px] max-h-[200px] resize-none focus:outline-none scrollbar-hide"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300
                ${!input.trim() || disabled 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-cyan-50 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105'
                }`}
            >
              {disabled ? <Sparkles size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
        </div>
        <div className="mt-2 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">Orchestrated Multi-Agent System</p>
        </div>
      </form>
    </div>
  );
};
