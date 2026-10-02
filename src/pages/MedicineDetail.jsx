import React, { useState } from "react";
import { ArrowLeft, Edit, Trash2, TrendingUp, AlertTriangle, Boxes, Clock3 } from "lucide-react";
import { db } from "../services/mockDb";

export function MedicineDetail({ medicine, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Get related data
  const batches = db.batches.filter(b => b.medicineId === medicine.id);
  const movements = db.movements.filter(m => m.medicineId === medicine.id).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  
  return <div className="page">
    <div className="page-heading">
      <div>
        <span className="eyebrow" style={{display:"flex", alignItems:"center", gap:5, cursor:"pointer", color:"var(--primary)"}} onClick={onBack}>
           <ArrowLeft size={14}/> Back to Inventory
        </span>
        <h1 style={{marginTop:10}}>{medicine.genericName} {medicine.strength}</h1>
        <p>{medicine.code} • {medicine.brandName} • {medicine.manufacturer}</p>
      </div>
      <div className="heading-actions">
         <button className="secondary"><Edit size={16}/> Edit</button>
         <button className="secondary"><Trash2 size={16} color="var(--rose)"/></button>
      </div>
    </div>

    <div className="inventory-toolbar">
       <div className="tabs">
          {["Overview", "Batches", "Movements"].map(t => (
             <button key={t} className={activeTab.toLowerCase()===t.toLowerCase()?"selected":""} onClick={()=>setActiveTab(t.toLowerCase())}>{t}</button>
          ))}
       </div>
    </div>

    {activeTab === "overview" && (
       <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:20}}>
          <div className="panel" style={{display:"flex", flexDirection:"column", gap:15}}>
             <h3 style={{borderBottom:"1px solid var(--line)", paddingBottom:10, marginBottom:5}}>Medicine Properties</h3>
             <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:15}}>
                <div><label style={{fontSize:11, color:"var(--muted)"}}>Category</label><div style={{fontWeight:600}}>{medicine.category}</div></div>
                <div><label style={{fontSize:11, color:"var(--muted)"}}>Dosage Form</label><div style={{fontWeight:600}}>{medicine.dosageForm}</div></div>
                <div><label style={{fontSize:11, color:"var(--muted)"}}>Unit</label><div style={{fontWeight:600}}>{medicine.unit}</div></div>
                <div><label style={{fontSize:11, color:"var(--muted)"}}>Storage</label><div style={{fontWeight:600}}>{medicine.storageRequirements}</div></div>
             </div>
             <div style={{marginTop:10}}>
                <label style={{fontSize:11, color:"var(--muted)"}}>Description</label>
                <p style={{fontSize:13, margin:0}}>{medicine.description}</p>
             </div>
          </div>
          
          <div className="panel" style={{display:"flex", flexDirection:"column", gap:15}}>
             <h3 style={{borderBottom:"1px solid var(--line)", paddingBottom:10, marginBottom:5}}>Inventory Parameters</h3>
             <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:15}}>
                <div><label style={{fontSize:11, color:"var(--muted)"}}><Boxes size={12}/> Current Stock</label><div style={{fontWeight:600, fontSize:20, color:"var(--primary)"}}>{medicine.totalStock}</div></div>
                <div><label style={{fontSize:11, color:"var(--muted)"}}><AlertTriangle size={12}/> Safety Stock</label><div style={{fontWeight:600}}>{medicine.safetyStock}</div></div>
                <div><label style={{fontSize:11, color:"var(--muted)"}}><TrendingUp size={12}/> Reorder Level</label><div style={{fontWeight:600}}>{medicine.reorderLevel}</div></div>
                <div><label style={{fontSize:11, color:"var(--muted)"}}>Max Capacity</label><div style={{fontWeight:600}}>{medicine.maxStock}</div></div>
             </div>
             
             {medicine.totalStock < medicine.safetyStock && (
                <div style={{background:"var(--rose-soft)", color:"var(--rose)", padding:15, borderRadius:8, fontSize:12, marginTop:10}}>
                   <b>Critical Stock Warning:</b> Current inventory is below safety thresholds. Consider immediate procurement.
                </div>
             )}
          </div>
       </div>
    )}

    {activeTab === "batches" && (
       <div className="panel" style={{padding:0, overflow:"hidden"}}>
          <div className="data-table">
             <div className="table-head"><span>Batch No.</span><span>Location</span><span>Quantity</span><span>Expiry</span><span>Status</span></div>
             {batches.length === 0 ? <div style={{padding:40, textAlign:"center"}}>No active batches</div> : batches.map(b => (
                <div className="data-row" key={b.id}>
                   <b>{b.batchNumber}</b>
                   <span>{db.locations.find(l=>l.id===b.locationId)?.name || b.locationId}</span>
                   <span><b>{b.currentQty}</b></span>
                   <span>{new Date(b.expiryDate).toLocaleDateString()}</span>
                   <span><span className={`status ${b.status==="ACTIVE"?"healthy":"medium-risk"}`}>{b.status}</span></span>
                </div>
             ))}
          </div>
       </div>
    )}

    {activeTab === "movements" && (
       <div className="panel" style={{padding:0, overflow:"hidden"}}>
          <div className="data-table">
             <div className="table-head"><span>Time</span><span>Type</span><span>Quantity</span><span>Batch</span><span>User</span></div>
             {movements.length === 0 ? <div style={{padding:40, textAlign:"center"}}>No movement history</div> : movements.map(m => (
                <div className="data-row" key={m.id}>
                   <span>{new Date(m.timestamp).toLocaleString()}</span>
                   <span><b>{m.type.replace("_"," ")}</b></span>
                   <span style={{color: m.quantity>0?"var(--green)":"var(--rose)", fontWeight:"bold"}}>{m.quantity>0?"+":""}{m.quantity}</span>
                   <span>{db.batches.find(b=>b.id===m.batchId)?.batchNumber}</span>
                   <span>{db.users.find(u=>u.id===m.user)?.name || m.user}</span>
                </div>
             ))}
          </div>
       </div>
    )}
  </div>;
}
