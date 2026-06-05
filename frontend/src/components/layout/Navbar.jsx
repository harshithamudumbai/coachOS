import React from 'react';
import { Database, BarChart3, History, ChevronDown } from 'lucide-react';

export default function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight">Dr.Query</span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <button 
            onClick={() => onNavigate('home')}
            className={`hover:text-foreground transition-colors ${currentPage === 'home' ? 'text-foreground' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('analyzer')}
            className={`flex items-center gap-2 hover:text-foreground transition-colors ${currentPage === 'analyzer' ? 'text-foreground' : ''}`}
          >
            <BarChart3 className="w-4 h-4" />
            Analyzer
          </button>
          <button 
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-2 hover:text-foreground transition-colors ${currentPage === 'history' ? 'text-foreground' : ''}`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <span className="cursor-not-allowed opacity-50">Documentation</span>
          <span className="cursor-not-allowed opacity-50">Pricing</span>
        </div>

        {/* Right Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            MySQL Ready
          </div>
          
          <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md border border-border bg-muted/50 cursor-not-allowed opacity-70">
            PostgreSQL
            <span className="bg-background px-1.5 py-0.5 rounded text-[10px] ml-1">Soon</span>
          </button>
        </div>

      </div>
    </nav>
  );
}
