import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Activity, Zap, ShieldCheck, ArrowRight, ChevronRight, BarChart3, Bot, Boxes, Terminal, Camera, CheckCircle2 } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  
  // Smooth out mouse movement for the background glow
  const springX = useSpring(mousePosition.x, { stiffness: 50, damping: 20 });
  const springY = useSpring(mousePosition.y, { stiffness: 50, damping: 20 });

  const healthQuotes = [
    "Healing is a matter of time, but it is sometimes also a matter of opportunity.",
    "The art of medicine consists of amusing the patient while nature cures the disease.",
    "Wherever the art of Medicine is loved, there is also a love of Humanity.",
    "Medicines cure diseases, but only doctors can cure patients.",
    "Prevention is better than cure.",
    "Let food be thy medicine and medicine be thy food.",
    "To array a man's will against his sickness is the supreme art of medicine.",
    "Health is a state of body. Wellness is a state of being.",
    "The good physician treats the disease; the great physician treats the patient.",
    "Time is generally the best doctor."
  ];
  const [randomQuote, setRandomQuote] = useState("");

  useEffect(() => {
    setRandomQuote(healthQuotes[Math.floor(Math.random() * healthQuotes.length)]);
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
    { icon: Boxes, title: "Spatial Digital Twin", desc: "Map your warehouse in 3D to optimize picking routes and shelf space allocation." },
    { icon: Camera, title: "Edge AI Vision", desc: "Instantly detect packaging anomalies and safety hazards using our mobile app." }
  ];

  const [activeCode, setActiveCode] = useState(0);
  const codeSnippets = [
    "> POST /api/predict/demand\n> {\"medicine_id\": \"AMX500\"}\n\n[200 OK]\n{\n  \"risk\": \"MODERATE\",\n  \"forecast\": 125.0,\n  \"auto_reorder\": true\n}",
    "> GET /api/vision/status\n> {\"camera\": \"aisle-4\"}\n\n[200 OK]\n{\n  \"anomaly\": \"SPILL_DETECTED\",\n  \"confidence\": 0.98,\n  \"alert_dispatched\": true\n}"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCode(prev => (prev + 1) % codeSnippets.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: '30px', fontSize: '14px', fontWeight: 600, marginBottom: '24px', border: '1px solid rgba(99,102,241,0.2)', fontStyle: 'italic' }}
          >
            <Sparkles size={16} /> "{randomQuote || healthQuotes[0]}"
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
          
          <div style={{ display: 'flex', gap: '20px', marginTop: '60px', flexWrap: 'wrap' }}>
            {[
              { v: "99.9%", l: "Inventory Accuracy", s: "Powered by Edge AI vision reconciliation." },
              { v: "-40%", l: "Stockout Rates", s: "Predictive neural reordering before you run out." },
              { v: "+2.4x", l: "Capital Efficiency", s: "Free up cash flow by eliminating dead stock." },
              { v: "< 15m", l: "Deployment", s: "Plug-and-play REST API integration." }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
                whileHover={{ y: -8, scale: 1.03, background: 'rgba(30,41,59,0.9)', borderColor: 'rgba(99,102,241,0.5)', boxShadow: '0 20px 40px -10px rgba(99,102,241,0.15)' }}
                style={{ flex: 1, minWidth: '160px', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(10px)', cursor: 'default', position: 'relative', overflow: 'hidden' }}
              >
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, transparent, #818cf8, transparent)' }} 
                />
                <h3 style={{ fontSize: '36px', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>{stat.v}</h3>
                <p style={{ color: '#e2e8f0', margin: '8px 0 6px 0', fontWeight: 600, fontSize: '15px' }}>{stat.l}</p>
                <p style={{ color: '#64748b', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{stat.s}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, rotateY: 20, rotateX: 10, scale: 0.9 }}
          animate={{ opacity: 1, rotateY: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          style={{ flex: 1, perspective: '2000px', y, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
        >
           {/* Floating Developer Metrics */}
           <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
               <motion.div 
                 animate={{ y: [-8, 8, -8] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)', padding: '12px 24px', borderRadius: '100px', border: '1px solid rgba(56,189,248,0.3)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
               >
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ position: 'relative', display: 'flex', width: '10px', height: '10px' }}>
                      <motion.div 
                        animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#38bdf8' }}
                      />
                      <div style={{ position: 'relative', width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }}></div>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>API Latency: <span style={{ color: '#38bdf8' }}>12ms</span></span>
                 </div>
                 <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }}></div>
                 <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>Active AI Nodes: <span style={{ color: '#fff' }}>1,204</span></div>
               </motion.div>

               <motion.div 
                 animate={{ y: [8, -8, 8] }}
                 transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                 style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)', padding: '12px 20px', borderRadius: '100px', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
               >
                 <ShieldCheck size={16} color="#34d399" />
                 <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>Uptime: <span style={{ color: '#34d399' }}>99.999%</span></span>
               </motion.div>
           </div>

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

      {/* Personas Section */}
      <section style={{ padding: '60px 64px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
         <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
               <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-1px' }}>Built for the entire care continuum</h2>
               <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '600px', margin: '16px auto 0' }}>From the loading dock to the patient's bedside, MediStock empowers every role with purpose-built tools.</p>
            </motion.div>
         </div>
         
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {[
              { role: "Hospital Admins", desc: "Gain global visibility across all facilities. Cut carrying costs by 30% and eliminate compliance fines.", color: "#818cf8", bg: "rgba(99,102,241,0.1)" },
              { role: "Head Pharmacists", desc: "Automate predictive reordering, generate instant DEA/FDA audit logs, and manage cold-chain logistics.", color: "#34d399", bg: "rgba(16,185,129,0.1)" },
              { role: "Floor Nurses", desc: "Never search for critical meds again. One-tap bedside dispensing and instant AI-driven low-stock alerts.", color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
              { role: "Logistics Drivers", desc: "Ensure real-time chain of custody with digital signatures and continuous GPS-linked temperature tracking.", color: "#f87171", bg: "rgba(239,68,68,0.1)" }
            ].map((persona, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, background: 'rgba(30,41,59,0.9)', borderColor: persona.color }}
                style={{ background: 'rgba(15,23,42,0.5)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ width: '48px', height: '48px', background: persona.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: persona.color, border: `1px solid ${persona.color}40` }}>
                   <Activity size={24} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0', color: '#fff' }}>{persona.role}</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0, fontSize: '15px' }}>{persona.desc}</p>
              </motion.div>
            ))}
         </div>
      </section>

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
           
           {/* Interactive Terminal Widget spanning remaining space */}
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-50px" }}
             transition={{ delay: 0.5, duration: 0.6 }}
             whileHover={{ scale: 1.02 }}
             style={{ background: 'rgba(15,23,42,0.8)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(99,102,241,0.3)', gridColumn: '1 / -1', display: 'flex', gap: '40px', alignItems: 'center', boxShadow: '0 10px 40px -10px rgba(99,102,241,0.2)' }}
           >
              <div style={{ flex: 1 }}>
                 <div style={{ width: '56px', height: '56px', background: 'rgba(99,102,241,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Terminal size={28} />
                 </div>
                 <h3 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '-1px' }}>Developer API</h3>
                 <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px 0', fontSize: '18px' }}>Integrate MediStock's AI directly into your existing ERP or hospital management system with our robust RESTful architecture.</p>
                 <button style={{ padding: '12px 24px', background: 'transparent', color: '#818cf8', border: '1px solid #818cf8', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>Read Documentation <ArrowRight size={16}/></button>
              </div>
              <div style={{ flex: 1.5, background: '#0f172a', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', position: 'relative', overflow: 'hidden', height: '240px', display: 'flex', alignItems: 'center' }}>
                 <div style={{ position: 'absolute', top: '12px', left: '16px', display: 'flex', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></div>
                    <div style={{ width: '10px', height: '10px', background: '#eab308', borderRadius: '50%' }}></div>
                    <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%' }}></div>
                 </div>
                 <motion.pre 
                   key={activeCode}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.4 }}
                   style={{ color: '#38bdf8', fontSize: '14px', lineHeight: 1.8, margin: 0, marginTop: '20px', whiteSpace: 'pre-wrap' }}
                 >
                   {codeSnippets[activeCode]}
                 </motion.pre>
              </div>
           </motion.div>
        </div>
      </section>
      
      {/* Footer CTA */}
      <section style={{ padding: '120px 64px 60px', position: 'relative', zIndex: 10 }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            {/* Glowing background blob behind CTA */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
            
            <motion.div 
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '32px', padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden', zIndex: 1, boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}
            >
               {/* Animated gradient top border inside card */}
               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #38bdf8, #818cf8, #34d399, #38bdf8)', backgroundSize: '300% 100%', animation: 'gradientMove 4s linear infinite' }}></div>
               
               <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: '#34d399' }}><CheckCircle2 size={14}/> HIPAA Compliant</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: '#818cf8' }}><CheckCircle2 size={14}/> ISO 27001 Certified</div>
               </div>

               <h2 style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '24px', marginTop: 0 }}>Ready to modernize your pharmacy?</h2>
               <p style={{ color: '#94a3b8', fontSize: '20px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: 1.6 }}>Join 500+ modern clinics using MediStock to eliminate stockouts, reduce waste, and automate compliance.</p>
               
               <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                  <motion.button 
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => navigate('/register')}
                     style={{ padding: '20px 48px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(99,102,241,0.5)' }}>
                     Start Your Free Trial
                  </motion.button>
                  <motion.button 
                     whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                     whileTap={{ scale: 0.95 }}
                     style={{ padding: '20px 48px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', fontSize: '18px', fontWeight: 600, cursor: 'pointer' }}>
                     Talk to Sales
                  </motion.button>
               </div>
               <p style={{ color: '#64748b', fontSize: '14px', marginTop: '24px', fontWeight: 500 }}>14-day free trial. No credit card required.</p>
            </motion.div>
         </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '60px', paddingBottom: '40px', paddingLeft: '64px', paddingRight: '64px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', marginBottom: '60px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                 <div style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', padding: '8px', borderRadius: '10px' }}>
                    <Activity size={20} color="#fff" />
                 </div>
                 <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>MediStock<span style={{ color: '#6366f1' }}>.pro</span></span>
               </div>
               <p style={{ color: '#64748b', lineHeight: 1.6, maxWidth: '300px' }}>The intelligent operating system for modern clinical supply chains. Predict demand, eliminate waste, and stay compliant.</p>
            </div>
            <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
               <div>
                  <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '20px', fontSize: '15px' }}>Product</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>AI Forecasting</a>
                     <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Edge Vision</a>
                     <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Digital Twin</a>
                     <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Developer API</a>
                  </div>
               </div>
               <div>
                  <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '20px', fontSize: '15px' }}>Company</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>About Us</a>
                     <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Careers</a>
                     <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Blog</a>
                     <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Contact</a>
                  </div>
               </div>
               <div>
                  <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '20px', fontSize: '15px' }}>Legal</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Privacy Policy</a>
                     <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Terms of Service</a>
                     <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>HIPAA Compliance</a>
                  </div>
               </div>
            </div>
         </div>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px', color: '#64748b', fontSize: '14px' }}>
            <p margin="0">&copy; 2026 MediStock Inc. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '24px' }}>
               <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#64748b'}>Twitter</a>
               <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#64748b'}>LinkedIn</a>
               <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#64748b'}>GitHub</a>
            </div>
         </div>
      </footer>

      {/* Global styles for animation */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

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
