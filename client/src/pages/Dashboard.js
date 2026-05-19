import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { coach, authFetch } = useAuth();
  const [stats, setStats] = useState({ totalClients: 0, activeClients: 0, recentClients: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await authFetch('/clients?limit=5');
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalClients: data.pagination.total,
          activeClients: data.clients.filter(c => c.status === 'active').length,
          recentClients: data.clients
        });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px 0' }}><p className="text-muted">Loading...</p></div>;
  }

  return (
    <div>
      <div className="topbar">
        <div className="topbar-left">
          <h1>{getGreeting()}, {coach?.full_name?.split(' ')[0]} 👋</h1>
          <p>Here's what's happening with your practice today.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div className="stat-info"><h3>{stats.totalClients}</h3><p>Total Clients</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info"><h3>{stats.activeClients}</h3><p>Active Clients</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div className="stat-info"><h3>0</h3><p>Sessions Today</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">💰</div>
          <div className="stat-info"><h3>₹0</h3><p>Revenue (MTD)</p></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card-header"><h3 className="card-title">Quick Actions</h3></div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Link to="/clients" className="btn btn-primary btn-sm">➕ Add New Client</Link>
          <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.5 }}>🥗 Create Meal Plan</button>
          <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.5 }}>📅 Schedule Session</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Clients</h3>
          <Link to="/clients" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        {stats.recentClients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No clients yet</h3>
            <p>Add your first client to get started.</p>
            <Link to="/clients" className="btn btn-primary">➕ Add First Client</Link>
          </div>
        ) : (
          <table className="client-table">
            <thead><tr><th>Client</th><th>Goals</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {stats.recentClients.map(client => (
                <tr key={client.id}>
                  <td>
                    <div className="client-name-cell">
                      <div className="client-avatar">{getInitials(client.full_name)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{client.full_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.goals || '—'}</td>
                  <td><span className={`status-badge ${client.status}`}>{client.status}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(client.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
