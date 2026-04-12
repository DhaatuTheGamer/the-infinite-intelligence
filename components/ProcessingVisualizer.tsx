import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

interface ProcessingVisualizerProps {
  processingState: { isProcessing: boolean; step: string };
  isHitlEnabled: boolean;
}

export const ProcessingVisualizer: React.FC<ProcessingVisualizerProps> = ({
  processingState,
  isHitlEnabled
}) => {
  return (
    <AnimatePresence>
      {processingState.step !== 'IDLE' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-col items-center justify-center py-6 overflow-hidden"
        >
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] w-full max-w-4xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-amber-500/5 animate-pulse"></div>
            
            {[
              { step: 'ANALYZING_PROMPT', label: 'Analyze', color: 'text-cyan-400', bg: 'bg-cyan-400/20', border: 'border-cyan-400' },
              { step: 'ASSEMBLING_AGENTS', label: 'Assemble', color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400' },
              { step: 'AGENTS_WORKING', label: 'Execute', color: 'text-emerald-400', bg: 'bg-emerald-400/20', border: 'border-emerald-400' },
              { step: 'AGENTS_CRITIQUING', label: 'Critique', color: 'text-amber-400', bg: 'bg-amber-400/20', border: 'border-amber-400' },
              ...(isHitlEnabled ? [{ step: 'PAUSED_FOR_REVIEW', label: 'Review', color: 'text-rose-400', bg: 'bg-rose-900/40', border: 'border-rose-500' }] : []),
              { step: 'SYNTHESIZING', label: 'Synthesize', color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400' }
            ].map((s, idx, arr) => {
              const isActive = processingState.step === s.step;
              const isPast = arr.findIndex(item => item.step === processingState.step) > idx;
              
              return (
                <React.Fragment key={s.step}>
                  <div className={`flex items-center gap-2 transition-all duration-500 ${isActive ? s.color : isPast ? 'text-gray-400' : 'text-gray-700'}`}>
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-500 ${isActive ? `${s.border} ${s.bg} shadow-[0_0_15px_rgba(255,255,255,0.1)]` : isPast ? 'border-gray-600 bg-gray-600/10' : 'border-gray-800'}`}>
                      {isPast ? <Check size={12} strokeWidth={4} /> : <span>{idx + 1}</span>}
                    </div>
                    <span className={isActive ? 'opacity-100' : 'opacity-40'}>{s.label}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className={`h-px w-8 transition-all duration-500 ${isPast ? 'bg-gray-600' : 'bg-gray-800'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
