import React from 'react';
import { ArrowRight, Code2, Sigma, Infinity as InfinityIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden bg-background">
      
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      {/* Floating Math Symbols */}
      <div className="absolute top-20 left-10 text-primary/20 text-6xl font-serif math-symbol-float" style={{ animationDelay: '0s' }}>Σ</div>
      <div className="absolute top-40 right-20 text-secondary/20 text-7xl font-serif math-symbol-float" style={{ animationDelay: '1s' }}>∫</div>
      <div className="absolute bottom-40 left-32 text-success/20 text-5xl font-serif math-symbol-float" style={{ animationDelay: '2s' }}>λ</div>
      <div className="absolute top-64 left-1/4 text-danger/20 text-4xl font-serif math-symbol-float" style={{ animationDelay: '3s' }}>Δ</div>
      <div className="absolute bottom-20 right-1/4 text-primary/20 text-6xl font-serif math-symbol-float" style={{ animationDelay: '1.5s' }}>π</div>
      <div className="absolute top-10 right-1/3 text-muted-foreground/10 text-8xl font-serif math-symbol-float" style={{ animationDelay: '0.5s' }}>∞</div>

      {/* Hero Section */}
      <section className="w-full pt-20 pb-16 lg:pt-32 lg:pb-24 px-4 relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left: Copy */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded border border-primary/30 bg-primary/10 text-primary text-sm font-mono font-bold tracking-widest uppercase">
            Dr.Query: SQL Detective
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-foreground leading-[1.1]">
            Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#F4D03F]">Slow Query</span> Has a Mathematical Reason.
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed font-mono">
            Turn confusing database bottlenecks into elegant mathematical proofs of execution. Paste a query to uncover missing indexes and structural flaws.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={() => onNavigate('analyzer')}
              className="w-full sm:w-auto math-button"
            >
              Analyze Query
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onNavigate('analyzer', 'SELECT users.id, users.email, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.total > 1000 ORDER BY orders.created_at DESC;')}
              className="w-full sm:w-auto px-6 py-2 bg-card border border-border hover:border-primary/50 text-foreground font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 font-display"
            >
              <Code2 className="w-5 h-5 text-muted-foreground" />
              View Example Theorem
            </button>
          </div>
        </motion.div>

        {/* Right: Mock Analyzer / Proof Board */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 w-full max-w-2xl"
        >
          <div className="math-panel overflow-hidden">
            {/* Header */}
            <div className="h-10 border-b border-[rgba(245,245,245,0.08)] flex items-center px-4 gap-2 bg-background/50">
              <div className="ml-auto text-xs font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2 font-mono">
                <Sigma className="w-3 h-3" /> Theorem Proof Board
              </div>
            </div>

            {/* Code Editor Mock */}
            <div className="p-4 border-b border-[rgba(245,245,245,0.08)] font-mono text-sm bg-[#080b11]">
              <div className="text-primary">SELECT <span className="text-foreground">users.id, orders.total</span></div>
              <div className="text-primary">FROM <span className="text-foreground">users</span></div>
              <div className="text-primary">JOIN <span className="text-foreground">orders ON users.id = orders.user_id</span></div>
              <div className="text-primary">WHERE <span className="text-foreground">orders.created_at &gt; '2025-01-01'</span></div>
            </div>

            {/* Analysis Results Mock */}
            <div className="p-4 bg-transparent">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold font-mono text-foreground uppercase tracking-wider">Analysis Complete</span>
                <span className="text-danger font-bold font-mono tracking-wider">Efficiency(Q) = 42</span>
              </div>
              
              <div className="space-y-4 font-mono text-sm">
                <div>
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Given:</span>
                  <p className="text-foreground mt-1">|Rows| = 45,023 in table `orders`</p>
                </div>
                
                <div>
                  <span className="text-danger font-bold uppercase tracking-wider text-xs">Observe:</span>
                  <p className="text-foreground mt-1 border-l-2 border-danger pl-3">Full Table Scan required for `WHERE orders.created_at &gt; '2025-01-01'`.</p>
                </div>

                <div>
                  <span className="text-success font-bold uppercase tracking-wider text-xs">Therefore:</span>
                  <code className="text-success bg-success/10 border border-success/20 px-3 py-2 rounded block mt-1">
                    CREATE INDEX idx_created_at ON orders(created_at);
                  </code>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
