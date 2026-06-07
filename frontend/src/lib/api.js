const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function analyzeQuery({ query, schema, indexes, pastedExplain }) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, schema, indexes, pastedExplain })
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.errors?.[0]?.msg || 'Failed to analyze query');
  }
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}
