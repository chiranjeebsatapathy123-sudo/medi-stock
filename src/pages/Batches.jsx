import React, { useState, useEffect } from "react";
import { Filter, CalendarClock, ShieldAlert, ArrowRight, PackageSearch } from "lucide-react";
import { inventoryService } from "../services/inventoryService";
import { db } from "../services/mockDb";
import { EmptyState, Modal } from "../components/ui";

export function Batches({ setToast }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [actionModal, setActionModal] = useState(null);

  useEffect(() => {
    loadBatches();
  }, []);

  async function loadBatches() {
    setLoading(true);
    const data = await inventoryService.getBatches();
    
    // Calculate risk logic
    const today = new Date();
    const enriched = data.map(b => {
      const expDate = new Date(b.expiryDate);
      const days = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      
      let riskLevel = "Healthy";
      let riskClass = "healthy";
      let action = "No action required";

      if (days < 0) { riskLevel = "Expired"; riskClass = "expired"; action = "Mark for disposal"; }
      else if (days <= 7) { riskLevel = "Critical"; riskClass = "critical"; action = "Prioritize dispensing immediately"; }
      else if (days <= 30) { riskLevel = "High risk"; riskClass = "high-risk"; action = "Transfer to fast-moving location"; }
      else if (days <= 60) { riskLevel = "Medium risk"; riskClass = "medium-risk"; action = "Stop new purchases"; }
      else if (days <= 90) { riskLevel = "Watch"; riskClass = "watch"; action = "Monitor consumption rate"; }

      return { ...b, days, riskLevel, riskClass, action };
    });
    
    // Sort by nearest expiry
    enriched.sort((a,b) => a.days - b.days);
    setBatches(enriched);
    setLoading(false);
  }

  const filtered = batches.filter(b => {
    if (filter === "All") return true;
    if (filter === "Action Required") return b.days <= 90;
    return b.riskLevel === filter;
  });

  return <div className="page">
    <div className="page-heading">
      <div><span className="eyebrow">EXPIRY COMMAND CENTER</span><h1>Batch Management</h1><p>Monitor FEFO distribution, expiry risks, and stock values.</p></div>
      <div className="heading-actions">
        <button className="secondary"><Filter size={16}/> Filter</button>
      </div>
    </div>

    <div className="inventory-toolbar">
      <div className="tabs">
        {["All", "Action Required", "Critical", "High risk", "Expired"].map(x => (
          <button key={x} className={filter===x?"selected":""} onClick={()=>setFilter(x)}>
            {x}
            <span>{
              x==="All" ? batches.length :
              x==="Action Required" ? batches.filter(b=>b.days<=90).length :
              batches.filter(b=>b.riskLevel===x).length
            }</span>
          </button>
        ))}
      </div>
    </div>

    <div className="panel inventory-panel">
      <div className="data-table">
        <div className="table-head" style={{gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1.5fr"}}>
          <span>Medicine & Batch</span>
          <span>Location</span>
          <span>Quantity</span>
          <span>Expiry Date</span>
          <span>Risk Level</span>
          <span>Recommended Action</span>
        </div>
        
        {loading ? <div style={{padding:60,textAlign:"center", color: 'var(--muted)'}}>Scanning batches...</div> : 
         filtered.length === 0 ? <EmptyState icon={CalendarClock} title="No batches found" description="There are no batches matching your selected risk level." actionText="Clear Filters" onAction={()=>setFilter("All")} /> :
         filtered.map(b => (
          <div className="data-row" key={b.id} style={{gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1.5fr"}}>
            <div className="med-cell">
              <div className="medicine-icon"><PackageSearch size={17}/></div>
              <div><b>{b.medicineName}</b><span>Batch: {b.batchNumber} • Value: ₹{(b.currentQty * b.purchasePrice).toLocaleString()}</span></div>
            </div>
            <span>{db.locations.find(l=>l.id===b.locationId)?.name || b.locationId}</span>
            <span><b>{b.currentQty} units</b></span>
            <span>
              {new Date(b.expiryDate).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'})}
              <small style={{color: b.days<0 ? "var(--rose)" : "var(--muted)"}}>
                {b.days < 0 ? `${Math.abs(b.days)} days ago` : `${b.days} days left`}
              </small>
            </span>
            <span>
              <span className={`status`} style={{
                background: b.days<0 ? "var(--rose)" : b.days<=7 ? "var(--rose)" : b.days<=30 ? "var(--amber)" : b.days<=60 ? "var(--amber)" : "var(--green)",
                color: b.days<=60 ? "#fff" : "var(--text)"
              }}>
                {b.riskLevel}
              </span>
            </span>
            <span style={{fontSize:12, display:"flex", alignItems:"center", gap:5}}>
              {b.days <= 90 && <ShieldAlert size={14} color="var(--amber)"/>}
              {b.action !== "No action required" ? (
                <button className="link-btn" style={{ fontWeight: 600, color: 'var(--text)', textAlign: 'left', cursor: 'pointer' }} onClick={() => setActionModal(b)}>
                  {b.action}
                </button>
              ) : (
                <span style={{ color: 'var(--muted)' }}>{b.action}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>

    {actionModal && (
      <Modal title="Execute Batch Recommendation" close={() => setActionModal(null)}>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '16px', border: '1px solid var(--line)' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>{actionModal.medicineName} (Batch {actionModal.batchNumber})</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>Risk Level: <b style={{ color: actionModal.days <= 7 ? 'var(--rose)' : 'var(--amber)' }}>{actionModal.riskLevel}</b> • Expiring in {actionModal.days} days</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <b style={{ fontSize: '13px', color: 'var(--text)' }}>AI Recommended Action</b>
            <div style={{ background: 'var(--brand-soft)', border: '1px solid var(--brand)', borderRadius: '8px', padding: '16px', color: 'var(--brand)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16}/> {actionModal.action}
            </div>
          </div>

          <button className="primary" style={{ marginTop: '8px', padding: '14px', width: '100%', display: 'flex', justifyContent: 'center' }} onClick={() => {
            if (actionModal.action === 'Transfer to fast-moving location') {
              const b = db.batches.find(x => x.id === actionModal.id);
              if (b) b.locationId = 'LOC-ER';
              setToast(`Successfully transferred Batch ${actionModal.batchNumber} to ER Annex to accelerate consumption.`);
            } else if (actionModal.action === 'Mark for disposal') {
              db.batches = db.batches.filter(x => x.id !== actionModal.id);
              setToast(`Batch ${actionModal.batchNumber} has been logged for regulatory disposal.`);
            } else {
              setToast(`Recommendation executed for ${actionModal.batchNumber}.`);
            }
            loadBatches();
            setActionModal(null);
          }}>
            Execute & Resolve Risk
          </button>
        </div>
      </Modal>
    )}
  </div>;
}
