import React from 'react';
import { useHistory } from '../hooks/useHistory';
import { Loader2, Calendar } from 'lucide-react';

export default function History() {
  const { data: history, isLoading, error } = useHistory();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-destructive">
        Failed to load history.
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Query History</h2>
        <p className="text-muted-foreground">Your most recently analyzed queries.</p>
      </div>

      <div className="flex flex-col gap-4">
        {history?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
            No query history found. Try analyzing a query first!
          </div>
        ) : (
          history?.map((item) => (
            <div key={item.id} className="glass-panel p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/30 transition-colors">
              <div className="flex-1 overflow-hidden">
                <pre className="text-sm font-mono truncate bg-muted/30 p-2 rounded text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.query_text}
                </pre>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-xl font-bold ${
                    item.health_score >= 90 ? 'text-success' :
                    item.health_score >= 70 ? 'text-warning' :
                    'text-destructive'
                  }`}>
                    {item.health_score}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Score</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
