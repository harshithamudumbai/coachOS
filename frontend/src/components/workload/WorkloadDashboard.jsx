import React from 'react';

export default function WorkloadDashboard({ data }) {
  if (!data) return null;

  const { globalMetrics, topQueries, aiAnalysis } = data;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-mono text-sm">
      
      {/* Executive Summary */}
      <div className="math-panel p-8">
        <div className="border-b border-[#333333] pb-4 mb-6">
          <h2 className="text-2xl font-serif font-bold text-foreground">Workload Intelligence</h2>
          <div className="text-xs text-muted-foreground mt-1">DATABASE HEALTH ROADMAP</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-[#121212] border border-[#333333] p-6 text-center">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Executions</div>
            <div className="text-4xl font-serif font-black text-foreground">
              {globalMetrics.totalExecutions.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#121212] border border-[#333333] p-6 text-center">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Unique Patterns</div>
            <div className="text-4xl font-serif font-black text-primary">
              {globalMetrics.uniquePatterns.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#121212] border border-[#333333] p-6 text-center">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Time Spent</div>
            <div className="text-4xl font-serif font-black text-warning">
              {globalMetrics.totalTimeSecs}s
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Executive Summary:</span>
            <p className="text-foreground mt-1 leading-relaxed text-lg">{aiAnalysis.executiveSummary}</p>
          </div>
          
          <div>
            <span className="text-danger font-bold uppercase tracking-wider text-xs block mb-2">Primary Bottlenecks:</span>
            <ul className="pl-4 border-l-2 border-danger space-y-2">
              {aiAnalysis.primaryBottlenecks.map((b, i) => (
                <li key={i} className="text-foreground">{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Optimization Roadmap */}
      {aiAnalysis.workloadRecommendations?.length > 0 && (
        <div className="math-panel p-8">
          <div className="border-b border-[#333333] pb-4 mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Optimization Roadmap</h2>
            <div className="text-xs text-muted-foreground mt-1">STRATEGIC ACTION PLAN</div>
          </div>
          
          <div className="flex flex-col gap-6">
            {aiAnalysis.workloadRecommendations.map((rec, index) => (
              <div key={index} className="relative pl-6 border-l-2 border-[#333333]">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#121212] border-2 border-[#333333] rounded-none"></div>
                
                <h3 className="font-bold text-foreground text-lg font-serif mb-2">Phase {rec.priority}: {rec.title}</h3>
                
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-warning text-xs uppercase tracking-wider">Rationale</span>
                    <p className="text-foreground mt-1">{rec.rationale}</p>
                  </div>
                  <div>
                    <span className="text-success text-xs uppercase tracking-wider">Estimated Impact</span>
                    <p className="text-muted-foreground mt-1">{rec.estimatedImpact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Worst Offenders */}
      <div className="math-panel p-8">
        <div className="border-b border-[#333333] pb-4 mb-6">
          <h2 className="text-2xl font-serif font-bold text-foreground">Top Worst Offenders</h2>
          <div className="text-xs text-muted-foreground mt-1">RANKED BY TOTAL LATENCY</div>
        </div>

        <div className="space-y-12">
          {topQueries.map((q, idx) => (
            <div key={idx} className="bg-[#121212] border border-[#333333]">
              <div className="p-4 border-b border-[#333333] flex justify-between items-center bg-[#1a1a1a]">
                <div className="text-lg font-serif font-bold text-danger">Rank #{idx + 1}</div>
                <div className="flex gap-6 text-xs text-muted-foreground">
                  <div>Executions: <span className="text-foreground">{q.metrics.executionCount}</span></div>
                  <div>Total Time: <span className="text-warning">{q.metrics.totalTimeSecs}s</span></div>
                  <div>Max Time: <span className="text-danger">{q.metrics.maxTimeSecs}s</span></div>
                </div>
              </div>
              
              <div className="p-6">
                <pre className="text-xs text-muted-foreground bg-[#0a0a0a] p-4 border border-[#333333] overflow-x-auto mb-6">
                  {q.exampleQuery}
                </pre>

                {q.engineFindings.length > 0 ? (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">Deterministic Findings:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.engineFindings.map((finding, fi) => (
                        <div key={fi} className="border border-[#333333] p-3 border-l-2 border-l-warning">
                          <div className="font-bold text-foreground text-sm">{finding.rule.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-muted-foreground mt-1">{finding.impact}</div>
                          <div className="text-xs text-primary mt-2">Fix: {finding.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-success text-xs uppercase tracking-wider">✔ No anti-patterns detected by deterministic engine.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
