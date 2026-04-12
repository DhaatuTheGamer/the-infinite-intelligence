import React from 'react';
import { AgentPersona, ProcessingState, AgentStatus } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, ArrowDown, Activity, BrainCircuit, Users, Sparkles, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface AgentFlowVisualizationProps {
  activeAgents: AgentPersona[];
  processingState: ProcessingState;
  agentResults: Record<string, any>;
  collaborationMode: string;
}

export const AgentFlowVisualization: React.FC<AgentFlowVisualizationProps> = ({
  activeAgents,
  processingState,
  agentResults,
  collaborationMode
}) => {
  if (processingState.step === 'IDLE' || processingState.step === 'DONE') return null;

  const isWorking = processingState.step === 'AGENTS_WORKING';
  const isCritiquing = processingState.step === 'AGENTS_CRITIQUING';
  const isSynthesizing = processingState.step === 'SYNTHESIZING';
  const isPaused = processingState.step === 'PAUSED_FOR_REVIEW';

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-emerald-500/5 animate-pulse-glow"></div>
      
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2 relative z-10">
        <Activity size={14} className="text-cyan-400" />
        Orchestration Flow: {collaborationMode}
      </h3>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        
        {/* User Prompt Node */}
        <motion.div 
          animate={{ 
            scale: processingState.step === 'ANALYZING_PROMPT' ? 1.05 : 1,
            borderColor: processingState.step === 'ANALYZING_PROMPT' ? 'rgba(167, 139, 250, 0.8)' : 'rgba(255,255,255,0.1)',
            boxShadow: processingState.step === 'ANALYZING_PROMPT' ? '0 0 15px rgba(167, 139, 250, 0.3)' : 'none'
          }}
          className="px-4 py-3 rounded-lg bg-black/60 border text-sm text-gray-300 flex items-center gap-2 min-w-[140px] justify-center"
        >
          <User size={16} className="text-purple-400" />
          User Prompt
        </motion.div>

        {/* Arrow 1 */}
        <div className="relative flex items-center justify-center w-8 h-8 md:w-16 md:h-auto">
          <motion.div
            animate={{ opacity: isWorking ? 1 : 0.3 }}
            className="hidden md:block w-full h-[2px] bg-gradient-to-r from-purple-500/50 to-cyan-500/50"
          />
          <ArrowRight className="hidden md:block absolute text-cyan-400 right-0" size={16} />
          <ArrowDown className="md:hidden text-cyan-400" size={20} />
          {isWorking && (
            <motion.div 
              className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        {/* Agents Node */}
        <motion.div 
          animate={{
            borderColor: (isWorking || isCritiquing) ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255,255,255,0.1)',
            boxShadow: (isWorking || isCritiquing) ? '0 0 15px rgba(56, 189, 248, 0.2)' : 'none'
          }}
          className="flex flex-col items-center gap-3 p-4 rounded-xl border bg-black/40 relative"
        >
          <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <Users size={12} />
            Agent Swarm
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {activeAgents.map(agent => {
              const status = agentResults[agent.id]?.status;
              const agentWorking = status === AgentStatus.THINKING;
              const agentCritiquing = status === AgentStatus.CRITIQUING;
              const agentDone = status === AgentStatus.COMPLETED;
              const agentError = status === AgentStatus.ERROR;
              
              let statusColor = 'rgba(255,255,255,0.1)';
              let statusBg = 'rgba(0,0,0,0.6)';
              let statusShadow = 'none';
              
              if (agentWorking) {
                statusColor = 'rgba(56, 189, 248, 0.8)'; // Cyan
                statusBg = 'rgba(56, 189, 248, 0.1)';
                statusShadow = '0 0 15px rgba(56, 189, 248, 0.3)';
              } else if (agentCritiquing) {
                statusColor = 'rgba(251, 191, 36, 0.8)'; // Amber
                statusBg = 'rgba(251, 191, 36, 0.1)';
                statusShadow = '0 0 15px rgba(251, 191, 36, 0.3)';
              } else if (agentDone) {
                statusColor = 'rgba(74, 222, 128, 0.6)'; // Green
                statusBg = 'rgba(74, 222, 128, 0.05)';
              } else if (agentError) {
                statusColor = 'rgba(239, 68, 68, 0.8)'; // Red
                statusBg = 'rgba(239, 68, 68, 0.1)';
                statusShadow = '0 0 15px rgba(239, 68, 68, 0.3)';
              }
              
              return (
                <motion.div
                  key={agent.id}
                  animate={{
                    scale: (agentWorking || agentCritiquing) ? 1.05 : 1,
                    borderColor: statusColor,
                    backgroundColor: statusBg,
                    boxShadow: statusShadow
                  }}
                  className={`flex flex-col gap-1.5 px-2 py-1.5 rounded-md border text-[10px] ${agent.color} relative overflow-visible group cursor-help`}
                >
                  <div className="flex items-center gap-1.5 relative z-10">
                    <BrainCircuit size={12} className={(agentWorking || agentCritiquing) ? 'animate-pulse' : ''} />
                    <span className="truncate max-w-[80px] font-bold">{agent.name}</span>
                    {agentWorking && <span className="absolute right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>}
                    {agentCritiquing && <span className="absolute right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>}
                    {agentDone && <CheckCircle2 size={10} className="absolute right-1 text-green-400" />}
                    {agentError && <AlertCircle size={10} className="absolute right-1 text-red-400" />}
                  </div>
                  {agentResults[agent.id]?.summary && (
                    <div className="text-[9px] text-gray-400 leading-tight border-t border-white/5 pt-1 mt-0.5 line-clamp-2 relative z-10">
                      {agentResults[agent.id].summary}
                    </div>
                  )}
                  
                  {/* Tooltip */}
                  {agentResults[agent.id]?.summary && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      <p className="text-xs text-gray-300 whitespace-pre-wrap">{agentResults[agent.id].summary}</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Critique Arrows (Internal) */}
          {isCritiquing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              <div className="w-16 h-16 border border-amber-500/30 rounded-full animate-[spin_4s_linear_infinite] border-t-amber-400 border-b-amber-400"></div>
              <div className="absolute text-[8px] text-amber-400 font-bold bg-black/80 px-1 rounded">PEER REVIEW</div>
            </motion.div>
          )}
        </motion.div>

        {/* Arrow 2 */}
        <div className="relative flex items-center justify-center w-8 h-8 md:w-16 md:h-auto">
          <motion.div
            animate={{ opacity: isSynthesizing ? 1 : 0.3 }}
            className="hidden md:block w-full h-[2px] bg-gradient-to-r from-cyan-500/50 to-rose-500/50"
          />
          <ArrowRight className="hidden md:block absolute text-rose-400 right-0" size={16} />
          <ArrowDown className="md:hidden text-rose-400" size={20} />
          {isSynthesizing && (
            <motion.div 
              className="absolute w-2 h-2 bg-rose-400 rounded-full shadow-[0_0_8px_#fb7185]"
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
          {isPaused && (
            <div className="absolute text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/30 whitespace-nowrap -top-6">
              PAUSED
            </div>
          )}
        </div>

        {/* Synthesizer Node */}
        <motion.div 
          animate={{ 
            scale: isSynthesizing ? 1.05 : 1,
            borderColor: isSynthesizing ? 'rgba(244, 63, 94, 0.8)' : 'rgba(255,255,255,0.1)',
            boxShadow: isSynthesizing ? '0 0 15px rgba(244, 63, 94, 0.3)' : 'none'
          }}
          className="px-4 py-3 rounded-lg bg-black/60 border text-sm text-gray-300 flex items-center gap-2 min-w-[140px] justify-center relative overflow-hidden"
        >
          {isSynthesizing && <div className="absolute inset-0 bg-rose-500/10 animate-pulse"></div>}
          <Sparkles size={16} className={isSynthesizing ? 'animate-pulse text-rose-400' : 'text-gray-500'} />
          <span className={isSynthesizing ? 'text-rose-100' : ''}>Final Synthesis</span>
        </motion.div>
        
      </div>
    </motion.div>
  );
};
