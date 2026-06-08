import React from 'react';
import { Database, BarChart3, History, Activity } from 'lucide-react';

export default function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Logo Left */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Database className="w-4 h-4 text-primary" />
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
            Analyzer
          </button>
          <button 
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground ${currentPage === 'history' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>

        {/* Status Right */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-card border border-border text-xs font-mono text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Engine Online
          </div>
        </div>

      </div>
    </nav>
  );
}
