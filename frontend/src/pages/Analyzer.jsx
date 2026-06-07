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
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Query Analyzer</h2>
              <p className="text-sm text-muted-foreground">Paste your MySQL query below.</p>
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
              className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-lg shadow transition-all flex items-center justify-center gap-2"
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
            <div className="h-full min-h-[400px] glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-8 text-muted-foreground border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Ready to Analyze</h3>
              <p className="text-sm max-w-sm">
                Enter a SELECT query to see execution plan breakdowns, bottleneck detection, and AI optimization suggestions.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[400px] glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-8">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <h3 className="font-semibold text-foreground animate-pulse mb-2">Running EXPLAIN & AI Analysis</h3>
              <p className="text-sm text-primary/80 font-mono italic max-w-md mx-auto mt-4 mb-2">
                {loadingQuote}
              </p>
              <p className="text-xs text-muted-foreground mt-4">This usually takes 3-5 seconds...</p>
            </div>
          )}

          {!isLoading && data && <ResultsDashboard data={data} />}
        </div>
      </div>
    </div>
  );
}
