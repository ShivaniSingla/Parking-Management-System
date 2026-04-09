import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import '../styles/LoginPage.css';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('Authenticating your admin account...');
    setLoading(true);

    try {
      // Hard timeout for the auth call
      const authPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase did not respond in time. Please check your internet.')), 12000)
      );

      const { data: authData, error: authError } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (authError) {
        throw new Error(authError.message);
      }
      
      if (!authData?.user) {
        throw new Error('Authentication failed - no user session returned.');
      }

      setStatus('Verifying admin privileges...');
      
      const { data: adminRow, error: roleError } = await supabase
        .from('admin')
        .select('role')
        .eq('user_email_id', email.trim())
        .maybeSingle();

      if (roleError) throw new Error('Database check failed: ' + roleError.message);

      if (!adminRow) {
        await supabase.auth.signOut();
        throw new Error('Access denied. This account is not in the Admin database.');
      }

      setStatus('Success! Opening portal...');
      navigate('/dashboard');

    } catch (err: any) {
      console.error('Login error detail:', err);
      setError(err.message || 'An unexpected error occurred.');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
          <FaUserShield />
        </div>
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Sign in to manage operations</p>

        {status && <div style={{ fontSize: '0.85rem', color: 'var(--primary)', textAlign: 'center', marginBottom: '1rem', fontWeight: 600 }}>{status}</div>}
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
              placeholder="admin@example.com"
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entering Portal...' : 'Sign In as Admin'}
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

export default AdminLoginPage;
