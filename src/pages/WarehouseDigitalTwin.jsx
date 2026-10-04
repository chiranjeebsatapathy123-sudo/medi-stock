import React, { useState, useEffect } from 'react';
import { Server, ThermometerSnowflake, Activity, Package, Maximize2 } from 'lucide-react';
import client from '../api/client';

export function WarehouseDigitalTwin({ setToast }) {
  const [locations, setLocations] = useState([]);
  
  useEffect(() => {
    async function loadData() {
      try {
        const whRes = await client.get('/warehouse');
        if (whRes.data.length > 0) {
          const whId = whRes.data[0].id;
          const locRes = await client.get(`/warehouse/${whId}/locations`);
          setLocations(locRes.data);
        }
      } catch (e) {
        console.error(e);
        setToast("Failed to load warehouse data");
      }
    }
    loadData();
  }, [setToast]);

  return (
    <div className="page fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-heading">
        <div>
          <span className="eyebrow" style={{ color: 'var(--brand)' }}>OPERATIONAL VISUALIZATION</span>
          <h1>Warehouse Digital Twin</h1>
          <p>Live 2D map with capacity and thermal conditions</p>
        </div>
        <div className="heading-actions">
           <button className="secondary font-bold" onClick={() => setToast("Entering fullscreen mode...")}><Maximize2 size={16}/> Fullscreen</button>
        </div>
      </div>

      <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
         <div style={{ padding: '16px', borderBottom: '1px solid var(--line)', display: 'flex', gap: '24px', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text)' }}><div style={{ width: '12px', height: '12px', background: 'var(--green)', borderRadius: '2px' }}/> Normal Capacity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text)' }}><div style={{ width: '12px', height: '12px', background: 'var(--amber)', borderRadius: '2px' }}/> High Capacity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text)' }}><div style={{ width: '12px', height: '12px', background: 'var(--rose)', borderRadius: '2px' }}/> Full / Overcapacity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text)' }}><div style={{ width: '12px', height: '12px', border: '2px solid var(--blue)', borderRadius: '2px' }}/> Cold Storage</div>
         </div>
         
         <div style={{ flex: 1, padding: '40px', background: '#0f172a', position: 'relative', overflow: 'auto' }}>
            <div style={{ width: '1000px', height: '600px', position: 'relative', border: '2px dashed rgba(255,255,255,0.1)' }}>
               {/* Central Racks */}
               <div style={{ position: 'absolute', top: '100px', left: '100px', width: '200px', height: '300px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}>Central Dry Zone</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     {locations.filter(l => l.locationType === 'BIN').map(loc => {
                        const util = loc.physicalCapacity ? (loc.usedCapacity || 0) / loc.physicalCapacity : 0;
                        let color = '#10b981'; // green
                        if (util > 0.8) color = '#f59e0b'; // amber
                        if (util >= 1) color = '#f43f5e'; // rose
                        
                        return (
                          <div key={loc.id} style={{ padding: '8px', background: color, borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setToast(`Opening bin ${loc.code}`)}>
                             <div style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>{loc.name}</div>
                             <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9px' }}>{(util*100).toFixed(0)}%</div>
                          </div>
                        )
                     })}
                  </div>
               </div>

               {/* Cold Room */}
               <div style={{ position: 'absolute', top: '100px', left: '400px', width: '250px', height: '200px', background: 'rgba(59,130,246,0.1)', border: '2px solid var(--blue)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--blue)', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                     <span>Cold Room 1</span>
                     <span style={{ fontWeight: 700 }}>4.2°C</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     {locations.filter(l => l.locationType === 'COLD_ROOM').map(loc => {
                        const util = loc.physicalCapacity ? (loc.usedCapacity || 0) / loc.physicalCapacity : 0;
                        return (
                          <div key={loc.id} style={{ padding: '8px', background: 'rgba(59,130,246,0.3)', border: '1px solid var(--blue)', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setToast(`Opening bin ${loc.code}`)}>
                             <div style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>{loc.name}</div>
                             <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9px' }}>{(util*100).toFixed(0)}%</div>
                          </div>
                        )
                     })}
                  </div>
               </div>

               {/* Quarantine Zone */}
               <div style={{ position: 'absolute', bottom: '100px', left: '400px', width: '250px', height: '100px', background: 'rgba(244,63,94,0.05)', border: '2px dashed var(--rose)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--rose)', marginBottom: '8px', textTransform: 'uppercase' }}>Quarantine Area</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     {locations.filter(l => l.locationType === 'QUARANTINE').map(loc => (
                        <div key={loc.id} style={{ padding: '8px', background: 'rgba(244,63,94,0.2)', border: '1px solid var(--rose)', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setToast(`Opening bin ${loc.code}`)}>
                           <div style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>{loc.name}</div>
                           <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9px' }}>{loc.usedCapacity || 0} {loc.capacityUom}</div>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         </div>
      </div>
    </div>
  );
}
