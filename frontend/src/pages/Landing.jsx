import React from 'react';
import { ArrowRight, Database, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden">
      
      {/* Hero Section */}
      <section className="w-full pt-20 pb-16 px-4 relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border-2 border-slate-700 bg-yellow-100 text-slate-800 text-sm font-bold font-mono shadow-[2px_2px_0px_0px_rgba(51,65,85,1)] transform -rotate-1">
            <span className="flex h-2.5 w-2.5 rounded-full border border-slate-700 bg-green-400 animate-pulse"></span>
            Dr.Query Engine Online
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 handwritten text-slate-800 leading-tight px-4">
            Debug <span className="underline decoration-wavy decoration-blue-500">Slow SQL</span> Instantly.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl font-mono leading-relaxed bg-white/70 p-4 border-2 border-slate-300 rounded shadow-[inset_1px_1px_0px_0px_rgba(0,0,0,0.05)]">
            <span className="highlighter">No more guessing.</span> Paste your query and let our analyzer break down your EXPLAIN plan to find missing indexes and structural bottlenecks.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-2 w-full">
            <button 
              onClick={() => onNavigate('analyzer')}
              className="math-button flex items-center justify-center gap-2 group w-full sm:w-auto"
            >
              Analyze a Query
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('analyzer', 'SELECT users.id, users.email, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.total > 1000 ORDER BY orders.created_at DESC;')}
              className="px-6 py-2 bg-white text-slate-800 border-2 border-slate-800 font-bold font-mono shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(30,41,59,1)] transition-all transform rotate-1 w-full sm:w-auto"
              style={{ borderRadius: '15px 255px 15px 225px/255px 15px 225px 15px' }}
            >
              Try Example
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-16 px-4 relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl handwritten font-bold text-slate-800 border-b-2 border-slate-300 pb-2 inline-block">How It Works</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="math-panel p-6 flex flex-col items-start text-left bg-white transform -rotate-1 hover:rotate-0">
            <div className="w-12 h-12 bg-blue-100 border-2 border-blue-800 flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]" style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}>
              <Database className="w-6 h-6 text-blue-800" />
            </div>
            <h3 className="text-2xl handwritten font-bold mb-2 text-slate-800">1. Execution Parsing</h3>
            <p className="text-slate-600 font-mono text-sm leading-relaxed">
              We run <span className="font-bold underline decoration-blue-300">EXPLAIN</span> on your queries and visualize exactly how the database engine executes them.
            </p>
          </div>

          <div className="math-panel p-6 flex flex-col items-start text-left bg-white transform rotate-1 hover:rotate-0">
            <div className="w-12 h-12 bg-purple-100 border-2 border-purple-800 flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]" style={{ borderRadius: '15px 255px 15px 225px/255px 15px 225px 15px' }}>
              <Zap className="w-6 h-6 text-purple-800" />
            </div>
            <h3 className="text-2xl handwritten font-bold mb-2 text-slate-800">2. Smart Suggestions</h3>
            <p className="text-slate-600 font-mono text-sm leading-relaxed">
              The AI reviews your schema and plan to guess at <span className="highlighter">missing indexes</span> and offer query rewrites.
            </p>
          </div>

          <div className="math-panel p-6 flex flex-col items-start text-left bg-white transform -rotate-1 hover:rotate-0">
            <div className="w-12 h-12 bg-red-100 border-2 border-red-800 flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]" style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}>
              <ShieldCheck className="w-6 h-6 text-red-800" />
            </div>
            <h3 className="text-2xl handwritten font-bold mb-2 text-slate-800">3. Issue Spotting</h3>
            <p className="text-slate-600 font-mono text-sm leading-relaxed">
              Get immediate warnings about <span className="font-bold text-red-600">full table scans</span> and inefficient joins before they hit production.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
