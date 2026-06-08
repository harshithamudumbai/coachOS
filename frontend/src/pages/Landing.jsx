import React from 'react';
import { ArrowRight, Zap, ShieldAlert, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10 max-w-4xl flex flex-col items-center relative"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-slate-800 text-slate-800 text-sm font-bold font-mono shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] transform -rotate-1 mb-8">
            <span className="flex h-3 w-3 rounded-full border-2 border-slate-800 bg-green-400 animate-pulse"></span>
            Now analyzing MySQL queries instantly
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 handwritten text-slate-800 leading-tight">
            Analyze Slow <span className="underline decoration-wavy decoration-blue-500">SQL Queries</span> Instantly
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl font-mono leading-relaxed bg-white/50 p-4 border-2 border-slate-300 rounded shadow-sm transform rotate-1">
            <span className="highlighter">AI-powered query analysis.</span> We review your execution plan and guess what might be causing bottlenecks to give you actionable optimization suggestions.
          </p>
          
          <div className="flex items-center gap-6 mt-4">
            <button 
              onClick={() => onNavigate('analyzer')}
              className="math-button flex items-center gap-2 group text-xl"
            >
              Analyze Query
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('analyzer', 'SELECT users.id, users.email, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.total > 1000 ORDER BY orders.created_at DESC;')}
              className="px-6 py-2 bg-white text-slate-800 border-2 border-slate-800 font-bold font-mono shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(30,41,59,1)] transition-all transform rotate-1"
              style={{ borderRadius: '15px 255px 15px 225px/255px 15px 225px 15px' }}
            >
              Try Sample Query
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="w-full py-20 bg-slate-100 border-t-4 border-slate-800 relative">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="math-panel p-6 flex flex-col items-start text-left transform rotate-1">
              <div className="w-14 h-14 bg-blue-100 border-2 border-blue-800 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]" style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}>
                <Database className="w-8 h-8 text-blue-800" />
              </div>
              <h3 className="text-3xl handwritten font-bold mb-2 text-slate-800">Execution Plan</h3>
              <p className="text-slate-600 font-mono text-sm leading-relaxed">
                We safely run <span className="font-bold underline decoration-blue-300">EXPLAIN</span> on your queries and translate the complex output into visual metrics.
              </p>
            </div>

            <div className="math-panel p-6 flex flex-col items-start text-left transform -rotate-1">
              <div className="w-14 h-14 bg-purple-100 border-2 border-purple-800 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]" style={{ borderRadius: '15px 255px 15px 225px/255px 15px 225px 15px' }}>
                <Zap className="w-8 h-8 text-purple-800" />
              </div>
              <h3 className="text-3xl handwritten font-bold mb-2 text-slate-800">AI Suggestions</h3>
              <p className="text-slate-600 font-mono text-sm leading-relaxed">
                The AI analyzes your schema and plan to guess at missing indexes, <span className="highlighter">rewrite slow queries</span>, and offer advice.
              </p>
            </div>

            <div className="math-panel p-6 flex flex-col items-start text-left transform rotate-1">
              <div className="w-14 h-14 bg-red-100 border-2 border-red-800 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]" style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}>
                <ShieldAlert className="w-8 h-8 text-red-800" />
              </div>
              <h3 className="text-3xl handwritten font-bold mb-2 text-slate-800">Issue Spotting</h3>
              <p className="text-slate-600 font-mono text-sm leading-relaxed">
                Get warnings about <span className="font-bold text-red-600">full table scans</span>, missing keys, and inefficient joins before they break production.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
