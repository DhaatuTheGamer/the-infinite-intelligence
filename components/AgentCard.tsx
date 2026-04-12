import React, { useState } from 'react';
import { AgentPersona, AgentStatus, AgentResult } from '../types';
import { BrainCircuit, Sparkles, ShieldCheck, Hammer, Loader2, ThumbsUp, ThumbsDown, AlertCircle, ChevronDown, ChevronUp, Bot, FileText, Code, PenTool, Lightbulb, Zap, Target, Eye, MessageSquare, Activity, Compass, Crosshair, Cpu, Database, Globe, Layers, Layout, Maximize, Minimize, Monitor, MousePointer, Move, Navigation, Octagon, Package, Paperclip, PieChart, Play, Power, Printer, Radio, RefreshCw, Repeat, Save, Search, Send, Server, Settings, Share2, Shield, ShoppingBag, ShoppingCart, Shuffle, Sidebar, SkipBack, SkipForward, Slack, Slash, Sliders, Smartphone, Smile, Speaker, Square, Star, StopCircle, Sun, Sunrise, Sunset, Tablet, Tag, Target as TargetIcon, Terminal, Thermometer, ThumbsDown as ThumbsDownIcon, ThumbsUp as ThumbsUpIcon, ToggleLeft, ToggleRight, Trash, Trash2, Trello, TrendingDown, TrendingUp, Triangle, Truck, Tv, Twitch, Twitter, Type, Umbrella, Underline, Unlock, Upload, UploadCloud, User, UserCheck, UserMinus, UserPlus, Users, Video, VideoOff, Voicemail, Volume, Volume1, Volume2, VolumeX, Watch, Wifi, WifiOff, Wind, X, XCircle, XOctagon, XSquare, Youtube, ZapOff, ZoomIn, ZoomOut, History as HistoryIcon } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { motion, AnimatePresence } from 'motion/react';

interface AgentCardProps {
  agent: AgentPersona;
  status: AgentStatus;
  content: string;
  critique?: string;
  error?: string;
  feedback?: 'up' | 'down';
  onFeedback?: (feedback: 'up' | 'down') => void;
  sessionHistory?: AgentResult[];
}

const IconMap: Record<string, React.FC<any>> = {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  Hammer,
  Bot,
  FileText,
  Code,
  PenTool,
  Lightbulb,
  Zap,
  Target,
  Eye,
  MessageSquare,
  Activity,
  Compass,
  Crosshair,
  Cpu,
  Database,
  Globe,
  Layers,
  Layout,
  Maximize,
  Minimize,
  Monitor,
  MousePointer,
  Move,
  Navigation,
  Octagon,
  Package,
  Paperclip,
  PieChart,
  Play,
  Power,
  Printer,
  Radio,
  RefreshCw,
  Repeat,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Share2,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Shuffle,
  Sidebar,
  SkipBack,
  SkipForward,
  Slack,
  Slash,
  Sliders,
  Smartphone,
  Smile,
  Speaker,
  Square,
  Star,
  StopCircle,
  Sun,
  Sunrise,
  Sunset,
  Tablet,
  Tag,
  TargetIcon,
  Terminal,
  Thermometer,
  ThumbsDownIcon,
  ThumbsUpIcon,
  ToggleLeft,
  ToggleRight,
  Trash,
  Trash2,
  Trello,
  TrendingDown,
  TrendingUp,
  Triangle,
  Truck,
  Tv,
  Twitch,
  Twitter,
  Type,
  Umbrella,
  Underline,
  Unlock,
  Upload,
  UploadCloud,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Video,
  VideoOff,
  Voicemail,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Watch,
  Wifi,
  WifiOff,
  Wind,
  X,
  XCircle,
  XOctagon,
  XSquare,
  Youtube,
  ZapOff,
  ZoomIn,
  ZoomOut
};

export const AgentCard: React.FC<AgentCardProps> = ({ 
  agent, 
  status, 
  content, 
  critique,
  error, 
  feedback, 
  onFeedback,
  sessionHistory = []
}) => {
  const Icon = IconMap[agent.icon] || BrainCircuit;
  const [showErrorDetails, setShowErrorDetails] = useState(true);
  const [showCritique, setShowCritique] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const renderThinkingAnimation = () => {
    return <Icon size={14} className={`animate-pulse ${agent.color}`} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative flex flex-col h-full rounded-xl border ${status === AgentStatus.ERROR ? 'border-red-500/50' : feedback === 'up' ? 'border-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.3)] ring-1 ring-green-500/50' : feedback === 'down' ? 'border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.3)] ring-1 ring-red-500/50' : 'border-white/10'} bg-gradient-to-br ${agent.bgGradient} backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/20 shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-black/40 ${agent.color}`}>
            <Icon size={20} className={(status === AgentStatus.THINKING || status === AgentStatus.CRITIQUING) ? 'animate-pulse' : ''} />
          </div>
          <div className="flex items-center gap-2">
            <div>
              <h3 className={`font-bold text-sm tracking-wide ${agent.color}`}>{agent.name}</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{agent.role}</p>
            </div>
            {sessionHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1 rounded-md transition-colors ${showHistory ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                title="Toggle Session History"
              >
                <HistoryIcon size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
           {status === AgentStatus.THINKING && (
              <span className="flex items-center gap-2 text-xs text-white/50">
                {renderThinkingAnimation()}
                <span className="animate-pulse">Thinking...</span>
              </span>
           )}
           {status === AgentStatus.CRITIQUING && (
              <span className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/30">
                <Icon size={14} className="animate-pulse" />
                <span className="animate-pulse font-medium">Critiquing...</span>
              </span>
           )}
           {(status === AgentStatus.COMPLETED || status === AgentStatus.CRITIQUING) && content && (
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => onFeedback?.('up')}
                  className={`p-1 rounded hover:bg-white/10 transition-colors ${feedback === 'up' ? 'text-green-400' : 'text-gray-500'}`}
                >
                  <ThumbsUp size={14} />
                </button>
                <button 
                  onClick={() => onFeedback?.('down')}
                  className={`p-1 rounded hover:bg-white/10 transition-colors ${feedback === 'down' ? 'text-red-400' : 'text-gray-500'}`}
                >
                  <ThumbsDown size={14} />
                </button>
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
             </div>
           )}
           {status === AgentStatus.ERROR && (
             <AlertCircle size={16} className="text-red-500 animate-bounce" />
           )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-hide text-xs sm:text-sm leading-relaxed text-gray-300">
        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-4"
            >
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <HistoryIcon size={14} /> Session History
              </h4>
              {sessionHistory.map((hist, idx) => (
                <div key={idx} className="bg-black/40 border border-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-500 uppercase">Turn {idx + 1}</span>
                    {hist.feedback && (
                      <span className={hist.feedback === 'up' ? 'text-green-400' : 'text-red-400'}>
                        {hist.feedback === 'up' ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 line-clamp-3 hover:line-clamp-none transition-all">
                    {hist.content}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : status === AgentStatus.ERROR ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs bg-red-900/20 p-3 rounded-lg border border-red-500/20 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold">Agent Error</p>
                <button 
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="flex items-center gap-1 text-[10px] hover:text-red-300 transition-colors bg-red-500/10 px-2 py-1 rounded"
                >
                  {showErrorDetails ? 'Hide Details' : 'View Details'}
                  {showErrorDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
              <p className="text-sm">The agent encountered an issue while processing your request.</p>
              <div className="space-y-2 mt-2 bg-red-950/30 p-2 rounded border border-red-500/20">
                <p className="text-[10px] font-bold text-red-300/90 uppercase tracking-tighter flex items-center gap-1">
                  <Lightbulb size={12} className="text-amber-400" />
                  AI Troubleshooting Suggestions:
                </p>
                <ul className="list-disc list-inside text-[10px] opacity-90 space-y-1.5 text-red-200">
                  {error?.toLowerCase().includes('safety') || error?.toLowerCase().includes('blocked') ? (
                    <>
                      <li><strong>Safety Filter Triggered:</strong> The AI model blocked the response due to safety guidelines.</li>
                      <li><strong>Action:</strong> Try rephrasing your prompt to be more neutral or avoid sensitive topics.</li>
                    </>
                  ) : error?.toLowerCase().includes('quota') || error?.includes('429') || error?.toLowerCase().includes('rate limit') ? (
                    <>
                      <li><strong>Rate Limit Exceeded:</strong> You are sending requests too quickly or have exhausted your API quota.</li>
                      <li><strong>Action:</strong> Wait a few moments before trying again, or check your API billing dashboard.</li>
                    </>
                  ) : error?.toLowerCase().includes('context window') || error?.toLowerCase().includes('tokens') || error?.toLowerCase().includes('too large') ? (
                    <>
                      <li><strong>Context Window Exceeded:</strong> The conversation history or prompt is too long for the model to process.</li>
                      <li><strong>Action:</strong> Try starting a new conversation or summarizing the previous context.</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Prompt Complexity:</strong> The prompt might be too ambiguous or complex for this specific agent persona.</li>
                      <li><strong>Model Overload:</strong> The AI provider might be experiencing high traffic or temporary outages.</li>
                      <li><strong>Action:</strong> Break your request into smaller steps, or try again in a few seconds.</li>
                    </>
                  )}
                </ul>
              </div>
              
              <AnimatePresence>
                {showErrorDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 pt-2 border-t border-red-500/20 whitespace-pre-wrap font-mono text-[10px] text-red-300/80">
                      {error}
                    </div>
                    <div className="mt-2 text-[10px]">
                      <a href="#" className="text-red-400 hover:text-red-300 underline flex items-center gap-1 w-fit">
                        <Globe size={10} /> View AI Troubleshooting Guide
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : content ? (
            <motion.div
              key={content.length + (critique?.length || 0)} // Trigger re-animation on new content
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <MarkdownRenderer content={content} compact={true} />
              
              {critique && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                >
                  <button 
                    onClick={() => setShowCritique(!showCritique)}
                    className="flex items-center justify-between w-full text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-2 hover:text-amber-300 transition-colors"
                  >
                    <span className="flex items-center gap-2"><Lightbulb size={12} /> Critique & Refinement</span>
                    {showCritique ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <AnimatePresence>
                    {showCritique && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 border-t border-amber-500/10">
                          <MarkdownRenderer content={critique} compact={true} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/10 italic text-xs">
              {status === AgentStatus.THINKING ? 'Analyzing...' : 'Waiting for input...'}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Status Bar */}
      <div className="h-1 w-full bg-white/5">
        {(status === AgentStatus.THINKING || status === AgentStatus.CRITIQUING) && (
          <motion.div 
            layoutId={`progress-${agent.id}`}
            className={`h-full ${agent.color.replace('text-', 'bg-')} animate-progress-indeterminate`}
          ></motion.div>
        )}
      </div>
    </motion.div>
  );
};
