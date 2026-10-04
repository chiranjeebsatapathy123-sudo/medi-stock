import React, { useState, useEffect, useMemo } from "react";
import { Filter, Plus, RefreshCw, PackageSearch, Camera, Sparkles, Edit, Trash2, AlertOctagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { inventoryService } from "../services/inventoryService";
import { Status, Modal, EmptyState } from "../components/ui";
import { MedicineDetail } from "./MedicineDetail";
import { CameraScanner } from "../components/CameraScanner";

export function Inventory({ search, setToast }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  
  // Modals state
  const [showAdd, setShowAdd] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [selectedDetailMed, setSelectedDetailMed] = useState(null);

  // Vision scanner state
  const [showCamera, setShowCamera] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    loadMeds();
  }, []);

  async function loadMeds() {
    setLoading(true);
    const data = await inventoryService.getMedicines();
    setMedicines(data);
    setLoading(false);
  }

  const handleScan = () => {
    setShowCamera(true);
  }

  const handleScanComplete = (data) => {
    setShowCamera(false);
    setScannedData({
      genericName: data.name.split(' ')[0],
      brandName: data.name,
      strength: data.name.match(/\d+[a-zA-Z]+/)?.[0] || "",
      category: "Antibiotic", // Mock category based on scan
      manufacturer: data.manufacturer
    });
    setToast("AI Vision data extracted successfully");
  }

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convert field names to match backend entity
    data.medicineCode = data.code;
    delete data.code;

    // Convert numeric fields
    data.safetyStock = parseInt(data.safetyStock || 0);
    data.reorderLevel = parseInt(data.reorderLevel || 0);

    try {
      if (editingMed) {
        await inventoryService.updateMedicine(editingMed.id, data);
      } else {
        await inventoryService.createMedicine(data);
      }
      setShowAdd(false);
      setEditingMed(null);
      setScannedData(null);
      setIsDirty(false);
      setToast("Medicine saved successfully");
      loadMeds();
    } catch(err) {
      setToast("Failed to save medicine");
    }
  }

  const handleClose = () => {
    setShowAdd(false);
    setEditingMed(null);
    setScannedData(null);
    setIsDirty(false);
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      try {
        await inventoryService.deleteMedicine(id);
        setToast("Medicine deleted successfully");
        loadMeds();
      } catch (err) {
        setToast("Failed to delete medicine");
      }
    }
  };

  const filtered = useMemo(() => {
    return medicines.filter(m => {
      const matchSearch = `${m.genericName} ${m.brandName} ${m.code} ${m.category}`.toLowerCase().includes((search || "").toLowerCase());
      if (!matchSearch) return false;
      const stock = m.totalStock || 0;
      const stat = m.status || "ACTIVE";
      if (filter === "All") return true;
      if (filter === "Healthy") return stock >= (m.safetyStock || 0) && stat === "ACTIVE";
      if (filter === "Low stock") return stock < (m.safetyStock || 0) && stock > 0 && stat === "ACTIVE";
      if (filter === "Out of stock") return stock === 0 && stat === "ACTIVE";
      if (filter === "Archived") return stat === "INACTIVE";
      return true;
    });
  }, [filter, search, medicines]);

  if (selectedDetailMed) {
    return <MedicineDetail medicine={selectedDetailMed} onBack={() => setSelectedDetailMed(null)} />;
  }

  return <div className="page">
    <div className="page-heading">
      <div><span className="eyebrow">MEDICINE MASTER</span><h1>Medicine inventory</h1><p>Manage product catalog, forms, and safety parameters.</p></div>
      <div className="heading-actions">
        <button className="secondary"><Filter size={16}/> Filters</button>
        <button className="primary" onClick={()=>setShowAdd(true)}><Plus size={17}/> Add medicine</button>
      </div>
    </div>
    
    <div className="inventory-toolbar">
      <div className="tabs">
        {["All","Healthy","Low stock","Out of stock", "Archived"].map(x => {
          const count = x==="All" ? medicines.length :
            x==="Healthy" ? medicines.filter(m=>(m.totalStock || 0) >= (m.safetyStock || 0) && (m.status || "ACTIVE")==="ACTIVE").length :
            x==="Low stock" ? medicines.filter(m=>(m.totalStock || 0) > 0 && (m.totalStock || 0) < (m.safetyStock || 0) && (m.status || "ACTIVE")==="ACTIVE").length :
            x==="Out of stock" ? medicines.filter(m=>(m.totalStock || 0) === 0 && (m.status || "ACTIVE")==="ACTIVE").length :
            medicines.filter(m=>(m.status || "ACTIVE")==="INACTIVE").length;
          
          return (
            <button key={x} className={filter===x?"selected":""} onClick={()=>setFilter(x)} style={{ position: 'relative' }}>
              {x}
              <span style={{ 
                background: filter === x ? 'var(--primary)' : 'var(--surface-2)',
                color: filter === x ? 'white' : 'var(--text)' 
              }}>{count}</span>
              {filter === x && (
                <motion.div layoutId="tab-indicator" style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, background: 'var(--primary)', borderRadius: 2 }} />
              )}
            </button>
          )
        })}
      </div>
      <div className="view-note"><RefreshCw size={14}/> {loading ? "Syncing..." : "Updated just now"}</div>
    </div>

    <div className="panel inventory-panel">
      <div className="data-table">
        <div className="table-head">
          <span>Medicine (Code)</span>
          <span>Category & Form</span>
          <span>Total Stock</span>
          <span>Manufacturer</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        
        {loading ? <div style={{padding:60,textAlign:"center", color: 'var(--muted)'}}>Loading inventory master data...</div> : 
         filtered.length === 0 ? <EmptyState icon={PackageSearch} title="No medicines found" description="There are no medicines matching your current filters." actionText="Clear Filters" onAction={()=>setFilter("All")} /> :
         <AnimatePresence mode="popLayout">
           {filtered.map((m, index) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              whileHover={{ scale: 1.01, backgroundColor: 'var(--surface-hover)' }}
            className="data-row" 
            key={m.id} 
            style={{cursor: "pointer", position: 'relative', overflow: 'hidden'}} 
            onClick={(e) => {
             if (e.target.closest('button')) return; // ignore button clicks
             setSelectedDetailMed(m);
          }}>
            {(m.totalStock || 0) === 0 && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--rose)'}}></div>}
            <div className="med-cell">
              <div className="medicine-icon"><PackageSearch size={17}/></div>
              <div><b>{m.genericName} {m.strength}</b><span>{m.code} • {m.brandName}</span></div>
            </div>
            <span><b>{m.category}</b><small>{m.dosageForm}</small></span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <b style={{ color: (m.totalStock || 0) === 0 ? 'var(--rose)' : 'var(--text)' }}>{(m.totalStock || 0).toLocaleString()} {m.unit}s</b>
              <small style={{color: (m.totalStock || 0) < m.safetyStock ? "var(--rose)" : "var(--muted)", display: 'flex', alignItems: 'center', gap: '4px'}}>
                / {m.safetyStock} safety stock
                {(m.totalStock || 0) === 0 && <AlertOctagon size={12} color="var(--rose)" />}
              </small>
            </span>
            <span>{m.manufacturer}</span>
            <span><Status value={m.status === "INACTIVE" ? "Archived" : (m.totalStock || 0) === 0 ? "Out of stock" : (m.totalStock || 0) < m.safetyStock ? "Low stock" : "Healthy"}/></span>
            <span style={{display:"flex", gap:10}}>
              <button className="icon-btn" onClick={(e)=>{ e.stopPropagation(); setEditingMed(m); }}><Edit size={15}/></button>
              <button className="icon-btn" onClick={(e)=>{ e.stopPropagation(); handleDelete(m.id); }}><Trash2 size={15} color="var(--rose)"/></button>
            </span>
          </motion.div>
          ))}
         </AnimatePresence>
        }
      </div>
    </div>

    {/* ADD / EDIT MODAL */}
    {(showAdd || editingMed) && <Modal title={editingMed ? "Edit Medicine Master" : "Add New Medicine"} close={handleClose}>
      {showAdd && !scannedData ? (
        <div className="vision-prompt panel" style={{textAlign:"center", padding:20, background:"var(--surface-2)", marginBottom:20, border:"1px dashed var(--primary)"}}>
           <Sparkles size={20} color="var(--primary)" style={{marginBottom:10}}/>
           <h4>AI Vision Scanner</h4>
           <p style={{fontSize:11, color:"var(--muted)", margin:"5px 0 10px"}}>Hold the medicine bottle to the camera to auto-extract product data.</p>
           <button className="primary" onClick={handleScan}><Camera size={14}/> Start Camera</button>
        </div>
      ) : null}

      <form id="medicineForm" className="form-grid" style={{gridTemplateColumns:"1fr 1fr", gap:15}} onChange={() => setIsDirty(true)} onSubmit={handleSave}>
        <label>Medicine Code<input name="code" defaultValue={editingMed?.code} placeholder="e.g. AMX500" required/></label>
        <label>Generic Name<input name="genericName" defaultValue={editingMed?.genericName || scannedData?.genericName} placeholder="e.g. Amoxicillin" required/></label>
        <label>Brand Name<input name="brandName" defaultValue={editingMed?.brandName || scannedData?.brandName} placeholder="e.g. Amoxil" required/></label>
        <label>Strength<input name="strength" defaultValue={editingMed?.strength || scannedData?.strength} placeholder="e.g. 500mg" required/></label>
        
        <label>Category
          <select name="category" defaultValue={editingMed?.category || scannedData?.category}>
            <option>Antibiotic</option><option>Analgesic</option><option>Cardiology</option><option>Diabetes</option>
          </select>
        </label>
        <label>Dosage Form
          <select name="dosageForm" defaultValue={editingMed?.dosageForm}>
            <option>Tablet</option><option>Capsule</option><option>Injection</option><option>Syrup</option>
          </select>
        </label>
        <label>Manufacturer<input name="manufacturer" defaultValue={editingMed?.manufacturer || scannedData?.manufacturer}/></label>
        <label>Unit of Measure<select name="unit" defaultValue={editingMed?.unit}><option>Tablet</option><option>Capsule</option><option>Vial</option></select></label>
        
        <label>Storage Requirements<input name="storageRequirement" defaultValue={editingMed?.storageRequirement} placeholder="e.g. 2-8°C, Protect from light"/></label>
        
        <label style={{gridColumn: "1 / -1"}}>Description
          <textarea name="description" rows="3" defaultValue={editingMed?.description} placeholder="Enter medicine description, active ingredients, and indications..." style={{width:"100%", padding:"10px", borderRadius:"6px", border:"1px solid var(--line)", background:"var(--bg)", color:"var(--text)"}}></textarea>
        </label>
        
        <label>Safety Stock<input name="safetyStock" type="number" defaultValue={editingMed?.safetyStock} placeholder="100"/></label>
        <label>Reorder Level<input name="reorderLevel" type="number" defaultValue={editingMed?.reorderLevel} placeholder="200"/></label>
        
      <div className="modal-actions" style={{gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop:20}}>
        <button type="button" className="secondary" onClick={handleClose}>Cancel</button>
        <button type="submit" className="primary">{editingMed ? "Save Changes" : "Save Medicine"}</button>
      </div>
      </form>
    </Modal>}
    {showCamera && <CameraScanner onClose={() => setShowCamera(false)} onScanComplete={handleScanComplete} />}
  </div>;
}
