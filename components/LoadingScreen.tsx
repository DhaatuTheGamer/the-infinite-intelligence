import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingScreenProps {
  isTransitioning: boolean;
  transitionTarget: string | null;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isTransitioning, transitionTarget }) => {
  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#030712] backdrop-blur-xl"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-[50px] rounded-full" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full relative z-10"
            />
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-xl font-bold text-white tracking-widest uppercase"
          >
            Hold tight, Captain...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-cyan-400/60 font-mono"
          >
            {transitionTarget === '/beta' ? 'INITIALIZING BETA PROTOCOLS' : 'RESTORING STANDARD ORCHESTRATION'}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
