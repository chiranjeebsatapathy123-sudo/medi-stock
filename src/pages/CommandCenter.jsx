import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, BarChart3, AlertTriangle, TrendingDown, Clock3, ShieldAlert, CheckCircle2, Bot, BrainCircuit, Activity } from 'lucide-react';
import { db } from '../services/mockDb';

const data = [
  { name: 'Jan', value: 2.1 },
  { name: 'Feb', value: 2.4 },
  { name: 'Mar', value: 2.3 },
  { name: 'Apr', value: 2.8 },
  { name: 'May', value: 3.2 },
  { name: 'Jun', value: 3.8 },
  { name: 'Jul', value: 4.1 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export function CommandCenter({ setActive, setToast }) {
  const totalValue = db.batches.reduce((sum, b) => sum + (b.currentQty * b.purchasePrice), 0);
  const expiringValue = db.batches.filter(b => new Date(b.expiryDate) < new Date(Date.now() + 90*86400000)).reduce((sum, b) => sum + (b.currentQty * b.purchasePrice), 0);
  
  const lowStockCount = db.medicines.filter(m => {
    const total = db.batches.filter(b => b.medicineId === m.id).reduce((s,b)=>s+b.currentQty, 0);
    return total <= m.reorderLevel;
  }).length;

  const [aiMode, setAiMode] = useState(false);

  return (
    <motion.div 
      className="page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
    >
      {/* 3D Background Glowing Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(27,180,162,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', color: 'var(--brand)', textTransform: 'uppercase' }}>Command Center 3.0</span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: 'var(--text)' }}>Executive Nexus</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>Real-time 3D intelligence & operational motion graphs.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAiMode(!aiMode)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px',
            background: aiMode ? 'var(--primary-soft)' : 'var(--surface)',
            border: `1px solid ${aiMode ? 'var(--primary)' : 'var(--line)'}`,
            color: aiMode ? 'var(--primary)' : 'var(--text)',
            fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s',
            boxShadow: aiMode ? '0 0 20px rgba(27,180,162,0.2)' : 'var(--shadow)'
          }}
        >
          {aiMode ? <BrainCircuit size={18} /> : <Activity size={18} />}
          {aiMode ? "AI MODE: ON" : "AI MODE: OFF"}
        </motion.button>
      </div>

      {aiMode && (
        <motion.div variants={itemVariants} style={{ marginBottom: '32px', padding: '24px', background: 'var(--primary-soft)', borderRadius: '24px', border: '1px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '12px', color: '#fff' }}><Bot size={20}/></div>
                <div>
                  <h3 style={{ color: 'var(--primary-2)', margin: 0, fontSize: '16px', fontWeight: 700 }}>AI Operations Oversight</h3>
                  <p style={{ color: 'var(--primary)', margin: '4px 0 0 0', fontSize: '12px' }}>Live neural observation overlay is active.</p>
                </div>
             </div>
             <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '12px', boxShadow: '0 4px 14px rgba(27,180,162,0.4)' }} onClick={() => setActive("AI Operations")}>Open Hub</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
             {[
               { icon: Bot, val: '14', label: 'Live Situations', color: 'var(--blue)' },
               { icon: AlertTriangle, val: '3', label: 'Recommendations', color: 'var(--amber)' },
               { icon: ShieldCheck, val: '5', label: 'Pending Approvals', color: 'var(--brand)' },
               { icon: CheckCircle2, val: '98%', label: 'Agent Health', color: 'var(--green)' }
             ].map((stat, i) => (
               <div key={i} style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
                 <stat.icon size={16} style={{ color: stat.color, marginBottom: '8px' }}/>
                 <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>{stat.val}</div>
                 <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{stat.label}</div>
               </div>
             ))}
          </div>
        </motion.div>
      )}

      {/* KPI Cards */}
      <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
        {[
          { icon: BarChart3, title: 'Total Inventory Value', value: `₹${(totalValue/100000).toFixed(2)}L`, change: '+2.4%', color: 'var(--green)', bg: 'rgba(33, 133, 91, 0.1)' },
          { icon: AlertTriangle, title: 'Expiry Exposure (90D)', value: `₹${(expiringValue/1000).toFixed(1)}k`, change: '+1.2%', color: 'var(--rose)', bg: 'rgba(190, 75, 101, 0.1)' },
          { icon: TrendingDown, title: 'Stockout Risk Profile', value: lowStockCount, change: '-4', color: 'var(--amber)', bg: 'rgba(183, 121, 31, 0.1)' },
          { icon: ShieldAlert, title: 'Critical Open Issues', value: '3', change: '-1', color: 'var(--blue)', bg: 'rgba(37, 99, 235, 0.1)' }
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5, boxShadow: `0 20px 40px -10px ${kpi.bg}` }}
            style={{
              background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)',
              borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ background: kpi.bg, color: kpi.color, padding: '10px', borderRadius: '12px' }}>
                <kpi.icon size={20} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: kpi.color, background: kpi.bg, padding: '4px 8px', borderRadius: '8px' }}>{kpi.change}</span>
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>{kpi.value}</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, fontWeight: 500 }}>{kpi.title}</p>
            {/* 3D glow effect inside card */}
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '100px', height: '100px', background: kpi.color, filter: 'blur(50px)', opacity: 0.15, pointerEvents: 'none' }} />
          </motion.div>
        ))}
      </motion.div>

      {/* Motion Graph & AI Action Center */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', position: 'relative', zIndex: 1 }}>
        <motion.div variants={itemVariants} style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)', borderRadius: '24px', padding: '24px', position: 'relative' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <div>
               <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Valuation Trajectory</h3>
               <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0 0' }}>Interactive 3D Motion Graph</p>
             </div>
             <div style={{ display: 'flex', gap: '8px', background: 'var(--bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
               {['1M', '3M', '6M', '1Y'].map(t => (
                 <button key={t} style={{ background: t === '6M' ? 'var(--brand)' : 'transparent', color: t === '6M' ? '#fff' : 'var(--muted)', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>{t}</button>
               ))}
             </div>
           </div>
           
           <div style={{ height: '300px', width: '100%' }}>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1bb4a2" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#1bb4a2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}L`} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px', color: 'var(--text)', boxShadow: 'var(--shadow)' }}
                    itemStyle={{ color: '#1bb4a2', fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#1bb4a2" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 6, fill: '#1bb4a2', stroke: 'var(--surface)', strokeWidth: 2, boxShadow: '0 0 10px #1bb4a2' }} />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
           <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Sparkles size={18} color="var(--brand)"/> Action Center
           </h3>
           <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 24px 0' }}>Requires executive authorization</p>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {[
                { title: 'REVIEW EXPIRY', desc: 'Ceftriaxone 1g (Batch CEF)', time: '2h ago', color: 'var(--rose)' },
                { title: 'APPROVE PURCHASE', desc: 'PO-2026-189 • NovaMed', time: '4h ago', color: 'var(--blue)' },
                { title: 'INVESTIGATE', desc: 'Pharmacy count discrepancy', time: '1d ago', color: 'var(--amber)' },
              ].map((act, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '16px', borderLeft: `3px solid ${act.color}`, border: '1px solid var(--line)', borderLeftWidth: '3px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e)=>e.currentTarget.style.transform='translateX(4px)'} onMouseOut={(e)=>e.currentTarget.style.transform='translateX(0)'}>
                   <div style={{ flex: 1 }}>
                     <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0', letterSpacing: '1px' }}>{act.title}</h4>
                     <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>{act.desc}</p>
                   </div>
                   <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{act.time}</span>
                </div>
              ))}
           </div>
           <button style={{ width: '100%', padding: '14px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginTop: '16px', boxShadow: '0 4px 20px rgba(27,180,162,0.3)', transition: 'all 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={(e)=>e.currentTarget.style.transform='translateY(0)'}>
             Resolve All Actions
           </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
