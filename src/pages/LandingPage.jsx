import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Layers, Activity, Zap, ShieldCheck } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #09090b 0%, #1a1a2e 100%)',
      color: '#fff',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Abstract Background Shapes */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }}></div>

      {/* Animated Top Bar */}
      <div style={{ 
          height: '4px', 
          width: '100%', 
          background: 'linear-gradient(90deg, #6366f1, #38bdf8, #818cf8, #3b82f6)', 
          backgroundSize: '200% 100%', 
          animation: 'gradientMove 3s linear infinite',
          position: 'absolute',
          top: 0,
          left: 0
      }}></div>
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
        `}
      </style>

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 64px', position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', padding: '10px', borderRadius: '12px' }}>
             <Activity size={24} color="#fff" />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>MediStock<span style={{ color: '#6366f1' }}>.pro</span></span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ padding: '10px 24px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
            Sign In
          </button>
          <button 
            onClick={() => navigate('/register')}
            style={{ padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)', transition: 'transform 0.2s' }}>
            Get Started
          </button>
        </div>
      </nav>

      <main style={{ padding: '60px 64px', maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '60px', position: 'relative', zIndex: 10 }}>
        <div style={{ flex: 1, perspective: '1000px' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: '20px', fontSize: '14px', fontWeight: 600, marginBottom: '24px', border: '1px solid rgba(99,102,241,0.2)' }}>
            ✨ The Future of Medical Inventory
          </div>
          <h1 style={{ fontSize: '64px', lineHeight: 1.1, fontWeight: 800, marginBottom: '24px', letterSpacing: '-2px' }}>
            Intelligent Supply Chain for <span style={{ background: 'linear-gradient(to right, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Modern Healthcare</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '40px', maxWidth: '600px' }}>
            Harness the power of AI and computer vision to predict stockouts, monitor expiries, and completely automate your clinical inventory management.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={() => navigate('/register')}
              style={{ padding: '16px 32px', background: '#fff', color: '#09090b', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', transformStyle: 'preserve-3d' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              Start Free Trial
            </button>
            <button 
              style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '18px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Book a Demo
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '40px', marginTop: '60px' }}>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>99.9%</h3>
              <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Inventory Accuracy</p>
            </div>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>-40%</h3>
              <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Stockout Rates</p>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, perspective: '2000px' }}>
           {/* 3D Dashboard Mockup */}
           <div style={{ 
               background: 'rgba(30,41,59,0.8)', 
               borderRadius: '24px', 
               padding: '24px', 
               border: '1px solid rgba(255,255,255,0.1)',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
               transform: 'rotateY(-15deg) rotateX(5deg)',
               transition: 'transform 0.5s ease',
               backdropFilter: 'blur(20px)'
           }}
           onMouseOver={(e) => e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)'}
           onMouseOut={(e) => e.currentTarget.style.transform = 'rotateY(-15deg) rotateX(5deg)'}
           >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                 <div style={{ width: '120px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}></div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }}></div>
                    <div style={{ width: '12px', height: '12px', background: '#eab308', borderRadius: '50%' }}></div>
                    <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%' }}></div>
                 </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                 <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Zap size={24} color="#818cf8" style={{ marginBottom: '12px' }}/>
                    <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>AI Forecast</div>
                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>Predictive reordering active</div>
                 </div>
                 <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <ShieldCheck size={24} color="#34d399" style={{ marginBottom: '12px' }}/>
                    <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Compliance</div>
                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>100% regulatory standard</div>
                 </div>
              </div>
              <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', display: 'flex', alignItems: 'flex-end', padding: '20px', gap: '10px' }}>
                 {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: 'linear-gradient(to top, #6366f1, #38bdf8)', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                 ))}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
