import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AgentId, AgentStatus, ProcessingState, ChatMessage, AgentResult, ConversationTurn, AgentPersona, Artifact, AgentPreset } from './types';
import { AGENTS, AGENT_PRESETS } from './constants';
import { generateAgentResponse, synthesizeFinalResponse, analyzePromptFirstPrinciples, assembleDynamicAgents, generateAgentCritique, extractArtifacts, generateAgentSummary } from './services/gemmaService';
import { AgentCard } from './components/AgentCard';
import { AgentFlowVisualization } from './components/AgentFlowVisualization';
import { InputArea } from './components/InputArea';
import { SettingsModal } from './components/modals/SettingsModal';
import { EditPresetModal } from './components/modals/EditPresetModal';
import { HistorySidebar } from './components/modals/HistorySidebar';
import { AgentHistorySidebar } from './components/modals/AgentHistorySidebar';
import { AgentPresetsSidebar } from './components/modals/AgentPresetsSidebar';
import { ViewingTurnModal } from './components/modals/ViewingTurnModal';
import { Header } from './components/Header';
import { MissionControlToolbar } from './components/MissionControlToolbar';
import { HomeState } from './components/HomeState';
import { BetaModeState } from './components/BetaModeState';
import { ProcessingVisualizer } from './components/ProcessingVisualizer';
import { ChatTurn } from './components/ChatTurn';
import { LoadingScreen } from './components/LoadingScreen';
import { Footer } from './components/Footer';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Bot, Sparkles, Settings2, History, X, Save, Plus, Cpu, Activity, Database, Globe, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    step: 'IDLE'
  });
  
  const [agentResults, setAgentResults] = useState<Record<AgentId, AgentResult>>({
    [AgentId.LOGOS]: { content: '', status: AgentStatus.IDLE },
    [AgentId.PATHOS]: { content: '', status: AgentStatus.IDLE },
    [AgentId.ETHOS]: { content: '', status: AgentStatus.IDLE },
    [AgentId.PRAXIS]: { content: '', status: AgentStatus.IDLE },
    [AgentId.DYNAMIC_1]: { content: '', status: AgentStatus.IDLE },
    [AgentId.DYNAMIC_2]: { content: '', status: AgentStatus.IDLE },
    [AgentId.DYNAMIC_3]: { content: '', status: AgentStatus.IDLE },
    [AgentId.DYNAMIC_4]: { content: '', status: AgentStatus.IDLE }
  });

  const [customInstructions, setCustomInstructions] = useState<Record<AgentId, string>>({
    [AgentId.LOGOS]: AGENTS[AgentId.LOGOS].systemInstruction,
    [AgentId.PATHOS]: AGENTS[AgentId.PATHOS].systemInstruction,
    [AgentId.ETHOS]: AGENTS[AgentId.ETHOS].systemInstruction,
    [AgentId.PRAXIS]: AGENTS[AgentId.PRAXIS].systemInstruction,
    [AgentId.DYNAMIC_1]: AGENTS[AgentId.DYNAMIC_1].systemInstruction,
    [AgentId.DYNAMIC_2]: AGENTS[AgentId.DYNAMIC_2].systemInstruction,
    [AgentId.DYNAMIC_3]: AGENTS[AgentId.DYNAMIC_3].systemInstruction,
    [AgentId.DYNAMIC_4]: AGENTS[AgentId.DYNAMIC_4].systemInstruction
  });

  const [agentFeedback, setAgentFeedback] = useState<Record<AgentId, 'up' | 'down' | null>>({
    [AgentId.LOGOS]: null,
    [AgentId.PATHOS]: null,
    [AgentId.ETHOS]: null,
    [AgentId.PRAXIS]: null,
    [AgentId.DYNAMIC_1]: null,
    [AgentId.DYNAMIC_2]: null,
    [AgentId.DYNAMIC_3]: null,
    [AgentId.DYNAMIC_4]: null
  });
  const activeTurnFeedbackRef = useRef<Partial<Record<AgentId, 'up' | 'down' | null>>>({});

  const [agentPresetSelections, setAgentPresetSelections] = useState<Record<AgentId, string>>({
    [AgentId.LOGOS]: 'Analytical',
    [AgentId.PATHOS]: 'Creative',
    [AgentId.ETHOS]: 'Practical',
    [AgentId.PRAXIS]: 'Practical',
    [AgentId.DYNAMIC_1]: 'Analytical',
    [AgentId.DYNAMIC_2]: 'Analytical',
    [AgentId.DYNAMIC_3]: 'Analytical',
    [AgentId.DYNAMIC_4]: 'Analytical'
  });

  const [customSavedPresets, setCustomSavedPresets] = useState<Record<string, AgentPreset>>(() => {
    const saved = localStorage.getItem('custom_presets');
    return saved ? JSON.parse(saved) : {};
  });
  const [newPresetName, setNewPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('current_session_id');
    return saved ? saved : Date.now().toString();
  });

  const [history, setHistory] = useState<ChatMessage[]>(() => {
    const savedSession = localStorage.getItem('current_session_id') || Date.now().toString();
    const saved = localStorage.getItem(`chat_history_${savedSession}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [turns, setTurns] = useState<ConversationTurn[]>(() => {
    const saved = localStorage.getItem('chat_turns');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('chat_turns', JSON.stringify(turns));
  }, [turns]);

  useEffect(() => {
    localStorage.setItem('current_session_id', currentSessionId);
    const savedHistory = localStorage.getItem(`chat_history_${currentSessionId}`);
    setHistory(savedHistory ? JSON.parse(savedHistory) : []);
  }, [currentSessionId]);

  useEffect(() => {
    localStorage.setItem(`chat_history_${currentSessionId}`, JSON.stringify(history));
  }, [history, currentSessionId]);

  const [historyTab, setHistoryTab] = useState<'active' | 'archived'>('active');
  const [settingsTab, setSettingsTab] = useState<'synthesizer' | 'agents' | 'presets'>('synthesizer');
  const [viewingTurn, setViewingTurn] = useState<ConversationTurn | null>(null);
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [synthTemp, setSynthTemp] = useState(0.5);
  const [synthTopP, setSynthTopP] = useState(0.95);
  const [synthTopK, setSynthTopK] = useState(64);
  const [synthFreqPenalty, setSynthFreqPenalty] = useState(0);

  const [activeAgents, setActiveAgents] = useState<AgentPersona[]>(Object.values(AGENTS));
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [showArtifacts, setShowArtifacts] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const [analyzedPrompt, setAnalyzedPrompt] = useState('');
  const [finalOutput, setFinalOutput] = useState('');
  const [isFinalOutputStreaming, setIsFinalOutputStreaming] = useState(false);
  const [activeFinalFeedback, setActiveFinalFeedback] = useState<'up' | 'down' | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [finalCopied, setFinalCopied] = useState(false);
  const finalRef = useRef<HTMLDivElement>(null);

  // New Enterprise Features State
  const [isHitlEnabled, setIsHitlEnabled] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentViewMode, setAgentViewMode] = useState<'grid' | 'tabs'>('grid');
  const [activeAgentTab, setActiveAgentTab] = useState<string>('');
  const [debateRounds, setDebateRounds] = useState(1);
  const [topology, setTopology] = useState<'QUICK' | 'STANDARD' | 'DEEP'>('STANDARD');
  const [collaborationMode, setCollaborationMode] = useState<'parallel' | 'sequential' | 'round-robin'>('parallel');
  const [totalTokens, setTotalTokens] = useState(0);

  const currentSessionTurns = turns.filter(t => t.sessionId === currentSessionId || (!t.sessionId && currentSessionId === 'default'));

  const path = location.pathname;
  const showSettings = path === '/settings';
  const isBetaMode = path === '/beta';
  const showHistory = path === '/history';
  const showAgentHistory = path === '/agent-history';
  const showAgentPresets = path === '/agent-presets';

  const isHome = currentSessionTurns.length === 0 && processingState.step === 'IDLE' && !finalOutput;
  const basePath = isHome ? '/home' : '/chat';

  // Loading Screen State
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

  const handleNavigateWithTransition = (targetPath: string) => {
    setIsTransitioning(true);
    setTransitionTarget(targetPath);
    setTimeout(() => {
      navigate(targetPath);
      setIsTransitioning(false);
      setTransitionTarget(null);
    }, 1500);
  };

  useEffect(() => {
    if (path === '/newchat') {
      startNewChat();
      navigate('/home', { replace: true });
    }
  }, [path, navigate]);

  // Beta Mode State
  const [editingPreset, setEditingPreset] = useState<AgentPreset | null>(null);
  const [betaHistory, setBetaHistory] = useState<{prompt: string, agents: AgentPersona[], timestamp: number}[]>(() => {
    const saved = localStorage.getItem('beta_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('beta_history', JSON.stringify(betaHistory));
  }, [betaHistory]);
  
  const [pendingSynthesisData, setPendingSynthesisData] = useState<{
    prompt: string;
    detailedPrompt: string;
    currentAgents: AgentPersona[];
    currentHistory: ChatMessage[];
    currentResults: Record<AgentId, AgentResult>;
    currentFeedback: Record<AgentId, 'up' | 'down' | null>;
  } | null>(null);

  // Scroll to final output when it starts
  useEffect(() => {
    if (processingState.step === 'SYNTHESIZING' && finalRef.current) {
      finalRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [processingState.step]);

  const handleBetaSubmit = async (prompt: string) => {
    setProcessingState({ isProcessing: true, step: 'ANALYZING_PROMPT' });
    const analysisResult = await analyzePromptFirstPrinciples(prompt, [], isWebSearchEnabled);
    const detailedPrompt = analysisResult.text;
    
    setProcessingState({ isProcessing: true, step: 'ASSEMBLING_AGENTS' });
    try {
      const assemblyResult = await assembleDynamicAgents(detailedPrompt, []);
      const newAgents = assemblyResult.agents;
      
      setBetaHistory(prev => [{ prompt, agents: newAgents, timestamp: Date.now() }, ...prev]);
      setActiveAgents(newAgents);
      setProcessingState({ isProcessing: false, step: 'IDLE' });
      
      // Auto-save as preset
      const presetName = prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '');
      const newPreset: AgentPreset = {
        id: 'preset_' + Date.now(),
        name: presetName,
        description: `Generated from: ${prompt}`,
        instructions: newAgents.reduce((acc, agent) => {
          acc[agent.id] = agent.systemInstruction;
          return acc;
        }, {} as Record<AgentId, string>),
        agents: newAgents.reduce((acc, agent) => {
          acc[agent.id] = agent.name;
          return acc;
        }, {} as Record<AgentId, string>)
      };
      setCustomSavedPresets(prev => ({ ...prev, [newPreset.id]: newPreset }));
      
      // Show presets panel
      handleNavigateWithTransition('/agent-presets');
    } catch (e) {
      console.error(e);
      setProcessingState({ isProcessing: false, step: 'IDLE' });
    }
  };

  const executeOrchestration = async (prompt: string, branchFromHistory?: ChatMessage[]) => {
      setProcessingState({ isProcessing: true, step: 'ANALYZING_PROMPT' });
      setAnalyzedPrompt('');
      
      // Reset agent results for new turn
      const initialResults: Record<AgentId, AgentResult> = {} as any;
      activeAgents.forEach(a => {
        initialResults[a.id] = { content: '', status: AgentStatus.IDLE };
      });
      setAgentResults(initialResults);
      setFinalOutput('');
      setFinalCopied(false);
      setArtifacts([]);
      
      const fullHistory = branchFromHistory || history;
      // Limit history to the last 4 messages (2 turns) to prevent exponential token growth
      const currentHistory = fullHistory.slice(-4);

      // Capture the current feedback to use for this turn, then clear it so it doesn't apply forever
      const currentFeedback = { ...agentFeedback };
      setAgentFeedback({} as any);
      activeTurnFeedbackRef.current = {};

      // STEP 0: Analyze Prompt
      const analysisResult = await analyzePromptFirstPrinciples(prompt, currentHistory, isWebSearchEnabled);
      const detailedPrompt = analysisResult.text;
      if (analysisResult.usage) {
        setTotalTokens(prev => prev + (analysisResult.usage?.totalTokenCount || 0));
      }
      setAnalyzedPrompt(detailedPrompt);

      // STEP 0.5: Assemble Dynamic Agents
      setProcessingState({ isProcessing: true, step: 'ASSEMBLING_AGENTS' });
      let currentAgents = activeAgents;
      
      // Determine agent count based on topology
      const agentCount = topology === 'QUICK' ? 2 : 4;
      
      try {
        const assemblyResult = await assembleDynamicAgents(detailedPrompt, currentHistory);
        currentAgents = assemblyResult.agents.slice(0, agentCount);
        if (assemblyResult.usage) {
          setTotalTokens(prev => prev + (assemblyResult.usage?.totalTokenCount || 0));
        }
        setActiveAgents(currentAgents);
      } catch (e) {
        console.error("Failed to assemble dynamic agents, falling back to defaults", e);
        currentAgents = Object.values(AGENTS).slice(0, agentCount);
        setActiveAgents(currentAgents);
      }

      setProcessingState({ isProcessing: true, step: 'AGENTS_WORKING' });

      const currentResults: Record<AgentId, AgentResult> = {} as any;
      currentAgents.forEach(a => {
        currentResults[a.id] = { content: '', status: AgentStatus.THINKING };
      });
      setAgentResults({ ...currentResults });

      // Build short-term memory context from the current turn's previous interactions
      const getShortTermMemory = (agentId: string) => {
        const previousTurns = turns.slice(-3); // Look at last 3 turns for short-term memory
        let memory = "";
        previousTurns.forEach(turn => {
          if (turn.agentOutputs[agentId]?.content) {
            memory += `\n[Previous Turn ${new Date(turn.timestamp).toLocaleTimeString()}]:\n${turn.agentOutputs[agentId].content}\n`;
          }
        });
        return memory ? `\n\n--- Your Recent Memory ---\n${memory}\nUse this context to maintain continuity.` : "";
      };

      // STEP 1: Agent Execution based on Collaboration Mode
      if (collaborationMode === 'parallel') {
        const promises = currentAgents.map(async (agent) => {
            try {
                let instruction = customInstructions[agent.id] || agent.systemInstruction;
                instruction += getShortTermMemory(agent.id);
                if (currentFeedback[agent.id] === 'up') {
                  instruction += "\n\nNote: The user gave your previous response a thumbs up. Keep up the good work and maintain your style.";
                } else if (currentFeedback[agent.id] === 'down') {
                  instruction += "\n\nNote: The user gave your previous response a thumbs down. Please adjust your approach, be more precise, and ensure you are strictly following your persona.";
                }

                const result = await generateAgentResponse(
                  agent, 
                  detailedPrompt, 
                  currentHistory.slice(-4), // Pass last 2 turns (4 messages) for short-term memory
                  instruction,
                  3,
                  isWebSearchEnabled,
                  (chunkText) => {
                    setAgentResults(prev => ({
                      ...prev,
                      [agent.id]: { ...prev[agent.id], content: prev[agent.id].content + chunkText }
                    }));
                  }
                );
                currentResults[agent.id] = { content: result.text, status: AgentStatus.COMPLETED, usage: result.usage };
                if (result.usage) {
                  setTotalTokens(prev => prev + (result.usage?.totalTokenCount || 0));
                }
                setAgentResults(prev => ({ ...prev, [agent.id]: currentResults[agent.id] }));
            } catch (error: any) {
                currentResults[agent.id] = { content: '', status: AgentStatus.ERROR, error: error.message };
                setAgentResults(prev => ({ ...prev, [agent.id]: currentResults[agent.id] }));
            }
        });

        await Promise.all(promises);
      } else if (collaborationMode === 'sequential') {
        let cumulativeContext = "";
        for (const agent of currentAgents) {
            try {
                let instruction = customInstructions[agent.id] || agent.systemInstruction;
                instruction += getShortTermMemory(agent.id);
                if (currentFeedback[agent.id] === 'up') {
                  instruction += "\n\nNote: The user gave your previous response a thumbs up. Keep up the good work and maintain your style.";
                } else if (currentFeedback[agent.id] === 'down') {
                  instruction += "\n\nNote: The user gave your previous response a thumbs down. Please adjust your approach, be more precise, and ensure you are strictly following your persona.";
                }

                const promptWithContext = cumulativeContext 
                  ? `${detailedPrompt}\n\n--- Previous Agents' Work ---\n${cumulativeContext}\n\nPlease build upon this.`
                  : detailedPrompt;

                const result = await generateAgentResponse(
                  agent, 
                  promptWithContext, 
                  currentHistory.slice(-4), // Pass last 2 turns (4 messages) for short-term memory
                  instruction,
                  3,
                  isWebSearchEnabled,
                  (chunkText) => {
                    setAgentResults(prev => ({
                      ...prev,
                      [agent.id]: { ...prev[agent.id], content: prev[agent.id].content + chunkText }
                    }));
                  }
                );
                
                currentResults[agent.id] = { content: result.text, status: AgentStatus.COMPLETED, usage: result.usage };
                if (result.usage) {
                  setTotalTokens(prev => prev + (result.usage?.totalTokenCount || 0));
                }
                setAgentResults(prev => ({ ...prev, [agent.id]: currentResults[agent.id] }));
                
                cumulativeContext += `\n\n[${agent.name}]:\n${result.text}`;
            } catch (error: any) {
                currentResults[agent.id] = { content: '', status: AgentStatus.ERROR, error: error.message };
                setAgentResults(prev => ({ ...prev, [agent.id]: currentResults[agent.id] }));
            }
        }
      } else if (collaborationMode === 'round-robin') {
        // Simple round-robin: 2 passes over the agents
        const passes = 2;
        let sharedWorkspace = "";
        
        for (let pass = 1; pass <= passes; pass++) {
          for (const agent of currentAgents) {
              // Only set to thinking if it's the first pass, otherwise keep it as completed from previous pass
              if (pass === 1) {
                setAgentResults(prev => ({ ...prev, [agent.id]: { ...prev[agent.id], status: AgentStatus.THINKING } }));
              }
              
              try {
                  let instruction = customInstructions[agent.id] || agent.systemInstruction;
                  instruction += getShortTermMemory(agent.id);
                  instruction += `\n\nThis is pass ${pass} of ${passes} in a round-robin collaboration.`;
                  
                  const promptWithWorkspace = sharedWorkspace 
                    ? `${detailedPrompt}\n\n--- Shared Workspace ---\n${sharedWorkspace}\n\nPlease review the workspace and add your specific insights or corrections.`
                    : detailedPrompt;

                  const result = await generateAgentResponse(
                    agent, 
                    promptWithWorkspace, 
                    currentHistory.slice(-4), // Pass last 2 turns (4 messages) for short-term memory
                    instruction,
                    3,
                    isWebSearchEnabled,
                    (chunkText) => {
                      setAgentResults(prev => ({
                        ...prev,
                        [agent.id]: { ...prev[agent.id], content: prev[agent.id].content + chunkText }
                      }));
                    }
                  );
                  
                  // Append to existing content if pass > 1
                  const newContent = pass > 1 && currentResults[agent.id].content 
                    ? `${currentResults[agent.id].content}\n\n--- Pass ${pass} ---\n${result.text}`
                    : result.text;

                  currentResults[agent.id] = { content: newContent, status: AgentStatus.COMPLETED, usage: result.usage };
                  if (result.usage) {
                    setTotalTokens(prev => prev + (result.usage?.totalTokenCount || 0));
                  }
                  setAgentResults(prev => ({ ...prev, [agent.id]: currentResults[agent.id] }));
                  
                  sharedWorkspace += `\n\n[${agent.name} (Pass ${pass})]:\n${result.text}`;
              } catch (error: any) {
                  currentResults[agent.id] = { content: currentResults[agent.id].content || '', status: AgentStatus.ERROR, error: error.message };
                  setAgentResults(prev => ({ ...prev, [agent.id]: currentResults[agent.id] }));
              }
          }
        }
      }

      // STEP 1.25: Generate Summaries
      const summaryPromises = currentAgents.map(async (agent) => {
        if (currentResults[agent.id].status === AgentStatus.COMPLETED && currentResults[agent.id].content) {
          try {
            const summaryResult = await generateAgentSummary(agent, currentResults[agent.id].content);
            currentResults[agent.id].summary = summaryResult.text;
            setAgentResults(prev => ({ ...prev, [agent.id]: currentResults[agent.id] }));
          } catch (e) {
            console.error("Summary failed for", agent.name, e);
          }
        }
      });
      await Promise.all(summaryPromises);

      // STEP 1.5: Critique Phase (Multi-Round Debate)
      const rounds = topology === 'QUICK' ? 0 : debateRounds;
      
      for (let round = 1; round <= rounds; round++) {
        setProcessingState(prev => ({ ...prev, step: 'AGENTS_CRITIQUING' }));
        const critiquePromises = currentAgents.map(async (agent) => {
          if (currentResults[agent.id].status === AgentStatus.COMPLETED) {
            setAgentResults(prev => ({ 
              ...prev, 
              [agent.id]: { ...prev[agent.id], status: AgentStatus.CRITIQUING } 
            }));
            try {
              const critiqueResult = await generateAgentCritique(
                agent,
                detailedPrompt,
                currentResults[agent.id].content,
                currentResults,
                currentHistory.slice(-4), // Pass last 2 turns (4 messages) for short-term memory
                round,
                isWebSearchEnabled,
                (chunkText) => {
                  setAgentResults(prev => {
                    const currentCritique = prev[agent.id].critique || '';
                    return {
                      ...prev,
                      [agent.id]: { ...prev[agent.id], critique: currentCritique + chunkText }
                    };
                  });
                }
              );
              
              // Append critique if multiple rounds
              if (round > 1 && currentResults[agent.id].critique) {
                currentResults[agent.id].critique += `\n\n--- Round ${round} ---\n${critiqueResult.text}`;
              } else {
                currentResults[agent.id].critique = critiqueResult.text;
              }
              
              if (critiqueResult.usage) {
                setTotalTokens(prev => prev + (critiqueResult.usage?.totalTokenCount || 0));
              }
              
              currentResults[agent.id].status = AgentStatus.COMPLETED;
              setAgentResults(prev => ({ ...prev, [agent.id]: currentResults[agent.id] }));
            } catch (e) {
              console.error("Critique failed for", agent.name, e);
              currentResults[agent.id].status = AgentStatus.COMPLETED;
              setAgentResults(prev => ({ ...prev, [agent.id]: currentResults[agent.id] }));
            }
          }
        });

        await Promise.all(critiquePromises);
      }

      if (isHitlEnabled) {
        setProcessingState(prev => ({ ...prev, step: 'PAUSED_FOR_REVIEW' }));
        setPendingSynthesisData({
          prompt,
          detailedPrompt,
          currentAgents,
          currentHistory,
          currentResults,
          currentFeedback
        });
        return; // Pause execution here
      }

      await executeSynthesis(prompt, detailedPrompt, currentAgents, currentHistory, currentResults, currentFeedback);
  };

  const executeSynthesis = async (
    prompt: string,
    detailedPrompt: string,
    currentAgents: AgentPersona[],
    currentHistory: ChatMessage[],
    currentResults: Record<AgentId, AgentResult>,
    currentFeedback: Record<AgentId, 'up' | 'down' | null>
  ) => {
      // STEP 2: Synthesis
      setProcessingState(prev => ({ ...prev, step: 'SYNTHESIZING' }));
      setIsFinalOutputStreaming(true);
      let fullText = '';
      let extractedArtifacts: Artifact[] = [];

      try {
          const stream = await synthesizeFinalResponse(detailedPrompt, currentAgents, currentResults, currentHistory, synthTemp, currentFeedback, {
              topP: synthTopP,
              topK: synthTopK,
              frequencyPenalty: synthFreqPenalty
          }, isWebSearchEnabled);
          
          for await (const chunk of stream) {
              const text = chunk.text;
              if (text) {
                  fullText += text;
                  setFinalOutput(prev => prev + text);
              }
          }

          // Extract artifacts after synthesis
          const extractionResult = await extractArtifacts(fullText);
          extractedArtifacts = extractionResult.artifacts;
          if (extractionResult.usage) {
            setTotalTokens(prev => prev + (extractionResult.usage?.totalTokenCount || 0));
          }
          setArtifacts(extractedArtifacts);
          if (extractedArtifacts.length > 0) {
            setShowArtifacts(true);
          }

          // Update History after successful synthesis
          const newHistory: ChatMessage[] = [
            ...currentHistory,
            { role: 'user', parts: [{ text: prompt }] },
            { role: 'model', parts: [{ text: fullText }] }
          ];
          setHistory(newHistory);

      } catch (e) {
          console.error("Synthesis failed", e);
          const errorMsg = "\n\n[System Failure during synthesis: " + (e instanceof Error ? e.message : String(e)) + "]";
          fullText += errorMsg;
          setFinalOutput(prev => prev + errorMsg);
      } finally {
          // Merge any feedback given during the active turn into currentResults before saving
          const finalOutputsWithFeedback = { ...currentResults };
          currentAgents.forEach(agent => {
              if (activeTurnFeedbackRef.current[agent.id]) {
                  finalOutputsWithFeedback[agent.id].feedback = activeTurnFeedbackRef.current[agent.id] as 'up' | 'down';
              }
          });

          const newTurn: ConversationTurn = {
            id: Date.now().toString(),
            sessionId: currentSessionId,
            prompt,
            analyzedPrompt: detailedPrompt,
            dynamicAgents: currentAgents,
            agentOutputs: finalOutputsWithFeedback,
            finalOutput: fullText,
            finalFeedback: activeFinalFeedback,
            artifacts: extractedArtifacts,
            timestamp: Date.now(),
            topology,
            collaborationMode,
            totalTokens // Note: this might be slightly behind the actual total due to state updates, but good enough for display
          };
          setTurns(prev => [...prev, newTurn]);

          setIsFinalOutputStreaming(false);
          setProcessingState({ isProcessing: false, step: 'IDLE' });
          setPendingSynthesisData(null);
      }
  };

  const resumeSynthesis = () => {
    if (pendingSynthesisData) {
      // Use the current agentResults from state, as the user might have edited them
      executeSynthesis(
        pendingSynthesisData.prompt,
        pendingSynthesisData.detailedPrompt,
        pendingSynthesisData.currentAgents,
        pendingSynthesisData.currentHistory,
        agentResults,
        pendingSynthesisData.currentFeedback
      );
    }
  };

  const handleFeedback = (agentId: AgentId, feedback: 'up' | 'down', turnId?: string) => {
    // Always update the global feedback state so it influences the next turn
    setAgentFeedback(prev => ({ ...prev, [agentId]: feedback }));

    if (turnId) {
      // Update feedback for a past turn
      setTurns(prev => prev.map(t => {
        if (t.id === turnId) {
          return {
            ...t,
            agentOutputs: {
              ...t.agentOutputs,
              [agentId]: { ...t.agentOutputs[agentId], feedback }
            }
          };
        }
        return t;
      }));
    } else {
      // Update feedback for current active turn
      activeTurnFeedbackRef.current[agentId] = feedback;
      setAgentResults(prev => ({
        ...prev,
        [agentId]: { ...prev[agentId], feedback }
      }));
    }
  };

  const handleFinalFeedback = (turnId: string, feedback: 'up' | 'down') => {
    setTurns(prev => prev.map(t => {
      if (t.id === turnId) {
        return { ...t, finalFeedback: t.finalFeedback === feedback ? undefined : feedback };
      }
      return t;
    }));
  };

  const handleActiveFinalFeedback = (feedback: 'up' | 'down') => {
    setActiveFinalFeedback(prev => prev === feedback ? undefined : feedback);
  };

  const saveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    setCustomSavedPresets(prev => ({
      ...prev,
      [newPresetName]: { instructions: { ...customInstructions } }
    }));
    
    // Set all agents to use this new preset
    setAgentPresetSelections({
      [AgentId.LOGOS]: newPresetName,
      [AgentId.PATHOS]: newPresetName,
      [AgentId.ETHOS]: newPresetName,
      [AgentId.PRAXIS]: newPresetName,
      [AgentId.DYNAMIC_1]: newPresetName,
      [AgentId.DYNAMIC_2]: newPresetName,
      [AgentId.DYNAMIC_3]: newPresetName,
      [AgentId.DYNAMIC_4]: newPresetName
    });
    
    setNewPresetName('');
    setIsSavingPreset(false);
  };

  const loadFullPreset = (presetName: string) => {
    const presetData = customSavedPresets[presetName] || AGENT_PRESETS[presetName];
    if (!presetData) return;
    
    setAgentPresetSelections(prev => {
      const next = { ...prev };
      Object.values(AgentId).forEach(id => {
        next[id] = presetName;
      });
      return next;
    });
    
    setCustomInstructions(prev => {
      const next = { ...prev };
      Object.keys(presetData.instructions).forEach(id => {
        next[id as AgentId] = presetData.instructions[id as AgentId];
      });
      return next;
    });
  };

  const saveTurnTitle = (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setTurns(prev => prev.map(t => {
      if ((t.sessionId || 'default') === sessionId) {
        return { ...t, title: newTitle };
      }
      return t;
    }));
    setEditingTurnId(null);
    setEditingTitle('');
  };

  const startNewChat = () => {
    const newSessionId = Date.now().toString();
    setCurrentSessionId(newSessionId);
    setHistory([]);
    setFinalOutput('');
    setAnalyzedPrompt('');
    setViewingTurn(null);
    setArtifacts([]);
    setShowArtifacts(false);
    setTotalTokens(0);
    setPendingSynthesisData(null);
    setProcessingState({ isProcessing: false, step: 'IDLE' });
    setAgentResults({
      [AgentId.LOGOS]: { content: '', status: AgentStatus.IDLE },
      [AgentId.PATHOS]: { content: '', status: AgentStatus.IDLE },
      [AgentId.ETHOS]: { content: '', status: AgentStatus.IDLE },
      [AgentId.PRAXIS]: { content: '', status: AgentStatus.IDLE },
      [AgentId.DYNAMIC_1]: { content: '', status: AgentStatus.IDLE },
      [AgentId.DYNAMIC_2]: { content: '', status: AgentStatus.IDLE },
      [AgentId.DYNAMIC_3]: { content: '', status: AgentStatus.IDLE },
      [AgentId.DYNAMIC_4]: { content: '', status: AgentStatus.IDLE }
    });
    setAgentFeedback({
      [AgentId.LOGOS]: null,
      [AgentId.PATHOS]: null,
      [AgentId.ETHOS]: null,
      [AgentId.PRAXIS]: null,
      [AgentId.DYNAMIC_1]: null,
      [AgentId.DYNAMIC_2]: null,
      [AgentId.DYNAMIC_3]: null,
      [AgentId.DYNAMIC_4]: null
    });
  };

  const rebuildHistory = (currentTurns: ConversationTurn[]) => {
    const newHistory: ChatMessage[] = [];
    currentTurns.filter(t => !t.archived).forEach(turn => {
      newHistory.push({ role: 'user', parts: [{ text: turn.prompt }] });
      newHistory.push({ role: 'model', parts: [{ text: turn.finalOutput }] });
    });
    setHistory(newHistory);
  };

  const branchConversation = (turnId: string) => {
    const turnIndex = currentSessionTurns.findIndex(t => t.id === turnId);
    if (turnIndex === -1) return;
    
    // Rebuild history up to this turn
    const newHistory: ChatMessage[] = [];
    const turnsToKeep = currentSessionTurns.slice(0, turnIndex + 1);
    
    turnsToKeep.forEach(turn => {
      newHistory.push({ role: 'user', parts: [{ text: turn.prompt }] });
      newHistory.push({ role: 'model', parts: [{ text: turn.finalOutput }] });
    });
    
    // Start a new session for the branch
    const newSessionId = Date.now().toString();
    setCurrentSessionId(newSessionId);
    
    // Copy turns to the new session
    const branchedTurns = turnsToKeep.map(t => ({ ...t, id: Date.now().toString() + Math.random(), sessionId: newSessionId }));
    setTurns(prev => [...prev, ...branchedTurns]);
    
    // Create a new branch prompt
    const branchPrompt = `[Branching from previous context] Let's explore a different angle on: "${currentSessionTurns[turnIndex].prompt}"`;
    executeOrchestration(branchPrompt, newHistory);
    setViewingTurn(null);
  };

  const deleteTurn = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newTurns = turns.filter(t => t.id !== id);
    setTurns(newTurns);
    rebuildHistory(newTurns);
  };

  const toggleArchiveTurn = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newTurns = turns.map(t => t.id === id ? { ...t, archived: !t.archived } : t);
    setTurns(newTurns);
    rebuildHistory(newTurns);
  };

  const toggleArchiveSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const sessionTurns = turns.filter(t => (t.sessionId || 'default') === sessionId);
    const shouldArchive = sessionTurns.some(t => !t.archived);
    const newTurns = turns.map(t => (t.sessionId || 'default') === sessionId ? { ...t, archived: shouldArchive } : t);
    setTurns(newTurns);
    rebuildHistory(newTurns);
  };

  const copyFinalOutput = () => {
    if (!finalOutput) return;
    navigator.clipboard.writeText(finalOutput);
    setFinalCopied(true);
    setTimeout(() => setFinalCopied(false), 2000);
  };

  const handleDownloadMarkdown = (content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthesis-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turn-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!reportRef.current) return;
    
    html2canvas(reportRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`synthesis-${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  const toggleSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-200 selection:bg-cyan-500/30 pt-20 pb-10 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 sm:px-6 flex flex-col gap-8">
        
        <MissionControlToolbar
          turns={turns}
          betaHistory={betaHistory}
          customSavedPresets={customSavedPresets}
          totalTokens={totalTokens}
          isHome={isHome}
          processingState={processingState}
          finalOutput={finalOutput}
        />

        {/* Standard Home Empty State */}
        {isHome && !isBetaMode && (
            <HomeState handleNavigateWithTransition={handleNavigateWithTransition} />
        )}

        {/* Beta Mode Empty State */}
        {isHome && isBetaMode && (
            <BetaModeState />
        )}

        {/* Visual Node Graph (Active Turn) */}
        <ProcessingVisualizer 
          processingState={processingState}
          isHitlEnabled={isHitlEnabled}
        />

        {/* Chat History (Main View) */}
        <div className="flex flex-col gap-12">
          {currentSessionTurns.filter(t => !t.archived).map((turn) => (
            <ChatTurn
              key={turn.id}
              turn={turn}
              turns={turns}
              agentResults={agentResults}
              processingState={processingState}
              setProcessingState={setProcessingState}
              isHitlEnabled={isHitlEnabled}
              activeAgentTab={activeAgentTab}
              setActiveAgentTab={setActiveAgentTab}
              agentViewMode={agentViewMode}
              handleFeedback={handleFeedback}
              handleFinalFeedback={handleFinalFeedback}
              handleActiveFinalFeedback={handleActiveFinalFeedback}
              finalOutput={finalOutput}
              isFinalOutputStreaming={isFinalOutputStreaming}
              activeFinalFeedback={activeFinalFeedback}
              finalCopied={finalCopied}
              setFinalCopied={setFinalCopied}
              isSpeaking={isSpeaking}
              toggleSpeech={toggleSpeech}
              exportToPDF={exportToPDF}
              exportToMarkdown={() => handleDownloadMarkdown(turn.finalOutput)}
              exportToJSON={() => handleDownloadJSON(turn)}
              branchConversation={branchConversation}
              setViewingTurn={setViewingTurn}
              setEditingTurnId={setEditingTurnId}
              setEditingTitle={setEditingTitle}
              editingTurnId={editingTurnId}
              editingTitle={editingTitle}
              saveTurnTitle={saveTurnTitle}
              resumeSynthesis={resumeSynthesis}
              finalRef={finalRef}
              reportRef={reportRef}
            />
          ))}

          {/* Active Turn */}
          {processingState.step !== 'IDLE' && (
            <ChatTurn
              turn={null as any}
              turns={turns}
              agentResults={agentResults}
              processingState={processingState}
              setProcessingState={setProcessingState}
              isHitlEnabled={isHitlEnabled}
              activeAgentTab={activeAgentTab}
              setActiveAgentTab={setActiveAgentTab}
              agentViewMode={agentViewMode}
              handleFeedback={handleFeedback}
              handleFinalFeedback={handleFinalFeedback}
              handleActiveFinalFeedback={handleActiveFinalFeedback}
              finalOutput={finalOutput}
              isFinalOutputStreaming={isFinalOutputStreaming}
              activeFinalFeedback={activeFinalFeedback}
              finalCopied={finalCopied}
              setFinalCopied={setFinalCopied}
              isSpeaking={isSpeaking}
              toggleSpeech={toggleSpeech}
              exportToPDF={exportToPDF}
              exportToMarkdown={() => handleDownloadMarkdown(finalOutput)}
              exportToJSON={() => handleDownloadJSON({
                agentResults,
                finalOutput,
                analyzedPrompt,
                totalTokens,
                timestamp: Date.now()
              })}
              branchConversation={branchConversation}
              setViewingTurn={setViewingTurn}
              setEditingTurnId={setEditingTurnId}
              setEditingTitle={setEditingTitle}
              editingTurnId={editingTurnId}
              editingTitle={editingTitle}
              saveTurnTitle={saveTurnTitle}
              resumeSynthesis={resumeSynthesis}
              finalRef={finalRef}
              reportRef={reportRef}
            />
          )}
        </div>

        {/* Input Section */}
        <div className="sticky bottom-0 z-40 bg-[#030712]/80 backdrop-blur-xl py-6 -mx-4 px-4 border-t border-white/5 mt-auto">
             <InputArea 
               onSend={isBetaMode ? handleBetaSubmit : executeOrchestration} 
               disabled={processingState.isProcessing} 
               isBetaMode={isBetaMode}
               onExitBeta={() => handleNavigateWithTransition(basePath)}
             />
        </div>

      </main>

      {/* Loading Screen */}
      <LoadingScreen isTransitioning={isTransitioning} transitionTarget={transitionTarget} />

      <HistorySidebar
        showHistory={showHistory}
        basePath={basePath}
        historyTab={historyTab}
        setHistoryTab={setHistoryTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        turns={turns}
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        editingTurnId={editingTurnId}
        setEditingTurnId={setEditingTurnId}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
        saveTurnTitle={saveTurnTitle}
        toggleArchiveSession={toggleArchiveSession}
        setTurns={setTurns}
        startNewChat={startNewChat}
      />

      <AgentHistorySidebar
        showAgentHistory={showAgentHistory}
        basePath={basePath}
        betaHistory={betaHistory}
        setActiveAgents={setActiveAgents}
      />

      <AgentPresetsSidebar
        showAgentPresets={showAgentPresets}
        basePath={basePath}
        setEditingPreset={setEditingPreset}
        customSavedPresets={customSavedPresets}
        setCustomSavedPresets={setCustomSavedPresets}
        setActiveAgents={setActiveAgents}
      />

      <ViewingTurnModal
        viewingTurn={viewingTurn}
        setViewingTurn={setViewingTurn}
        turns={turns}
        setHistory={setHistory}
        navigate={navigate}
        basePath={basePath}
        toggleSpeech={toggleSpeech}
        isSpeaking={isSpeaking}
        handleDownloadMarkdown={handleDownloadMarkdown}
      />

      <EditPresetModal
        editingPreset={editingPreset}
        setEditingPreset={setEditingPreset}
        setCustomSavedPresets={setCustomSavedPresets}
      />

      <SettingsModal
        showSettings={showSettings}
        basePath={basePath}
        settingsTab={settingsTab}
        setSettingsTab={setSettingsTab}
        synthTopP={synthTopP}
        setSynthTopP={setSynthTopP}
        synthTemp={synthTemp}
        setSynthTemp={setSynthTemp}
        synthFreqPenalty={synthFreqPenalty}
        setSynthFreqPenalty={setSynthFreqPenalty}
        synthTopK={synthTopK}
        setSynthTopK={setSynthTopK}
        isWebSearchEnabled={isWebSearchEnabled}
        setIsWebSearchEnabled={setIsWebSearchEnabled}
        activeAgents={activeAgents}
        setActiveAgents={setActiveAgents}
        customSavedPresets={customSavedPresets}
        setCustomSavedPresets={setCustomSavedPresets}
        agentPresetSelections={agentPresetSelections}
        setAgentPresetSelections={setAgentPresetSelections}
        customInstructions={customInstructions}
        setCustomInstructions={setCustomInstructions}
        isSavingPreset={isSavingPreset}
        setIsSavingPreset={setIsSavingPreset}
        newPresetName={newPresetName}
        setNewPresetName={setNewPresetName}
        saveCustomPreset={saveCustomPreset}
      />
      
      <Footer />
      
      <style>{`
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%) scaleX(0.2); }
          50% { transform: translateX(0%) scaleX(0.5); }
          100% { transform: translateX(100%) scaleX(0.2); }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite linear;
          transform-origin: 0% 50%;
        }
      `}</style>
    </div>
  );
}
