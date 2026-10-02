import React from 'react';
import { Activity, Database, Server, Cpu, HardDrive, Wifi, ShieldAlert, Cloud, Radio, Webhook, Zap, RefreshCw } from 'lucide-react';

export function SystemHealth({ setToast }) {
  const healthData = [
    { name: "API Gateway", status: "Healthy", latency: "42ms", icon: <Server size={18}/>, lastFailure: "Never" },
    { name: "PostgreSQL Database", status: "Healthy", latency: "12ms", icon: <Database size={18}/>, lastFailure: "4 days ago" },
    { name: "Redis Cache", status: "Degraded", latency: "150ms", icon: <Zap size={18}/>, lastFailure: "2 hours ago" },
    { name: "Background Workers", status: "Healthy", latency: "N/A", icon: <Cpu size={18}/>, lastFailure: "12 days ago" },
    { name: "S3 Object Storage", status: "Healthy", latency: "85ms", icon: <HardDrive size={18}/>, lastFailure: "Never" },
    { name: "AI Provider (OpenAI)", status: "Healthy", latency: "850ms", icon: <Cloud size={18}/>, lastFailure: "1 day ago" },
    { name: "IoT Message Broker", status: "Healthy", latency: "15ms", icon: <Radio size={18}/>, lastFailure: "Never" },
    { name: "Webhook Dispatcher", status: "Healthy", latency: "N/A", icon: <Webhook size={18}/>, lastFailure: "5 days ago" }
  ];

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow" style={{ color: 'var(--blue)' }}>OBSERVABILITY</span>
          <h1>System Health</h1>
          <p>Production Dependency Status & Telemetry</p>
        </div>
        <div className="heading-actions">
           <button className="secondary" onClick={() => setToast && setToast("Running diagnostic ping...")}><RefreshCw size={16}/> Refresh Diagnostics</button>
           <button className="primary" onClick={() => { throw new Error("Simulated Production Crash for Error Boundary testing"); }}><ShieldAlert size={16}/> Simulate Crash</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {healthData.map(dep => (
           <div key={dep.name} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontWeight: 600 }}>
                    <div style={{ color: dep.status === 'Healthy' ? 'var(--green)' : 'var(--amber)' }}>{dep.icon}</div>
                    {dep.name}
                 </div>
                 <div style={{ 
                   fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', 
                   background: dep.status === 'Healthy' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                   color: dep.status === 'Healthy' ? 'var(--green)' : 'var(--amber)' 
                 }}>
                   {dep.status}
                 </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' }}>
                 <div>Latency: <b style={{ color: 'var(--text)' }}>{dep.latency}</b></div>
                 <div>Last Failure: <b>{dep.lastFailure}</b></div>
              </div>
           </div>
        ))}
      </div>
      
      <div className="panel" style={{ marginTop: '24px' }}>
         <div className="panel-head">
            <div><h3>Liveness & Readiness</h3><p>Internal Endpoint Validation</p></div>
         </div>
         <div style={{ padding: '16px', display: 'flex', gap: '24px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)' }}/> /health/live (2ms)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)' }}/> /health/ready (18ms)</div>
         </div>
      </div>
    </div>
  );
}
