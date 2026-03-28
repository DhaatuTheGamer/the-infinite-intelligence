import React, { useState } from 'react';
import { AgentPersona, AgentStatus } from '../types';
import { BrainCircuit, Sparkles, ShieldCheck, Hammer, Loader2, ThumbsUp, ThumbsDown, AlertCircle, ChevronDown, ChevronUp, Bot, FileText, Code, PenTool, Lightbulb, Zap, Target, Eye, MessageSquare, Activity, Compass, Crosshair, Cpu, Database, Globe, Layers, Layout, Maximize, Minimize, Monitor, MousePointer, Move, Navigation, Octagon, Package, Paperclip, PieChart, Play, Power, Printer, Radio, RefreshCw, Repeat, Save, Search, Send, Server, Settings, Share2, Shield, ShoppingBag, ShoppingCart, Shuffle, Sidebar, SkipBack, SkipForward, Slack, Slash, Sliders, Smartphone, Smile, Speaker, Square, Star, StopCircle, Sun, Sunrise, Sunset, Tablet, Tag, Target as TargetIcon, Terminal, Thermometer, ThumbsDown as ThumbsDownIcon, ThumbsUp as ThumbsUpIcon, ToggleLeft, ToggleRight, Trash, Trash2, Trello, TrendingDown, TrendingUp, Triangle, Truck, Tv, Twitch, Twitter, Type, Umbrella, Underline, Unlock, Upload, UploadCloud, User, UserCheck, UserMinus, UserPlus, Users, Video, VideoOff, Voicemail, Volume, Volume1, Volume2, VolumeX, Watch, Wifi, WifiOff, Wind, X, XCircle, XOctagon, XSquare, Youtube, ZapOff, ZoomIn, ZoomOut } from 'lucide-react';
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
  sliders?: { creativity: number; logic: number; formality: number };
  onSlidersChange?: (sliders: { creativity: number; logic: number; formality: number }) => void;
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
  sliders,
  onSlidersChange
}) => {
  const Icon = IconMap[agent.icon] || BrainCircuit;
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const renderThinkingAnimation = () => {
    switch (agent.icon) {
      case 'BrainCircuit':
        return <BrainCircuit size={14} className="animate-spin text-cyan-400" style={{ animationDuration: '3s' }} />;
      case 'Sparkles':
        return <Sparkles size={14} className="animate-pulse text-purple-400" style={{ animationDuration: '0.8s', transform: 'scale(1.2)' }} />;
      case 'ShieldCheck':
        return (
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ShieldCheck size={14} className="text-emerald-400" />
          </motion.div>
        );
      case 'Hammer':
        return (
          <motion.div
            animate={{ rotate: [0, -20, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: 'bottom right' }}
          >
            <Hammer size={14} className="text-amber-400" />
          </motion.div>
        );
      default:
        return <Loader2 size={14} className="animate-spin text-gray-400" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative flex flex-col h-full rounded-xl border ${status === AgentStatus.ERROR ? 'border-red-500/50' : 'border-white/10'} bg-gradient-to-br ${agent.bgGradient} backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/20 shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-black/40 ${agent.color}`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className={`font-bold text-sm tracking-wide ${agent.color}`}>{agent.name}</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{agent.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowSettings(!showSettings)}
             className={`p-1 rounded hover:bg-white/10 transition-colors ${showSettings ? 'text-cyan-400 bg-white/5' : 'text-gray-500'}`}
             title="Agent Settings"
           >
             <Settings size={14} />
           </button>
           {status === AgentStatus.THINKING && (
              <span className="flex items-center gap-2 text-xs text-white/50">
                {renderThinkingAnimation()}
                <span className="animate-pulse">Thinking...</span>
              </span>
           )}
           {status === AgentStatus.CRITIQUING && (
              <span className="flex items-center gap-2 text-xs text-amber-400/80">
                <Loader2 size={14} className="animate-spin" />
                <span className="animate-pulse">Critiquing...</span>
              </span>
           )}
           {status === AgentStatus.COMPLETED && (
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
      <div className="flex-1 p-4 overflow-y-auto scrollbar-hide text-xs sm:text-sm leading-relaxed text-gray-300 font-mono">
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 p-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Agent Parameters</h4>
                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              
              {sliders && onSlidersChange && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-purple-400 font-bold uppercase">Creativity</span>
                      <span className="text-white">{sliders.creativity}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={sliders.creativity} 
                      onChange={(e) => onSlidersChange({ ...sliders, creativity: parseInt(e.target.value) })}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-[8px] text-gray-500">
                      <span>Literal</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-blue-400 font-bold uppercase">Logic</span>
                      <span className="text-white">{sliders.logic}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={sliders.logic} 
                      onChange={(e) => onSlidersChange({ ...sliders, logic: parseInt(e.target.value) })}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[8px] text-gray-500">
                      <span>Intuitive</span>
                      <span>Analytical</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-emerald-400 font-bold uppercase">Formality</span>
                      <span className="text-white">{sliders.formality}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={sliders.formality} 
                      onChange={(e) => onSlidersChange({ ...sliders, formality: parseInt(e.target.value) })}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[8px] text-gray-500">
                      <span>Casual</span>
                      <span>Formal</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-gray-500 italic">
                  These parameters dynamically adjust the agent's persona and reasoning style for the next turn.
                </p>
              </div>
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
              <div className="space-y-2 mt-1">
                <p className="text-[10px] font-bold text-red-300/90 uppercase tracking-tighter">Troubleshooting Suggestions:</p>
                <ul className="list-disc list-inside text-[10px] opacity-80 space-y-1">
                  {error?.includes('SAFETY') ? (
                    <li>The content was flagged by safety filters. Try rephrasing to be more neutral.</li>
                  ) : error?.includes('QUOTA') || error?.includes('429') ? (
                    <li>Rate limit exceeded. Please wait a moment before trying again.</li>
                  ) : error?.includes('context window') || error?.includes('tokens') ? (
                    <li>The conversation history might be too long. Try starting a new turn or clearing history.</li>
                  ) : (
                    <>
                      <li>Check your internet connection and API key status.</li>
                      <li>The prompt might be too complex or ambiguous.</li>
                      <li>The model might be temporarily overloaded.</li>
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
                  className="pt-4 border-t border-white/10"
                >
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block mb-2">Critique & Refinement</span>
                  <MarkdownRenderer content={critique} compact={true} />
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
