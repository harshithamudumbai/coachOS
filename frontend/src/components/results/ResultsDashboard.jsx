import React from 'react';

export default function ResultsDashboard({ data }) {
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
          <p className="text-muted-foreground">{data.summary}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-primary">{data.health_score}/100</div>
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Health Score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-sm text-muted-foreground mb-1">Est. Improvement</div>
          <div className="text-xl font-bold text-success">{data.estimated_improvement}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-sm text-muted-foreground mb-1">Complexity</div>
          <div className="text-xl font-bold">{data.execution_complexity}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-sm text-muted-foreground mb-1">Tables Scanned</div>
          <div className="text-xl font-bold">{data.tables_scanned}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-sm text-muted-foreground mb-1">Missing Indexes</div>
          <div className="text-xl font-bold text-warning">{data.missing_indexes?.length || 0}</div>
        </div>
      </div>

      {data.bottlenecks?.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Bottlenecks</h3>
          <div className="flex flex-col gap-3">
            {data.bottlenecks.map(b => (
              <div key={b.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{b.problem}</span>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                    b.severity === 'Critical' ? 'bg-critical/20 text-critical' :
                    b.severity === 'High' ? 'bg-orange-500/20 text-orange-500' :
                    b.severity === 'Medium' ? 'bg-warning/20 text-warning' :
                    'bg-success/20 text-success'
                  }`}>{b.severity}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Impact: {b.impact}</p>
                <p className="text-sm font-medium text-primary">Fix: {b.fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.rewritten_query && (
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Rewritten Query</h3>
          <pre className="p-4 bg-background rounded-lg text-sm font-mono overflow-x-auto border border-border mb-3">
            {data.rewritten_query}
          </pre>
          <p className="text-sm text-muted-foreground">{data.rewrite_explanation}</p>
        </div>
      )}
    </div>
  );
}
