import React from 'react';

export default function QueryInput({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground flex items-center justify-between">
        SQL Query
        <span className="text-xs text-muted-foreground font-normal">MySQL SELECT only</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="SELECT * FROM users WHERE email = 'test@example.com';"
        className="w-full h-48 p-4 bg-muted border border-border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
        spellCheck="false"
      />
    </div>
  );
}
