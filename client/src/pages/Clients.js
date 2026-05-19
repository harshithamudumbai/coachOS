import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Clients() {
  const { authFetch } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', gender: '', goals: '', medical_notes: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async (searchTerm = '') => {
    try {
      const url = searchTerm ? `/clients?search=${searchTerm}` : '/clients';
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Fetch clients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    // Debounce: wait 300ms after typing stops
    clearTimeout(window._searchTimeout);
    window._searchTimeout = setTimeout(() => fetchClients(value), 300);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const res = await authFetch('/clients', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowModal(false);
      setForm({ full_name: '', email: '', phone: '', gender: '', goals: '', medical_notes: '' });
      fetchClients();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name}? This cannot be undone.`)) return;
    try {
      await authFetch(`/clients/${id}`, { method: 'DELETE' });
      fetchClients();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div>
      {/* Header */}
      <div className="topbar">
        <div className="topbar-left">
          <h1>Clients</h1>
          <p>Manage your coaching clients</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Add Client</button>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="client-list-header">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input placeholder="Search by name or email..." value={search} onChange={handleSearch} />
          </div>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>{clients.length} client{clients.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <p className="text-muted text-center" style={{ padding: 40 }}>Loading clients...</p>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>{search ? 'No clients found' : 'No clients yet'}</h3>
            <p>{search ? 'Try a different search term.' : 'Add your first client to get started.'}</p>
            {!search && <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Add First Client</button>}
          </div>
        ) : (
          <table className="client-table">
            <thead><tr><th>Client</th><th>Phone</th><th>Goals</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {clients.map(client => (
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
                  <td>{client.phone || '—'}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.goals || '—'}</td>
                  <td><span className={`status-badge ${client.status}`}>{client.status}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(client.id, client.full_name)} style={{ color: 'var(--error)' }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Client</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {formError && <div className="alert alert-error">⚠️ {formError}</div>}
            <form onSubmit={handleAddClient}>
              <div className="form-group">
                <label>Full Name *</label>
                <input name="full_name" className="form-input" placeholder="Client's full name" value={form.full_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" className="form-input" placeholder="client@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" className="form-input" placeholder="9876543210" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" className="form-input" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Goals</label>
                <textarea name="goals" className="form-input" placeholder="What does this client want to achieve?" value={form.goals} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Medical Notes</label>
                <textarea name="medical_notes" className="form-input" placeholder="Allergies, conditions, medications..." value={form.medical_notes} onChange={handleChange} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={`btn btn-primary ${formLoading ? 'btn-loading' : ''}`} disabled={formLoading}>
                  {formLoading ? 'Adding...' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
