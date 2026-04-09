import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import '../styles/LoginPage.css';

const StaffLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('Authenticating with Supabase...');
    setLoading(true);

    try {
      const authPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth request timed out. Please check your network.')), 12000)
      );

      const { data: authData, error: authError } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (authError) throw new Error(authError.message);

      setStatus('Checking staff record...');
      const { data: staffRow, error: roleError } = await supabase
        .from('staff')
        .select('role')
        .eq('user_email_id', email.trim())
        .maybeSingle();

      if (roleError) throw new Error('Database error: ' + roleError.message);

      if (!staffRow) {
        setStatus('User not found in staff table. Checking admin status...');
        const { data: adminRow } = await supabase
          .from('admin')
          .select('role')
          .eq('user_email_id', email.trim())
          .maybeSingle();

        if (adminRow) {
          await supabase.auth.signOut();
          throw new Error('This account is an Admin. Please use the Admin Portal.');
        }

        setStatus('Creating your staff profile...');
        await supabase.from('staff').insert([
          { user_email_id: email.trim(), password: '', role: 'staff' }
        ]);
      }

      setStatus('Success! Entering portal...');
      navigate('/dashboard');

    } catch (err: any) {
      console.error('Staff login error:', err);
      setError(err.message || 'An unexpected error occurred.');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo" style={{ backgroundColor: 'var(--success)', color: 'white' }}>
          <FaUserTie />
        </div>
        <h1 className="login-title">Staff Login</h1>
        <p className="login-subtitle">Sign in to manage parking vehicles</p>

        {status && <div style={{ fontSize: '0.85rem', color: 'var(--success)', textAlign: 'center', marginBottom: '1rem', fontWeight: 600 }}>{status}</div>}
        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="staff@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--success)' }} disabled={loading}>
            {loading ? 'Entering Portal...' : 'Sign In as Staff'}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', backgroundColor: 'transparent', border: 'none', textDecoration: 'underline' }}
            onClick={() => navigate('/')}
          >
            Go Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffLoginPage;
