import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Sparkles, Search, BrainCircuit, Save } from 'lucide-react';

export const BetaModeState: React.FC = () => {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center relative"
    >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-fuchsia-500 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 rounded-3xl bg-[#1a0b2e] border border-fuchsia-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(217,70,239,0.2)] rotate-45 hover:rotate-90 transition-transform duration-700">
                <Cpu size={40} className="text-fuchsia-400 -rotate-45 hover:-rotate-90 transition-transform duration-700" />
            </div>
        </div>
        
        <div className="space-y-4 mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-[10px] font-mono uppercase tracking-widest">
            <Sparkles size={12} />
            Agent Forge Active
          </span>
          <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 tracking-tighter uppercase leading-[0.9] font-mono">
              Architect Custom Swarms
          </h2>
        </div>
        
        <p className="max-w-2xl text-gray-400 text-lg md:text-xl font-mono leading-relaxed mb-12">
            Define your high-stakes objective. The orchestration engine will analyze your requirements and dynamically forge a specialized squad of AI experts to execute it.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
          <div className="p-6 rounded-2xl bg-black/40 border border-fuchsia-500/10 flex flex-col items-center text-center gap-3 hover:border-fuchsia-500/30 transition-colors">
             <Search className="text-fuchsia-400" size={24} />
             <h3 className="text-white font-bold font-mono text-sm uppercase tracking-wider">1. Analyze</h3>
             <p className="text-xs text-gray-500 font-mono">Deconstructs your prompt using first principles.</p>
          </div>
          <div className="p-6 rounded-2xl bg-black/40 border border-purple-500/10 flex flex-col items-center text-center gap-3 hover:border-purple-500/30 transition-colors">
             <BrainCircuit className="text-purple-400" size={24} />
             <h3 className="text-white font-bold font-mono text-sm uppercase tracking-wider">2. Assemble</h3>
             <p className="text-xs text-gray-500 font-mono">Generates bespoke system instructions for each agent.</p>
          </div>
          <div className="p-6 rounded-2xl bg-black/40 border border-indigo-500/10 flex flex-col items-center text-center gap-3 hover:border-indigo-500/30 transition-colors">
             <Save className="text-indigo-400" size={24} />
             <h3 className="text-white font-bold font-mono text-sm uppercase tracking-wider">3. Deploy</h3>
             <p className="text-xs text-gray-500 font-mono">Saves the squad as a reusable preset for future runs.</p>
          </div>
        </div>
    </motion.div>
  );
};
