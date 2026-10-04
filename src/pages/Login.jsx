import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useSpring } from 'framer-motion';
import client from '../api/client';
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react';

export function Login({ setLogged }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@medistock.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Smooth out mouse movement for the background glow
  const springX = useSpring(mousePosition.x, { stiffness: 50, damping: 20 });
  const springY = useSpring(mousePosition.y, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      backgroundColor: '#030712',
      backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      color: '#fff', 
      overflow: 'hidden',
      position: 'relative',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Interactive Cursor Glow */}
      <motion.div style={{
          position: 'fixed', top: 0, left: 0,
          width: '800px', height: '800px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)',
          borderRadius: '50%',
          x: springX, y: springY,
          translateX: '-50%', translateY: '-50%',
          pointerEvents: 'none', zIndex: 0,
          filter: 'blur(40px)'
      }} />

      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 120px', zIndex: 10 }}
      >
         <motion.div 
           whileHover={{ scale: 1.05 }}
           style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '60px', cursor: 'pointer', width: 'fit-content' }} 
           onClick={() => navigate('/')}
         >
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', padding: '10px', borderRadius: '12px', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
               <Activity size={24} color="#fff" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>MediStock<span style={{ color: '#6366f1' }}>.pro</span></span>
         </motion.div>
         
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ 
              background: 'rgba(15,23,42,0.6)', 
              backdropFilter: 'blur(20px)', 
              padding: '48px', 
              borderRadius: '24px', 
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.8)',
              maxWidth: '500px'
            }}
         >
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-1px' }}>Welcome Back</h2>
            <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '15px' }}>Authenticate to access the intelligence engine.</p>
            
            {error && <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(239,68,68,0.2)', fontSize: '14px', fontWeight: 500 }}>{error}</motion.div>}
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ position: 'relative' }}>
                  <Mail size={20} color="#64748b" style={{ position: 'absolute', left: '16px', top: '16px' }}/>
                  <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border 0.2s' }} onFocus={(e)=>e.target.style.borderColor='#6366f1'} onBlur={(e)=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
               </div>
               <div style={{ position: 'relative' }}>
                  <Lock size={20} color="#64748b" style={{ position: 'absolute', left: '16px', top: '16px' }}/>
                  <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border 0.2s' }} onFocus={(e)=>e.target.style.borderColor='#6366f1'} onBlur={(e)=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}>
                   <input type="checkbox" style={{ accentColor: '#6366f1' }} defaultChecked /> Remember me
                 </label>
                 <span style={{ color: '#818cf8', fontSize: '14px', cursor: 'pointer', fontWeight: 600 }}>Forgot Password?</span>
               </div>
               <motion.button 
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 type="submit" 
                 style={{ padding: '16px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginTop: '10px', boxShadow: '0 10px 30px -10px rgba(99,102,241,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
               >
                 Sign In <ArrowRight size={18} />
               </motion.button>
            </form>
            <div style={{ marginTop: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
               Don't have an account? <span onClick={() => navigate('/register')} style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>Register here</span>
            </div>
         </motion.div>
      </motion.div>

      {/* Abstract Animated Graphic Side */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px' }}
      >
         <motion.div 
           animate={{ rotateY: [0, 10, 0], rotateX: [0, -5, 0] }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
           style={{ width: '400px', height: '500px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', padding: '24px', gap: '20px' }}
         >
           <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Activity size={20} color="#38bdf8" />
             </div>
             <div>
               <div style={{ width: '120px', height: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '5px', marginBottom: '6px' }}></div>
               <div style={{ width: '80px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
             </div>
           </div>
           
           <div style={{ flex: 1, background: 'linear-gradient(to bottom, rgba(99,102,241,0.1), transparent)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
              {/* Fake animated chart lines */}
              <motion.div animate={{ x: [-200, 400] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, transparent, #818cf8, transparent)', boxShadow: '0 0 20px #818cf8' }}></motion.div>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <div style={{ height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}></div>
             <div style={{ height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}></div>
           </div>
         </motion.div>
      </motion.div>
    </div>
  );
}
