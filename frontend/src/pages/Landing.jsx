import React from 'react';
import { ArrowRight, Zap, ShieldAlert, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Background gradient blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10 max-w-4xl flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Now analyzing MySQL queries instantly
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Understand Slow SQL Queries in Seconds
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
            AI-powered MySQL query analysis, execution plan breakdowns, bottleneck detection, and optimization suggestions.
          </p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('analyzer')}
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2 group"
            >
              Analyze Query
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('analyzer', 'SELECT users.id, users.email, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.total > 1000 ORDER BY orders.created_at DESC;')}
              className="px-8 py-4 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg border border-border transition-colors"
            >
              Try Sample Query
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="w-full py-20 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Execution Plan Breakdown</h3>
              <p className="text-muted-foreground text-sm">
                We safely run EXPLAIN on your queries and translate the complex output into visual, easy-to-understand metrics.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Optimization</h3>
              <p className="text-muted-foreground text-sm">
                Advanced AI analyzes your schema and plan to detect missing indexes, rewrite slow queries, and simulate scale.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Production Risk Assessment</h3>
              <p className="text-muted-foreground text-sm">
                Get immediate warnings about potential CPU spikes, memory exhaustion, table locks, or replication lag before you deploy.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
