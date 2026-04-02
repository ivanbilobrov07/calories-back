import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/users';
import { calculateDailyGoalKcal } from '../utils/bmr';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: '', sex: '', age: '', weightKg: '', heightCm: '', activityLevel: 'sedentary', dailyGoalKcal: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        sex: user.sex || '',
        age: user.age || '',
        weightKg: user.weightKg || '',
        heightCm: user.heightCm || '',
        activityLevel: user.activityLevel || 'sedentary',
        dailyGoalKcal: user.dailyGoalKcal || ''
      });
    }
  }, [user]);

  const suggested = calculateDailyGoalKcal({
    sex: form.sex,
    age: Number(form.age),
    weightKg: Number(form.weightKg),
    heightCm: Number(form.heightCm),
    activityLevel: form.activityLevel
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name !== 'dailyGoalKcal') setForm(prev => ({ ...prev, [name]: value, dailyGoalKcal: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const payload = {
        name: form.name || undefined,
        sex: form.sex || undefined,
        age: form.age ? Number(form.age) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        activityLevel: form.activityLevel || undefined,
        dailyGoalKcal: form.dailyGoalKcal ? Number(form.dailyGoalKcal) : undefined
      };
      await updateProfile(payload);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-layout">
        <div className="card profile-card">
          <h2>Personal Information</h2>
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label>Sex</label>
                <select name="sex" value={form.sex} onChange={handleChange}>
                  <option value="">— select —</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input name="age" type="number" min={10} max={120} value={form.age} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input name="weightKg" type="number" min={20} max={300} step={0.1} value={form.weightKg} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input name="heightCm" type="number" min={100} max={250} step={0.1} value={form.heightCm} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Activity Level</label>
              <select name="activityLevel" value={form.activityLevel} onChange={handleChange}>
                <option value="sedentary">Sedentary (office work, no exercise)</option>
                <option value="light">Light (1–3 workouts/week)</option>
                <option value="moderate">Moderate (3–5 workouts/week)</option>
                <option value="active">Active (6–7 workouts/week)</option>
              </select>
            </div>

            {suggested && (
              <div className="hint-box">
                Suggested daily goal based on your profile: <strong>{suggested} kcal</strong> (Mifflin-St Jeor)
              </div>
            )}

            <div className="form-group">
              <label>Daily Calorie Goal (kcal)</label>
              <input
                name="dailyGoalKcal"
                type="number"
                min={500}
                max={10000}
                value={form.dailyGoalKcal}
                onChange={e => setForm(prev => ({ ...prev, dailyGoalKcal: e.target.value }))}
                placeholder={suggested ? `Suggested: ${suggested}` : 'e.g. 2000'}
              />
              <span className="form-hint">Leave empty to use the suggested value</span>
            </div>

            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">Profile saved!</p>}

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="card profile-info-card">
          <h2>Account</h2>
          <p className="text-muted">Email</p>
          <p><strong>{user?.email}</strong></p>
          <p className="text-muted" style={{ marginTop: '1rem' }}>Member since</p>
          <p><strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</strong></p>
        </div>
      </div>
    </div>
  );
}
