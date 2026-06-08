import React from 'react';

export default function QueryInput({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2 relative">
      <label className="text-lg font-display font-bold text-foreground flex items-center justify-between">
        SQL Query
        <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono uppercase tracking-wider">MySQL SELECT only</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="SELECT * FROM users WHERE email = 'test@example.com';"
        className="math-input h-48 resize-y"
        spellCheck="false"
      />
    </div>
  );
}
