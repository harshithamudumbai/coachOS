import React, { useState } from 'react';
import QueryInput from '../components/analyzer/QueryInput';
import SchemaInput from '../components/analyzer/SchemaInput';
import ExplainInput from '../components/analyzer/ExplainInput';
import IndexesInput from '../components/analyzer/IndexesInput';
import ResultsDashboard from '../components/results/ResultsDashboard';
import { useAnalyze } from '../hooks/useAnalyze';
import { Loader2, AlertCircle } from 'lucide-react';

const OPTIMIZATION_QUOTES = [
  '"Premature optimization is the root of all evil." — Donald Knuth',
  '"Make it work, make it right, make it fast." — Kent Beck',
  '"The best performance improvement is the transition from the nonworking state to the working state." — J. Osterhout',
  '"Hardware is cheap, programmers are expensive." — Unknown',
  '"There are two hard things in CS: cache invalidation, naming things, and off-by-one errors." — Phil Karlton',
  '"Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday\'s code." — Dan Salomon'
];

export default function Analyzer({ initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [schema, setSchema] = useState('');
  const [indexes, setIndexes] = useState('');
  const [pastedExplain, setPastedExplain] = useState('');
  const [loadingQuote, setLoadingQuote] = useState('');
  const { analyze, data, isLoading, error } = useAnalyze();

  React.useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleAnalyze = () => {
    if (!query.trim()) return;
    setLoadingQuote(OPTIMIZATION_QUOTES[Math.floor(Math.random() * OPTIMIZATION_QUOTES.length)]);
    analyze(query, schema, indexes, pastedExplain);
  };

  return (
    <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Input Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="math-panel p-6 flex flex-col gap-6 relative">
            {/* Hand-drawn decorative elements */}
            <div className="absolute -top-3 -right-3 text-blue-500 font-bold font-mono text-xl rotate-12">∑</div>
            <div className="absolute -bottom-2 -left-2 text-red-500 font-bold font-mono text-2xl -rotate-12">∫</div>
            
            <div>
              <h2 className="text-3xl font-bold mb-1 handwritten text-slate-800">Query Analyzer</h2>
              <p className="text-sm text-slate-600 font-mono">Paste your MySQL query below.</p>
            </div>

            <QueryInput value={query} onChange={setQuery} />
            <SchemaInput value={schema} onChange={setSchema} />
            
            <div className="flex flex-col gap-3">
              <IndexesInput value={indexes} onChange={setIndexes} />
              <ExplainInput value={pastedExplain} onChange={setPastedExplain} />
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!query.trim() || isLoading}
              className="math-button w-full flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Query'
              )}
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          {!data && !isLoading && (
            <div className="h-full min-h-[400px] math-panel flex flex-col items-center justify-center text-center p-8 text-slate-500 border-dashed relative">
              <div className="absolute top-4 right-8 text-slate-300 font-mono text-6xl rotate-12 opacity-50">π</div>
              <div className="absolute bottom-10 left-10 text-slate-300 font-mono text-5xl -rotate-12 opacity-50">∆</div>
              
              <div className="w-16 h-16 rounded-full border-2 border-slate-400 border-dashed flex items-center justify-center mb-4">
                <span className="font-mono text-2xl text-slate-400">?</span>
              </div>
              <h3 className="text-2xl font-bold handwritten text-slate-700 mb-2">Ready to Analyze</h3>
              <p className="text-sm max-w-sm font-mono leading-relaxed">
                Enter a <span className="text-blue-500 font-bold">SELECT</span> query to see execution plan breakdowns, bottleneck detection, and AI optimization suggestions.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[400px] math-panel flex flex-col items-center justify-center text-center p-8">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <h3 className="text-2xl handwritten font-bold text-slate-800 animate-pulse mb-2">Running EXPLAIN & AI Analysis</h3>
              <p className="text-sm text-slate-700 font-mono max-w-md mx-auto mt-4 mb-2 bg-yellow-100 p-2 border border-yellow-300 rounded transform -rotate-1">
                {loadingQuote}
              </p>
              <p className="text-xs text-slate-500 mt-4 font-mono">This usually takes 3-5 seconds...</p>
            </div>
          )}

          {!isLoading && data && <ResultsDashboard data={data} />}
        </div>
      </div>
    </div>
  );
}
