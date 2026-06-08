import React from 'react';

export default function QueryInput({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2 relative">
      <label className="text-xl handwritten font-bold text-slate-800 flex items-center justify-between">
        SQL Query
        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-bold font-mono border border-blue-200 shadow-[1px_1px_0px_0px_rgba(59,130,246,0.2)]">MySQL SELECT only</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="SELECT * FROM users WHERE email = 'test@example.com';"
        className="math-input h-48"
        spellCheck="false"
      />
    </div>
  );
}
