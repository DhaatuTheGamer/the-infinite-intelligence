import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Settings2, X, SlidersHorizontal, Globe, Bot, Check, Plus, Trash2, Save } from 'lucide-react';
import { AgentPersona, AgentPreset, AgentId } from '../../types';
import { AGENT_PRESETS } from '../../constants';

interface SettingsModalProps {
  showSettings: boolean;
  basePath: string;
  settingsTab: 'synthesizer' | 'agents' | 'presets';
  setSettingsTab: (tab: 'synthesizer' | 'agents' | 'presets') => void;
  synthTopP: number;
  setSynthTopP: (val: number) => void;
  synthTemp: number;
  setSynthTemp: (val: number) => void;
  synthFreqPenalty: number;
  setSynthFreqPenalty: (val: number) => void;
  synthTopK: number;
  setSynthTopK: (val: number) => void;
  isWebSearchEnabled: boolean;
  setIsWebSearchEnabled: (val: boolean) => void;
  activeAgents: AgentPersona[];
  setActiveAgents: React.Dispatch<React.SetStateAction<AgentPersona[]>>;
  customSavedPresets: Record<string, AgentPreset>;
  setCustomSavedPresets: React.Dispatch<React.SetStateAction<Record<string, AgentPreset>>>;
  agentPresetSelections: Record<string, string>;
  setAgentPresetSelections: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customInstructions: Record<string, string>;
  setCustomInstructions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSavingPreset: boolean;
  setIsSavingPreset: (val: boolean) => void;
  newPresetName: string;
  setNewPresetName: (val: string) => void;
  saveCustomPreset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  showSettings,
  basePath,
  settingsTab,
  setSettingsTab,
  synthTopP,
  setSynthTopP,
  synthTemp,
  setSynthTemp,
  synthFreqPenalty,
  setSynthFreqPenalty,
  synthTopK,
  setSynthTopK,
  isWebSearchEnabled,
  setIsWebSearchEnabled,
  activeAgents,
  setActiveAgents,
  customSavedPresets,
  setCustomSavedPresets,
  agentPresetSelections,
  setAgentPresetSelections,
  customInstructions,
  setCustomInstructions,
  isSavingPreset,
  setIsSavingPreset,
  newPresetName,
  setNewPresetName,
  saveCustomPreset
}) => {
  if (!showSettings) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl bg-[#0b0f1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
              <div className="p-6 border-b border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Settings2 className="text-cyan-400" />
                          <h2 className="text-xl font-bold text-white">Orchestration Settings</h2>
                      </div>
                      <Link to={basePath} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                          <X size={20} />
                      </Link>
                  </div>
                  <div className="flex items-center gap-2 border-b border-white/10 pb-1">
                      <button 
                          onClick={() => setSettingsTab('synthesizer')}
                          className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${settingsTab === 'synthesizer' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                      >
                          Synthesizer Parameters
                      </button>
                      <button 
                          onClick={() => setSettingsTab('agents')}
                          className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${settingsTab === 'agents' ? 'border-purple-400 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                      >
                          Agent Instructions
                      </button>
                      <button 
                          onClick={() => setSettingsTab('presets')}
                          className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${settingsTab === 'presets' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                      >
                          Preset Management
                      </button>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Synthesizer Settings */}
                  {settingsTab === 'synthesizer' && (
                  <div className="space-y-6 p-5 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                          <SlidersHorizontal size={18} className="text-amber-400" />
                          <h3 className="font-bold text-white">Synthesizer Parameters</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Row 1: Top-P (Left) and Creativity (Right) */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400" title="Top-P: Nucleus sampling parameter. Controls randomness by sampling from the smallest set of tokens whose cumulative probability exceeds P.">Top-P</span>
                                <span className="text-purple-400 font-mono">{synthTopP.toFixed(2)}</span>
                            </div>
                            <input 
                                type="range" min="0" max="1" step="0.05" 
                                value={synthTopP} onChange={(e) => setSynthTopP(parseFloat(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                <span>Exact</span>
                                <span>Diverse</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400" title="Controls randomness. Lower is more deterministic.">Creativity (Temperature)</span>
                                <span className="text-cyan-400 font-mono">{synthTemp.toFixed(2)}</span>
                            </div>
                            <input 
                                type="range" min="0" max="2" step="0.05" 
                                value={synthTemp} onChange={(e) => setSynthTemp(parseFloat(e.target.value))}
                                className="w-full accent-cyan-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                <span>Focused</span>
                                <span>Creative</span>
                            </div>
                        </div>

                        {/* Row 2: Frequency Penalty (Left) and Top-K (Right) */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400" title="Frequency Penalty: Reduces the likelihood of repeating tokens.">Frequency Penalty</span>
                                <span className="text-amber-400 font-mono">{synthFreqPenalty.toFixed(2)}</span>
                            </div>
                            <input 
                                type="range" min="-2" max="2" step="0.1" 
                                value={synthFreqPenalty} onChange={(e) => setSynthFreqPenalty(parseFloat(e.target.value))}
                                className="w-full accent-amber-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                <span>Repetitive</span>
                                <span>Novel</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400" title="Top-K: Limits sampling to the K most likely next tokens.">Top-K</span>
                                <span className="text-emerald-400 font-mono">{synthTopK}</span>
                            </div>
                            <input 
                                type="range" min="1" max="100" step="1" 
                                value={synthTopK} onChange={(e) => setSynthTopK(parseInt(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                <span>Narrow</span>
                                <span>Broad</span>
                            </div>
                        </div>

                        {/* Row 3: Web Search (Left) */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <div className="flex items-center gap-2">
                                  <Globe size={14} className="text-cyan-400" />
                                  <span className="text-gray-400" title="Enable Web Search for agents to pull real-time data.">Web Search (Grounding)</span>
                                </div>
                                <button 
                                  onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isWebSearchEnabled ? 'bg-cyan-500' : 'bg-gray-600'}`}
                                >
                                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isWebSearchEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                      </div>
                  </div>
                  )}

                  {/* Agent Instructions */}
                  {settingsTab === 'agents' && (
                  <div>
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                          <Bot size={18} className="text-purple-400" />
                          Agent System Instructions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {activeAgents.map((agent) => (
                              <div key={agent.id} className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                                  <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                          <div className={`p-1.5 rounded-md bg-white/5 ${agent.color}`}>
                                              <Bot size={16} />
                                          </div>
                                          <div className="flex flex-col">
                                            <h3 className="font-bold text-white">{agent.name}</h3>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{agent.role}</span>
                                          </div>
                                      </div>
                                      
                                      {/* Icon Selector */}
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-500 uppercase">Icon:</span>
                                        <select 
                                          value={agent.icon}
                                          onChange={(e) => {
                                            const newIcon = e.target.value;
                                            setActiveAgents(prev => prev.map(a => a.id === agent.id ? { ...a, icon: newIcon } : a));
                                          }}
                                          className="bg-[#0b0f1a] border border-white/20 rounded-md px-2 py-1 text-xs text-cyan-400 focus:outline-none focus:border-cyan-500/50 hover:border-white/30 transition-colors cursor-pointer"
                                        >
                                          {['BrainCircuit', 'Sparkles', 'ShieldCheck', 'Hammer', 'Bot', 'FileText', 'Code', 'PenTool', 'Lightbulb', 'Zap', 'Target', 'Eye', 'MessageSquare', 'Activity', 'Compass', 'Crosshair', 'Cpu', 'Database', 'Globe', 'Layers', 'Layout', 'Maximize', 'Minimize', 'Monitor', 'MousePointer', 'Move', 'Navigation', 'Octagon', 'Package', 'Paperclip', 'PieChart', 'Play', 'Power', 'Printer', 'Radio', 'RefreshCw', 'Repeat', 'Save', 'Search', 'Send', 'Server', 'Settings', 'Share2', 'Shield', 'ShoppingBag', 'ShoppingCart', 'Shuffle', 'Sidebar', 'SkipBack', 'SkipForward', 'Slack', 'Slash', 'Sliders', 'Smartphone', 'Smile', 'Speaker', 'Square', 'Star', 'StopCircle', 'Sun', 'Sunrise', 'Sunset', 'Tablet', 'Tag', 'TargetIcon', 'Terminal', 'Thermometer', 'ThumbsDownIcon', 'ThumbsUpIcon', 'ToggleLeft', 'ToggleRight', 'Trash', 'Trash2', 'Trello', 'TrendingDown', 'TrendingUp', 'Triangle', 'Truck', 'Tv', 'Twitch', 'Twitter', 'Type', 'Umbrella', 'Underline', 'Unlock', 'Upload', 'UploadCloud', 'User', 'UserCheck', 'UserMinus', 'UserPlus', 'Users', 'Video', 'VideoOff', 'Voicemail', 'Volume', 'Volume1', 'Volume2', 'VolumeX', 'Watch', 'Wifi', 'WifiOff', 'Wind', 'X', 'XCircle', 'XOctagon', 'XSquare', 'Youtube', 'ZapOff', 'ZoomIn', 'ZoomOut'].map(icon => (
                                            <option key={icon} value={icon} className="bg-[#0b0f1a] text-gray-300">{icon}</option>
                                          ))}
                                        </select>
                                      </div>
                                  </div>
                                  
                                  {/* Presets */}
                                  <div className="flex flex-wrap gap-1.5">
                                      {['Basic', 'Creative', 'Analytical', 'Practical', ...Object.keys(customSavedPresets), 'Custom'].map(preset => (
                                          <button
                                              key={preset}
                                              onClick={() => {
                                                  setAgentPresetSelections(prev => ({ ...prev, [agent.id]: preset }));
                                                  if (preset !== 'Custom') {
                                                      const presetData = AGENT_PRESETS[preset] || customSavedPresets[preset];
                                                      if (presetData && presetData.instructions[agent.id]) {
                                                        setCustomInstructions(prev => ({ ...prev, [agent.id]: presetData.instructions[agent.id]! }));
                                                      }
                                                  }
                                              }}
                                              className={`px-2 py-1 text-[10px] font-medium rounded-md border transition-colors ${
                                                  agentPresetSelections[agent.id] === preset 
                                                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                                                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                                              }`}
                                          >
                                              {preset}
                                          </button>
                                      ))}
                                  </div>

                                  <textarea 
                                      value={customInstructions[agent.id] || agent.systemInstruction}
                                      onChange={(e) => {
                                          setCustomInstructions(prev => ({ ...prev, [agent.id]: e.target.value }));
                                          setAgentPresetSelections(prev => ({ ...prev, [agent.id]: 'Custom' }));
                                      }}
                                      className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none mt-2"
                                      placeholder={`Enter system instructions for ${agent.name}...`}
                                  />
                              </div>
                          ))}
                      </div>
                  </div>
                  )}
                  
                  {/* Save Custom Preset */}
                  {settingsTab === 'presets' && (
                  <div className="p-4 rounded-xl bg-cyan-900/10 border border-cyan-500/20 flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                              <h4 className="text-sm font-bold text-cyan-400">Save Current Instructions as Preset</h4>
                              <p className="text-xs text-gray-400 mt-1">Save the current configuration of all 4 agents to reuse later.</p>
                          </div>
                          {isSavingPreset ? (
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <input 
                                      type="text" 
                                      value={newPresetName}
                                      onChange={e => setNewPresetName(e.target.value)}
                                      placeholder="Preset Name..."
                                      className="bg-black/40 border border-cyan-500/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none w-full sm:w-40"
                                      autoFocus
                                      onKeyDown={e => e.key === 'Enter' && saveCustomPreset()}
                                  />
                                  <button onClick={saveCustomPreset} className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                                      <Check size={16} />
                                  </button>
                                  <button onClick={() => setIsSavingPreset(false)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                                      <X size={16} />
                                  </button>
                              </div>
                          ) : (
                              <button 
                                  onClick={() => setIsSavingPreset(true)}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-all"
                              >
                                  <Plus size={14} />
                                  <span>Save Preset</span>
                              </button>
                          )}
                      </div>
                      
                      {Object.keys(customSavedPresets).length > 0 && (
                          <div className="pt-4 border-t border-cyan-500/20">
                              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Saved Presets</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {Object.entries(customSavedPresets).map(([key, preset]) => (
                                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                                          <span className="text-sm text-gray-300">{preset.name || key}</span>
                                          <button 
                                              onClick={() => {
                                                  const newPresets = { ...customSavedPresets };
                                                  delete newPresets[key];
                                                  setCustomSavedPresets(newPresets);
                                              }}
                                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                          >
                                              <Trash2 size={14} />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
                  )}
              </div>

              <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-4">
                  <button 
                      onClick={() => {
                          const newInstructions: Record<string, string> = {};
                          const newSelections: Record<string, string> = {};
                          activeAgents.forEach(a => {
                            newInstructions[a.id] = a.systemInstruction;
                            newSelections[a.id] = 'Analytical'; // Default fallback
                          });
                          setCustomInstructions(newInstructions);
                          setAgentPresetSelections(newSelections);
                          setSynthTemp(0.5);
                          setSynthTopP(0.95);
                          setSynthTopK(64);
                          setSynthFreqPenalty(0);
                      }}
                      className="px-4 py-2 rounded-xl hover:bg-white/5 text-sm font-medium transition-all"
                  >
                      Reset to Defaults
                  </button>
                  <Link 
                      to={basePath}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all"
                  >
                      <Save size={18} />
                      <span>Save & Close</span>
                  </Link>
              </div>
          </motion.div>
      </div>
    </AnimatePresence>
  );
};
