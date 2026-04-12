import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Sparkles, Copy, GitFork, Volume2, VolumeX, Download } from 'lucide-react';
import { OrchestrationTurn, AgentStatus, ChatMessage } from '../../types';
import { AGENTS } from '../../constants';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface ViewingTurnModalProps {
  viewingTurn: OrchestrationTurn | null;
  setViewingTurn: React.Dispatch<React.SetStateAction<OrchestrationTurn | null>>;
  turns: OrchestrationTurn[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  navigate: (path: string) => void;
  basePath: string;
  toggleSpeech: (text: string) => void;
  isSpeaking: boolean;
  handleDownloadMarkdown: (content: string) => void;
}

export const ViewingTurnModal: React.FC<ViewingTurnModalProps> = ({
  viewingTurn,
  setViewingTurn,
  turns,
  setHistory,
  navigate,
  basePath,
  toggleSpeech,
  isSpeaking,
  handleDownloadMarkdown
}) => {
  return (
    <AnimatePresence>
      {viewingTurn && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-5xl bg-[#0b0f1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <History className="text-purple-400" size={20} />
                <h2 className="text-lg font-bold text-white">Past Turn Details</h2>
                <span className="text-xs text-gray-500 ml-2">{new Date(viewingTurn.timestamp).toLocaleString()}</span>
                {viewingTurn.topology && (
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-bold ml-2">
                    {viewingTurn.topology}
                  </span>
                )}
                {viewingTurn.collaborationMode && (
                  <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-xs font-bold ml-2">
                    {viewingTurn.collaborationMode}
                  </span>
                )}
                {viewingTurn.totalTokens && viewingTurn.totalTokens > 0 && (
                  <span className="flex items-center gap-1 text-yellow-500/70 text-xs ml-2" title="Total Tokens">
                    <Sparkles size={12} />
                    {viewingTurn.totalTokens.toLocaleString()}
                  </span>
                )}
              </div>
              <button onClick={() => setViewingTurn(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">User Prompt</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(viewingTurn.prompt);
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Copy size={12} /> Copy Prompt
                    </button>
                    <button 
                      onClick={() => {
                        const turnIndex = turns.findIndex(t => t.id === viewingTurn.id);
                        if (turnIndex !== -1) {
                          const newHistory: ChatMessage[] = [];
                          for (let i = turns.length - 1; i >= turnIndex; i--) {
                            newHistory.push({ role: 'user', parts: [{ text: turns[i].prompt }] });
                            newHistory.push({ role: 'model', parts: [{ text: turns[i].finalOutput }] });
                          }
                          setHistory(newHistory);
                          setViewingTurn(null);
                          navigate(basePath);
                        }
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <GitFork size={12} /> Branch from Here
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-gray-200">
                  {viewingTurn.prompt}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Agent Outputs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(viewingTurn.dynamicAgents || Object.values(AGENTS)).map(agent => (
                    <div key={agent.id} className="p-4 rounded-xl bg-black/40 border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`font-bold text-sm ${agent.color}`}>{agent.name}</span>
                        {viewingTurn.agentOutputs[agent.id]?.status === AgentStatus.ERROR && (
                          <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Error</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-300 font-mono max-h-40 overflow-y-auto scrollbar-hide">
                        {viewingTurn.agentOutputs[agent.id]?.status === AgentStatus.ERROR 
                          ? <span className="text-red-400">{viewingTurn.agentOutputs[agent.id]?.error}</span>
                          : (
                            <>
                              <MarkdownRenderer content={viewingTurn.agentOutputs[agent.id]?.content || ''} compact={true} />
                              {viewingTurn.agentOutputs[agent.id]?.critique && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block mb-2">Critique & Refinement</span>
                                  <MarkdownRenderer content={viewingTurn.agentOutputs[agent.id]?.critique || ''} compact={true} />
                                </div>
                              )}
                            </>
                          )
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400" />
                  Final Synthesis
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => toggleSpeech(viewingTurn.finalOutput)}
                    className={`p-1.5 rounded hover:bg-white/10 transition-colors ${isSpeaking ? 'text-cyan-400' : 'text-gray-500 hover:text-white'}`}
                    title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
                  >
                    {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <button
                    onClick={() => handleDownloadMarkdown(viewingTurn.finalOutput)}
                    className="p-1.5 rounded hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
                    title="Download Markdown"
                  >
                    <Download size={14} />
                  </button>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                  <MarkdownRenderer content={viewingTurn.finalOutput} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
