import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import WorkloadDashboard from '../components/workload/WorkloadDashboard';

export default function Workload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.log', '.txt']
    },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('slowLog', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/workload/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze workload');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 font-mono">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">Workload Analysis</h1>
        <p className="text-muted-foreground mt-2">Upload a MySQL Slow Query Log to identify and resolve systemic performance bottlenecks.</p>
      </div>

      {!results && (
        <div className="math-panel p-8 mb-8">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors duration-200 ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-[#333333] hover:border-muted-foreground bg-[#121212]'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-primary font-bold">Drop the log file here...</p>
            ) : file ? (
              <div>
                <p className="text-foreground font-bold">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-foreground">Drag & drop a mysql-slow.log file here, or click to select</p>
                <p className="text-xs text-muted-foreground mt-2">Only .log or .txt files accepted</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="btn-primary"
            >
              {loading ? 'ANALYZING WORKLOAD...' : 'RUN FORENSICS'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 border border-danger text-danger bg-danger/10 text-sm">
              <span className="font-bold">Error: </span>{error}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="math-panel p-12 text-center text-muted-foreground animate-pulse">
          <div className="text-4xl mb-4 font-serif">∫</div>
          <p>Processing log file and extracting fingerprints...</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-8">
          <div className="flex justify-end">
            <button onClick={() => { setResults(null); setFile(null); }} className="text-xs text-muted-foreground hover:text-foreground underline">
              Upload New Log
            </button>
          </div>
          <WorkloadDashboard data={results} />
        </div>
      )}
    </div>
  );
}
