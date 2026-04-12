import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Plus, Search, Edit2, Archive, ArchiveRestore, Trash2, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { OrchestrationTurn } from '../../types';

interface HistorySidebarProps {
  showHistory: boolean;
  basePath: string;
  historyTab: 'active' | 'archived';
  setHistoryTab: React.Dispatch<React.SetStateAction<'active' | 'archived'>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  turns: OrchestrationTurn[];
  currentSessionId: string | null;
  setCurrentSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  editingTurnId: string | null;
  setEditingTurnId: React.Dispatch<React.SetStateAction<string | null>>;
  editingTitle: string;
  setEditingTitle: React.Dispatch<React.SetStateAction<string>>;
  saveTurnTitle: (sessionId: string, newTitle: string) => void;
  toggleArchiveSession: (e: React.MouseEvent, sessionId: string) => void;
  setTurns: React.Dispatch<React.SetStateAction<OrchestrationTurn[]>>;
  startNewChat: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  showHistory,
  basePath,
  historyTab,
  setHistoryTab,
  searchQuery,
  setSearchQuery,
  turns,
  currentSessionId,
  setCurrentSessionId,
  editingTurnId,
  setEditingTurnId,
  editingTitle,
  setEditingTitle,
  saveTurnTitle,
  toggleArchiveSession,
  setTurns,
  startNewChat
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {showHistory && (
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
                <History className="text-cyan-400" size={20} />
                <h2 className="font-bold text-white">Conversation History</h2>
              </div>
              <Link to={basePath} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </Link>
            </div>

            <div className="p-4 border-b border-white/5">
              <Link 
                to="/newchat"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 font-bold transition-all shadow-lg shadow-cyan-500/5"
              >
                <Plus size={20} />
                <span>Start New Chat</span>
              </Link>
            </div>

            <div className="flex border-b border-white/5">
              <button 
                onClick={() => setHistoryTab('active')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${historyTab === 'active' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setHistoryTab('archived')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${historyTab === 'archived' ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              >
                Archived
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Search history..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {Array.from(new Set(turns.map(t => t.sessionId || 'default'))).map(sessionId => {
                const sessionTurns = turns.filter(t => {
                  const isSessionMatch = (t.sessionId || 'default') === sessionId;
                  if (!isSessionMatch) return false;
                  if (historyTab === 'active' && t.archived) return false;
                  if (historyTab === 'archived' && !t.archived) return false;
                  return true;
                });
                if (sessionTurns.length === 0) return null;
                const firstTurn = sessionTurns[0];
                
                if (searchQuery) {
                  const query = searchQuery.toLowerCase();
                  const matches = sessionTurns.some(t => 
                    t.prompt.toLowerCase().includes(query) || 
                    t.finalOutput.toLowerCase().includes(query) ||
                    (t.title && t.title.toLowerCase().includes(query))
                  );
                  if (!matches) return null;
                }

                return (
                  <div
                    key={sessionId}
                    className={`w-full text-left p-4 rounded-xl border transition-all group flex flex-col gap-2 relative cursor-pointer ${currentSessionId === sessionId ? 'bg-cyan-900/20 border-cyan-500/30' : 'bg-white/5 hover:bg-white/10 border-white/5'}`}
                    onClick={() => {
                      setCurrentSessionId(sessionId);
                      navigate(basePath);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                        {new Date(firstTurn.timestamp).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTurnId(sessionId);
                            setEditingTitle(firstTurn.title || firstTurn.prompt);
                          }}
                          className="p-1.5 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors"
                          title="Edit Title"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => toggleArchiveSession(e, sessionId)}
                          className={`p-1.5 rounded-lg transition-colors ${historyTab === 'active' ? 'hover:bg-purple-500/20 text-purple-400' : 'hover:bg-green-500/20 text-green-400'}`}
                          title={historyTab === 'active' ? "Archive Chat" : "Restore Chat"}
                        >
                          {historyTab === 'active' ? <Archive size={14} /> : <ArchiveRestore size={14} />}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setTurns(prev => prev.filter(t => (t.sessionId || 'default') !== sessionId));
                            if (currentSessionId === sessionId) {
                              startNewChat();
                            }
                          }}
                          className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          title="Delete Chat"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {editingTurnId === sessionId ? (
                      <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="text" 
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 bg-black/60 border border-cyan-500/50 rounded px-2 py-1 text-sm text-white focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTurnTitle(sessionId, editingTitle);
                            if (e.key === 'Escape') setEditingTurnId(null);
                          }}
                        />
                        <button 
                          onClick={() => saveTurnTitle(sessionId, editingTitle)}
                          className="p-1 text-green-400 hover:bg-green-400/10 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => setEditingTurnId(null)}
                          className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <h3 className="text-sm font-bold text-white line-clamp-2">
                        {firstTurn.title || firstTurn.prompt}
                      </h3>
                    )}
                    <p className="text-xs text-gray-400">
                      {sessionTurns.length} message{sessionTurns.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
              {turns.length === 0 && (
                <div className="text-center mt-10 text-gray-500">
                  <History size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No history found.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
