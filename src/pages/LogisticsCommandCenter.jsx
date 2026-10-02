import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Map, AlertTriangle, Snowflake, Package, Clock, ShieldCheck, Zap, MoreHorizontal, User, Navigation, Activity } from 'lucide-react';
import { db } from '../services/mockDb';
import { ShipmentTracker } from './ShipmentTracker';
import { Modal } from '../components/ui';

export function LogisticsCommandCenter({ setActive, setToast }) {
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [showNewShipment, setShowNewShipment] = useState(false);
  const [newShipmentForm, setNewShipmentForm] = useState({ destination: 'LOC-ICU', priority: 'NORMAL', items: 100 });
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({ reroute: true, consolidate: true });
  const [exceptions, setExceptions] = useState(db.exceptions || []);

  const shipments = db.shipments || [];
  const inTransit = shipments.filter(s => s.status === 'IN_TRANSIT').length;
  const delayed = exceptions.filter(e => e.type === 'DELAY' && e.status === 'OPEN').length;
  const coldChainActive = shipments.filter(s => s.status === 'IN_TRANSIT' && s.temperatureRequirement !== 'N/A').length;

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow" style={{ color: 'var(--brand)' }}>LOGISTICS DOMAIN</span>
          <h1>Logistics Command Center</h1>
          <p>End-to-End Connected Healthcare Supply Network & Tracking</p>
        </div>
        <div className="heading-actions">
           <button className="secondary font-bold" onClick={() => { setShowRoutePlanner(true); setCalculatingRoute(true); setTimeout(()=>setCalculatingRoute(false), 2000); }}><Map size={16}/> Route Planner</button>
           <button className="primary font-bold" onClick={() => setShowNewShipment(true)}><Package size={16}/> New Shipment</button>
        </div>
      </div>

      {/* Logistics Overview KPI */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue)' }}><Truck size={19}/></div></div>
          <div className="stat-value">{inTransit}</div><div className="stat-label">In Transit</div><div className="stat-detail">Active moving vehicles</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose)' }}><AlertTriangle size={19}/></div></div>
          <div className="stat-value">{delayed}</div><div className="stat-label">Delayed Shipments</div><div className="stat-detail">Exceptions open</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--blue)' }}><Snowflake size={19}/></div></div>
          <div className="stat-value">{coldChainActive}</div><div className="stat-label">Cold Chain</div><div className="stat-detail">Active temp-monitored</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)' }}><Activity size={19}/></div></div>
          <div className="stat-value">98.5%</div><div className="stat-label">On-Time Rate</div><div className="stat-detail">Network 30d avg</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-head">
            <div><h3>Active Transports</h3><p>Live tracking and custody chain</p></div>
          </div>
          <div className="table-wrapper">
             <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                   <th style={{ padding: '12px' }}>Shipment</th>
                   <th style={{ padding: '12px' }}>Route</th>
                   <th style={{ padding: '12px' }}>Status</th>
                   <th style={{ padding: '12px' }}>ETA</th>
                   <th style={{ padding: '12px' }}>Condition</th>
                 </tr>
               </thead>
               <tbody>
                 {shipments.map(ship => {
                   const origin = db.locations.find(l => l.id === ship.origin)?.name || ship.origin;
                   const dest = db.locations.find(l => l.id === ship.destination)?.name || ship.destination;
                   return (
                     <tr key={ship.id} style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }} onClick={() => setSelectedShipment(ship.id)} className="hover-row">
                       <td style={{ padding: '12px' }}>
                          <b style={{ color: 'var(--text)' }}>{ship.id}</b>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Priority: {ship.priority}</div>
                       </td>
                       <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text)' }}>
                          {origin} <span style={{ color: 'var(--muted)' }}>→</span> {dest}
                       </td>
                       <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: ship.status==='IN_TRANSIT'?'rgba(59,130,246,0.1)':'rgba(16,185,129,0.1)', color: ship.status==='IN_TRANSIT'?'var(--blue)':'var(--green)' }}>
                            {ship.status}
                          </span>
                       </td>
                       <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text)' }}>
                          {ship.trackingData?.eta ? new Date(ship.trackingData.eta).toLocaleTimeString() : 'N/A'}
                       </td>
                       <td style={{ padding: '12px' }}>
                          {ship.temperatureRequirement !== 'N/A' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--blue)' }}><Snowflake size={14}/> {ship.temperatureLog?.[ship.temperatureLog.length-1]?.temp || '--'}°C</div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Standard</span>
                          )}
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
          </div>
        </section>

        <section className="panel" style={{ gridColumn: 'span 1' }}>
          <div className="panel-head">
            <div><h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}><Zap size={16}/> AI Logistics Planner</h3><p>Supply network optimization</p></div>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {aiSuggestions.reroute && (
               <div style={{ padding: '12px', background: 'var(--primary-soft)', border: '1px solid var(--primary)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                     <b style={{ fontSize: '13px', color: 'var(--text)' }}>Reroute Recommendation</b>
                     <span style={{ fontSize: '10px', background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>94% CONFIDENCE</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 12px 0' }}>Traffic accident ahead on Route 9 (SHIP-2026-000002). Divert to Alternative Highway 4 to save 45 minutes and prevent cold-chain excursion risk.</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <button style={{ flex: 1, padding: '6px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setToast("Reroute approved and dispatched to driver."); setAiSuggestions({...aiSuggestions, reroute: false}); }}>Approve Reroute</button>
                     <button style={{ flex: 1, padding: '6px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View Evidence</button>
                  </div>
               </div>
             )}
             {aiSuggestions.consolidate && (
               <div style={{ padding: '12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px' }}>
                  <b style={{ fontSize: '13px', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Consolidation Opportunity</b>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 8px 0' }}>3 pending transfers to ICU Pharmacy can be consolidated into 1 shipment, reducing logistics cost by ₹35.00.</p>
                  <button style={{ padding: '6px 12px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setToast("Consolidation reviewed and applied."); setAiSuggestions({...aiSuggestions, consolidate: false}); }}>Review Consolidation</button>
               </div>
             )}
             {!aiSuggestions.reroute && !aiSuggestions.consolidate && (
               <div style={{ color: 'var(--muted)', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>No AI recommendations at this time.</div>
             )}
          </div>
        </section>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <section className="panel">
          <div className="panel-head">
            <div><h3>Exceptions & Alerts</h3><p>Requiring immediate action</p></div>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {exceptions.filter(e => e.status === 'OPEN').length > 0 ? exceptions.filter(e => e.status === 'OPEN').map(exc => (
              <div key={exc.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', border: '1px solid var(--rose)', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '8px' }}>
                 <AlertTriangle size={16} style={{ color: 'var(--rose)' }}/>
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{exc.type} - {exc.shipmentId}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{exc.description}</div>
                 </div>
                 <button className="secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => { setToast(`Resolved ${exc.type}`); setExceptions(exceptions.filter(e => e.id !== exc.id)); }}>Resolve</button>
              </div>
            )) : (
              <div style={{ color: 'var(--muted)', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>All clear. No active alerts.</div>
            )}
          </div>
        </section>

        <section className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-head">
            <div><h3>Active Drivers & Vehicles</h3><p>Fleet utilization</p></div>
          </div>
          <div className="table-wrapper">
             <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                   <th style={{ padding: '12px' }}>Driver</th>
                   <th style={{ padding: '12px' }}>Vehicle</th>
                   <th style={{ padding: '12px' }}>Assignment</th>
                   <th style={{ padding: '12px' }}>Status</th>
                 </tr>
               </thead>
               <tbody>
                 {db.drivers?.map(drv => {
                   const veh = db.vehicles?.find(v => v.id === drv.vehicleId);
                   return (
                     <tr key={drv.id} style={{ borderBottom: '1px solid var(--line)' }}>
                       <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{drv.name.charAt(0)}</div>
                             <div>
                               <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{drv.name}</div>
                               <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{drv.phone}</div>
                             </div>
                          </div>
                       </td>
                       <td style={{ padding: '12px' }}>
                          {veh ? (
                            <div>
                               <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{veh.registration}</div>
                               <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{veh.type}</div>
                            </div>
                          ) : <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Unassigned</span>}
                       </td>
                       <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text)' }}>{veh?.currentAssignment || 'None'}</td>
                       <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: drv.status==='ACTIVE'?'rgba(16,185,129,0.1)':'rgba(245, 158, 11, 0.1)', color: drv.status==='ACTIVE'?'var(--green)':'var(--amber)' }}>
                            {drv.status.replace('_', ' ')}
                          </span>
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
          </div>
        </section>
      </div>

      {selectedShipment && <ShipmentTracker shipmentId={selectedShipment} onClose={() => setSelectedShipment(null)} setToast={setToast} />}
      {showRoutePlanner && (
        <Modal title="AI Route Optimization" close={() => setShowRoutePlanner(false)}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
             {calculatingRoute ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '16px' }}>
                   <div style={{ width: '40px', height: '40px', border: '3px solid var(--line)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                   <p style={{ color: 'var(--text)', fontWeight: 600 }}>Analyzing real-time traffic & priorities...</p>
                   <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Simulating 1,420 permutations across active fleet</p>
                </motion.div>
             ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>AI has locked the most efficient dispatch sequence, saving an estimated <b style={{color: 'var(--green)'}}>18 minutes</b> and <b style={{color: 'var(--green)'}}>4% fuel</b>.</p>
                   <div style={{ background: 'var(--surface)', border: '1px solid var(--brand)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)' }}>
                      <div style={{ padding: '16px', background: 'var(--brand-soft)', borderBottom: '1px solid var(--brand)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <b style={{color: 'var(--brand)'}}>Optimized Route Alpha</b>
                         <span style={{ fontSize: '11px', background: 'var(--brand)', color: '#fff', padding: '4px 8px', borderRadius: '12px', fontWeight: 700 }}>99.2% CONFIDENCE</span>
                      </div>
                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                         <div style={{ position: 'absolute', left: '27px', top: '30px', bottom: '30px', width: '2px', background: 'var(--line)' }} />
                         <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', zIndex: 1 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text)', border: '2px solid var(--bg)', marginTop: 4, outline: '2px solid var(--line)' }}/>
                            <div>
                              <b style={{ fontSize: '14px', color: 'var(--text)' }}>Central Warehouse</b>
                              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4 }}>Loading Dock 4 • Dispatch at 08:00 AM</div>
                            </div>
                         </motion.div>
                         <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', zIndex: 1 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--rose)', border: '2px solid var(--bg)', marginTop: 4, outline: '2px solid var(--rose)' }}/>
                            <div>
                              <b style={{ fontSize: '14px', color: 'var(--text)' }}>ICU Pharmacy <span style={{fontSize: 10, background: 'rgba(244,63,94,0.1)', color: 'var(--rose)', padding: '2px 6px', borderRadius: 4, marginLeft: 8}}>CRITICAL</span></b>
                              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4 }}>Dropoff: SHIP-2026-000003 • ETA: 08:22 AM</div>
                            </div>
                         </motion.div>
                         <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', zIndex: 1 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand)', border: '2px solid var(--bg)', marginTop: 4, outline: '2px solid var(--brand)' }}/>
                            <div>
                              <b style={{ fontSize: '14px', color: 'var(--text)' }}>ER Annex</b>
                              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4 }}>Dropoff: SHIP-2026-000005 • ETA: 08:45 AM</div>
                            </div>
                         </motion.div>
                      </div>
                   </div>
                   <button className="primary" style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => { setToast("Routes locked. Manifests transmitted to active drivers."); setShowRoutePlanner(false); }}><Navigation size={18}/> Transmit Dispatch Sequence</button>
                </motion.div>
             )}
          </div>
        </Modal>
      )}

      {showNewShipment && (
        <Modal title="Create New Shipment" close={() => setShowNewShipment(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Map size={14} className="text-brand"/> Destination Hub</div>
                  <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' }} value={newShipmentForm.destination} onChange={e => setNewShipmentForm({...newShipmentForm, destination: e.target.value})}>
                    <option value="LOC-ICU">ICU Pharmacy</option>
                    <option value="LOC-ER">ER Annex</option>
                    <option value="LOC-OPD">Outpatient Dispensary</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14} className="text-rose"/> Routing Priority</div>
                  <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' }} value={newShipmentForm.priority} onChange={e => setNewShipmentForm({...newShipmentForm, priority: e.target.value})}>
                    <option value="NORMAL">Normal Standard</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL">STAT (Life-Saving)</option>
                  </select>
                </label>
             </div>
             <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={14} className="text-brand"/> Payload Quantity (Units)</div>
               <input type="number" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' }} value={newShipmentForm.items} onChange={e => setNewShipmentForm({...newShipmentForm, items: Number(e.target.value)})} />
             </label>
             <div style={{ background: 'var(--bg)', border: '1px dashed var(--brand)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Snowflake size={24} color="var(--brand)"/>
                <div>
                   <b style={{ fontSize: '13px', color: 'var(--text)' }}>Cold Chain Active</b>
                   <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>This shipment will automatically be tracked via IoT sensors.</p>
                </div>
             </div>
             <button className="primary hover-glow" style={{ marginTop: '8px', padding: '16px', fontSize: '15px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => { 
                const newId = `SHIP-2026-00000${db.shipments.length + 1}`;
                db.shipments.push({
                   id: newId, origin: "LOC-CENTRAL", destination: newShipmentForm.destination, requestedBy: "USR-001",
                   createdAt: new Date().toISOString(), expectedDelivery: new Date(Date.now() + 3600000).toISOString(),
                   priority: newShipmentForm.priority, carrierId: null, driverId: null, vehicleId: null, temperatureRequirement: "2-8°C", status: "DRAFT",
                   items: [{ medicineId: "MED-1044", batchId: "BAT-003", quantity: newShipmentForm.items, unit: "Tablet", weight: 1.0, volume: 0.05 }],
                   trackingData: null, cost: null
                });
                setToast(`Secure Manifest generated. Shipment ${newId} queued in Drafts.`); 
                setShowNewShipment(false); 
             }}><Package size={18}/> Generate Secure Manifest</button>
          </motion.div>
        </Modal>
      )}
    </div>
  );
}
