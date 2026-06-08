import React from 'react';
import { Sigma, CheckCircle2, Copy } from 'lucide-react';

export default function ResultsDashboard({ data }) {
  if (!data) return null;

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  };

  const getSeverityBadge = (severity) => {
    const s = severity.toLowerCase();
    if (s === 'critical' || s === 'high') return <span className="badge-danger">{severity}</span>;
    if (s === 'medium') return <span className="badge-warning">{severity}</span>;
    return <span className="badge-success">{severity}</span>;
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Summary */}
      <div className="math-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-primary">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sigma className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-display font-bold text-foreground">Execution Proof Complete</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl font-mono">
            {data.summary}
          </p>
        </div>
        <div className="text-center md:text-right shrink-0 bg-background/50 p-4 rounded border border-[rgba(245,245,245,0.08)] min-w-[140px]">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono mb-1">
            Efficiency(Q)
          </div>
          <div className={`text-5xl font-serif font-black ${getHealthColor(data.health_score)}`}>
            = {data.health_score}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="math-panel p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Δ(t)</span>
          <div className="text-2xl font-display font-bold text-success">{data.estimated_improvement}</div>
        </div>
        <div className="math-panel p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">O(n)</span>
          <div className="text-2xl font-display font-bold text-foreground">{data.execution_complexity}</div>
        </div>
        <div className="math-panel p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">|Rows|</span>
          <div className="text-2xl font-display font-bold text-foreground">{data.tables_scanned}</div>
        </div>
        <div className="math-panel p-4 flex flex-col items-center justify-center text-center border-b-2 border-b-danger">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">∅ Indexes</span>
          <div className="text-2xl font-display font-bold text-danger">{data.missing_indexes?.length || 0}</div>
        </div>
      </div>

      {/* Bottlenecks / Theorems */}
      {data.bottlenecks?.length > 0 && (
        <div className="math-panel p-6 border-t-2 border-t-warning">
          <h3 className="text-xl font-display font-bold mb-4 text-foreground flex items-center gap-2">
            Theorems
          </h3>
          <div className="flex flex-col gap-6 mt-2">
            {data.bottlenecks.map((b, index) => (
              <div key={b.id} className="p-4 bg-background/50 border border-[rgba(245,245,245,0.08)] rounded font-mono">
                <div className="flex items-start justify-between mb-3 gap-4 border-b border-[rgba(245,245,245,0.08)] pb-3">
                  <span className="font-bold text-foreground text-sm leading-snug">Theorem {index + 1}: {b.problem}</span>
                  <div className="shrink-0">{getSeverityBadge(b.severity)}</div>
                </div>
                
                <div className="mb-4">
                  <span className="text-danger font-bold uppercase tracking-wider text-xs">Proof:</span>
                  <p className="text-sm text-muted-foreground mt-1 pl-3 border-l-2 border-danger">
                    {b.impact}
                  </p>
                </div>
                
                <div>
                  <span className="text-success font-bold uppercase tracking-wider text-xs">Corollary (Fix):</span>
                  <div className="flex items-start gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <p className="text-foreground text-sm">{b.fix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewritten Query */}
      {data.rewritten_query && (
        <div className="math-panel p-6">
          <h3 className="text-xl font-display font-bold mb-4 text-foreground flex items-center gap-2">
            <Copy className="w-5 h-5 text-primary" />
            Optimized Formula
          </h3>
          
          <div className="font-mono text-sm mb-4">
            <span className="text-primary font-bold uppercase tracking-wider text-xs">Observe:</span>
            <p className="text-muted-foreground mt-1 pl-3 border-l-2 border-primary mb-4">
              {data.rewrite_explanation}
            </p>
            
            <span className="text-success font-bold uppercase tracking-wider text-xs">Therefore:</span>
            <div className="relative group mt-1">
              <pre className="p-4 bg-[#080b11] text-foreground overflow-x-auto rounded border border-[rgba(245,245,245,0.08)] shadow-inner">
                {data.rewritten_query}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
