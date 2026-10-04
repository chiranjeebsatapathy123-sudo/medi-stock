import React, { useState, useEffect } from "react";
import { Filter, CalendarClock, ShieldAlert, ArrowRight, PackageSearch, Plus, Edit, Trash2 } from "lucide-react";
import { inventoryService } from "../services/inventoryService";
import { EmptyState, Modal } from "../components/ui";

export function Batches({ setToast }) {
  const [batches, setBatches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [actionModal, setActionModal] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [data, locs, meds] = await Promise.all([
      inventoryService.getBatches(),
      inventoryService.getLocations(),
      inventoryService.getMedicines()
    ]);
    setLocations(locs);
    setMedicines(meds);
    
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

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this batch?")) {
      try {
        await inventoryService.deleteBatch(id);
        setToast("Batch deleted successfully");
        loadData();
      } catch (err) {
        setToast("Failed to delete batch");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    data.currentQuantity = parseInt(data.currentQuantity || 0);
    data.receivedQuantity = parseInt(data.receivedQuantity || 0);
    data.purchasePrice = parseFloat(data.purchasePrice || 0);
    
    // We need to send medicine object or ID depending on how backend handles it
    // Batch.java has `private Medicine medicine;`
    data.medicine = { id: data.medicineId };
    delete data.medicineId;

    try {
      if (editingBatch) {
        await inventoryService.updateBatch(editingBatch.id, data);
      } else {
        await inventoryService.createBatch(data);
      }
      setShowAdd(false);
      setEditingBatch(null);
      setToast("Batch saved successfully");
      loadData();
    } catch(err) {
      setToast("Failed to save batch");
    }
  };

  const filtered = batches.filter(b => {
    if (filter === "All") return true;
    if (filter === "Action Required") return b.days <= 90;
    return b.riskLevel === filter;
  });

  return <div className="page">
    <div className="page-heading">
      <div><span className="eyebrow">EXPIRY COMMAND CENTER</span><h1>Batch Management</h1><p>Monitor FEFO distribution, expiry risks, and stock values.</p></div>
      <div className="heading-actions">
        <button className="primary" onClick={() => setShowAdd(true)}><Plus size={16}/> Add Batch</button>
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
        <div className="table-head" style={{gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 0.5fr 1.5fr"}}>
          <span>Medicine & Batch</span>
          <span>Location</span>
          <span>Quantity</span>
          <span>Expiry Date</span>
          <span>Risk Level</span>
          <span>Actions</span>
          <span>Recommended Action</span>
        </div>
        
        {loading ? <div style={{padding:60,textAlign:"center", color: 'var(--muted)'}}>Scanning batches...</div> : 
         filtered.length === 0 ? <EmptyState icon={CalendarClock} title="No batches found" description="There are no batches matching your selected risk level." actionText="Clear Filters" onAction={()=>setFilter("All")} /> :
         filtered.map(b => (
          <div className="data-row" key={b.id} style={{gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 0.5fr 1.5fr"}}>
            <div className="med-cell">
              <div className="medicine-icon"><PackageSearch size={17}/></div>
              <div><b>{b.medicine?.genericName || "Unknown Medicine"}</b><span>Batch: {b.batchNumber} • Value: ₹{(b.currentQuantity * b.purchasePrice).toLocaleString()}</span></div>
            </div>
            <span>{locations.find(l=>l.id===b.locationId)?.name || b.locationId}</span>
            <span><b>{b.currentQuantity} units</b></span>
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
            <span style={{display:"flex", gap:10}}>
              <button className="icon-btn" onClick={(e)=>{ e.stopPropagation(); setEditingBatch(b); }}><Edit size={15}/></button>
              <button className="icon-btn" onClick={(e)=>{ e.stopPropagation(); handleDelete(b.id); }}><Trash2 size={15} color="var(--rose)"/></button>
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
            <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>{actionModal.medicine?.genericName || "Unknown Medicine"} (Batch {actionModal.batchNumber})</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>Risk Level: <b style={{ color: actionModal.days <= 7 ? 'var(--rose)' : 'var(--amber)' }}>{actionModal.riskLevel}</b> • Expiring in {actionModal.days} days</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <b style={{ fontSize: '13px', color: 'var(--text)' }}>AI Recommended Action</b>
            <div style={{ background: 'var(--brand-soft)', border: '1px solid var(--brand)', borderRadius: '8px', padding: '16px', color: 'var(--brand)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16}/> {actionModal.action}
            </div>
          </div>

          <button className="primary" style={{ marginTop: '8px', padding: '14px', width: '100%', display: 'flex', justifyContent: 'center' }} onClick={async () => {
            try {
              if (actionModal.action === 'Transfer to fast-moving location') {
                await inventoryService.transferStock({ batchId: actionModal.id, toLocationId: 'LOC-ER', quantity: actionModal.currentQuantity });
                setToast(`Successfully transferred Batch ${actionModal.batchNumber} to ER Annex to accelerate consumption.`);
              } else if (actionModal.action === 'Mark for disposal') {
                await inventoryService.disposeStock({ batchId: actionModal.id, quantity: actionModal.currentQuantity });
                setToast(`Batch ${actionModal.batchNumber} has been logged for regulatory disposal.`);
              } else {
                setToast(`Recommendation executed for ${actionModal.batchNumber}.`);
              }
              await loadData();
            } catch (err) {
              setToast(`Failed to execute recommendation.`);
            }
            setActionModal(null);
          }}>
            Execute & Resolve Risk
          </button>
        </div>
      </Modal>
    )}

    {(showAdd || editingBatch) && (
      <Modal title={editingBatch ? "Edit Batch" : "Add New Batch"} close={() => { setShowAdd(false); setEditingBatch(null); }}>
        <form className="form-grid" style={{gridTemplateColumns:"1fr 1fr", gap:15}} onSubmit={handleSave}>
          <label style={{gridColumn: "1 / -1"}}>Medicine
            <select name="medicineId" defaultValue={editingBatch?.medicine?.id || editingBatch?.medicineId} required>
              <option value="">Select Medicine</option>
              {medicines.map(m => <option key={m.id} value={m.id}>{m.genericName} {m.strength} ({m.code})</option>)}
            </select>
          </label>
          <label>Batch Number<input name="batchNumber" defaultValue={editingBatch?.batchNumber} required placeholder="e.g. BATCH123"/></label>
          <label>Manufacturer<input name="manufacturer" defaultValue={editingBatch?.manufacturer} required placeholder="e.g. Pfizer"/></label>
          
          <label>Manufacturing Date<input type="date" name="manufacturingDate" defaultValue={editingBatch?.manufacturingDate} required/></label>
          <label>Expiry Date<input type="date" name="expiryDate" defaultValue={editingBatch?.expiryDate} required/></label>
          
          <label>Received Quantity<input type="number" name="receivedQuantity" defaultValue={editingBatch?.receivedQuantity} required/></label>
          <label>Current Quantity<input type="number" name="currentQuantity" defaultValue={editingBatch?.currentQuantity} required/></label>
          
          <label>Purchase Price (₹)<input type="number" step="0.01" name="purchasePrice" defaultValue={editingBatch?.purchasePrice} required/></label>
          
          <div className="modal-actions" style={{gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop:20}}>
            <button type="button" className="secondary" onClick={() => { setShowAdd(false); setEditingBatch(null); }}>Cancel</button>
            <button type="submit" className="primary">{editingBatch ? "Save Changes" : "Save Batch"}</button>
          </div>
        </form>
      </Modal>
    )}
  </div>;
}
