import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Activity, Mail, Lock } from 'lucide-react';

export function Login({ setLogged }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@medistock.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await client.post('/auth/login', { email, password });
      localStorage.setItem('medistock_token', res.data.token);
      localStorage.setItem('medistock_user', JSON.stringify(res.data.user));
      setLogged(true);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials or server error.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#09090b', color: '#fff', perspective: '1000px', overflow: 'hidden' }}>
      {/* 3D background elements */}
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', height: '400px', background: '#6366f1', filter: 'blur(120px)', opacity: 0.3, borderRadius: '50%', transform: 'translateZ(-200px)' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '400px', height: '400px', background: '#38bdf8', filter: 'blur(120px)', opacity: 0.2, borderRadius: '50%', transform: 'translateZ(-100px)' }}></div>
      
      <div style={{ flex: 1, background: 'url(https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80) center/cover', position: 'relative' }}>
         <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, #09090b, transparent)' }}></div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 120px', zIndex: 10 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '60px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', padding: '10px', borderRadius: '12px' }}>
               <Activity size={24} color="#fff" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 800 }}>MediStock</span>
         </div>
         
         <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            backdropFilter: 'blur(20px)', 
            padding: '48px', 
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            transform: 'rotateY(-5deg)',
            transition: 'transform 0.3s ease',
            maxWidth: '500px'
         }}
         onMouseOver={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'}
         onMouseOut={(e) => e.currentTarget.style.transform = 'rotateY(-5deg)'}
         >
            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Enter your credentials to access the platform.</p>
            
            {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ position: 'relative' }}>
                  <Mail size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }}/>
                  <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none' }} />
               </div>
               <div style={{ position: 'relative' }}>
                  <Lock size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }}/>
                  <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                 <span style={{ color: '#818cf8', fontSize: '14px', cursor: 'pointer', fontWeight: 600 }}>Forgot Password?</span>
               </div>
               <button type="submit" style={{ padding: '16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}>Sign In</button>
            </form>
            <div style={{ marginTop: '32px', textAlign: 'center', color: '#94a3b8' }}>
               Don't have an account? <span onClick={() => navigate('/register')} style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>Register here</span>
            </div>
         </div>
      </div>
    </div>
  );
}
