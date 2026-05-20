// ============================================
// pages/ClientDetail.js — Client Detail Page with Tabs
// ============================================
// 📚 LEARNING NOTES:
//
// What is useParams()?
// → A React Router hook that gives you the URL parameters
// → If the route is /clients/:id and URL is /clients/5
// → useParams() returns { id: "5" }
//
// What is a Tabbed UI?
// → Show different content based on which tab is selected
// → We use state to track the active tab
// → Only render the content for the active tab
//
// Component Composition:
// → Instead of one HUGE component, we break it into sections:
//   - ProfileTab — view/edit client info
//   - ProgressTab — view/add progress entries
//   - NotesTab — view/add coach notes
// → Each section is a function inside this file
// → In bigger apps, each would be its own file
//
// What is "Optimistic UI"?
// → Show the change IMMEDIATELY (before API confirms)
// → If the API fails, revert the change
// → Makes the app feel instant and snappy
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ClientDetail() {
  const { id } = useParams();     // 📚 Get :id from URL
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [client, setClient] = useState(null);
  const [progress, setProgress] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');

  // Fetch client data on mount
  useEffect(() => {
    fetchClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await authFetch(`/clients/${id}`);
      if (!res.ok) {
        setError('Client not found');
        return;
      }
      const data = await res.json();
      setClient(data.client);
      setProgress(data.progress || []);
      setNotes(data.notes || []);
    } catch (err) {
      setError('Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Helper to format dates nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading client details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-error">
        <div className="empty-icon">😕</div>
        <h3>{error}</h3>
        <Link to="/clients" className="btn btn-primary">← Back to Clients</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <Link to="/clients" className="breadcrumb-link">Clients</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{client.full_name}</span>
      </div>

      {/* Client Header */}
      <div className="client-detail-header">
        <div className="client-detail-info">
          <div className="client-detail-avatar">
            {getInitials(client.full_name)}
          </div>
          <div>
            <h1>{client.full_name}</h1>
            <p className="client-detail-meta">
              {client.email} {client.phone ? `• ${client.phone}` : ''}
            </p>
            <div className="client-detail-badges">
              <span className={`status-badge ${client.status}`}>{client.status}</span>
              {client.gender && <span className="detail-badge">{client.gender}</span>}
              {client.specialization && <span className="detail-badge">{client.specialization}</span>}
            </div>
          </div>
        </div>
        <div className="client-detail-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/clients')}>
            ← Back
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button
          className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          📊 Progress ({progress.length})
        </button>
        <button
          className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Notes ({notes.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'profile' && (
          <ProfileTab
            client={client}
            authFetch={authFetch}
            onUpdate={(updated) => setClient({ ...client, ...updated })}
            formatDate={formatDate}
          />
        )}
        {activeTab === 'progress' && (
          <ProgressTab
            clientId={id}
            entries={progress}
            authFetch={authFetch}
            onUpdate={setProgress}
            formatDate={formatDate}
          />
        )}
        {activeTab === 'notes' && (
          <NotesTab
            clientId={id}
            notes={notes}
            authFetch={authFetch}
            onUpdate={setNotes}
            formatDateTime={formatDateTime}
          />
        )}
      </div>
    </div>
  );
}


// ============================================
// PROFILE TAB — View & Edit Client Info
// ============================================
// 📚 LEARNING NOTES:
// → isEditing state controls whether we show form or display
// → editForm holds the temporary values while editing
// → On save, we send PUT request and update parent state
// → On cancel, we discard changes

function ProfileTab({ client, authFetch, onUpdate, formatDate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const startEditing = () => {
    // 📚 Copy current client data into the edit form
    setEditForm({
      full_name: client.full_name || '',
      email: client.email || '',
      phone: client.phone || '',
      gender: client.gender || '',
      goals: client.goals || '',
      medical_notes: client.medical_notes || '',
      status: client.status || 'active'
    });
    setIsEditing(true);
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await authFetch(`/clients/${client.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(editForm);  // 📚 Optimistic UI — update parent immediately
        setIsEditing(false);
        setMessage('Profile updated! ✅');
      } else {
        setMessage(data.error || 'Failed to save');
      }
    } catch {
      setMessage('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="profile-tab">
      {message && (
        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Client Information</h3>
          {!isEditing ? (
            <button className="btn btn-ghost btn-sm" onClick={startEditing}>✏️ Edit</button>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className={`btn btn-primary btn-sm ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          /* EDIT MODE */
          <div className="profile-form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input name="full_name" className="form-input" value={editForm.full_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" className="form-input" value={editForm.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" className="form-input" value={editForm.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" className="form-input" value={editForm.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" className="form-input" value={editForm.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Goals</label>
              <textarea name="goals" className="form-input" value={editForm.goals} onChange={handleChange} rows={3} />
            </div>
            <div className="form-group full-width">
              <label>Medical Notes</label>
              <textarea name="medical_notes" className="form-input" value={editForm.medical_notes} onChange={handleChange} rows={3} />
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="profile-details-grid">
            <div className="profile-field">
              <span className="field-label">Full Name</span>
              <span className="field-value">{client.full_name}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Email</span>
              <span className="field-value">{client.email}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Phone</span>
              <span className="field-value">{client.phone || '—'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Gender</span>
              <span className="field-value">{client.gender || '—'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Status</span>
              <span className={`status-badge ${client.status}`}>{client.status}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Joined</span>
              <span className="field-value">{formatDate(client.created_at)}</span>
            </div>
            <div className="profile-field full-width">
              <span className="field-label">Goals</span>
              <span className="field-value">{client.goals || 'No goals set'}</span>
            </div>
            <div className="profile-field full-width">
              <span className="field-label">Medical Notes</span>
              <span className="field-value">{client.medical_notes || 'None'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ============================================
// PROGRESS TAB — View & Add Progress Entries
// ============================================
// 📚 LEARNING NOTES:
// → Progress entries track metrics over time (weight, energy, sleep, etc.)
// → showForm state controls the "Add Entry" form visibility
// → After adding, we prepend to the array (newest first)

function ProgressTab({ clientId, entries, authFetch, onUpdate, formatDate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    weight_kg: '', energy_level: '', sleep_hours: '', water_litres: '', mood: '', notes: '',
    recorded_date: new Date().toISOString().split('T')[0]  // 📚 Today's date in YYYY-MM-DD
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch(`/clients/${clientId}/progress`, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        // 📚 Prepend new entry to list (optimistic, newest first)
        onUpdate([{ id: data.entryId, ...form, created_at: new Date().toISOString() }, ...entries]);
        setForm({ weight_kg: '', energy_level: '', sleep_hours: '', water_litres: '', mood: '', notes: '', recorded_date: new Date().toISOString().split('T')[0] });
        setShowForm(false);
      }
    } catch (err) {
      console.error('Add progress error:', err);
    } finally {
      setSaving(false);
    }
  };

  // 📚 Helper: emoji for mood
  const moodEmoji = { great: '😄', good: '🙂', okay: '😐', bad: '😟', terrible: '😞' };

  return (
    <div className="progress-tab">
      <div className="tab-section-header">
        <h3>Progress History</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Add Entry'}
        </button>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <div className="card add-entry-card">
          <h4 style={{ marginBottom: 'var(--space-md)' }}>New Progress Entry</h4>
          <form onSubmit={handleSubmit}>
            <div className="progress-form-grid">
              <div className="form-group">
                <label>Date</label>
                <input name="recorded_date" type="date" className="form-input" value={form.recorded_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input name="weight_kg" type="number" step="0.1" className="form-input" placeholder="72.5" value={form.weight_kg} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Energy (1-10)</label>
                <input name="energy_level" type="number" min="1" max="10" className="form-input" placeholder="7" value={form.energy_level} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Sleep (hours)</label>
                <input name="sleep_hours" type="number" step="0.5" className="form-input" placeholder="7.5" value={form.sleep_hours} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Water (litres)</label>
                <input name="water_litres" type="number" step="0.5" className="form-input" placeholder="3.0" value={form.water_litres} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Mood</label>
                <select name="mood" className="form-input" value={form.mood} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="great">😄 Great</option>
                  <option value="good">🙂 Good</option>
                  <option value="okay">😐 Okay</option>
                  <option value="bad">😟 Bad</option>
                  <option value="terrible">😞 Terrible</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea name="notes" className="form-input" placeholder="How was the client feeling?" value={form.notes} onChange={handleChange} rows={2} />
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-md)', textAlign: 'right' }}>
              <button type="submit" className={`btn btn-primary btn-sm ${saving ? 'btn-loading' : ''}`} disabled={saving}>
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Progress Entries List */}
      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No progress entries yet</h3>
          <p>Track your client's progress by adding their first entry.</p>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>➕ Add First Entry</button>
          )}
        </div>
      ) : (
        <div className="progress-entries">
          {entries.map((entry, idx) => (
            <div key={entry.id || idx} className="progress-entry-card card">
              <div className="entry-date">
                📅 {formatDate(entry.recorded_date)}
              </div>
              <div className="entry-metrics">
                {entry.weight_kg && (
                  <div className="metric">
                    <span className="metric-label">Weight</span>
                    <span className="metric-value">{entry.weight_kg} kg</span>
                  </div>
                )}
                {entry.energy_level && (
                  <div className="metric">
                    <span className="metric-label">Energy</span>
                    <span className="metric-value">{entry.energy_level}/10</span>
                    <div className="metric-bar">
                      <div className="metric-bar-fill energy" style={{ width: `${entry.energy_level * 10}%` }}></div>
                    </div>
                  </div>
                )}
                {entry.sleep_hours && (
                  <div className="metric">
                    <span className="metric-label">Sleep</span>
                    <span className="metric-value">{entry.sleep_hours}h</span>
                  </div>
                )}
                {entry.water_litres && (
                  <div className="metric">
                    <span className="metric-label">Water</span>
                    <span className="metric-value">{entry.water_litres}L</span>
                  </div>
                )}
                {entry.mood && (
                  <div className="metric">
                    <span className="metric-label">Mood</span>
                    <span className="metric-value">{moodEmoji[entry.mood] || ''} {entry.mood}</span>
                  </div>
                )}
              </div>
              {entry.notes && (
                <div className="entry-notes">
                  💬 {entry.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ============================================
// NOTES TAB — Coach Notes Timeline
// ============================================
// 📚 LEARNING NOTES:
// → Timeline UI: each note is a "card" in a vertical list
// → Delete uses a confirmation dialog (window.confirm)
// → After delete, we filter the note out of the array

function NotesTab({ clientId, notes, authFetch, onUpdate, formatDateTime }) {
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const res = await authFetch(`/clients/${clientId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note: newNote })
      });
      const data = await res.json();
      if (res.ok) {
        // 📚 Prepend new note (newest first)
        onUpdate([{ id: data.noteId, note: newNote, created_at: new Date().toISOString() }, ...notes]);
        setNewNote('');
      }
    } catch (err) {
      console.error('Add note error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await authFetch(`/clients/${clientId}/notes/${noteId}`, { method: 'DELETE' });
      // 📚 Filter out the deleted note from the array
      onUpdate(notes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error('Delete note error:', err);
    }
  };

  return (
    <div className="notes-tab">
      {/* Add Note Form */}
      <div className="card add-note-card">
        <form onSubmit={handleAddNote}>
          <textarea
            className="form-input"
            placeholder="Write a private note about this client..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <div style={{ marginTop: 'var(--space-sm)', textAlign: 'right' }}>
            <button
              type="submit"
              className={`btn btn-primary btn-sm ${saving ? 'btn-loading' : ''}`}
              disabled={saving || !newNote.trim()}
            >
              {saving ? 'Saving...' : '📝 Add Note'}
            </button>
          </div>
        </form>
      </div>

      {/* Notes Timeline */}
      {notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No notes yet</h3>
          <p>Write your first note about this client above.</p>
        </div>
      ) : (
        <div className="notes-timeline">
          {notes.map((note, idx) => (
            <div key={note.id || idx} className="note-card card">
              <div className="note-header">
                <span className="note-time">{formatDateTime(note.created_at)}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(note.id)}
                  style={{ color: 'var(--error)', padding: '4px 8px' }}
                >
                  🗑️
                </button>
              </div>
              <div className="note-content">{note.note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
