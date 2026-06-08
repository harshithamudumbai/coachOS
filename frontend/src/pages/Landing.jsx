import React from 'react';
import { ArrowRight, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden bg-background">
      
      {/* Hero Section */}
      <section className="w-full pt-16 pb-16 lg:pt-32 lg:pb-24 px-4 relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left: Copy */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col items-start"
        >
          <div className="mb-4 text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground">
            INTERNAL INVESTIGATION TOOL
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-bold mb-6 text-foreground leading-none">
            Dr.Query
          </h1>
          
          <p className="text-xl text-[#A0A0A0] mb-10 max-w-xl leading-relaxed font-serif">
            A database professor who keeps solving query mysteries in a notebook. Turn slow database execution into elegant, mathematical case files.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={() => onNavigate('analyzer')}
              className="w-full sm:w-auto math-button"
            >
              Open Investigation
            </button>
          </div>
        </motion.div>

        {/* Right: The Case File */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 w-full max-w-2xl"
        >
          <div className="modern-card p-8 bg-[#1A1A1A] border-[#333333] shadow-none">
            {/* Case Header */}
            <div className="flex justify-between items-start border-b border-[#333333] pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Case #847</h2>
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Status: Resolved</div>
              </div>
              <div className="border border-success text-success px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider">
                CONFIDENTIAL
              </div>
            </div>

            {/* Case Details */}
            <div className="space-y-6 font-mono text-sm">
              <div className="grid grid-cols-4 gap-4 border-b border-[#333333] pb-6">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs col-span-1">Subject:</span>
                <p className="text-foreground col-span-3">Slow SQL Query Investigation</p>
              </div>
              
              <div className="grid grid-cols-4 gap-4 border-b border-[#333333] pb-6">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs col-span-1">Evidence:</span>
                <div className="col-span-3 bg-[#121212] border border-[#333333] p-3 text-secondary">
                  SELECT users.id, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.created_at &gt; '2025-01-01'
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 border-b border-[#333333] pb-6">
                <span className="text-danger font-bold uppercase tracking-wider text-xs col-span-1">Observe:</span>
                <p className="text-foreground col-span-3 border-l-2 border-danger pl-3">
                  Full table scan detected. The query scans 45,023 rows sequentially.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <span className="text-success font-bold uppercase tracking-wider text-xs col-span-1">Conclusion:</span>
                <div className="col-span-3">
                  <p className="text-foreground mb-2">Missing index on `created_at`.</p>
                  <code className="text-success bg-[#121212] border border-[#333333] px-3 py-2 block">
                    CREATE INDEX idx_created_at ON orders(created_at);
                  </code>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="mt-8 pt-6 border-t border-[#333333] flex justify-end">
              <button 
                onClick={() => onNavigate('analyzer', 'SELECT users.id, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.created_at > \'2025-01-01\'')}
                className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                Investigate Query <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Statistics Section */}
      <section className="w-full bg-[#121212] border-t border-b border-[#333333] py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-serif font-bold text-foreground">Dr.Query Intelligence</h2>
            <div className="text-xs text-muted-foreground mt-2 font-mono uppercase tracking-widest">PERFORMANCE METRICS</div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center font-mono text-sm">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-black text-primary mb-2">18</div>
              <div className="text-muted-foreground uppercase tracking-widest text-xs">Optimization Rules</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-black text-success mb-2">95%+</div>
              <div className="text-muted-foreground uppercase tracking-widest text-xs">Test Coverage</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-black text-foreground mb-2">100%</div>
              <div className="text-muted-foreground uppercase tracking-widest text-xs">Benchmark Validation</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-black text-warning mb-2">Logs</div>
              <div className="text-muted-foreground uppercase tracking-widest text-xs">Fingerprint Forensics</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-black text-danger mb-2">Top 5</div>
              <div className="text-muted-foreground uppercase tracking-widest text-xs">Offender Ranking</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
