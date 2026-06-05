import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function SchemaInput({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-semibold text-foreground flex items-center gap-1 hover:text-primary transition-colors w-fit"
      >
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        Schema (Optional)
      </button>
      
      {isOpen && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(255));"
          className="w-full h-32 p-4 bg-muted/50 border border-border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
          spellCheck="false"
        />
      )}
    </div>
  );
}
