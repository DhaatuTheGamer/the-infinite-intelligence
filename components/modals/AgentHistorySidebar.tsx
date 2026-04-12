import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bot } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Agent } from '../../types';

interface AgentHistoryItem {
  prompt: string;
  timestamp: number;
  agents: Agent[];
}

interface AgentHistorySidebarProps {
  showAgentHistory: boolean;
  basePath: string;
  betaHistory: AgentHistoryItem[];
  setActiveAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

export const AgentHistorySidebar: React.FC<AgentHistorySidebarProps> = ({
  showAgentHistory,
  basePath,
  betaHistory,
  setActiveAgents
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {showAgentHistory && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => navigate(basePath)}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 sm:w-96 bg-[#0b0f1a] border-r border-white/10 z-[100] shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <Bot className="text-emerald-400" size={20} />
                <h2 className="font-bold text-white">Agent History</h2>
              </div>
              <Link to={basePath} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {betaHistory.map((item, idx) => (
                <div key={idx} className="bg-black/40 border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-white line-clamp-2">{item.prompt}</p>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.agents.map(a => (
                      <span key={a.id} className={`text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${a.color}`}>
                        {a.name}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setActiveAgents(item.agents);
                        navigate(basePath);
                      }}
                      className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20 transition-colors"
                    >
                      Load Agents
                    </button>
                  </div>
                </div>
              ))}
              {betaHistory.length === 0 && (
                <div className="text-center mt-10 text-gray-500">
                  <Bot size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No agent history found.</p>
                  <p className="text-xs mt-2">Use Beta Mode to generate agents.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
