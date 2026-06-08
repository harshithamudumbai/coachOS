import React, { useState } from 'react';
import QueryInput from '../components/analyzer/QueryInput';
import SchemaInput from '../components/analyzer/SchemaInput';
import ExplainInput from '../components/analyzer/ExplainInput';
import IndexesInput from '../components/analyzer/IndexesInput';
import ResultsDashboard from '../components/results/ResultsDashboard';
import { useAnalyze } from '../hooks/useAnalyze';
import { Loader2, AlertCircle, Database } from 'lucide-react';

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
    <div className="flex-1 container mx-auto px-4 py-8 max-w-[1400px]">
      <div className="grid lg:grid-cols-10 gap-8 items-start">
        
        {/* Input Column (40%) */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-20">
          <div className="math-panel p-6 flex flex-col gap-6">
            
            <div>
              <h2 className="text-2xl font-bold mb-1 text-foreground">Query Analyzer</h2>
              <p className="text-sm text-muted-foreground">Paste your MySQL query below.</p>
            </div>

            <QueryInput value={query} onChange={setQuery} />
            <SchemaInput value={schema} onChange={setSchema} />
            
            <div className="flex flex-col gap-3">
              <IndexesInput value={indexes} onChange={setIndexes} />
              <ExplainInput value={pastedExplain} onChange={setPastedExplain} />
            </div>

            {error && (
              <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-lg flex gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!query.trim() || isLoading}
              className="math-button w-full mt-2"
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

        {/* Results Column (60%) */}
        <div className="lg:col-span-6">
          {!data && !isLoading && (
            <div className="h-full min-h-[500px] modern-card flex flex-col items-center justify-center text-center p-8 text-muted-foreground border-dashed border-2 bg-transparent">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Analyze</h3>
              <p className="text-sm max-w-sm leading-relaxed">
                Enter a <span className="text-primary font-semibold">SELECT</span> query to see execution plan breakdowns, bottleneck detection, and AI optimization suggestions.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[500px] modern-card flex flex-col items-center justify-center text-center p-8 bg-card/50">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
              <h3 className="text-xl font-bold text-foreground animate-pulse mb-3">Running EXPLAIN & AI Analysis</h3>
              <p className="text-sm text-primary font-mono max-w-md mx-auto mb-2 bg-primary/10 p-3 rounded-md border border-primary/20">
                {loadingQuote}
              </p>
              <p className="text-xs text-muted-foreground mt-4 font-mono">This usually takes 3-5 seconds...</p>
            </div>
          )}

          {!isLoading && data && <ResultsDashboard data={data} />}
        </div>
      </div>
    </div>
  );
}
