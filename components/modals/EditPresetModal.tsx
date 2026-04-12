import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit2 } from 'lucide-react';
import { AgentPreset, AgentId } from '../../types';
import { AGENTS } from '../../constants';

interface EditPresetModalProps {
  editingPreset: AgentPreset | null;
  setEditingPreset: React.Dispatch<React.SetStateAction<AgentPreset | null>>;
  setCustomSavedPresets: React.Dispatch<React.SetStateAction<Record<string, AgentPreset>>>;
}

export const EditPresetModal: React.FC<EditPresetModalProps> = ({
  editingPreset,
  setEditingPreset,
  setCustomSavedPresets
}) => {
  return (
    <AnimatePresence>
      {editingPreset && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-4xl bg-[#0b0f1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <Edit2 className="text-amber-400" size={20} />
                <h2 className="text-lg font-bold text-white">Edit Agent Preset</h2>
              </div>
              <button onClick={() => setEditingPreset(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Title and Description */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Preset Title</label>
                  <input 
                    type="text" 
                    value={editingPreset.name || ''}
                    onChange={(e) => setEditingPreset({ ...editingPreset, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    placeholder="Enter preset title..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                  <textarea 
                    value={editingPreset.description || ''}
                    onChange={(e) => setEditingPreset({ ...editingPreset, description: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[80px] resize-none"
                    placeholder="Enter preset description..."
                  />
                </div>
              </div>

              {/* Agent Prompts */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 pb-2">Agent Instructions</h3>
                {[AgentId.DYNAMIC_1, AgentId.DYNAMIC_2, AgentId.DYNAMIC_3, AgentId.DYNAMIC_4].map(agentId => {
                  const defaultAgent = AGENTS[agentId];
                  const agentName = editingPreset.agents?.[agentId] || defaultAgent.name;
                  
                  return (
                  <div key={agentId} className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 group">
                      <div className={`w-2 h-2 rounded-full ${defaultAgent.color.replace('text-', 'bg-')}`}></div>
                      <label className="flex items-center gap-2 cursor-text">
                        <input
                          type="text"
                          value={agentName}
                          onChange={(e) => {
                            const newAgents = { ...(editingPreset.agents || {}) };
                            newAgents[agentId] = e.target.value;
                            setEditingPreset({ ...editingPreset, agents: newAgents });
                          }}
                          className={`font-bold text-sm bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-500/50 focus:outline-none transition-colors px-1 py-0.5 ${defaultAgent.color}`}
                        />
                        <Edit2 size={12} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                      </label>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest ml-auto">{defaultAgent.role}</span>
                    </div>
                    <textarea 
                      value={editingPreset.instructions?.[agentId] || ''}
                      onChange={(e) => {
                        const newInstructions = { ...editingPreset.instructions };
                        newInstructions[agentId] = e.target.value;
                        setEditingPreset({ ...editingPreset, instructions: newInstructions });
                      }}
                      className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-amber-500/30 transition-colors min-h-[120px] font-mono leading-relaxed"
                      placeholder={`Enter instructions for ${agentName}...`}
                    />
                  </div>
                )})}
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-white/5 flex justify-end gap-3">
              <button 
                onClick={() => setEditingPreset(null)}
                className="px-6 py-2 rounded-xl hover:bg-white/5 text-sm font-bold text-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (editingPreset.id) {
                    setCustomSavedPresets(prev => ({
                      ...prev,
                      [editingPreset.id!]: editingPreset
                    }));
                    setEditingPreset(null);
                  }
                }}
                className="px-8 py-2 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
