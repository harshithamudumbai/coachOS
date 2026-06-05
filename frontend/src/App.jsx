import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Analyzer from './pages/Analyzer';
import History from './pages/History';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [sampleQuery, setSampleQuery] = useState('');

  const handleNavigate = (page, query = '') => {
    setSampleQuery(query);
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main className="flex-1 flex flex-col">
        {currentPage === 'home' && <Landing onNavigate={handleNavigate} />}
        {currentPage === 'analyzer' && <Analyzer initialQuery={sampleQuery} />}
        {currentPage === 'history' && <History />}
      </main>
    </div>
  );
}

export default App;
