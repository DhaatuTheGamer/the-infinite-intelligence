import React, { useState, useRef, useEffect } from 'react';
import { AgentId, AgentStatus, ProcessingState, ChatMessage, AgentResult, ConversationTurn, AgentPersona, Artifact } from './types';
import { AGENTS, AGENT_PRESETS } from './constants';
import { generateAgentResponse, synthesizeFinalResponse, analyzePromptFirstPrinciples, assembleDynamicAgents, generateAgentCritique, extractArtifacts } from './services/geminiService';
import { AgentCard } from './components/AgentCard';
import { InputArea } from './components/InputArea';
import { Header } from './components/Header';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Bot, Sparkles, Copy, Check, Settings2, Trash2, History, X, Save, SlidersHorizontal, ChevronRight, Edit2, CheckCircle2, Archive, ArchiveRestore, ThumbsUp, ThumbsDown, Plus, Loader2, GitFork, Download, FileText, Code, FileJson } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function App() {
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

  const [agentSliders, setAgentSliders] = useState<Record<string, { creativity: number, logic: number, formality: number }>>(() => {
    const initialSliders: Record<string, { creativity: number, logic: number, formality: number }> = {};
    Object.values(AGENTS).forEach(agent => {
      if (agent.sliders) {
        initialSliders[agent.id] = { ...agent.sliders };
      }
    });
    return initialSliders;
  });

  const [customSavedPresets, setCustomSavedPresets] = useState<Record<string, Record<AgentId, string>>>({});
  const [newPresetName, setNewPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [historyTab, setHistoryTab] = useState<'active' | 'archived'>('active');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
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
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const [analyzedPrompt, setAnalyzedPrompt] = useState('');
  const [finalOutput, setFinalOutput] = useState('');
  const [isFinalOutputStreaming, setIsFinalOutputStreaming] = useState(false);
  const [finalCopied, setFinalCopied] = useState(false);
  const finalRef = useRef<HTMLDivElement>(null);

  // New Enterprise Features State
  const [isHitlEnabled, setIsHitlEnabled] = useState(false);
  const [debateRounds, setDebateRounds] = useState(1);
  const [topology, setTopology] = useState<'QUICK' | 'STANDARD' | 'DEEP'>('STANDARD');
  const [collaborationMode, setCollaborationMode] = useState<'parallel' | 'sequential' | 'round-robin'>('parallel');
  const [totalTokens, setTotalTokens] = useState(0);
  
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
      
      const currentHistory = branchFromHistory || history;

      // Capture the current feedback to use for this turn, then clear it so it doesn't apply forever
      const currentFeedback = { ...agentFeedback };
      setAgentFeedback({} as any);
      activeTurnFeedbackRef.current = {};

      // STEP 0: Analyze Prompt
      const analysisResult = await analyzePromptFirstPrinciples(prompt, currentHistory);
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
                  currentHistory, 
                  instruction,
                  agentSliders[agent.id]
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
                  currentHistory, 
                  instruction,
                  agentSliders[agent.id]
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
                    currentHistory, 
                    instruction,
                    agentSliders[agent.id]
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
                currentHistory,
                round
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
          });
          
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
            prompt,
            analyzedPrompt: detailedPrompt,
            dynamicAgents: currentAgents,
            agentOutputs: finalOutputsWithFeedback,
            finalOutput: fullText,
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

  const saveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    setCustomSavedPresets(prev => ({
      ...prev,
      [newPresetName]: { ...customInstructions }
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

  const clearHistory = () => {
    setHistory([]);
    setTurns([]);
    setFinalOutput('');
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
    const turnIndex = turns.findIndex(t => t.id === turnId);
    if (turnIndex === -1) return;
    
    // Rebuild history up to this turn
    const newHistory: ChatMessage[] = [];
    const turnsToKeep = turns.slice(0, turnIndex + 1);
    
    turnsToKeep.forEach(turn => {
      newHistory.push({ role: 'user', parts: [{ text: turn.prompt }] });
      newHistory.push({ role: 'model', parts: [{ text: turn.finalOutput }] });
    });
    
    // Create a new branch prompt
    const branchPrompt = `[Branching from previous context] Let's explore a different angle on: "${turns[turnIndex].prompt}"`;
    executeOrchestration(branchPrompt, newHistory);
    setViewingTurn(null);
  };

  const exportReport = async (turn: ConversationTurn) => {
    setIsExporting(true);
    try {
      // Create a temporary div to render the report
      const reportDiv = document.createElement('div');
      reportDiv.style.padding = '40px';
      reportDiv.style.background = '#ffffff';
      reportDiv.style.color = '#000000';
      reportDiv.style.width = '800px';
      reportDiv.style.fontFamily = 'sans-serif';
      
      let html = `
        <h1 style="color: #111827; margin-bottom: 20px;">Executive Summary Report</h1>
        <p style="color: #6b7280; font-size: 12px; margin-bottom: 30px;">Generated on ${new Date(turn.timestamp).toLocaleString()}</p>
        
        <h2 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">1. Original Request</h2>
        <p style="background: #f3f4f6; padding: 15px; border-radius: 8px;">${turn.prompt}</p>
        
        <h2 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-top: 30px;">2. First Principles Analysis</h2>
        <div style="background: #f5f3ff; padding: 15px; border-radius: 8px;">${turn.analyzedPrompt}</div>
        
        <h2 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-top: 30px;">3. Expert Perspectives</h2>
      `;
      
      const agents = turn.dynamicAgents || Object.values(AGENTS);
      agents.forEach(agent => {
        const output = turn.agentOutputs[agent.id];
        if (output && output.status === AgentStatus.COMPLETED) {
          html += `
            <h3 style="color: #4b5563; margin-top: 20px;">${agent.name} (${agent.role})</h3>
            <div style="padding-left: 15px; border-left: 3px solid #d1d5db;">
              <p><strong>Initial Analysis:</strong> ${output.content}</p>
              ${output.critique ? `<p><strong>Critique/Refinement:</strong> ${output.critique}</p>` : ''}
            </div>
          `;
        }
      });
      
      html += `
        <h2 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-top: 30px;">4. Final Synthesis</h2>
        <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; border: 1px solid #ccfbf1;">
          ${turn.finalOutput}
        </div>
      `;
      
      reportDiv.innerHTML = html;
      document.body.appendChild(reportDiv);
      
      const canvas = await html2canvas(reportDiv, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AI_Report_${new Date(turn.timestamp).getTime()}.pdf`);
      
      document.body.removeChild(reportDiv);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to generate report.");
    } finally {
      setIsExporting(false);
    }
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

  const startEditingTurn = (e: React.MouseEvent, turn: ConversationTurn, index: number) => {
    e.stopPropagation();
    setEditingTurnId(turn.id);
    setEditingTitle(turn.title || `Turn ${index + 1}`);
  };

  const saveTurnTitle = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.stopPropagation();
    setTurns(prev => prev.map(t => t.id === id ? { ...t, title: editingTitle } : t));
    setEditingTurnId(null);
  };

  const copyFinalOutput = () => {
    if (!finalOutput) return;
    navigator.clipboard.writeText(finalOutput);
    setFinalCopied(true);
    setTimeout(() => setFinalCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-200 selection:bg-cyan-500/30 pt-20 pb-10 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 sm:px-6 flex flex-col gap-8">
        
        {/* Controls Bar */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all"
                >
                    <Settings2 size={18} className="text-cyan-400" />
                    <span>Settings</span>
                </button>
                <button 
                    onClick={() => setShowHistory(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all"
                >
                    <History size={18} className="text-purple-400" />
                    <span>History ({turns.length})</span>
                </button>
                {totalTokens > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-gray-400">
                    <Sparkles size={16} className="text-yellow-400" />
                    <span>{totalTokens.toLocaleString()} Tokens</span>
                  </div>
                )}
            </div>
            {history.length > 0 && (
                <button 
                    onClick={clearHistory}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-sm font-medium text-red-400 transition-all"
                >
                    <Trash2 size={18} />
                    <span className="hidden sm:inline">Clear Session</span>
                </button>
            )}
        </div>

        {/* Intro / Empty State */}
        {turns.length === 0 && processingState.step === 'IDLE' && !finalOutput && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center mt-10 mb-10 text-center space-y-4"
            >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                    <Bot size={40} className="text-gray-300" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                    Orchestrate <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Collective Intelligence</span>
                </h2>
                <p className="max-w-xl text-gray-400 text-lg">
                    Deploy four specialized AI agents to analyze, imagine, critique, and plan. Then, witness the synthesis of their superior combined output.
                </p>
            </motion.div>
        )}

        {/* Visual Node Graph (Active Turn) */}
        <AnimatePresence>
          {processingState.step !== 'IDLE' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col items-center justify-center py-4 overflow-hidden"
            >
              <div className="flex items-center justify-center gap-4 text-xs font-mono text-gray-500 w-full max-w-4xl">
                <div className={`flex flex-col items-center gap-2 ${processingState.step === 'ANALYZING_PROMPT' ? 'text-cyan-400' : 'text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${processingState.step === 'ANALYZING_PROMPT' ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-gray-600'}`}>1</div>
                  <span>Analyze</span>
                </div>
                <div className={`h-px w-16 ${processingState.step === 'ASSEMBLING_AGENTS' ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-gray-700'}`}></div>
                <div className={`flex flex-col items-center gap-2 ${processingState.step === 'ASSEMBLING_AGENTS' ? 'text-purple-400' : 'text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${processingState.step === 'ASSEMBLING_AGENTS' ? 'border-purple-400 bg-purple-400/20 shadow-[0_0_15px_rgba(192,132,252,0.5)]' : 'border-gray-600'}`}>2</div>
                  <span>Assemble</span>
                </div>
                <div className={`h-px w-16 ${processingState.step === 'AGENTS_WORKING' ? 'bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]' : 'bg-gray-700'}`}></div>
                <div className={`flex flex-col items-center gap-2 ${processingState.step === 'AGENTS_WORKING' ? 'text-emerald-400' : 'text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${processingState.step === 'AGENTS_WORKING' ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'border-gray-600'}`}>3</div>
                  <span>Execute</span>
                </div>
                <div className={`h-px w-16 ${processingState.step === 'AGENTS_CRITIQUING' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-gray-700'}`}></div>
                <div className={`flex flex-col items-center gap-2 ${processingState.step === 'AGENTS_CRITIQUING' ? 'text-amber-400' : 'text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${processingState.step === 'AGENTS_CRITIQUING' ? 'border-amber-400 bg-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'border-gray-600'}`}>4</div>
                  <span>Critique</span>
                </div>
                {isHitlEnabled && (
                  <>
                    <div className={`h-px w-16 ${processingState.step === 'PAUSED_FOR_REVIEW' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-gray-700'}`}></div>
                    <div className={`flex flex-col items-center gap-2 ${processingState.step === 'PAUSED_FOR_REVIEW' ? 'text-rose-400' : 'text-gray-600'}`}>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${processingState.step === 'PAUSED_FOR_REVIEW' ? 'border-rose-400 bg-rose-400/20 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'border-gray-600'}`}>H</div>
                      <span>Review</span>
                    </div>
                  </>
                )}
                <div className={`h-px w-16 ${processingState.step === 'SYNTHESIZING' || processingState.step === 'PAUSED_FOR_REVIEW' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-gray-700'}`}></div>
                <div className={`flex flex-col items-center gap-2 ${processingState.step === 'SYNTHESIZING' ? 'text-blue-400' : 'text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${processingState.step === 'SYNTHESIZING' ? 'border-blue-400 bg-blue-400/20 shadow-[0_0_15px_rgba(96,165,250,0.5)]' : 'border-gray-600'}`}>5</div>
                  <span>Synthesize</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat History (Main View) */}
        <div className="flex flex-col gap-12">
          {turns.filter(t => !t.archived).map((turn) => (
            <div key={turn.id} className="flex flex-col gap-6">
              {/* User Prompt */}
              <div className="self-end bg-cyan-900/20 border border-cyan-500/20 text-cyan-50 px-6 py-4 rounded-2xl max-w-3xl shadow-lg">
                <p className="whitespace-pre-wrap">{turn.prompt}</p>
              </div>

              {/* Analyzed Prompt */}
              {turn.analyzedPrompt && turn.analyzedPrompt !== turn.prompt && (
                <div className="self-end bg-purple-900/20 border border-purple-500/20 text-purple-50 px-6 py-4 rounded-2xl max-w-3xl shadow-lg mt-2">
                  <div className="flex items-center gap-2 mb-2 text-purple-400">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">First Principles Analysis</span>
                  </div>
                  <div className="text-sm opacity-90">
                    <MarkdownRenderer content={turn.analyzedPrompt} compact={true} />
                  </div>
                </div>
              )}

              {/* Agents Grid for Past Turn */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(turn.dynamicAgents || Object.values(AGENTS)).map((agent) => (
                  <div key={agent.id} className="h-64 md:h-80 lg:h-96 opacity-80 hover:opacity-100 transition-opacity">
                      <AgentCard 
                          agent={agent} 
                          status={turn.agentOutputs[agent.id]?.status || AgentStatus.IDLE} 
                          content={turn.agentOutputs[agent.id]?.content || ''} 
                          critique={turn.agentOutputs[agent.id]?.critique}
                          error={turn.agentOutputs[agent.id]?.error}
                          feedback={turn.agentOutputs[agent.id]?.feedback}
                          onFeedback={(f) => handleFeedback(agent.id, f, turn.id)}
                      />
                  </div>
                ))}
              </div>

              {/* Final Synthesis for Past Turn */}
              <div className="relative bg-[#0b0f1a] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                  <div className="bg-white/5 border-b border-white/5 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Sparkles className="text-amber-300" size={20} />
                          <h3 className="text-lg font-bold text-white tracking-wide">Final Synthesis</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                            onClick={() => exportReport(turn)}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-gray-300 hover:text-white transition-all group"
                        >
                            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} className="group-hover:text-purple-400 transition-colors" />}
                            <span>Export</span>
                        </button>
                        <button
                            onClick={() => {
                              navigator.clipboard.writeText(turn.finalOutput);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-gray-300 hover:text-white transition-all group"
                        >
                            <Copy size={14} className="group-hover:text-cyan-400 transition-colors" />
                            <span>Copy</span>
                        </button>
                      </div>
                  </div>
                  <div className="p-8">
                      <MarkdownRenderer content={turn.finalOutput} />
                  </div>
                  
                  {/* Render Artifacts if they exist */}
                  {turn.artifacts && turn.artifacts.length > 0 && (
                    <div className="p-4 bg-black/20 border-t border-white/5">
                      <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2"><FileText size={16}/> Extracted Artifacts</h4>
                      <div className="flex flex-wrap gap-3">
                        {turn.artifacts.map(artifact => (
                          <div key={artifact.id} className="bg-[#0b0f1a] border border-white/10 rounded-lg p-3 w-full sm:w-[calc(50%-0.375rem)]">
                            <div className="flex items-center gap-2 mb-2 text-cyan-400">
                              {artifact.type === 'code' ? <Code size={14}/> : artifact.type === 'json' ? <FileJson size={14}/> : <FileText size={14}/>}
                              <span className="text-xs font-bold">{artifact.title}</span>
                            </div>
                            <div className="max-h-32 overflow-y-auto text-xs text-gray-300 font-mono bg-black/40 p-2 rounded">
                              <pre className="whitespace-pre-wrap">{artifact.content}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="h-1 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-amber-500/50 w-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Active Turn */}
        <AnimatePresence>
          {processingState.step !== 'IDLE' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-6"
            >
              {/* Analyzed Prompt (Active) */}
              {processingState.step === 'ANALYZING_PROMPT' ? (
                <div className="self-end bg-purple-900/20 border border-purple-500/20 text-purple-50 px-6 py-4 rounded-2xl max-w-3xl shadow-lg mt-2 flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-purple-400" />
                  <span className="text-sm text-purple-200">Applying First Principles Analysis...</span>
                </div>
              ) : analyzedPrompt && (
                <div className="self-end bg-purple-900/20 border border-purple-500/20 text-purple-50 px-6 py-4 rounded-2xl max-w-3xl shadow-lg mt-2">
                  <div className="flex items-center gap-2 mb-2 text-purple-400">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">First Principles Analysis</span>
                  </div>
                  <div className="text-sm opacity-90">
                    <MarkdownRenderer content={analyzedPrompt} compact={true} />
                  </div>
                </div>
              )}

              {/* HITL Review Banner */}
              {processingState.step === 'PAUSED_FOR_REVIEW' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-900/20 border border-rose-500/50 rounded-2xl p-6 shadow-lg shadow-rose-900/20 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/50">
                      <Loader2 className="animate-spin text-rose-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-rose-400">Paused for Human Review</h3>
                      <p className="text-sm text-rose-200/70">Review the agent outputs and critiques below. You can provide feedback before synthesizing.</p>
                    </div>
                  </div>
                  <button 
                    onClick={resumeSynthesis}
                    className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    Approve & Synthesize
                  </button>
                </motion.div>
              )}

              {/* Agents Grid */}
              <motion.div 
                animate={{ 
                  height: processingState.step === 'SYNTHESIZING' ? 'auto' : 'auto',
                  opacity: processingState.step === 'SYNTHESIZING' ? 0.6 : 1
                }}
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${processingState.step === 'SYNTHESIZING' ? 'scale-95 origin-top transition-all duration-500' : ''}`}
              >
                {activeAgents.map((agent) => (
                  <div key={agent.id} className={`${processingState.step === 'SYNTHESIZING' ? 'h-24 overflow-hidden' : 'h-64 md:h-80 lg:h-96'} transition-all duration-500`}>
                      <AgentCard 
                          agent={agent} 
                          status={agentResults[agent.id]?.status || AgentStatus.IDLE} 
                          content={agentResults[agent.id]?.content || ''} 
                          critique={agentResults[agent.id]?.critique}
                          error={agentResults[agent.id]?.error}
                          feedback={agentResults[agent.id]?.feedback}
                          onFeedback={(f) => handleFeedback(agent.id, f)}
                          sliders={agentSliders[agent.id]}
                          onSlidersChange={(s) => setAgentSliders(prev => ({ ...prev, [agent.id]: s }))}
                      />
                  </div>
                ))}
              </motion.div>

              {/* Final Synthesis */}
              <AnimatePresence>
                  {(processingState.step === 'SYNTHESIZING') && (
                      <motion.div 
                          ref={finalRef} 
                          initial={{ opacity: 0, y: 40 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 40 }}
                          className="mt-2 relative"
                      >
                          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 rounded-2xl opacity-20 blur-lg"></div>
                          <div className="relative bg-[#0b0f1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                              <div className="bg-white/5 border-b border-white/5 p-4 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <Sparkles className="text-amber-300" size={20} />
                                      <h3 className="text-lg font-bold text-white tracking-wide">Final Synthesis</h3>
                                      {isFinalOutputStreaming && (
                                          <span className="ml-2 text-xs text-cyan-400 animate-pulse font-mono">SYNTHESIZING...</span>
                                      )}
                                  </div>
                              </div>
                              <div className="p-8">
                                  <MarkdownRenderer content={finalOutput} />
                                  {isFinalOutputStreaming && (
                                      <span className="inline-block w-2 h-5 ml-1 bg-cyan-400 animate-pulse align-middle"></span>
                                  )}
                              </div>
                              
                              {/* Active Artifacts Panel */}
                              <AnimatePresence>
                                {showArtifacts && artifacts.length > 0 && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-4 bg-black/20 border-t border-white/5"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="text-sm font-bold text-gray-400 flex items-center gap-2"><FileText size={16}/> Extracted Artifacts</h4>
                                      <button onClick={() => setShowArtifacts(false)} className="text-gray-500 hover:text-white"><X size={14}/></button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                      {artifacts.map(artifact => (
                                        <div key={artifact.id} className="bg-[#0b0f1a] border border-white/10 rounded-lg p-3 w-full sm:w-[calc(50%-0.375rem)]">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-cyan-400">
                                              {artifact.type === 'code' ? <Code size={14}/> : artifact.type === 'json' ? <FileJson size={14}/> : artifact.type === 'html' ? <FileText size={14}/> : <FileText size={14}/>}
                                              <span className="text-xs font-bold">{artifact.title}</span>
                                            </div>
                                            <button onClick={() => navigator.clipboard.writeText(artifact.content)} className="text-gray-500 hover:text-cyan-400"><Copy size={12}/></button>
                                          </div>
                                          {artifact.type === 'html' ? (
                                            <div className="max-h-64 overflow-y-auto bg-white p-2 rounded" dangerouslySetInnerHTML={{ __html: artifact.content }} />
                                          ) : (
                                            <div className="max-h-48 overflow-y-auto text-xs text-gray-300 font-mono bg-black/40 p-2 rounded">
                                              <pre className="whitespace-pre-wrap">{artifact.content}</pre>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div className="h-1 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-amber-500/50 w-full"></div>
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Section */}
        <div className="sticky bottom-0 z-40 bg-[#030712]/80 backdrop-blur-xl py-6 -mx-4 px-4 border-t border-white/5 mt-auto">
             <InputArea onSend={executeOrchestration} disabled={processingState.isProcessing} />
        </div>

      </main>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
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
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} />
                </button>
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {turns.filter(t => historyTab === 'active' ? !t.archived : t.archived).length === 0 ? (
                  <div className="text-center mt-10 text-gray-500">
                    <History size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No {historyTab} history yet.</p>
                  </div>
                ) : (
                  turns.filter(t => historyTab === 'active' ? !t.archived : t.archived).map((turn, i) => (
                    <div
                      key={turn.id}
                      className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group flex flex-col gap-2 relative cursor-pointer"
                      onClick={() => setViewingTurn(turn)}
                    >
                      <div className="flex items-center justify-between w-full">
                        {editingTurnId === turn.id ? (
                          <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                            <input 
                              type="text" 
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && saveTurnTitle(e, turn.id)}
                              className="bg-black/40 border border-cyan-500/50 rounded px-2 py-1 text-xs text-white w-full focus:outline-none"
                              autoFocus
                            />
                            <button onClick={(e) => saveTurnTitle(e, turn.id)} className="text-green-400 hover:text-green-300">
                              <CheckCircle2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-cyan-400">{turn.title || `Turn ${i + 1}`}</span>
                        )}
                        
                        {editingTurnId !== turn.id && (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); branchConversation(turn.id); }}
                              className="text-gray-400 hover:text-purple-400 transition-colors"
                              title="Branch from here"
                            >
                              <GitFork size={12} />
                            </button>
                            <button 
                              onClick={(e) => startEditingTurn(e, turn, i)}
                              className="text-gray-400 hover:text-cyan-400 transition-colors"
                              title="Edit Title"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={(e) => toggleArchiveTurn(e, turn.id)}
                              className="text-gray-400 hover:text-amber-400 transition-colors"
                              title={turn.archived ? "Unarchive" : "Archive"}
                            >
                              {turn.archived ? <ArchiveRestore size={12} /> : <Archive size={12} />}
                            </button>
                            <button 
                              onClick={(e) => deleteTurn(e, turn.id)}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {editingTurnId !== turn.id && (
                        <>
                          <p className="text-sm text-gray-200 line-clamp-2">{turn.prompt}</p>
                          
                          {/* Feedback Summary */}
                          <div className="flex gap-2 mt-1">
                            {Object.values(AGENTS).map(agent => {
                              const feedback = turn.agentOutputs[agent.id]?.feedback;
                              if (!feedback) return null;
                              return (
                                <span key={agent.id} className={`text-[10px] flex items-center gap-0.5 ${feedback === 'up' ? 'text-green-400' : 'text-red-400'}`} title={`${agent.name}: ${feedback}`}>
                                  {feedback === 'up' ? <ThumbsUp size={10} /> : <ThumbsDown size={10} />}
                                  {agent.name[0]}
                                </span>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span className="text-[10px]">{new Date(turn.timestamp).toLocaleTimeString()}</span>
                            <div className="flex items-center gap-2">
                              {turn.topology && (
                                <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                  {turn.topology}
                                </span>
                              )}
                              {turn.collaborationMode && (
                                <span className="bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded text-[9px] font-bold ml-1">
                                  {turn.collaborationMode}
                                </span>
                              )}
                              {turn.totalTokens && turn.totalTokens > 0 && (
                                <span className="flex items-center gap-1 text-yellow-500/70" title="Total Tokens">
                                  <Sparkles size={10} />
                                  {turn.totalTokens > 1000 ? `${(turn.totalTokens / 1000).toFixed(1)}k` : turn.totalTokens}
                                </span>
                              )}
                              <div className="flex items-center group-hover:text-gray-300">
                                <span>View Details</span>
                                <ChevronRight size={14} className="ml-1" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Viewing Turn Modal */}
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
                                <button 
                                    onClick={() => {
                                        // Find the input area and set its value, or just copy it to clipboard
                                        navigator.clipboard.writeText(viewingTurn.prompt);
                                        setViewingTurn(null);
                                        // We can't easily set the input state from here without passing a ref or prop, 
                                        // so copying to clipboard and closing is a good alternative.
                                        // Or we can just let them copy it manually.
                                    }}
                                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                >
                                    <Copy size={12} /> Copy to Replay
                                </button>
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
                            <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                                <MarkdownRenderer content={viewingTurn.finalOutput} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-4xl bg-[#0b0f1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Settings2 className="text-cyan-400" />
                            <h2 className="text-xl font-bold text-white">Orchestration Settings</h2>
                        </div>
                        <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Enterprise Features */}
                        <div className="space-y-6 p-5 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={18} className="text-purple-400" />
                                <h3 className="font-bold text-white">Enterprise Orchestration</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-gray-400" title="Determines the number of agents and debate rounds.">Workflow Topology</span>
                                </div>
                                <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                                  {(['QUICK', 'STANDARD', 'DEEP'] as const).map(t => (
                                    <button
                                      key={t}
                                      onClick={() => setTopology(t)}
                                      className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${topology === t ? 'bg-purple-500/20 text-purple-400 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                      {t}
                                    </button>
                                  ))}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">
                                  {topology === 'QUICK' && "2 Agents, 0 Debate Rounds. Fast and cheap."}
                                  {topology === 'STANDARD' && "4 Agents, 1 Debate Round. Balanced."}
                                  {topology === 'DEEP' && "4 Agents, Custom Debate Rounds. Thorough analysis."}
                                </p>
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-gray-400" title="Determines how agents interact with each other.">Collaboration Mode</span>
                                </div>
                                <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                                  {(['parallel', 'sequential', 'round-robin'] as const).map(m => (
                                    <button
                                      key={m}
                                      onClick={() => setCollaborationMode(m)}
                                      className={`flex-1 py-2 text-xs font-bold rounded-md transition-all capitalize ${collaborationMode === m ? 'bg-cyan-500/20 text-cyan-400 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                      {m}
                                    </button>
                                  ))}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">
                                  {collaborationMode === 'parallel' && "Agents work simultaneously. Fastest."}
                                  {collaborationMode === 'sequential' && "Agents work one after another, building on previous outputs."}
                                  {collaborationMode === 'round-robin' && "Agents take turns contributing to a shared workspace."}
                                </p>
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-gray-400" title="Number of times agents critique each other.">Debate Rounds</span>
                                  <span className="text-purple-400 font-mono">{topology === 'QUICK' ? 0 : debateRounds}</span>
                                </div>
                                <input 
                                    type="range" min="1" max="3" step="1" 
                                    value={debateRounds} onChange={(e) => setDebateRounds(parseInt(e.target.value))}
                                    disabled={topology === 'QUICK'}
                                    className="w-full accent-purple-500 disabled:opacity-50"
                                />
                                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                    <span>1 Round</span>
                                    <span>3 Rounds</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only" 
                                    checked={isHitlEnabled}
                                    onChange={(e) => setIsHitlEnabled(e.target.checked)}
                                  />
                                  <div className={`block w-10 h-6 rounded-full transition-colors ${isHitlEnabled ? 'bg-rose-500' : 'bg-gray-700'}`}></div>
                                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isHitlEnabled ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-white">Human-in-the-Loop (HITL)</div>
                                  <div className="text-xs text-gray-500">Pause orchestration before synthesis for manual review and feedback.</div>
                                </div>
                              </label>
                            </div>
                        </div>

                        {/* Synthesizer Settings */}
                        <div className="space-y-6 p-5 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-4">
                                <SlidersHorizontal size={18} className="text-amber-400" />
                                <h3 className="font-bold text-white">Synthesizer Parameters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                              <div>
                                  <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-400" title="Nucleus sampling. Lower means less random.">Top-P</span>
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
                                      <span className="text-gray-400" title="Limits vocabulary to top K tokens.">Top-K</span>
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

                              <div>
                                  <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-400" title="Penalizes repeated words.">Frequency Penalty</span>
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
                            </div>
                        </div>

                        {/* Agent Instructions */}
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
                                                className="bg-black/40 border border-white/10 rounded px-1 py-0.5 text-[10px] text-gray-300 focus:outline-none"
                                              >
                                                {['BrainCircuit', 'Sparkles', 'ShieldCheck', 'Hammer', 'Bot', 'FileText', 'Code', 'PenTool', 'Lightbulb', 'Zap', 'Target', 'Eye', 'MessageSquare', 'Activity', 'Compass', 'Crosshair', 'Cpu', 'Database', 'Globe', 'Layers', 'Layout', 'Maximize', 'Minimize', 'Monitor', 'MousePointer', 'Move', 'Navigation', 'Octagon', 'Package', 'Paperclip', 'PieChart', 'Play', 'Power', 'Printer', 'Radio', 'RefreshCw', 'Repeat', 'Save', 'Search', 'Send', 'Server', 'Settings', 'Share2', 'Shield', 'ShoppingBag', 'ShoppingCart', 'Shuffle', 'Sidebar', 'SkipBack', 'SkipForward', 'Slack', 'Slash', 'Sliders', 'Smartphone', 'Smile', 'Speaker', 'Square', 'Star', 'StopCircle', 'Sun', 'Sunrise', 'Sunset', 'Tablet', 'Tag', 'TargetIcon', 'Terminal', 'Thermometer', 'ThumbsDownIcon', 'ThumbsUpIcon', 'ToggleLeft', 'ToggleRight', 'Trash', 'Trash2', 'Trello', 'TrendingDown', 'TrendingUp', 'Triangle', 'Truck', 'Tv', 'Twitch', 'Twitter', 'Type', 'Umbrella', 'Underline', 'Unlock', 'Upload', 'UploadCloud', 'User', 'UserCheck', 'UserMinus', 'UserPlus', 'Users', 'Video', 'VideoOff', 'Voicemail', 'Volume', 'Volume1', 'Volume2', 'VolumeX', 'Watch', 'Wifi', 'WifiOff', 'Wind', 'X', 'XCircle', 'XOctagon', 'XSquare', 'Youtube', 'ZapOff', 'ZoomIn', 'ZoomOut'].map(icon => (
                                                  <option key={icon} value={icon}>{icon}</option>
                                                ))}
                                              </select>
                                            </div>
                                        </div>
                                        
                                        {/* Parameters */}
                                        {agentSliders[agent.id] && (
                                          <div className="space-y-3 mt-2 mb-4 p-3 bg-black/20 rounded-lg border border-white/5">
                                            <div className="flex items-center justify-between gap-4">
                                              <span className="text-[10px] text-gray-400 w-16">Creativity</span>
                                              <input 
                                                type="range" min="0" max="100" 
                                                value={agentSliders[agent.id].creativity}
                                                onChange={(e) => setAgentSliders(prev => ({
                                                  ...prev,
                                                  [agent.id]: { ...prev[agent.id], creativity: parseInt(e.target.value) }
                                                }))}
                                                className="flex-1 accent-purple-500 h-1"
                                              />
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                              <span className="text-[10px] text-gray-400 w-16">Logic</span>
                                              <input 
                                                type="range" min="0" max="100" 
                                                value={agentSliders[agent.id].logic}
                                                onChange={(e) => setAgentSliders(prev => ({
                                                  ...prev,
                                                  [agent.id]: { ...prev[agent.id], logic: parseInt(e.target.value) }
                                                }))}
                                                className="flex-1 accent-blue-500 h-1"
                                              />
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                              <span className="text-[10px] text-gray-400 w-16">Formality</span>
                                              <input 
                                                type="range" min="0" max="100" 
                                                value={agentSliders[agent.id].formality}
                                                onChange={(e) => setAgentSliders(prev => ({
                                                  ...prev,
                                                  [agent.id]: { ...prev[agent.id], formality: parseInt(e.target.value) }
                                                }))}
                                                className="flex-1 accent-emerald-500 h-1"
                                              />
                                            </div>
                                          </div>
                                        )}

                                        {/* Presets */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {['Basic', 'Creative', 'Analytical', 'Practical', ...Object.keys(customSavedPresets), 'Custom'].map(preset => (
                                                <button
                                                    key={preset}
                                                    onClick={() => {
                                                        setAgentPresetSelections(prev => ({ ...prev, [agent.id]: preset }));
                                                        if (preset !== 'Custom') {
                                                            const presetData = AGENT_PRESETS[preset] || customSavedPresets[preset];
                                                            if (presetData) {
                                                              setCustomInstructions(prev => ({ ...prev, [agent.id]: presetData[agent.id] }));
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
                        
                        {/* Save Custom Preset */}
                        <div className="mt-6 p-4 rounded-xl bg-cyan-900/10 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                        <button 
                            onClick={() => setShowSettings(false)}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all"
                        >
                            <Save size={18} />
                            <span>Save & Close</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
      
      <footer className="mt-12 text-center text-gray-600 text-sm">
        <p>© 2026 The Infinite Intelligence. Powered by Gemini.</p>
      </footer>
      
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
