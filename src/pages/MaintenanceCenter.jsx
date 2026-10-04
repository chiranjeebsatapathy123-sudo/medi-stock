import React from 'react';
import { Wrench, CalendarClock, PenTool, CheckCircle2, AlertTriangle } from 'lucide-react';
const db = { visionEvents: [], edgeDevices: [], facilityIncidents: [], maintenanceTasks: [], shipments: [], locations: [], chainOfCustody: [], exceptions: [], proofOfDelivery: [], drivers: [], vehicles: [] };

export function MaintenanceCenter({ setToast }) {
  const maintenance = db.maintenanceTasks || [];

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow" style={{ color: 'var(--brand)' }}>FACILITY OPERATIONS</span>
          <h1>Maintenance Center</h1>
          <p>Asset management, preventative maintenance & calibration</p>
        </div>
        <div className="heading-actions">
           <button className="primary font-bold" onClick={() => setToast("Creating work order...")}><Wrench size={16}/> New Work Order</button>
        </div>
      </div>

      <div className="table-wrapper">
         <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
           <thead>
             <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>
               <th style={{ padding: '12px' }}>Task ID</th>
               <th style={{ padding: '12px' }}>Asset</th>
               <th style={{ padding: '12px' }}>Type & Description</th>
               <th style={{ padding: '12px' }}>Due Date</th>
               <th style={{ padding: '12px' }}>Status</th>
               <th style={{ padding: '12px' }}>Action</th>
             </tr>
           </thead>
           <tbody>
             {maintenance.map(mnt => (
               <tr key={mnt.id} style={{ borderBottom: '1px solid var(--line)' }}>
                 <td style={{ padding: '12px' }}>
                    <b style={{ color: 'var(--text)' }}>{mnt.id}</b>
                 </td>
                 <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>
                    {mnt.assetId}
                 </td>
                 <td style={{ padding: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>{mnt.type}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{mnt.description}</div>
                 </td>
                 <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text)' }}>
                    {new Date(mnt.dueDate).toLocaleDateString()}
                 </td>
                 <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: mnt.status==='OVERDUE'?'rgba(244,63,94,0.1)':'rgba(59,130,246,0.1)', color: mnt.status==='OVERDUE'?'var(--rose)':'var(--blue)' }}>
                      {mnt.status}
                    </span>
                 </td>
                 <td style={{ padding: '12px' }}>
                    <button className="secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => setToast("Opening completion workflow...")}>Complete</button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  );
}
