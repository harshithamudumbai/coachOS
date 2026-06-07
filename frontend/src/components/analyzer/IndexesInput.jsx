import React, { useState } from 'react';
import { ChevronDown, ChevronUp, KeyRound } from 'lucide-react';

export default function IndexesInput({ value, onChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-background/50 transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Table Indexes</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium ml-2">Optional</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-border/50 bg-background/80">
          <p className="text-xs text-muted-foreground mb-3">
            Paste your table indexes (e.g. from <code>SHOW INDEXES FROM table;</code>). This helps Dr.Query identify redundant or missing indexes accurately.
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-32 p-3 bg-muted/30 border border-border/50 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
            placeholder="Table: users&#10;Key_name: PRIMARY, Column_name: id&#10;Key_name: idx_email, Column_name: email"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
