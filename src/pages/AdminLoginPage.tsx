import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield } from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import '../styles/LoginPage.css';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);
  const { currentUser, refreshUserRole } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const { error } = await supabase.from('pricing').select('count', { count: 'exact', head: true });
        setIsSupabaseConnected(!error);
      } catch (err) {
        setIsSupabaseConnected(false);
      }
    };
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 15000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/dashboard');
      } else {
        // If they have the wrong role locally, the context will eventually update
        // but we navigate to dashboard either way
        navigate('/dashboard'); 
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const loginTimeout = setTimeout(() => {
      setLoading(false);
      setError("Login process timed out (30s). This may be due to a slow network or Supabase connection issue. Please try again.");
    }, 30000);

    try {
      console.log("Attempting admin sign in...");
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;
      
      if (data.user) {
        console.log("Sign in success, verifying admin profile...");
        // Check if profile exists
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profile) {
          console.log("Admin profile missing, creating now...");
          const { error: insertErr } = await supabase.from('profiles').insert([
            { id: data.user.id, username: data.user.email || 'admin', role: 'admin' }
          ]);
          if (!insertErr) {
            console.log("Profile created, triggering role refresh...");
            await refreshUserRole(data.user);
          } else {
            console.error("Failed to create admin profile:", insertErr);
          }
        } else if (profile.role !== 'admin') {
          console.log("Correcting role to admin...");
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
          await refreshUserRole(data.user);
        }
      }

    } catch (err: any) {
      console.error("Admin Login Error:", err);
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    } finally {
      clearTimeout(loginTimeout);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo" style={{ backgroundColor: 'var(--primary)', color: 'white', position: 'relative' }}>
          <FaUserShield />
          <div 
            title={isSupabaseConnected === null ? "Checking connection..." : isSupabaseConnected ? "Connected to Supabase" : "Supabase connection error"}
            style={{ 
              position: 'absolute', 
              bottom: 0, 
              right: 0, 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: isSupabaseConnected === null ? '#aaa' : isSupabaseConnected ? '#4ade80' : '#f87171',
              border: '2px solid white',
              boxShadow: '0 0 5px rgba(0,0,0,0.2)'
            }} 
          />
        </div>
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Sign in to manage operations</p>

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
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
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
