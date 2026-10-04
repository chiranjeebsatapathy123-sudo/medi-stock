import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ThermometerSnowflake, Camera, HardDrive, Wrench, AlertTriangle, CheckCircle2, Zap, Server } from 'lucide-react';
import { facilityService } from '../services/facilityService';

export function SmartFacilityCenter({ setToast }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [facilityData, setFacilityData] = useState({ edgeDevices: [], facilityIncidents: [], visionEvents: [], maintenanceTasks: [] });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await facilityService.getOverview();
      setFacilityData(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const devices = facilityData.edgeDevices || [];
  const incidents = facilityData.facilityIncidents || [];
  const visionEvents = facilityData.visionEvents || [];
  const maintenance = facilityData.maintenanceTasks || [];

  const onlineDevices = devices.filter(d => d.status === 'ONLINE' || d.status === 'ACTIVE').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'HIGH' && (i.status === 'OPEN' || i.resolved === false)).length;
  const pendingVision = visionEvents.filter(v => v.status === 'NEEDS_REVIEW' || v.resolved === false).length;
  const overdueMaintenance = maintenance.filter(m => m.status === 'OVERDUE').length;

  const healthScore = Math.max(0, 100 - (criticalIncidents * 10) - (overdueMaintenance * 5) - (pendingVision * 2));

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow" style={{ color: 'var(--brand)' }}>SMART WAREHOUSE</span>
          <h1>Smart Facility Command Center</h1>
          <p>IoT, Edge AI, Environmental Health & Capacity</p>
        </div>
        <div className="heading-actions">
           <button className="secondary font-bold" onClick={() => navigate('/vision-queue')}><Camera size={16}/> Vision Queue ({pendingVision})</button>
           <button className="primary font-bold" onClick={() => navigate('/digital-twin')}><Server size={16}/> Digital Twin</button>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon" style={{ background: healthScore > 90 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: healthScore > 90 ? 'var(--green)' : 'var(--amber)' }}><Activity size={19}/></div></div>
          <div className="stat-value">{healthScore}/100</div><div className="stat-label">Facility Health</div><div className="stat-detail">Based on capacity & incidents</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue)' }}><HardDrive size={19}/></div></div>
          <div className="stat-value">{onlineDevices}/{devices.length}</div><div className="stat-label">Edge Devices</div><div className="stat-detail">Online and syncing</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon" style={{ background: criticalIncidents > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: criticalIncidents > 0 ? 'var(--rose)' : 'var(--green)' }}><ThermometerSnowflake size={19}/></div></div>
          <div className="stat-value">{criticalIncidents}</div><div className="stat-label">Active Incidents</div><div className="stat-detail">Environmental alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon" style={{ background: overdueMaintenance > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: overdueMaintenance > 0 ? 'var(--amber)' : 'var(--green)' }}><Wrench size={19}/></div></div>
          <div className="stat-value">{overdueMaintenance}</div><div className="stat-label">Overdue Maintenance</div><div className="stat-detail">Requires immediate action</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-head">
            <div><h3>Facility Incidents & Anomalies</h3><p>Environmental and hardware alerts</p></div>
          </div>
          <div className="table-wrapper">
             <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                   <th style={{ padding: '12px' }}>Incident ID</th>
                   <th style={{ padding: '12px' }}>Location / Sensor</th>
                   <th style={{ padding: '12px' }}>Condition</th>
                   <th style={{ padding: '12px' }}>Severity</th>
                   <th style={{ padding: '12px' }}>Action</th>
                 </tr>
               </thead>
               <tbody>
                 {incidents.length === 0 ? (
                   <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>No active incidents.</td></tr>
                 ) : incidents.map(inc => (
                   <tr key={inc.id} style={{ borderBottom: '1px solid var(--line)' }}>
                     <td style={{ padding: '12px' }}>
                        <b style={{ color: 'var(--text)' }}>{inc.id}</b>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{inc.reportedAt ? new Date(inc.reportedAt).toLocaleTimeString() : new Date().toLocaleTimeString()}</div>
                     </td>
                     <td style={{ padding: '12px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{inc.locationId}</div>
                     </td>
                     <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text)' }}>{inc.incidentType || inc.condition}</td>
                     <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: inc.severity==='HIGH'?'rgba(244,63,94,0.1)':'rgba(245,158,11,0.1)', color: inc.severity==='HIGH'?'var(--rose)':'var(--amber)' }}>
                          {inc.severity}
                        </span>
                     </td>
                     <td style={{ padding: '12px' }}>
                        <button className="secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => setToast("Opening investigation workflow...")}>Investigate</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </section>

        <section className="panel" style={{ gridColumn: 'span 1' }}>
          <div className="panel-head">
            <div><h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}><Zap size={16}/> AI Facility Copilot</h3><p>Predictive maintenance & storage</p></div>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <div style={{ padding: '12px', background: 'var(--primary-soft)', border: '1px solid var(--primary)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                   <b style={{ fontSize: '13px', color: 'var(--text)' }}>Quarantine Recommendation</b>
                   <span style={{ fontSize: '10px', background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>HIGH RISK</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 12px 0' }}>Due to Incident INC-2026-001 (Temperature Spike), batch CEF-26A5 in Cold Room 1 may be compromised. Recommend immediate quarantine pending QC review.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button style={{ flex: 1, padding: '6px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setToast("Routing to QC for approval...")}>Propose Quarantine</button>
                </div>
             </div>
             
             <div style={{ padding: '12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px' }}>
                <b style={{ fontSize: '13px', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Storage Rebalancing</b>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 8px 0' }}>Central Rack 1, Shelf A is at 96% capacity. AI recommends transferring 500 units of Paracetamol to Rack 2, Shelf B.</p>
                <button style={{ padding: '6px 12px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View Transfer Plan</button>
             </div>
          </div>
        </section>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <section className="panel" style={{ gridColumn: 'span 3' }}>
          <div className="panel-head">
            <div><h3>Edge Computing Registry</h3><p>Sensors, cameras, and local compute nodes</p></div>
          </div>
          <div className="table-wrapper">
             <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                   <th style={{ padding: '12px' }}>Device ID</th>
                   <th style={{ padding: '12px' }}>Type & Location</th>
                   <th style={{ padding: '12px' }}>Health Metrics</th>
                   <th style={{ padding: '12px' }}>Firmware</th>
                   <th style={{ padding: '12px' }}>Status</th>
                 </tr>
               </thead>
               <tbody>
                 {devices.map(dev => (
                   <tr key={dev.id} style={{ borderBottom: '1px solid var(--line)' }}>
                     <td style={{ padding: '12px' }}>
                        <b style={{ color: 'var(--text)' }}>{dev.id}</b>
                     </td>
                     <td style={{ padding: '12px' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text)' }}>{dev.type.replace('_', ' ')}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{dev.location}</div>
                     </td>
                     <td style={{ padding: '12px', fontSize: '12px' }}>
                        {dev.cpu && <div>CPU: {dev.cpu}% | MEM: {dev.memory}%</div>}
                        {dev.battery && <div>BAT: {dev.battery}% | {dev.reading}°C</div>}
                     </td>
                     <td style={{ padding: '12px', fontSize: '12px', color: 'var(--muted)' }}>{dev.firmware || dev.modelVersion || 'N/A'}</td>
                     <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: dev.status==='ONLINE'?'rgba(16,185,129,0.1)':'rgba(244,63,94,0.1)', color: dev.status==='ONLINE'?'var(--green)':'var(--rose)' }}>
                          {dev.status}
                        </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </section>
      </div>
    </div>
  );
}
