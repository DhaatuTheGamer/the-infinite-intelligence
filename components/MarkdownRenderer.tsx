import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  compact?: boolean;
}

const CodeBlock = ({ inline, className, children, compact, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const isInline = inline || !match;
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInline) {
     return (
      <code className="bg-white/10 text-cyan-200 px-1 py-0.5 rounded font-mono text-[0.9em]" {...props}>
        {children}
      </code>
     );
  }

  return (
    <div className={`relative group ${compact ? 'my-2' : 'my-6'}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative bg-[#0d1117] rounded-lg border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5">
           <span className="text-xs text-gray-500 font-mono lowercase">{match ? match[1] : 'code'}</span>
           <button 
             onClick={handleCopy}
             className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
             title="Copy code"
           >
             {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
             <span className="text-[10px] uppercase font-medium">{copied ? 'Copied' : 'Copy'}</span>
           </button>
        </div>
        <pre className={`overflow-x-auto scrollbar-hide ${compact ? 'p-2' : 'p-4'}`}>
          <code className={`font-mono text-gray-200 ${compact ? 'text-xs' : 'text-sm'} ${className}`} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, compact = false }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className={`font-bold text-white mb-2 ${compact ? 'text-base mt-2' : 'text-2xl mt-6'}`} {...props} />,
        h2: ({node, ...props}) => <h2 className={`font-bold text-white mb-2 ${compact ? 'text-sm mt-2' : 'text-xl mt-5'}`} {...props} />,
        h3: ({node, ...props}) => <h3 className={`font-bold text-white mb-1 ${compact ? 'text-xs mt-1' : 'text-lg mt-4'}`} {...props} />,
        p: ({node, ...props}) => <p className={`text-gray-300 leading-relaxed ${compact ? 'mb-2 text-xs' : 'mb-4 text-base'}`} {...props} />,
        ul: ({node, ...props}) => <ul className={`list-disc list-outside ml-4 text-gray-300 ${compact ? 'mb-2 text-xs' : 'mb-4 text-base'}`} {...props} />,
        ol: ({node, ...props}) => <ol className={`list-decimal list-outside ml-4 text-gray-300 ${compact ? 'mb-2 text-xs' : 'mb-4 text-base'}`} {...props} />,
        li: ({node, ...props}) => <li className="mb-1 pl-1" {...props} />,
        a: ({node, ...props}) => <a className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className={`border-l-2 border-cyan-500/50 pl-4 italic text-gray-400 ${compact ? 'my-2 text-xs' : 'my-4 text-base'}`} {...props} />,
        code: (props) => <CodeBlock {...props} compact={compact} />,
        table: ({node, ...props}) => <div className={`overflow-x-auto border border-white/10 rounded-lg ${compact ? 'my-2' : 'my-6'}`}><table className="w-full text-left border-collapse" {...props} /></div>,
        th: ({node, ...props}) => <th className={`bg-white/5 font-semibold text-gray-200 border-b border-white/10 ${compact ? 'p-2 text-xs' : 'p-3 text-sm'}`} {...props} />,
        td: ({node, ...props}) => <td className={`border-b border-white/5 text-gray-400 ${compact ? 'p-2 text-xs' : 'p-3 text-sm'}`} {...props} />,
        hr: ({node, ...props}) => <hr className="border-white/10 my-6" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
