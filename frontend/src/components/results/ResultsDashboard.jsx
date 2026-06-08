import React from 'react';

export default function ResultsDashboard({ data }) {
  if (!data) return null;

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  };

  const getSeverityBadge = (severity) => {
    const s = severity.toLowerCase();
    if (s === 'critical' || s === 'high') return <span className="bg-danger text-[#121212] px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider">{severity}</span>;
    if (s === 'medium') return <span className="bg-warning text-[#121212] px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider">{severity}</span>;
    return <span className="bg-success text-[#121212] px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider">{severity}</span>;
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-mono text-sm">
      
      {/* Header Summary */}
      <div className="math-panel p-8">
        <div className="border-b border-[#333333] pb-4 mb-6">
          <h2 className="text-2xl font-serif font-bold text-foreground">Executive Summary</h2>
          <div className="text-xs text-muted-foreground mt-1">CONFIDENTIAL REPORT</div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div>
              <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Overview:</span>
              <p className="text-foreground mt-1 leading-relaxed">{data.summary}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#333333]">
              <div>
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs block mb-1">Est. Speedup (Δt)</span>
                <span className="text-xl font-serif font-bold text-success">{data.estimated_improvement}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs block mb-1">Complexity O(n)</span>
                <span className="text-xl font-serif font-bold text-foreground">{data.execution_complexity}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs block mb-1">Rows Scanned</span>
                <span className="text-xl font-serif font-bold text-foreground">{data.tables_scanned}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs block mb-1">Missing Indexes</span>
                <span className="text-xl font-serif font-bold text-danger">{data.missing_indexes?.length || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#121212] border border-[#333333] p-6 shrink-0 flex flex-col justify-center items-center min-w-[160px]">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Efficiency(Q)</div>
            <div className={`text-6xl font-serif font-black ${getHealthColor(data.health_score)}`}>
              {data.health_score}
            </div>
          </div>
        </div>
      </div>

      {/* Findings */}
      {data.bottlenecks?.length > 0 && (
        <div className="math-panel p-8">
          <div className="border-b border-[#333333] pb-4 mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Investigation Findings</h2>
            <div className="text-xs text-muted-foreground mt-1">{data.bottlenecks.length} ISSUES IDENTIFIED</div>
          </div>
          
          <div className="flex flex-col gap-8">
            {data.bottlenecks.map((b, index) => (
              <div key={b.id} className="relative pl-6 border-l-2 border-[#333333]">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#121212] border-2 border-[#333333] rounded-none"></div>
                
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-foreground text-lg font-serif">Finding #{index + 1}</h3>
                  {getSeverityBadge(b.severity)}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-danger font-bold uppercase tracking-wider text-xs">Observation:</span>
                    <p className="text-foreground mt-1">{b.problem}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Impact Evidence:</span>
                    <p className="text-muted-foreground mt-1 pl-3 border-l border-[#333333]">{b.impact}</p>
                  </div>
                  
                  <div>
                    <span className="text-success font-bold uppercase tracking-wider text-xs">Recommendation:</span>
                    <p className="text-foreground mt-1">{b.fix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewritten Query */}
      {data.rewritten_query && (
        <div className="math-panel p-8">
          <div className="border-b border-[#333333] pb-4 mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Optimization Proposal</h2>
            <div className="text-xs text-muted-foreground mt-1">REVISED SQL STATEMENT</div>
          </div>
          
          <div className="space-y-6">
            <div>
              <span className="text-primary font-bold uppercase tracking-wider text-xs">Strategic Rationale:</span>
              <p className="text-foreground mt-1 pl-3 border-l-2 border-primary">
                {data.rewrite_explanation}
              </p>
            </div>
            
            <div>
              <span className="text-success font-bold uppercase tracking-wider text-xs mb-2 block">Proposed Code:</span>
              <pre className="p-4 bg-[#121212] border border-[#333333] text-foreground overflow-x-auto shadow-none">
                {data.rewritten_query}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
