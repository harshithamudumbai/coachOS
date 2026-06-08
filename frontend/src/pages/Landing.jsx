import React from 'react';
import { ArrowRight, Zap, ShieldAlert, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center bg-white font-sans">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center justify-center text-center px-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            AI-Powered MySQL Query Analysis
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            Find the bottleneck in your <span className="text-blue-600">slow queries.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
            We analyze your EXPLAIN output and schema to guess what might be causing bottlenecks, giving you actionable optimization suggestions instantly.
          </p>
          
          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={() => onNavigate('analyzer')}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors text-lg flex items-center gap-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Analyze a Query
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onNavigate('analyzer', 'SELECT users.id, users.email, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.total > 1000 ORDER BY orders.created_at DESC;')}
              className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium rounded-lg shadow-sm transition-colors text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Try Sample Query
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="w-full py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>How it works</h2>
            <p className="text-slate-600 max-w-xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>A simple, effective tool to help you debug database performance.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start text-left hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>Execution Plan</h3>
              <p className="text-slate-600 leading-relaxed text-sm font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                We safely run EXPLAIN on your queries (or use the plan you paste) and translate the complex output into visual metrics.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start text-left hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>AI Suggestions</h3>
              <p className="text-slate-600 leading-relaxed text-sm font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                The AI reviews your schema and execution plan to guess at missing indexes, rewrite slow queries, and offer advice.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start text-left hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>Issue Spotting</h3>
              <p className="text-slate-600 leading-relaxed text-sm font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                Get warnings about full table scans, missing keys, and inefficient joins before they break production.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
