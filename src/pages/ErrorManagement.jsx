import React from 'react';
import { ShieldAlert, AlertOctagon, CheckCircle2, Clock, Search, Filter } from 'lucide-react';

export function ErrorManagement({ setToast }) {
  const errors = [
    { id: "ERR-2026-9A1B", type: "TypeError", endpoint: "POST /api/v1/inventory/dispense", frequency: 42, firstSeen: "2026-10-01T14:20:00Z", lastSeen: "2026-10-02T19:40:00Z", severity: "HIGH", status: "INVESTIGATING", reqId: "REQ-2026-XXXX1" },
    { id: "ERR-2026-8C2D", type: "DatabaseTimeout", endpoint: "GET /api/v1/reports/financial", frequency: 12, firstSeen: "2026-10-02T08:15:00Z", lastSeen: "2026-10-02T08:30:00Z", severity: "CRITICAL", status: "MITIGATED", reqId: "REQ-2026-XXXX2" },
    { id: "ERR-2026-7E3F", type: "AITimeoutException", endpoint: "POST /api/v1/ai/predict", frequency: 156, firstSeen: "2026-09-28T10:00:00Z", lastSeen: "2026-10-02T18:12:00Z", severity: "WARNING", status: "NEW", reqId: "REQ-2026-XXXX3" }
  ];

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow" style={{ color: 'var(--rose)' }}>SYSTEM RELIABILITY</span>
          <h1>Error Management Center</h1>
          <p>Global exception tracking and incident triage</p>
        </div>
        <div className="heading-actions">
           <button className="secondary" onClick={() => setToast && setToast("Opening incident filters...")}><Filter size={16}/> Filter</button>
        </div>
      </div>

      <div className="table-wrapper" style={{ marginTop: '24px' }}>
         <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
           <thead>
             <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>
               <th style={{ padding: '12px' }}>Error ID / Type</th>
               <th style={{ padding: '12px' }}>Endpoint</th>
               <th style={{ padding: '12px' }}>Frequency</th>
               <th style={{ padding: '12px' }}>Latest Occurrence</th>
               <th style={{ padding: '12px' }}>Severity</th>
               <th style={{ padding: '12px' }}>Status</th>
               <th style={{ padding: '12px' }}>Action</th>
             </tr>
           </thead>
           <tbody>
             {errors.map(err => (
               <tr key={err.id} style={{ borderBottom: '1px solid var(--line)' }}>
                 <td style={{ padding: '12px' }}>
                    <b style={{ color: 'var(--text)' }}>{err.id}</b>
                    <div style={{ fontSize: '12px', color: 'var(--rose)', fontWeight: 600, marginTop: '4px' }}>{err.type}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>Ref: {err.reqId}</div>
                 </td>
                 <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text)', fontFamily: 'monospace' }}>
                    {err.endpoint}
                 </td>
                 <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text)' }}>
                    {err.frequency} events
                 </td>
                 <td style={{ padding: '12px', fontSize: '12px', color: 'var(--muted)' }}>
                    {new Date(err.lastSeen).toLocaleString()}
                 </td>
                 <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: err.severity==='CRITICAL'?'rgba(244,63,94,0.1)':'rgba(245,158,11,0.1)', color: err.severity==='CRITICAL'?'var(--rose)':'var(--amber)' }}>
                      {err.severity}
                    </span>
                 </td>
                 <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: err.status==='NEW'?'rgba(244,63,94,0.1)':'var(--surface)', color: err.status==='NEW'?'var(--rose)':'var(--text)', border: '1px solid var(--line)' }}>
                      {err.status}
                    </span>
                 </td>
                 <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                       {err.status !== 'RESOLVED' && <button className="secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => setToast && setToast("Updating incident status to MITIGATED...")}>Acknowledge</button>}
                       <button className="primary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => setToast && setToast("Loading stack trace and distributed trace...")}>Trace</button>
                    </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  );
}
