import React from 'react';
import { Database, BarChart3, History, ChevronDown } from 'lucide-react';

export default function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="border-b-4 border-slate-800 bg-white/90 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer transform -rotate-2 hover:rotate-0 transition-transform"
          onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-yellow-200 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]">
            <span className="font-bold text-2xl font-mono text-slate-800">∑</span>
          </div>
          <span className="font-bold text-3xl tracking-tight handwritten text-slate-800 underline decoration-wavy decoration-blue-500">Dr.Query</span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-6 text-xl handwritten font-bold text-slate-600">
          <button 
            onClick={() => onNavigate('home')}
            className={`hover:text-blue-600 hover:-translate-y-0.5 transition-all ${currentPage === 'home' ? 'text-blue-600 underline decoration-4 decoration-yellow-400' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('analyzer')}
            className={`flex items-center gap-1 hover:text-blue-600 hover:-translate-y-0.5 transition-all ${currentPage === 'analyzer' ? 'text-blue-600 underline decoration-4 decoration-yellow-400' : ''}`}
          >
            <BarChart3 className="w-5 h-5" />
            Analyzer
          </button>
          <button 
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-1 hover:text-blue-600 hover:-translate-y-0.5 transition-all ${currentPage === 'history' ? 'text-blue-600 underline decoration-4 decoration-yellow-400' : ''}`}
          >
            <History className="w-5 h-5" />
            Notes History
          </button>
        </div>

        {/* Right Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white border-2 border-slate-800 text-slate-800 text-xs font-bold font-mono shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] transform rotate-2">
            <div className="w-3 h-3 border-2 border-slate-800 rounded-full bg-green-400"></div>
            MySQL=Ready
          </div>
        </div>

      </div>
    </nav>
  );
}
