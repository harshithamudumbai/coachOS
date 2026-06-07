import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileCode2 } from 'lucide-react';

export default function ExplainInput({ value, onChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-background/50 transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Custom EXPLAIN / EXPLAIN ANALYZE Output</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium ml-2">Optional</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-border/50 bg-background/80">
          <p className="text-xs text-muted-foreground mb-3">
            Paste the raw output of <code>EXPLAIN</code> or <code>EXPLAIN ANALYZE</code> from your database. If provided, Dr.Query will use this instead of running EXPLAIN locally.
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-32 p-3 bg-muted/30 border border-border/50 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
            placeholder="-> Limit: 10 rows&#10;    -> Index scan on users using idx_email..."
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
