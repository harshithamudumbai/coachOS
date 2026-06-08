import React from 'react';

export default function ResultsDashboard({ data }) {
  if (!data) return null;

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  };

  const getSeverityBadge = (severity) => {
    if (!severity) return null;
    const s = severity.toLowerCase();
    if (s === 'critical' || s === 'high') return <span className="bg-danger text-[#121212] px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider">{severity}</span>;
    if (s === 'medium') return <span className="bg-warning text-[#121212] px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider">{severity}</span>;
    return <span className="bg-success text-[#121212] px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider">{severity}</span>;
  };

  const renderList = (title, items, colorClass = "text-foreground", borderClass = "border-[#333333]") => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-6">
        <span className={`font-bold uppercase tracking-wider text-xs mb-2 block ${colorClass}`}>{title}:</span>
        <ul className={`pl-4 border-l-2 ${borderClass} space-y-2`}>
          {items.map((item, i) => (
            <li key={i} className="text-foreground leading-relaxed">
              {typeof item === 'string' ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-mono text-sm">
      
      {/* Executive Summary */}
      <div className="math-panel p-8">
        <div className="border-b border-[#333333] pb-4 mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Executive Summary</h2>
            <div className="text-xs text-muted-foreground mt-1">CONFIDENTIAL REPORT</div>
          </div>
          {getSeverityBadge(data.severity)}
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div>
              <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Overview:</span>
              <p className="text-foreground mt-1 leading-relaxed">{data.summary}</p>
            </div>
            
            {data.productionReadiness && (
              <div>
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Production Readiness:</span>
                <p className={`mt-1 font-bold ${data.productionReadiness.toLowerCase().includes('not') || data.productionReadiness.toLowerCase().includes('poor') ? 'text-danger' : 'text-success'}`}>
                  {data.productionReadiness}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-[#121212] border border-[#333333] p-6 shrink-0 flex flex-col justify-center items-center min-w-[160px]">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Efficiency(Q)</div>
            <div className={`text-6xl font-serif font-black ${getHealthColor(data.healthScore)}`}>
              {data.healthScore}
            </div>
          </div>
        </div>
      </div>

      {/* Rule Coverage */}
      {data.ruleCoverage && (
        <div className="math-panel p-8 bg-[#121212]">
          <div className="border-b border-[#333333] pb-4 mb-6">
            <h2 className="text-xl font-serif font-bold text-foreground">Analysis Engine v1</h2>
            <div className="text-xs text-muted-foreground mt-1">
              RULES EXECUTED: {data.ruleCoverage.executed.length} | TRIGGERED: {data.ruleCoverage.triggered.length}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.ruleCoverage.executed.map(rule => {
              const triggered = data.ruleCoverage.triggered.includes(rule);
              return (
                <div key={rule} className={`flex items-center gap-2 text-xs font-mono ${triggered ? 'text-danger' : 'text-success'}`}>
                  <span>{triggered ? '✘' : '✔'}</span>
                  <span>{rule.replace(/_/g, ' ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Root Causes & Risks */}
      {(data.rootCauses?.length > 0 || data.performanceRisks?.length > 0) && (
        <div className="math-panel p-8">
          <div className="border-b border-[#333333] pb-4 mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Diagnosis</h2>
            <div className="text-xs text-muted-foreground mt-1">CAUSES AND RISKS</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {renderList('Root Causes', data.rootCauses, 'text-warning', 'border-warning')}
            </div>
            <div>
              {renderList('Performance Risks', data.performanceRisks, 'text-danger', 'border-danger')}
            </div>
          </div>
        </div>
      )}

      {/* Architect Notes */}
      {data.architectNotes?.length > 0 && (
        <div className="math-panel p-8 border-l-4 border-l-primary">
          <div className="border-b border-[#333333] pb-4 mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Architect's Notes</h2>
          </div>
          <div className="space-y-4">
            {data.architectNotes.map((note, i) => (
              <p key={i} className="text-foreground leading-relaxed">{note}</p>
            ))}
          </div>
        </div>
      )}

      {/* Findings & Recommendations */}
      {data.optimizationRecommendations?.length > 0 && (
        <div className="math-panel p-8">
          <div className="border-b border-[#333333] pb-4 mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Investigation Findings</h2>
            <div className="text-xs text-muted-foreground mt-1">{data.optimizationRecommendations.length} RECOMMENDATIONS IDENTIFIED</div>
          </div>
          
          <div className="flex flex-col gap-8">
            {data.optimizationRecommendations.map((rec, index) => {
              // Try to find the matching confidence score from the deterministic engine
              const triggeredRule = data.ruleCoverage?.triggered.find(r => rec.title.toUpperCase().includes(r.replace(/_/g, ' ')));
              const confidence = triggeredRule ? 100 : 85; // Fallback if name doesn't match perfectly

              return (
              <div key={index} className="relative pl-6 border-l-2 border-[#333333]">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#121212] border-2 border-[#333333] rounded-none"></div>
                
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-foreground text-lg font-serif">Priority {rec.priority}: {rec.title}</h3>
                  <span className="text-xs text-muted-foreground font-mono">Confidence: {confidence}%</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-warning font-bold uppercase tracking-wider text-xs">Reasoning:</span>
                    <p className="text-foreground mt-1">{rec.reason}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Expected Impact:</span>
                    <p className="text-muted-foreground mt-1 pl-3 border-l border-[#333333]">{rec.expectedImpact}</p>
                  </div>
                  
                  <div>
                    <span className="text-success font-bold uppercase tracking-wider text-xs block mb-2">Implementation:</span>
                    <pre className="p-4 bg-[#121212] border border-[#333333] text-foreground overflow-x-auto shadow-none">
                      {rec.implementation}
                    </pre>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* Index & Rewrite Suggestions */}
      {(data.indexRecommendations?.length > 0 || data.queryRewriteSuggestions?.length > 0 || data.benchmarkResults) && (
        <div className="math-panel p-8">
          <div className="border-b border-[#333333] pb-4 mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Optimization Code</h2>
          </div>
          
          <div className="space-y-8">
            {/* Benchmark Results */}
            {data.benchmarkResults && (
              <div className="bg-[#121212] border border-[#333333] p-6">
                <span className="text-primary font-bold uppercase tracking-wider text-xs mb-4 block">Benchmark Proof:</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Original Rows</div>
                    <div className="text-xl font-mono text-danger">{data.benchmarkResults.originalRows}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Rewritten Rows</div>
                    <div className="text-xl font-mono text-success">{data.benchmarkResults.rewrittenRows}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Improvement</div>
                    <div className="text-xl font-mono text-primary">-{data.benchmarkResults.improvementPercent}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Est. Cost Drop</div>
                    <div className="text-xl font-mono text-primary">
                      {data.benchmarkResults.originalCost > 0 ? 
                        `-${Math.round(((data.benchmarkResults.originalCost - data.benchmarkResults.rewrittenCost) / data.benchmarkResults.originalCost) * 100)}%` 
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {data.indexRecommendations?.length > 0 && (
              <div>
                <span className="text-primary font-bold uppercase tracking-wider text-xs mb-2 block">Index Recommendations:</span>
                {data.indexRecommendations.map((idx, i) => (
                  <pre key={i} className="p-4 mb-2 bg-[#121212] border border-[#333333] text-foreground overflow-x-auto shadow-none">
                    {typeof idx === 'string' ? idx : JSON.stringify(idx, null, 2)}
                  </pre>
                ))}
              </div>
            )}
            
            {data.queryRewriteSuggestions?.length > 0 && (
              <div>
                <span className="text-success font-bold uppercase tracking-wider text-xs mb-2 block">Query Rewrites:</span>
                {data.queryRewriteSuggestions.map((qr, i) => (
                  <pre key={i} className="p-4 mb-2 bg-[#121212] border border-[#333333] text-foreground overflow-x-auto shadow-none">
                    {typeof qr === 'string' ? qr : JSON.stringify(qr, null, 2)}
                  </pre>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {data.nextSteps?.length > 0 && (
        <div className="math-panel p-8 bg-[#121212]">
          <h2 className="text-xl font-serif font-bold text-foreground mb-4">Action Plan</h2>
          <ul className="list-decimal pl-5 space-y-2 text-muted-foreground">
            {data.nextSteps.map((step, i) => (
              <li key={i}>{typeof step === 'string' ? step : JSON.stringify(step)}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
