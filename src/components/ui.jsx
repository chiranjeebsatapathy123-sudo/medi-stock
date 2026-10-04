import React from "react";
import { AlertTriangle, Clock3, Search, ShieldCheck, X } from "lucide-react";

export function StatCard({ icon: Icon, label, value, change, detail, tone }) {
  return <div className="stat-card tilt-card">
    <div className="stat-head"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><span className={change?.startsWith("+")?"positive":"negative"}>{change}</span></div>
    <div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-detail">{detail}</div>
  </div>;
}

export function MiniChart() {
  const points = [42,55,48,71,65,78,69,88,82,96,91,105];
  const max = 110;
  return <div className="chart-wrap">
    <div className="chart-grid">{[0,1,2,3].map(x=><span key={x}/>)}</div>
    <svg viewBox="0 0 600 190" preserveAspectRatio="none" className="chart-svg">
      <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopOpacity=".25"/><stop offset="100%" stopOpacity="0"/></linearGradient></defs>
      <path d={`M 0 190 L ${points.map((p,i)=>`${i*(600/(points.length-1))} ${190-(p/max)*160}`).join(" L ")} L 600 190 Z`} fill="url(#fill)" />
      <polyline fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points.map((p,i)=>`${i*(600/(points.length-1))},${190-(p/max)*160}`).join(" ")}/>
    </svg>
    <div className="chart-labels">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(x=><span key={x}>{x}</span>)}</div>
  </div>;
}

export function Status({ value }) {
  const lowerValue = value.toLowerCase();
  
  let cls = "healthy";
  let Icon = ShieldCheck;
  
  if (lowerValue.includes("low")) {
    cls = "low-stock";
    Icon = AlertTriangle;
  } else if (lowerValue.includes("expir")) {
    cls = "expiring";
    Icon = Clock3;
  } else if (lowerValue.includes("out of stock") || lowerValue.includes("critical")) {
    cls = "out-of-stock";
    Icon = AlertTriangle; // Or use XCircle if you prefer, AlertTriangle is fine.
  } else if (lowerValue.includes("archived") || lowerValue.includes("inactive")) {
    cls = "archived";
    Icon = Clock3;
  }

  return <span className={`status ${cls}`}><Icon size={13}/> {value}</span>;
}

export function Modal({ title, close, children }) {
  return <div className="modal-backdrop" onMouseDown={close}>
    <div className="modal" onMouseDown={e=>e.stopPropagation()}>
      <div className="modal-head">
        <div><span className="eyebrow">MEDISTOCK</span><h2>{title}</h2></div>
        <button type="button" className="icon-btn flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" onClick={close} aria-label="Close modal">
          <X size={18} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" />
        </button>
      </div>
      {children}
    </div>
  </div>;
}

export function GenericPage({ title, eyebrow, icon: Icon, description, action, children }) {
  return <div className="page">
    <div className="page-heading">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      {action&&<button className="primary">{action}</button>}
    </div>
    {children||<section className="empty-feature panel"><div className="feature-icon"><Icon size={25}/></div><h2>{title} workspace</h2><p>This production-ready module is structured for API integration, role-based permissions, audit trails and real-time updates.</p><button className="secondary">Configure module ›</button></section>}
  </div>;
}

export function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return <div className="empty-feature panel" style={{marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center'}}>
    <div className="feature-icon" style={{marginBottom: '16px', color: 'var(--brand)'}}><Icon size={32}/></div>
    <h3 style={{fontSize: '18px', fontWeight: 500, marginBottom: '8px'}}>{title}</h3>
    <p style={{color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', maxWidth: '400px'}}>{description}</p>
    {actionText && <button className="primary" onClick={onAction}>{actionText}</button>}
  </div>;
}