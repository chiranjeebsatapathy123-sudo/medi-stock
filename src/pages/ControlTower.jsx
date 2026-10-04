import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, CheckCircle, ShieldAlert, ThermometerSnowflake, Truck, Clock, Crosshair, ArrowRight, Activity, Search, RefreshCw, Zap } from 'lucide-react';

export function ControlTower({ setToast }) {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [status, setStatus] = useState('LIVE');
  const [events, setEvents] = useState([]);
  const [risks, setRisks] = useState([]);

  // Simulate incoming real-time SSE stream
  useEffect(() => {
    // TODO: Connect to backend SSE endpoint
    setStatus('LIVE');
    setLastUpdate(new Date());
  }, []);

  // Initialize risks based on actual DB
  useEffect(() => {
    // TODO: Fetch risks from backend API
     setRisks([
       {
          id: 'RSK-PRED-1',
          type: 'Supplier Delay',
          severity: 'HIGH',
          entity: 'Cureline Pharma',
          evidence: 'Predictive Twin indicates 85% probability of 4-day delay on upcoming shipment based on regional weather.',
          state: 'PREDICTED'
       }
     ]);
  }, []);

  return (
    <div className="page fade-in">
      {/* Header & Status */}
      <div className="page-heading" style={{ marginBottom: '16px' }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--brand)' }}>OPERATIONS COCKPIT</span>
          <h1>MediStock Control Tower</h1>
          <p>Real-time operational awareness and centralized action management.</p>
        </div>
        <div className="heading-actions">
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--surface)', borderRadius: '20px', border: `1px solid ${status === 'LIVE' ? 'var(--green)' : 'var(--amber)'}`, fontSize: '12px', fontWeight: 600, color: status === 'LIVE' ? 'var(--green)' : 'var(--amber)' }}>
              {status === 'LIVE' ? <Radio size={14} className="pulse"/> : <RefreshCw size={14} className="spin"/>}
              {status} • {lastUpdate.toLocaleTimeString()}
           </div>
           <button className="primary" onClick={() => setToast && setToast("Opening ask AI Operations Copilot...")}><Zap size={16}/> Ask AI</button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
         
         {/* Live Event Stream */}
         <section className="panel" style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-head">
               <div><h3>Live Event Stream</h3><p>Real-time telemetry and state changes</p></div>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '500px' }}>
               {events.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '13px' }}>Waiting for incoming events...</div>
               ) : events.map(evt => (
                  <div key={evt.id} className="fade-in-up" style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${evt.severity === 'CRITICAL' ? 'var(--rose)' : 'var(--amber)'}`, background: 'var(--bg)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                     <div style={{ color: evt.severity === 'CRITICAL' ? 'var(--rose)' : 'var(--amber)' }}>
                        {evt.type.includes('TEMPERATURE') ? <ThermometerSnowflake size={18}/> : <AlertTriangle size={18}/>}
                     </div>
                     <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                           <span style={{ fontSize: '12px', fontWeight: 700, color: evt.severity === 'CRITICAL' ? 'var(--rose)' : 'var(--amber)' }}>{evt.type}</span>
                           <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px' }}>{evt.entity}</div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>ID: {evt.id}</div>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Predictive Risk Radar */}
         <section className="panel" style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-head">
               <div><h3>Predictive Risk Radar</h3><p>Vulnerabilities detected by the Digital Twin</p></div>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '500px' }}>
               {risks.map(risk => (
                  <div key={risk.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setToast("Opening Risk Evidence Drawer...")}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <Crosshair size={14} color="var(--brand)"/>
                           <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{risk.entity}</span>
                        </div>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: risk.state==='PREDICTED'?'rgba(59, 130, 246, 0.1)':'rgba(244, 63, 94, 0.1)', color: risk.state==='PREDICTED'?'var(--blue)':'var(--rose)' }}>{risk.state}</span>
                     </div>
                     <div style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 600, marginBottom: '4px' }}>{risk.type}</div>
                     <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>{risk.evidence}</p>
                     
                     <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button className="secondary" style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }}>Investigate</button>
                        <button className="secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>Dismiss</button>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Action Center */}
         <section className="panel" style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-head">
               <div><h3>Action Center</h3><p>Assigned mitigations and draft approvals</p></div>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '500px' }}>
               
               <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--blue)', background: 'rgba(59, 130, 246, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--blue)' }}>WAITING_APPROVAL</span>
                     <span style={{ fontSize: '11px', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Due in 2h</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Draft PO: Paracetamol 500mg</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>Mitigation for simulated Scenario SCN-TEST.</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <button className="primary" style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }} onClick={() => setToast("Draft PO Approved and Submitted.")}>Approve</button>
                     <button className="secondary" style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }} onClick={() => setToast("Draft Rejected.")}>Reject</button>
                  </div>
               </div>

               <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)' }}>IN_PROGRESS</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Quarantine Inspection: Batch AMX-24F8</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>Assigned to: Quality Team</div>
                  <button className="secondary" style={{ fontSize: '11px', padding: '4px 8px', width: '100%' }}>View Details</button>
               </div>

            </div>
         </section>

      </div>
    </div>
  );
}
