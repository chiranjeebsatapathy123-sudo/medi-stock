import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Activity, User, Mail, Lock, Building } from 'lucide-react';

export function Register({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', companyName: '' });
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await client.post('/auth/register', formData);
      // Auto login after register
      const loginRes = await client.post('/auth/login', { email: formData.email, password: formData.password });
      localStorage.setItem('medistock_token', loginRes.data.token);
      localStorage.setItem('medistock_user', JSON.stringify(loginRes.data.user));
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#09090b', color: '#fff', perspective: '1000px', overflow: 'hidden' }}>
      {/* 3D background elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: '#6366f1', filter: 'blur(120px)', opacity: 0.3, borderRadius: '50%', transform: 'translateZ(-200px)' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: '#38bdf8', filter: 'blur(120px)', opacity: 0.2, borderRadius: '50%', transform: 'translateZ(-100px)' }}></div>

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
            transform: 'rotateY(5deg)',
            transition: 'transform 0.3s ease',
            maxWidth: '500px'
         }}
         onMouseOver={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'}
         onMouseOut={(e) => e.currentTarget.style.transform = 'rotateY(5deg)'}
         >
            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Create an Account</h2>
            <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Join the intelligent medical supply chain.</p>
            
            {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
            
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ position: 'relative' }}>
                  <User size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }}/>
                  <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none' }} />
               </div>
               <div style={{ position: 'relative' }}>
                  <Building size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }}/>
                  <input type="text" placeholder="Organization / Hospital Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} style={{ width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none' }} />
               </div>
               <div style={{ position: 'relative' }}>
                  <Mail size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }}/>
                  <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none' }} />
               </div>
               <div style={{ position: 'relative' }}>
                  <Lock size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }}/>
                  <input type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none' }} />
               </div>
               <button type="submit" style={{ padding: '16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}>Register</button>
            </form>
            <div style={{ marginTop: '32px', textAlign: 'center', color: '#94a3b8' }}>
               Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>Sign In</span>
            </div>
         </div>
      </div>
      
      <div style={{ flex: 1, background: 'url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80) center/cover', position: 'relative' }}>
         <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #09090b, transparent)' }}></div>
      </div>
    </div>
  );
}
