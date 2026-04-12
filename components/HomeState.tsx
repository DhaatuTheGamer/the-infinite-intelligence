import React from 'react';
import { motion } from 'motion/react';
import { Infinity, Sparkles } from 'lucide-react';

interface HomeStateProps {
  handleNavigateWithTransition: (targetPath: string) => void;
}

export const HomeState: React.FC<HomeStateProps> = ({ handleNavigateWithTransition }) => {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
    >
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 rounded-3xl bg-black border border-white/10 flex items-center justify-center shadow-2xl rotate-12 hover:rotate-0 transition-transform duration-500">
                <Infinity size={48} className="text-cyan-400" />
            </div>
        </div>
        
        <div className="space-y-2 mb-8">
          <span className="text-[10px] uppercase tracking-[0.4em] text-cyan-500 font-black">Orchestration Protocol v4.0</span>
          <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.85] flex flex-col">
              <span>Summon The</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400">Ultimate Squad</span>
          </h2>
        </div>
        
        <p className="max-w-2xl text-gray-400 text-lg md:text-xl font-medium leading-relaxed mb-12">
            A multi-agent intelligence layer designed for high-stakes synthesis. 
            <span className="text-white"> Analyze. Assemble. Execute. Critique.</span>
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mb-8">
          {[
            { label: 'Logos', desc: 'Logic & Reason', color: 'text-blue-400' },
            { label: 'Pathos', desc: 'Emotion & Values', color: 'text-purple-400' },
            { label: 'Ethos', desc: 'Ethics & Authority', color: 'text-emerald-400' },
            { label: 'Praxis', desc: 'Action & Utility', color: 'text-amber-400' }
          ].map((squad, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1 hover:bg-white/10 transition-colors">
              <span className={`text-xs font-black uppercase tracking-widest ${squad.color}`}>{squad.label}</span>
              <span className="text-[10px] text-gray-500">{squad.desc}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => handleNavigateWithTransition('/beta')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest hover:from-emerald-500/30 hover:to-cyan-500/30 hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            <Sparkles size={16} className="animate-pulse" />
            Enter Beta Mode
          </button>
        </div>
    </motion.div>
  );
};
