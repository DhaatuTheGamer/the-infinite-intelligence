import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Trash2, Edit2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AgentPreset, AgentId, Agent } from '../../types';
import { AGENTS } from '../../constants';

interface AgentPresetsSidebarProps {
  showAgentPresets: boolean;
  basePath: string;
  setEditingPreset: React.Dispatch<React.SetStateAction<AgentPreset | null>>;
  customSavedPresets: Record<string, AgentPreset>;
  setCustomSavedPresets: React.Dispatch<React.SetStateAction<Record<string, AgentPreset>>>;
  setActiveAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

export const AgentPresetsSidebar: React.FC<AgentPresetsSidebarProps> = ({
  showAgentPresets,
  basePath,
  setEditingPreset,
  customSavedPresets,
  setCustomSavedPresets,
  setActiveAgents
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {showAgentPresets && (
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
                <Save className="text-amber-400" size={20} />
                <h2 className="font-bold text-white">Agent Presets</h2>
              </div>
              <Link to={basePath} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <button 
                onClick={() => setEditingPreset({ 
                  id: 'preset_' + Date.now(), 
                  name: '', 
                  description: '', 
                  instructions: {
                    [AgentId.DYNAMIC_1]: '',
                    [AgentId.DYNAMIC_2]: '',
                    [AgentId.DYNAMIC_3]: '',
                    [AgentId.DYNAMIC_4]: ''
                  },
                  agents: {
                    [AgentId.DYNAMIC_1]: 'Expert 1',
                    [AgentId.DYNAMIC_2]: 'Expert 2',
                    [AgentId.DYNAMIC_3]: 'Expert 3',
                    [AgentId.DYNAMIC_4]: 'Expert 4'
                  }
                })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-bold transition-all shadow-lg shadow-amber-500/5 mb-4"
              >
                <Plus size={20} />
                <span>Create New Preset</span>
              </button>

              {Object.values(customSavedPresets).map((preset) => (
                <div key={preset.id} className="bg-black/40 border border-white/5 rounded-xl p-4 hover:border-amber-500/30 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-amber-400">{preset.name}</h3>
                    <button 
                      onClick={() => {
                        const newPresets = { ...customSavedPresets };
                        if (preset.id) {
                          delete newPresets[preset.id];
                          setCustomSavedPresets(newPresets);
                        }
                      }}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{preset.description}</p>
                  
                  <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingPreset({ ...preset });
                      }}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded border border-white/10 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        // Load preset logic
                        const newAgents = [AgentId.DYNAMIC_1, AgentId.DYNAMIC_2, AgentId.DYNAMIC_3, AgentId.DYNAMIC_4].map(agentId => {
                          const baseAgent = AGENTS[agentId];
                          return {
                            ...baseAgent,
                            name: preset.agents?.[agentId] || baseAgent.name,
                            systemInstruction: preset.instructions?.[agentId] || baseAgent.systemInstruction
                          };
                        });
                        setActiveAgents(newAgents);
                        navigate(basePath);
                      }}
                      className="flex-1 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded border border-amber-500/20 transition-colors"
                    >
                      Apply Preset
                    </button>
                  </div>
                </div>
              ))}
              {Object.keys(customSavedPresets).length === 0 && (
                <div className="text-center mt-10 text-gray-500">
                  <Save size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No saved presets.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
