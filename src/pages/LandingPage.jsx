import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Activity, Zap, ShieldCheck, ArrowRight, ChevronRight, BarChart3, Bot, Boxes } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  
  // Smooth out mouse movement for the background glow
  const springX = useSpring(mousePosition.x, { stiffness: 50, damping: 20 });
  const springY = useSpring(mousePosition.y, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Features list for staggering animation
  const features = [
    { icon: Bot, title: "Neural Forecasting", desc: "Predict stockouts 30 days in advance with 99.4% accuracy using our proprietary ML model." },
    { icon: ShieldCheck, title: "FDA/DEA Compliance", desc: "Automated audit logs, cold-chain temperature tracking, and mandatory regulatory reporting." },
    { icon: BarChart3, title: "Dynamic Valuation", desc: "Real-time capital tracking and wastage mitigation algorithms." },
    { icon: Boxes, title: "Spatial Digital Twin", desc: "Map your warehouse in 3D to optimize picking routes and shelf space allocation." }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#030712', // Very dark slate
      backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      color: '#fff',
      overflowX: 'hidden',
      position: 'relative',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Interactive Cursor Glow */}
      <motion.div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '800px', height: '800px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)',
          borderRadius: '50%',
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(40px)'
      }} />

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 64px', position: 'relative', zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(3,7,18,0.7)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', padding: '10px', borderRadius: '12px', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
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
            style={{ padding: '10px 24px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, transition: 'transform 0.2s' }}>
            Get Started <ArrowRight size={16} style={{display:'inline', verticalAlign:'middle', marginLeft:5}}/>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ padding: '80px 64px', maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '60px', position: 'relative', zIndex: 10, minHeight: '80vh' }}>
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ flex: 1.2, perspective: '1000px' }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: '30px', fontSize: '14px', fontWeight: 600, marginBottom: '24px', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <Sparkles size={16} /> MediStock Intelligence Engine 3.0 is live
          </motion.div>
          <h1 style={{ fontSize: '72px', lineHeight: 1.05, fontWeight: 800, marginBottom: '24px', letterSpacing: '-2px' }}>
            The Operating System for <span style={{ background: 'linear-gradient(to right, #818cf8, #38bdf8, #2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Modern Pharmacies</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '40px', maxWidth: '600px' }}>
            Supercharge your clinical supply chain with artificial intelligence. Predict demand, eliminate stockouts, and automate compliance effortlessly.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              style={{ padding: '16px 32px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 30px -10px rgba(99,102,241,0.8)' }}>
              Deploy to your Clinic
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '18px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              View Interactive Demo
            </motion.button>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ display: 'flex', gap: '40px', marginTop: '60px' }}
          >
            <div>
              <h3 style={{ fontSize: '36px', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>99.9%</h3>
              <p style={{ color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>Inventory Accuracy</p>
            </div>
            <div>
              <h3 style={{ fontSize: '36px', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>-40%</h3>
              <p style={{ color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>Stockout Rates</p>
            </div>
            <div>
              <h3 style={{ fontSize: '36px', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>+2.4x</h3>
              <p style={{ color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>Capital Efficiency</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, rotateY: 20, rotateX: 10, scale: 0.9 }}
          animate={{ opacity: 1, rotateY: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          style={{ flex: 1, perspective: '2000px', y }}
        >
           {/* Interactive 3D Mockup Container */}
           <motion.div 
             whileHover={{ rotateY: -10, rotateX: 5, scale: 1.02 }}
             transition={{ type: "spring", stiffness: 300, damping: 20 }}
             style={{ 
               background: 'rgba(15,23,42,0.8)', 
               borderRadius: '24px', 
               padding: '24px', 
               border: '1px solid rgba(255,255,255,0.1)',
               boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
               backdropFilter: 'blur(20px)',
               transformStyle: 'preserve-3d'
           }}
           >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', transform: 'translateZ(30px)' }}>
                 <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }}></div>
                    <div style={{ width: '12px', height: '12px', background: '#eab308', borderRadius: '50%' }}></div>
                    <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%' }}></div>
                 </div>
                 <div style={{ width: '120px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}></div>
              </div>

              {/* Floating Widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', transform: 'translateZ(50px)' }}>
                 <motion.div 
                   animate={{ y: [0, -5, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(56,189,248,0.15))', borderRadius: '16px', padding: '20px', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 10px 30px -10px rgba(99,102,241,0.3)' }}
                 >
                    <Zap size={24} color="#818cf8" style={{ marginBottom: '12px' }}/>
                    <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>AI Forecast Active</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Predictive reordering enabled</div>
                 </motion.div>
                 
                 <motion.div 
                   animate={{ y: [0, 5, 0] }}
                   transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                   style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.15))', borderRadius: '16px', padding: '20px', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 10px 30px -10px rgba(16,185,129,0.3)' }}
                 >
                    <ShieldCheck size={24} color="#34d399" style={{ marginBottom: '12px' }}/>
                    <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>100% Compliant</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Zero regulatory infractions</div>
                 </motion.div>
              </div>

              {/* Chart Mockup */}
              <div style={{ height: '220px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', display: 'flex', alignItems: 'flex-end', padding: '20px', gap: '12px', transform: 'translateZ(40px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                 {[40, 60, 30, 80, 50, 100, 70].map((h, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.5 + (i * 0.1), duration: 0.8, type: "spring" }}
                      style={{ flex: 1, background: 'linear-gradient(to top, #6366f1, #38bdf8)', borderRadius: '6px 6px 0 0', opacity: 0.9, position: 'relative' }}
                    >
                      <div style={{position:'absolute', top:0, left:0, right:0, height:'4px', background:'#fff', borderRadius:'6px 6px 0 0', opacity:0.5}}></div>
                    </motion.div>
                 ))}
              </div>
           </motion.div>
        </motion.div>
      </main>

      {/* Feature Grid */}
      <section style={{ padding: '100px 64px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
           <h2 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-1px' }}>Engineered for Enterprise</h2>
           <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '600px', margin: '16px auto 0' }}>Everything you need to run a modern, automated, and hyper-efficient medical facility.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
           {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, background: 'rgba(30,41,59,0.8)' }}
                style={{ background: 'rgba(15,23,42,0.6)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s' }}
              >
                 <div style={{ width: '56px', height: '56px', background: 'rgba(99,102,241,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <f.icon size={28} />
                 </div>
                 <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px 0' }}>{f.title}</h3>
                 <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </motion.div>
           ))}
        </div>
      </section>
      
      {/* Footer CTA */}
      <section style={{ padding: '120px 64px', textAlign: 'center', position: 'relative', zIndex: 10, background: 'linear-gradient(to top, rgba(99,102,241,0.1), transparent)' }}>
         <h2 style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '32px' }}>Ready to modernize your pharmacy?</h2>
         <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            style={{ padding: '20px 48px', background: '#fff', color: '#000', border: 'none', borderRadius: '16px', fontSize: '20px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(255,255,255,0.3)' }}>
            Start Your Free Trial
         </motion.button>
      </section>

      {/* Sparkles component fallback */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999 }}>
        {/* We can add a particle canvas here if needed, but the radial glows are enough for a premium feel */}
      </div>
    </div>
  );
}

function Sparkles({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
