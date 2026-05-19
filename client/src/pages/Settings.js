import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { coach, authFetch } = useAuth();
  const [form, setForm] = useState({
    full_name: coach?.full_name || '',
    business_name: coach?.business_name || '',
    phone: coach?.phone || '',
    specialization: coach?.specialization || '',
    bio: coach?.bio || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await authFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully! ✅');
      } else {
        setMessage(data.error || 'Failed to update');
      }
    } catch (err) {
      setMessage('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Settings</h1>
          <p>Manage your coach profile</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-header">
          <h3 className="card-title">Coach Profile</h3>
        </div>

        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="full_name" className="form-input" value={form.full_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Business Name</label>
            <input name="business_name" className="form-input" placeholder="Your coaching brand" value={form.business_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Specialization</label>
            <input name="specialization" className="form-input" placeholder="Weight Loss, PCOS, Diabetes" value={form.specialization} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" className="form-input" placeholder="Tell clients about yourself..." value={form.bio} onChange={handleChange} rows={4} />
          </div>

          <div style={{ marginTop: 'var(--space-lg)' }}>
            <button type="submit" className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            🔗 Your subdomain: <strong style={{ color: 'var(--primary)' }}>{coach?.subdomain || 'not-set'}.coachos.com</strong>
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            📧 Email: <strong>{coach?.email}</strong>
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            📅 Member since: <strong>{coach?.created_at ? new Date(coach.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
