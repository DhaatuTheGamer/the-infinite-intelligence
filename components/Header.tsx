import React from 'react';
import { Infinity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6">
      <Link to="/home" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-40 animate-pulse"></div>
            <Infinity className="relative text-cyan-400" size={28} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white font-sans">
          The Infinite <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Intelligence</span>
        </h1>
      </Link>
      <div className="hidden sm:flex items-center gap-6 text-xs font-medium text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>LOGOS</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>PATHOS</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>ETHOS</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>PRAXIS</span>
      </div>
    </header>
  );
};
