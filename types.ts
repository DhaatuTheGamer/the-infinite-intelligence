export enum AgentId {
  LOGOS = 'LOGOS',
  PATHOS = 'PATHOS',
  ETHOS = 'ETHOS',
  PRAXIS = 'PRAXIS',
  DYNAMIC_1 = 'DYNAMIC_1',
  DYNAMIC_2 = 'DYNAMIC_2',
  DYNAMIC_3 = 'DYNAMIC_3',
  DYNAMIC_4 = 'DYNAMIC_4'
}

export enum AgentStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  CRITIQUING = 'CRITIQUING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface AgentPersona {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  color: string;
  bgGradient: string;
  icon: string;
  systemInstruction: string;
  sliders?: {
    creativity: number;
    logic: number;
    formality: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface TokenUsage {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface AgentResult {
  content: string;
  critique?: string;
  status: AgentStatus;
  feedback?: 'up' | 'down';
  error?: string;
  usage?: TokenUsage;
}

export interface Artifact {
  id: string;
  title: string;
  type: 'code' | 'markdown' | 'json' | 'text' | 'html';
  content: string;
}

export interface ConversationTurn {
  id: string;
  title?: string;
  prompt: string;
  analyzedPrompt?: string;
  dynamicAgents?: AgentPersona[];
  agentOutputs: Record<AgentId, AgentResult>;
  finalOutput: string;
  artifacts?: Artifact[];
  timestamp: number;
  archived?: boolean;
  topology?: 'QUICK' | 'STANDARD' | 'DEEP';
  collaborationMode?: 'parallel' | 'sequential' | 'round-robin';
  totalTokens?: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  step: 'IDLE' | 'ANALYZING_PROMPT' | 'ASSEMBLING_AGENTS' | 'AGENTS_WORKING' | 'AGENTS_CRITIQUING' | 'PAUSED_FOR_REVIEW' | 'SYNTHESIZING' | 'DONE';
}
