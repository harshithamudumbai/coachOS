import React, { useState } from 'react';
import { ChevronDown, ChevronUp, KeyRound } from 'lucide-react';

export default function IndexesInput({ value, onChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="modern-card overflow-hidden mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-card/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-foreground text-lg">Table Indexes</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono uppercase tracking-wider ml-2">Optional</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-border bg-background/50">
          <p className="text-xs text-muted-foreground mb-3">
            Paste your table indexes (e.g. from <code>SHOW INDEXES FROM table;</code>). This helps Dr.Query identify redundant or missing indexes accurately.
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="math-input h-32 resize-y"
            placeholder="Table: users&#10;Key_name: PRIMARY, Column_name: id&#10;Key_name: idx_email, Column_name: email"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
