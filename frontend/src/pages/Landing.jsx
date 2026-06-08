import React from 'react';
import { ArrowRight, Database, Code2, ShieldAlert, Zap, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden bg-background">
      
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="w-full pt-20 pb-16 lg:pt-32 lg:pb-24 px-4 relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left: Copy */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Dr.Query Engine v2.0
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-foreground leading-[1.1]">
            Understand <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Slow SQL</span> Queries in Seconds.
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed">
            Paste a MySQL query and instantly discover execution bottlenecks, missing indexes, and optimization opportunities.
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
              className="w-full sm:w-auto px-6 py-2 bg-card border border-border hover:border-slate-600 text-foreground font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Code2 className="w-5 h-5 text-muted-foreground" />
              View Example
            </button>
          </div>
        </motion.div>

        {/* Right: Mock Analyzer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 w-full max-w-2xl"
        >
          <div className="modern-card overflow-hidden bg-[#0a0f18]">
            {/* Header */}
            <div className="h-10 bg-[#111827] border-b border-[#1f2937] flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
              <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
              <div className="ml-auto text-xs text-muted-foreground flex items-center gap-2">
                <Database className="w-3 h-3" /> EXPLAIN Plan
              </div>
            </div>

            {/* Code Editor Mock */}
            <div className="p-4 bg-[#0a0f18] border-b border-[#1f2937] font-mono text-sm">
              <div className="text-blue-400">SELECT <span className="text-gray-300">users.id, orders.total</span></div>
              <div className="text-blue-400">FROM <span className="text-gray-300">users</span></div>
              <div className="text-blue-400">JOIN <span className="text-gray-300">orders ON users.id = orders.user_id</span></div>
              <div className="text-blue-400">WHERE <span className="text-gray-300">orders.created_at &gt; '2025-01-01'</span></div>
            </div>

            {/* Analysis Results Mock */}
            <div className="p-4 bg-[#111827]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground">Analysis Complete</span>
                <span className="badge-danger">Critical</span>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-[#1f2937]/50 border border-[#374151] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="w-4 h-4 text-[#ef4444]" />
                    <span className="text-sm font-semibold text-foreground">Full Table Scan</span>
                  </div>
                  <p className="text-xs text-muted-foreground">The query scans 45,023 rows in `orders` because there is no index on `created_at`.</p>
                </div>
                
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Suggested Fix</span>
                  </div>
                  <code className="text-xs text-gray-300 bg-[#0a0f18] px-2 py-1 rounded block mt-2">
                    CREATE INDEX idx_created_at ON orders(created_at);
                  </code>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Value Props */}
      <section className="w-full py-16 px-4 relative z-10 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          
          <div className="modern-card p-6 bg-card/50">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">Visual Execution Plans</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We translate confusing JSON or tabular EXPLAIN outputs into clear, visual metrics so you can see exactly where the engine is struggling.
            </p>
          </div>

          <div className="modern-card p-6 bg-card/50">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">AI Optimization</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Dr.Query's AI analyzes your schema to guess at missing indexes, rewrite slow queries, and offer actionable fixes.
            </p>
          </div>

          <div className="modern-card p-6 bg-card/50">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">Issue Spotting</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Get immediate warnings about full table scans, filesorts, and inefficient joins before they break your production environment.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
