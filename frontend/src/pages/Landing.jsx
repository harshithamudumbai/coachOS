import React from 'react';
import { ArrowRight, Database, Code2, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center bg-[#fafafa] font-sans relative overflow-hidden">
      
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>

      {/* Hero Section */}
      <section className="w-full pt-32 pb-20 px-4 relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left Copy */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col items-start text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50/80 border border-blue-200/50 rounded-full text-blue-600 text-sm font-semibold mb-6 shadow-sm backdrop-blur-sm">
            <Database className="w-4 h-4" />
            Database Intelligence
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black mb-6 text-slate-900 tracking-tight leading-[1.1]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Debug <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">slow SQL</span> <br/> in seconds.
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-600 mb-10 leading-relaxed max-w-xl font-medium">
            Paste your query. We analyze the EXPLAIN plan and schema to identify missing indexes, full table scans, and structural bottlenecks instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={() => onNavigate('analyzer')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg flex items-center justify-center gap-2 group"
            >
              Analyze Query
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('analyzer', 'SELECT users.id, users.email, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.total > 1000 ORDER BY orders.created_at DESC;')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 font-semibold rounded-xl shadow-sm transition-all text-lg flex items-center justify-center gap-2"
            >
              <Code2 className="w-5 h-5 text-slate-400" />
              Try Example
            </button>
          </div>
        </motion.div>

        {/* Right Graphic / Code Window */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 w-full max-w-2xl relative"
        >
          {/* Decorative Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
          
          {/* Mac-style Window */}
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="ml-auto text-xs font-mono text-slate-400 flex items-center gap-1">
                <Database className="w-3 h-3" /> Dr.Query
              </div>
            </div>
            
            <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden relative">
              <div className="text-slate-400 mb-2">-- Paste your MySQL query to analyze</div>
              <div className="text-indigo-600 font-semibold">SELECT</div>
              <div className="text-slate-700 pl-4">users.id, users.name, orders.total</div>
              <div className="text-indigo-600 font-semibold">FROM</div>
              <div className="text-slate-700 pl-4">users</div>
              <div className="text-indigo-600 font-semibold">JOIN</div>
              <div className="text-slate-700 pl-4">orders <span className="text-indigo-600">ON</span> users.id = orders.user_id</div>
              <div className="text-indigo-600 font-semibold">WHERE</div>
              <div className="text-slate-700 pl-4">orders.created_at &gt; '2025-01-01'</div>
              
              {/* Overlay scanning effect */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-8 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent pointer-events-none"
              />
            </div>
            
            <div className="bg-blue-50 border-t border-blue-100 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Bottleneck Detected
              </div>
              <div className="text-sm font-medium text-slate-700">Missing index on <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-red-600">orders.created_at</code> causing full table scan.</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trust / Value Section */}
      <section className="w-full py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-12 text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Zap className="w-5 h-5" /></div>
            <span className="text-lg text-slate-700">AI Heuristics</span>
          </div>
          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><Database className="w-5 h-5" /></div>
            <span className="text-lg text-slate-700">EXPLAIN Parsing</span>
          </div>
          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
            <span className="text-lg text-slate-700">Risk Mitigation</span>
          </div>
        </div>
      </section>
    </div>
  );
}
