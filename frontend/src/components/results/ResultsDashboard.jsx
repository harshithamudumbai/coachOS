import React from 'react';
import { Activity, Zap, Layers, Server, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';

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
      <div className="modern-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-primary">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-display font-bold text-foreground">Analysis Complete</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            {data.summary}
          </p>
        </div>
        <div className="text-center md:text-right shrink-0 bg-background/50 p-4 rounded-xl border border-border min-w-[140px]">
          <div className={`text-5xl font-display font-black mb-1 ${getHealthColor(data.health_score)}`}>
            {data.health_score}
          </div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">
            Health Score
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="modern-card p-4 bg-background/30 flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">Est. Speedup</span>
          </div>
          <div className="text-2xl font-display font-bold text-success">{data.estimated_improvement}</div>
        </div>
        <div className="modern-card p-4 bg-background/30 flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">Complexity</span>
          </div>
          <div className="text-2xl font-display font-bold text-foreground">{data.execution_complexity}</div>
        </div>
        <div className="modern-card p-4 bg-background/30 flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Server className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">Scans</span>
          </div>
          <div className="text-2xl font-display font-bold text-foreground">{data.tables_scanned}</div>
        </div>
        <div className="modern-card p-4 bg-background/30 flex flex-col border-b-2 border-b-danger">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">Missing Indexes</span>
          </div>
          <div className="text-2xl font-display font-bold text-danger">{data.missing_indexes?.length || 0}</div>
        </div>
      </div>

      {/* Bottlenecks */}
      {data.bottlenecks?.length > 0 && (
        <div className="modern-card p-6 border-t-2 border-t-warning">
          <h3 className="text-xl font-display font-bold mb-4 text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Bottlenecks Found
          </h3>
          <div className="flex flex-col gap-4 mt-2">
            {data.bottlenecks.map(b => (
              <div key={b.id} className="p-4 bg-background/50 border border-border rounded-xl">
                <div className="flex items-start justify-between mb-3 gap-4">
                  <span className="font-semibold text-foreground text-sm leading-snug">{b.problem}</span>
                  <div className="shrink-0 mt-0.5">{getSeverityBadge(b.severity)}</div>
                </div>
                <div className="pl-4 border-l-2 border-muted mb-3 py-1">
                  <p className="text-xs text-muted-foreground">Impact: {b.impact}</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <p className="text-primary font-medium">Fix: {b.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewritten Query */}
      {data.rewritten_query && (
        <div className="modern-card p-6">
          <h3 className="text-xl font-display font-bold mb-4 text-foreground flex items-center gap-2">
            <Copy className="w-5 h-5 text-primary" />
            Optimized Query
          </h3>
          <div className="relative group">
            <pre className="p-4 bg-[#0B0F17] text-[#A6ACCD] font-mono text-sm overflow-x-auto rounded-xl border border-border mb-4 shadow-inner">
              {data.rewritten_query}
            </pre>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3">
            <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-primary/90 font-medium leading-relaxed">{data.rewrite_explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
