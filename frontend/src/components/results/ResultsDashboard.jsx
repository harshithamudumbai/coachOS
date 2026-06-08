import React from 'react';

export default function ResultsDashboard({ data }) {
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="math-panel p-6 flex items-center justify-between">
        <div>
          <h2 className="text-4xl handwritten font-bold mb-2 text-slate-800">Analysis Complete!</h2>
          <p className="text-slate-600 font-mono text-sm leading-relaxed"><span className="highlighter">{data.summary}</span></p>
        </div>
        <div className="text-right">
          <div className="text-6xl handwritten font-black text-blue-600 underline decoration-wavy decoration-blue-300">{data.health_score}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">Health Score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="math-panel p-4 text-center">
          <div className="text-xs font-mono text-slate-500 mb-1">Est. Improvement</div>
          <div className="text-2xl handwritten font-bold text-green-600">{data.estimated_improvement}</div>
        </div>
        <div className="math-panel p-4 text-center">
          <div className="text-xs font-mono text-slate-500 mb-1">Complexity</div>
          <div className="text-2xl handwritten font-bold text-slate-800">{data.execution_complexity}</div>
        </div>
        <div className="math-panel p-4 text-center">
          <div className="text-xs font-mono text-slate-500 mb-1">Tables Scanned</div>
          <div className="text-2xl handwritten font-bold text-slate-800">{data.tables_scanned}</div>
        </div>
        <div className="math-panel p-4 text-center">
          <div className="text-xs font-mono text-slate-500 mb-1">Missing Indexes</div>
          <div className="text-2xl handwritten font-bold text-red-500">{data.missing_indexes?.length || 0}</div>
        </div>
      </div>

      {data.bottlenecks?.length > 0 && (
        <div className="math-panel p-6 relative">
          <div className="absolute -top-4 -left-4 text-red-500 font-bold font-mono text-2xl -rotate-12">!</div>
          <h3 className="text-2xl handwritten font-bold mb-4 text-slate-800 border-b-2 border-slate-300 pb-2 inline-block">Bottlenecks Found</h3>
          <div className="flex flex-col gap-4 mt-2">
            {data.bottlenecks.map(b => (
              <div key={b.id} className="p-4 bg-white border-2 border-slate-400 border-dashed rounded-lg relative shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 font-mono text-sm underline decoration-red-300">{b.problem}</span>
                  <span className={`text-xs px-2 py-1 border-2 font-bold font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transform rotate-1 ${
                    b.severity === 'Critical' ? 'bg-red-100 text-red-700 border-red-300' :
                    b.severity === 'High' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                    b.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                    'bg-green-100 text-green-700 border-green-300'
                  }`}>{b.severity}</span>
                </div>
                <p className="text-xs font-mono text-slate-600 mb-3 border-l-2 border-slate-300 pl-3">Impact: {b.impact}</p>
                <p className="text-sm font-bold font-mono text-blue-600">→ Fix: {b.fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.rewritten_query && (
        <div className="math-panel p-6">
          <h3 className="text-2xl handwritten font-bold mb-4 text-slate-800 border-b-2 border-slate-300 pb-2 inline-block">Rewritten Query</h3>
          <pre className="p-4 bg-slate-800 text-slate-100 font-mono text-sm overflow-x-auto border-2 border-slate-900 mb-4 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.5)] rounded">
            {data.rewritten_query}
          </pre>
          <p className="text-sm font-mono text-slate-700 bg-blue-50 p-3 border-l-4 border-blue-400">💡 {data.rewrite_explanation}</p>
        </div>
      )}
    </div>
  );
}
