import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileCode2 } from 'lucide-react';

export default function ExplainInput({ value, onChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="math-panel overflow-hidden transition-all duration-300 mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition-colors border-2 border-transparent hover:border-slate-300"
        style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}
      >
        <div className="flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-slate-800 handwritten text-xl">Custom EXPLAIN Output</span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-blue-300 bg-blue-50 text-blue-600 font-bold font-mono ml-2 transform -rotate-2 shadow-[1px_1px_0px_0px_rgba(59,130,246,0.3)]">Optional</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-border/50 bg-background/80">
          <p className="text-xs text-muted-foreground mb-3">
            Paste the raw output of <code>EXPLAIN</code> or <code>EXPLAIN ANALYZE</code> from your database. If provided, Dr.Query will use this instead of running EXPLAIN locally.
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-32 p-3 bg-white border-2 border-slate-700 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.05)] resize-y"
            style={{ borderRadius: '10px 200px 10px 200px/200px 10px 200px 10px' }}
            placeholder="-> Limit: 10 rows&#10;    -> Index scan on users using idx_email..."
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
