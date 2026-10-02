import React, { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Plus, RefreshCw, Send, Search } from "lucide-react";
import { db } from "../services/mockDb";
import { inventoryService } from "../services/inventoryService";
import { Modal, EmptyState } from "../components/ui";

export function Movements({ setToast }) {
  const [movements, setMovements] = useState(db.movements);
  const [showIssue, setShowIssue] = useState(false);
  
  const [medicineId, setMedicineId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [locationId, setLocationId] = useState("");
  const [reason, setReason] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  
  const handleIssue = async () => {
    if(!medicineId || !quantity || !locationId) return;
    try {
      await inventoryService.issueStock(medicineId, parseInt(quantity), "USR-001", reason, locationId, "MANUAL-ISSUE");
      setMovements([...db.movements]);
      setShowIssue(false);
      setIsDirty(false);
      if (setToast) setToast("Stock issued successfully via FEFO");
    } catch (e) {
      if (setToast) setToast("Error: " + e.message);
    }
  }

  const handleClose = () => {
    if (isDirty && !window.confirm("You have entered issue details. Are you sure you want to discard them?")) return;
    setShowIssue(false);
    setIsDirty(false);
  }

  return <div className="page">
    <div className="page-heading">
      <div>
        <span className="eyebrow">OPERATIONS</span>
        <h1>Movement Engine</h1>
        <p>Track all stock in/out, adjustments, and internal transfers.</p>
      </div>
      <div className="heading-actions">
         <button className="primary" onClick={()=>setShowIssue(true)}><Send size={16}/> Issue Stock (FEFO)</button>
      </div>
    </div>

    <div className="panel inventory-panel">
      <div className="data-table">
        <div className="table-head" style={{gridTemplateColumns:"1.5fr 1fr 1.5fr 1.5fr 1fr"}}>
          <span>Transaction</span>
          <span>Type & Time</span>
          <span>Source</span>
          <span>Destination</span>
          <span>User & Ref</span>
        </div>
        
        {movements.length === 0 ? <EmptyState icon={RefreshCw} title="No movements found" description="There are no inventory transactions in the system yet." /> :
        movements.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).map(m => {
          const med = db.medicines.find(x => x.id === m.medicineId);
          const batch = db.batches.find(x => x.id === m.batchId);
          
          return <div className="data-row" key={m.id} style={{gridTemplateColumns:"1.5fr 1fr 1.5fr 1.5fr 1fr"}}>
            <div className="med-cell">
              <div className={`activity-icon ${m.quantity > 0 ? 'in' : 'out'}`} style={{background: m.quantity > 0 ? "var(--green-soft)" : "var(--rose-soft)", color: m.quantity > 0 ? "var(--green)" : "var(--rose)"}}>
                 {m.quantity > 0 ? <ArrowDownRight size={17}/> : <ArrowUpRight size={17}/>}
              </div>
              <div><b>{Math.abs(m.quantity)} {med?.unit} {med?.genericName}</b><span>Batch: {batch?.batchNumber}</span></div>
            </div>
            
            <span><b>{m.type.replace("_", " ")}</b><small>{new Date(m.timestamp).toLocaleString()}</small></span>
            <span>{db.locations.find(l=>l.id===m.sourceId)?.name || db.suppliers.find(s=>s.id===m.sourceId)?.name || m.sourceId}</span>
            <span>{db.locations.find(l=>l.id===m.destId)?.name || m.destId}</span>
            <span><b>{db.users.find(u=>u.id===m.user)?.name || m.user}</b><small>{m.reason}</small></span>
          </div>
        })}
      </div>
    </div>

    {showIssue && <Modal title="Advanced Dispensing Workspace" close={handleClose}>
       <div style={{background:"var(--primary-soft)", padding:15, borderRadius:8, marginBottom:20, color:"var(--primary)", fontSize:12, border:"1px solid var(--primary)", display: 'flex', gap: '8px', alignItems: 'center'}}>
         <ArrowUpRight size={16} />
         <div>
           <b>FEFO Enforcement Active:</b> The system will automatically select the nearest expiry batches to fulfill this request. Expired and quarantined stock are strictly locked.
         </div>
       </div>
       <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }} onChange={() => setIsDirty(true)}>
         <label>Medicine
            <select value={medicineId} onChange={e=>setMedicineId(e.target.value)}>
               <option value="">Select Medicine...</option>
               {db.medicines.map(m => <option key={m.id} value={m.id}>{m.genericName} {m.strength}</option>)}
            </select>
         </label>
         <label>Quantity to Issue<input type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="0"/></label>
         <label>Destination Location
            <select value={locationId} onChange={e=>setLocationId(e.target.value)}>
               <option value="">Select Destination...</option>
               {db.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
               <option value="PATIENT">Dispense to Patient</option>
            </select>
         </label>
         <label>Reason<input value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Ward Request / Emergency"/></label>
       </div>

       {medicineId && quantity > 0 && (
         <div className="mt-6 border border-slate-700 rounded-lg overflow-hidden">
           <div className="bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 uppercase tracking-wider border-b border-slate-700">
             System Batch Allocation (FEFO)
           </div>
           <div className="p-4 bg-slate-900/50">
             <div className="flex justify-between items-center text-sm mb-2">
               <span className="text-white font-medium">Batch BATCH-24X (Exp: Nov 2026)</span>
               <span className="text-emerald-400">Allocated: {Math.min(quantity, 500)} units</span>
             </div>
             <div className="text-xs text-slate-400">Location: Central Warehouse (Aisle A)</div>
             {quantity > 500 && (
               <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-slate-700/50">
                 <span className="text-white font-medium">Batch BATCH-89Y (Exp: Feb 2027)</span>
                 <span className="text-emerald-400">Allocated: {quantity - 500} units</span>
               </div>
             )}
           </div>
         </div>
       )}

       <div className="modal-actions" style={{marginTop:20, display: 'flex', justifyContent: 'space-between'}}>
         <button className="secondary" onClick={handleClose}>Cancel</button>
         <button className="primary" onClick={handleIssue}>Confirm Issue</button>
       </div>
    </Modal>}
  </div>;
}
