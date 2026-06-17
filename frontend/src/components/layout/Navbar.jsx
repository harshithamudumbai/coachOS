import React from 'react';
import { Search, BarChart3, History, Cpu } from 'lucide-react';

export default function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="border-b border-[#333333] bg-[#1A1A1A] sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Logo Left */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-8 h-8 bg-[#121212] border border-[#333333] flex items-center justify-center group-hover:border-[#F5B041] transition-colors">
            <Search className="w-4 h-4 text-[#F5B041]" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Dr.Query
          </span>
        </div>

        {/* Navigation Center */}
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onNavigate('home')}
            className={`text-sm font-medium transition-colors hover:text-foreground ${currentPage === 'home' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('analyzer')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground ${currentPage === 'analyzer' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Investigation
          </button>
          <button 
            onClick={() => onNavigate('workload')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground ${currentPage === 'workload' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <Cpu className="w-4 h-4" />
            Workload
          </button>
          <button 
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground ${currentPage === 'history' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <History className="w-4 h-4" />
            Case Files
          </button>
        </div>

        {/* Status Right */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#121212] border border-[#333333] text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
            MySQL Supported (PgSQL Soon)
          </div>
        </div>

      </div>
    </nav>
  );
}
