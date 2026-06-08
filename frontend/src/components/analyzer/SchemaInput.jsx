import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function SchemaInput({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="modern-card overflow-hidden mb-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-card/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-foreground text-lg">Schema</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono uppercase tracking-wider ml-2">Optional</span>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-border bg-background/50">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(255));"
            className="math-input h-32 resize-y"
            spellCheck="false"
          />
        </div>
      )}
    </div>
  );
}
