import React from 'react';
import { Package, MapPin, Snowflake, Thermometer, Clock, CheckCircle2, ShieldCheck, Map, Camera, PenTool, AlertTriangle } from 'lucide-react';
const db = { visionEvents: [], edgeDevices: [], facilityIncidents: [], maintenanceTasks: [], shipments: [], locations: [], chainOfCustody: [], exceptions: [], proofOfDelivery: [], drivers: [], vehicles: [] };

export function ShipmentTracker({ shipmentId, onClose, setToast }) {
  const shipment = db.shipments?.find(s => s.id === shipmentId);
  
  if (!shipment) {
    return <div className="page" style={{ padding: '40px', textAlign: 'center' }}>Shipment not found.</div>;
  }

  const origin = db.locations?.find(l => l.id === shipment.origin)?.name || shipment.origin;
  const dest = db.locations?.find(l => l.id === shipment.destination)?.name || shipment.destination;
  
  const cocEvents = db.chainOfCustody?.filter(c => c.shipmentId === shipmentId).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)) || [];
  const exceptions = db.exceptions?.filter(e => e.shipmentId === shipmentId) || [];
  const pod = db.proofOfDelivery?.find(p => p.shipmentId === shipmentId);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: '600px', background: 'var(--bg)', height: '100%', overflowY: 'auto', borderLeft: '1px solid var(--line)', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)' }} className="fade-in">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
           <div>
             <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={20}/> {shipment.id}</h2>
             <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Priority: {shipment.priority} • Required: {shipment.temperatureRequirement}</span>
           </div>
           <button className="icon-btn" onClick={onClose}>×</button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
           {/* Route Overview */}
           <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Origin</span>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{origin}</div>
                 </div>
                 <div style={{ flex: 1, height: '2px', background: 'var(--line)', margin: '0 20px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', padding: '0 8px' }}><MapPin size={14} color="var(--brand)"/></div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Destination</span>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{dest}</div>
                 </div>
              </div>

              {shipment.status === 'IN_TRANSIT' && (
                <div style={{ padding: '12px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                   <MapPin size={16} color="var(--blue)"/>
                   <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600 }}>Live Location</div>
                      <div style={{ fontSize: '13px', color: 'var(--text)' }}>{shipment.trackingData?.currentLoc}</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>ETA</div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{shipment.trackingData?.eta ? new Date(shipment.trackingData.eta).toLocaleTimeString() : '--'}</div>
                   </div>
                </div>
              )}
           </div>

           {/* Exceptions */}
           {exceptions.length > 0 && (
             <div style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '16px', border: '1px solid var(--rose)' }}>
               <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16}/> Active Exceptions</h3>
               {exceptions.map(exc => (
                 <div key={exc.id} style={{ fontSize: '13px', color: 'var(--text)' }}>
                   <b>{exc.type}</b>: {exc.description} <span style={{ color: 'var(--muted)', fontSize: '11px' }}>({new Date(exc.timestamp).toLocaleTimeString()})</span>
                 </div>
               ))}
             </div>
           )}

           {/* Cold Chain IoT */}
           {shipment.temperatureRequirement !== 'N/A' && (
             <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--line)' }}>
               <h3 style={{ fontSize: '14px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}><Snowflake size={16} color="var(--blue)"/> IoT Cold Chain Telemetry</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px' }}>
                     <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Required Range</div>
                     <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{shipment.temperatureRequirement}</div>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px' }}>
                     <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Current Temp</div>
                     <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)' }}>{shipment.temperatureLog?.[shipment.temperatureLog.length-1]?.temp || '--'}°C</div>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px' }}>
                     <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Status</div>
                     <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--green)' }}>Stable</div>
                  </div>
               </div>
             </div>
           )}

           {/* Chain of Custody */}
           <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--line)' }}>
             <h3 style={{ fontSize: '14px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}><ShieldCheck size={16} color="var(--brand)"/> Chain of Custody</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
               {cocEvents.map((evt, idx) => (
                 <div key={evt.id} style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: idx === cocEvents.length-1 ? 0 : '20px' }}>
                   {idx !== cocEvents.length-1 && <div style={{ position: 'absolute', left: '7px', top: '20px', bottom: 0, width: '2px', background: 'var(--line)' }}/>}
                   <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--brand)', zIndex: 1, marginTop: '2px' }}/>
                   <div>
                     <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{evt.event}</div>
                     <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Actor: {evt.actor} • Loc: {evt.location}</div>
                     <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{new Date(evt.timestamp).toLocaleString()}</div>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* Proof of Delivery */}
           {pod && (
             <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--line)' }}>
               <h3 style={{ fontSize: '14px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}><CheckCircle2 size={16} color="var(--green)"/> Proof of Delivery</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Recipient</div>
                    <div style={{ fontSize: '14px', color: 'var(--text)' }}>{pod.recipientName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Condition</div>
                    <div style={{ fontSize: '14px', color: 'var(--text)' }}>{pod.condition}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Signature</div>
                    <div style={{ width: '100%', height: '80px', background: 'var(--bg)', border: '1px dashed var(--line)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}><PenTool size={20}/></div>
                  </div>
               </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
