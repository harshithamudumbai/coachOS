const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export { API_BASE };

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

export async function analyzeWorkloadFile(file) {
  const formData = new FormData();
  formData.append('slowLog', file);

  const res = await fetch(`${API_BASE}/workload/analyze`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to analyze workload');
  }
  return data;
}
