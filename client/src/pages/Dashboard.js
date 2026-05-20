// ============================================
// pages/Dashboard.js — Enhanced Coach Dashboard
// ============================================
// 📚 LEARNING NOTES:
//
// What changed from Phase 1?
// → Phase 1: fetched /clients and counted manually
// → Phase 2: fetches /dashboard/stats — SQL does the counting (faster!)
//
// Why is server-side counting better?
// → Phase 1: GET /clients returns ALL clients → count in JS
//   - Slow if you have 1,000+ clients (downloads all data)
// → Phase 2: GET /dashboard/stats → SQL COUNT(*) on server
//   - Fast! SQL is optimized for counting
//   - Returns just the numbers, not all the data
//
// What is Promise.all?
// → Runs multiple async calls in PARALLEL (at the same time)
// → Without it: fetch stats → wait → fetch activity → wait (slow)
// → With it: fetch stats + activity at the same time (fast!)
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { coach, authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 📚 Promise.all — fetch both endpoints at the same time!
      const [statsRes, activityRes] = await Promise.all([
        authFetch('/dashboard/stats'),
        authFetch('/dashboard/activity?limit=10')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.activities || []);
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

  // 📚 Activity feed helpers
  const activityIcons = {
    client_added: '👤',
    progress_logged: '📊',
    note_added: '📝'
  };

  const activityColors = {
    client_added: 'var(--primary)',
    progress_logged: 'var(--success)',
    note_added: 'var(--info)'
  };

  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const clientStats = stats?.clients || { total: 0, active: 0, inactive: 0, paused: 0 };
  const trends = stats?.trends || { clientsThisWeek: 0, clientsThisMonth: 0 };

  return (
    <div>
      {/* Welcome Header */}
      <div className="topbar">
        <div className="topbar-left">
          <h1>{getGreeting()}, {coach?.full_name?.split(' ')[0]} 👋</h1>
          <p>
            {coach?.business_name
              ? `Here's what's happening at ${coach.business_name} today.`
              : "Here's what's happening with your practice today."}
          </p>
        </div>
        <div className="topbar-right">
          <Link to="/clients" className="btn btn-primary btn-sm">➕ Add Client</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div className="stat-info">
            <h3>{clientStats.total}</h3>
            <p>Total Clients</p>
            {trends.clientsThisMonth > 0 && (
              <span className="stat-change positive">+{trends.clientsThisMonth} this month</span>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{clientStats.active}</h3>
            <p>Active Clients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div className="stat-info">
            <h3>{trends.clientsThisWeek}</h3>
            <p>New This Week</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⏸️</div>
          <div className="stat-info">
            <h3>{clientStats.paused + clientStats.inactive}</h3>
            <p>Inactive / Paused</p>
          </div>
        </div>
      </div>

      {/* Client Distribution Bar */}
      {clientStats.total > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="card-header">
            <h3 className="card-title">Client Distribution</h3>
          </div>
          <div className="distribution-bar">
            {clientStats.active > 0 && (
              <div
                className="distribution-segment active"
                style={{ width: `${(clientStats.active / clientStats.total) * 100}%` }}
                title={`Active: ${clientStats.active}`}
              >
                {clientStats.active > 0 && clientStats.active}
              </div>
            )}
            {clientStats.paused > 0 && (
              <div
                className="distribution-segment paused"
                style={{ width: `${(clientStats.paused / clientStats.total) * 100}%` }}
                title={`Paused: ${clientStats.paused}`}
              >
                {clientStats.paused}
              </div>
            )}
            {clientStats.inactive > 0 && (
              <div
                className="distribution-segment inactive"
                style={{ width: `${(clientStats.inactive / clientStats.total) * 100}%` }}
                title={`Inactive: ${clientStats.inactive}`}
              >
                {clientStats.inactive}
              </div>
            )}
          </div>
          <div className="distribution-legend">
            <span className="legend-item"><span className="legend-dot active"></span> Active</span>
            <span className="legend-item"><span className="legend-dot paused"></span> Paused</span>
            <span className="legend-item"><span className="legend-dot inactive"></span> Inactive</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card-header"><h3 className="card-title">Quick Actions</h3></div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Link to="/clients" className="btn btn-primary btn-sm">➕ Add New Client</Link>
          <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.5 }}>🥗 Create Meal Plan</button>
          <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.5 }}>📅 Schedule Session</button>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        {activities.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
            <div className="empty-icon">📋</div>
            <h3>No activity yet</h3>
            <p>Activity will appear here as you add clients, log progress, and write notes.</p>
          </div>
        ) : (
          <div className="activity-feed">
            {activities.map((activity, idx) => (
              <div key={`${activity.type}-${activity.id}-${idx}`} className="activity-item">
                <div className="activity-icon" style={{ color: activityColors[activity.type] }}>
                  {activityIcons[activity.type] || '📌'}
                </div>
                <div className="activity-body">
                  <p className="activity-description">
                    {activity.client_id ? (
                      <Link to={`/clients/${activity.client_id}`} className="activity-link">
                        {activity.description}
                      </Link>
                    ) : (
                      activity.description
                    )}
                  </p>
                  <span className="activity-time">{timeAgo(activity.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
