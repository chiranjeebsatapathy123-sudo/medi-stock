import React, { useState } from 'react';
import { PackageSearch, Box, Truck, CheckSquare, ScanBarcode, ArrowRight } from 'lucide-react';
const db = { visionEvents: [], edgeDevices: [], facilityIncidents: [], maintenanceTasks: [], shipments: [], locations: [], chainOfCustody: [], exceptions: [], proofOfDelivery: [], drivers: [], vehicles: [] };

export function LogisticsOperations({ setToast }) {
  const [activeTab, setActiveTab] = useState('PICK');
  const [renderTrigger, setRenderTrigger] = useState(0);

  const pendingShipments = db.shipments || [];
  
  const toPick = pendingShipments.filter(s => s.status === 'READY' || s.status === 'DRAFT');
  const toPack = pendingShipments.filter(s => s.status === 'PICKED');
  const toDispatch = pendingShipments.filter(s => s.status === 'PACKED');
  const toReceive = pendingShipments.filter(s => s.status === 'IN_TRANSIT');
  const history = pendingShipments.filter(s => s.status === 'DELIVERED');

  const advanceShipment = (id, newStatus, message) => {
    const s = db.shipments.find(x => x.id === id);
    if (s) {
      s.status = newStatus;
      setRenderTrigger(prev => prev + 1);
      setToast(message);
    }
  };

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow" style={{ color: 'var(--brand)' }}>STORE STAFF</span>
          <h1>Logistics Operations</h1>
          <p>Pick, Pack, Dispatch, and Receive Operations</p>
        </div>
        <div className="heading-actions">
           <button className="primary font-bold" onClick={() => setToast("Opening scanner...")}><ScanBarcode size={16}/> Scan Package</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
         <button onClick={() => setActiveTab('PICK')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: activeTab === 'PICK' ? 'var(--brand)' : 'transparent', color: activeTab === 'PICK' ? '#fff' : 'var(--text)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
           <PackageSearch size={16}/> To Pick <span style={{ background: activeTab==='PICK'?'rgba(255,255,255,0.2)':'var(--line)', padding: '2px 6px', borderRadius: '12px', fontSize: '11px' }}>{toPick.length}</span>
         </button>
         <button onClick={() => setActiveTab('PACK')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: activeTab === 'PACK' ? 'var(--brand)' : 'transparent', color: activeTab === 'PACK' ? '#fff' : 'var(--text)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
           <Box size={16}/> To Pack <span style={{ background: activeTab==='PACK'?'rgba(255,255,255,0.2)':'var(--line)', padding: '2px 6px', borderRadius: '12px', fontSize: '11px' }}>{toPack.length}</span>
         </button>
         <button onClick={() => setActiveTab('DISPATCH')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: activeTab === 'DISPATCH' ? 'var(--brand)' : 'transparent', color: activeTab === 'DISPATCH' ? '#fff' : 'var(--text)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
           <Truck size={16}/> To Dispatch <span style={{ background: activeTab==='DISPATCH'?'rgba(255,255,255,0.2)':'var(--line)', padding: '2px 6px', borderRadius: '12px', fontSize: '11px' }}>{toDispatch.length}</span>
         </button>
         <button onClick={() => setActiveTab('RECEIVE')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: activeTab === 'RECEIVE' ? 'var(--brand)' : 'transparent', color: activeTab === 'RECEIVE' ? '#fff' : 'var(--text)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
           <CheckSquare size={16}/> To Receive <span style={{ background: activeTab==='RECEIVE'?'rgba(255,255,255,0.2)':'var(--line)', padding: '2px 6px', borderRadius: '12px', fontSize: '11px' }}>{toReceive.length}</span>
         </button>
         <button onClick={() => setActiveTab('HISTORY')} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: activeTab === 'HISTORY' ? 'var(--brand)' : 'transparent', color: activeTab === 'HISTORY' ? '#fff' : 'var(--muted)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
           History <span style={{ background: activeTab==='HISTORY'?'rgba(255,255,255,0.2)':'var(--line)', padding: '2px 6px', borderRadius: '12px', fontSize: '11px' }}>{history.length}</span>
         </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
         {activeTab === 'PICK' && toPick.map(ship => <ShipmentCard key={ship.id} ship={ship} action="Complete Pick" onClick={() => advanceShipment(ship.id, 'PICKED', `Picking completed for ${ship.id}`)} />)}
         {activeTab === 'PACK' && toPack.map(ship => <ShipmentCard key={ship.id} ship={ship} action="Complete Pack" onClick={() => advanceShipment(ship.id, 'PACKED', `Packing completed for ${ship.id}`)} />)}
         {activeTab === 'DISPATCH' && toDispatch.map(ship => <ShipmentCard key={ship.id} ship={ship} action="Confirm Dispatch" onClick={() => advanceShipment(ship.id, 'IN_TRANSIT', `Shipment ${ship.id} dispatched.`)} />)}
         {activeTab === 'RECEIVE' && toReceive.map(ship => <ShipmentCard key={ship.id} ship={ship} action="Receive & Inspect" onClick={() => advanceShipment(ship.id, 'DELIVERED', `Shipment ${ship.id} received successfully.`)} />)}
         {activeTab === 'HISTORY' && history.map(ship => <ShipmentCard key={ship.id} ship={ship} action="View Details" onClick={() => setToast(`Viewing manifest for ${ship.id}`)} />)}
         
         {(activeTab === 'PICK' && toPick.length === 0) && <div style={{ color: 'var(--muted)', padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>No shipments to pick.</div>}
         {(activeTab === 'PACK' && toPack.length === 0) && <div style={{ color: 'var(--muted)', padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>No shipments to pack.</div>}
         {(activeTab === 'DISPATCH' && toDispatch.length === 0) && <div style={{ color: 'var(--muted)', padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>No shipments to dispatch.</div>}
         {(activeTab === 'RECEIVE' && toReceive.length === 0) && <div style={{ color: 'var(--muted)', padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>No incoming shipments.</div>}
         {(activeTab === 'HISTORY' && history.length === 0) && <div style={{ color: 'var(--muted)', padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>No completed shipments yet.</div>}
      </div>
    </div>
  );
}

function ShipmentCard({ ship, action, onClick }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b style={{ color: 'var(--text)', fontSize: '14px' }}>{ship.id}</b>
          <span style={{ fontSize: '10px', background: 'var(--bg)', border: '1px solid var(--line)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, color: 'var(--brand)' }}>{ship.priority}</span>
       </div>
       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text)' }}>
          <div style={{ flex: 1, background: 'var(--bg)', padding: '8px', borderRadius: '8px' }}>{db.locations?.find(l=>l.id===ship.origin)?.name || ship.origin}</div>
          <ArrowRight size={14} color="var(--muted)"/>
          <div style={{ flex: 1, background: 'var(--bg)', padding: '8px', borderRadius: '8px' }}>{db.locations?.find(l=>l.id===ship.destination)?.name || ship.destination}</div>
       </div>
       <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
          Items: {ship.items.reduce((s,i)=>s+i.quantity, 0)} units
          {ship.temperatureRequirement !== 'N/A' && <span style={{ color: 'var(--blue)', marginLeft: '8px' }}>• Cold Chain</span>}
       </div>
       <button className="primary" style={{ width: '100%', marginTop: 'auto' }} onClick={onClick}>{action}</button>
    </div>
  );
}
