import React from 'react';
import { Link } from 'react-router-dom';
import { Settings2, History, Bot, Save, Cpu, Activity, Plus } from 'lucide-react';
import { OrchestrationTurn } from '../types';

interface MissionControlToolbarProps {
  turns: OrchestrationTurn[];
  betaHistory: any[];
  customSavedPresets: Record<string, any>;
  totalTokens: number;
  isHome: boolean;
  processingState: { isProcessing: boolean; step: string };
  finalOutput: string;
}

export const MissionControlToolbar: React.FC<MissionControlToolbarProps> = ({
  turns,
  betaHistory,
  customSavedPresets,
  totalTokens,
  isHome,
  processingState,
  finalOutput
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-1">
            <Link 
                to="/settings"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white/5 text-sm font-bold text-gray-400 hover:text-cyan-400 transition-all group"
            >
                <Settings2 size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                <span className="uppercase tracking-widest text-[10px]">Settings</span>
            </Link>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <Link 
                to="/history"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white/5 text-sm font-bold text-gray-400 hover:text-purple-400 transition-all group"
            >
                <History size={18} />
                <span className="uppercase tracking-widest text-[10px]">Chat History <span className="ml-1 text-purple-500/50">[{turns.length}]</span></span>
            </Link>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <Link 
                to="/agent-history"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white/5 text-sm font-bold text-gray-400 hover:text-emerald-400 transition-all group"
            >
                <Bot size={18} />
                <span className="uppercase tracking-widest text-[10px]">Agent History <span className="ml-1 text-emerald-500/50">[{betaHistory.length}]</span></span>
            </Link>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <Link 
                to="/agent-presets"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white/5 text-sm font-bold text-gray-400 hover:text-amber-400 transition-all group"
            >
                <Save size={18} />
                <span className="uppercase tracking-widest text-[10px]">Agent Presets <span className="ml-1 text-amber-500/50">[{Object.keys(customSavedPresets).length}]</span></span>
            </Link>
        </div>

        <div className="flex items-center gap-3 px-2">
            {totalTokens > 0 && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/40 border border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Cpu size={14} className="text-yellow-500/50" />
                  <span className="font-mono text-yellow-500/80">{totalTokens.toLocaleString()}</span>
                  <span className="opacity-40">Tokens</span>
                </div>
                <div className="w-px h-3 bg-white/10"></div>
                <div className="flex items-center gap-1.5">
                  <Activity size={14} className="text-cyan-500/50" />
                  <span className="text-cyan-500/80">Active</span>
                </div>
              </div>
            )}
            
            {!(isHome && processingState.step === 'IDLE' && !finalOutput) && (
              <Link 
                  to="/newchat"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                  <Plus size={16} strokeWidth={3} />
                  <span>New Session</span>
              </Link>
            )}
        </div>
    </div>
  );
};
