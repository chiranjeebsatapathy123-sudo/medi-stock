import React, { useState, useEffect } from "react";
import { Filter, CalendarClock, ShieldAlert, ArrowRight, PackageSearch } from "lucide-react";
import { inventoryService } from "../services/inventoryService";
import { db } from "../services/mockDb";
import { EmptyState } from "../components/ui";

export function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

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
              {b.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>;
}
