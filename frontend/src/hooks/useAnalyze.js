import { useState } from 'react';
import { analyzeQuery } from '../lib/api';

export function useAnalyze() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async (query, schema, indexes, pastedExplain) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    
    try {
      const result = await analyzeQuery({ query, schema, indexes, pastedExplain });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { analyze, data, isLoading, error };
}
