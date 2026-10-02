import React, { useState, useEffect, useMemo } from "react";
import { Filter, Plus, RefreshCw, PackageSearch, Camera, Sparkles, Edit, Trash2 } from "lucide-react";
import { inventoryService } from "../services/inventoryService";
import { Status, Modal, EmptyState } from "../components/ui";
import { MedicineDetail } from "./MedicineDetail";

export function Inventory({ search, setToast }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  
  // Modals state
  const [showAdd, setShowAdd] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [selectedDetailMed, setSelectedDetailMed] = useState(null);

  // Vision scanner state
  const [isScanning, setIsScanning] = useState(false);
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
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedData({ 
        genericName: "Ciprofloxacin", brandName: "Cipro", 
        strength: "500mg", category: "Antibiotic", 
        manufacturer: "NovaMed" 
      });
    }, 2500);
  }

  const handleSave = () => {
    setShowAdd(false);
    setEditingMed(null);
    setScannedData(null);
    setIsDirty(false);
    setToast("Medicine saved successfully");
    loadMeds();
  }

  const handleClose = () => {
    setShowAdd(false);
    setEditingMed(null);
    setScannedData(null);
    setIsDirty(false);
  };

  const filtered = useMemo(() => {
    return medicines.filter(m => {
      const matchSearch = `${m.genericName} ${m.brandName} ${m.code} ${m.category}`.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filter === "All") return true;
      if (filter === "Healthy") return m.totalStock >= m.safetyStock && m.status === "ACTIVE";
      if (filter === "Low stock") return m.totalStock < m.safetyStock && m.totalStock > 0 && m.status === "ACTIVE";
      if (filter === "Out of stock") return m.totalStock === 0 && m.status === "ACTIVE";
      if (filter === "Archived") return m.status === "INACTIVE";
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
        {["All","Healthy","Low stock","Out of stock", "Archived"].map(x => (
          <button key={x} className={filter===x?"selected":""} onClick={()=>setFilter(x)}>
            {x}
            <span>{
              x==="All" ? medicines.length :
              x==="Healthy" ? medicines.filter(m=>m.totalStock >= m.safetyStock && m.status==="ACTIVE").length :
              x==="Low stock" ? medicines.filter(m=>m.totalStock > 0 && m.totalStock < m.safetyStock && m.status==="ACTIVE").length :
              x==="Out of stock" ? medicines.filter(m=>m.totalStock === 0 && m.status==="ACTIVE").length :
              medicines.filter(m=>m.status==="INACTIVE").length
            }</span>
          </button>
        ))}
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
         filtered.map(m => (
          <div className="data-row" key={m.id} style={{cursor: "pointer"}} onClick={(e) => {
             if (e.target.closest('button')) return; // ignore button clicks
             setSelectedDetailMed(m);
          }}>
            <div className="med-cell">
              <div className="medicine-icon"><PackageSearch size={17}/></div>
              <div><b>{m.genericName} {m.strength}</b><span>{m.code} • {m.brandName}</span></div>
            </div>
            <span><b>{m.category}</b><small>{m.dosageForm}</small></span>
            <span>
              <b>{m.totalStock.toLocaleString()} {m.unit}s</b>
              <small style={{color: m.totalStock < m.safetyStock ? "var(--rose)" : "var(--muted)"}}>
                / {m.safetyStock} safety stock
              </small>
            </span>
            <span>{m.manufacturer}</span>
            <span><Status value={m.status === "INACTIVE" ? "Archived" : m.totalStock === 0 ? "Out of stock" : m.totalStock < m.safetyStock ? "Low stock" : "Healthy"}/></span>
            <span style={{display:"flex", gap:10}}>
              <button className="icon-btn" onClick={()=>setEditingMed(m)}><Edit size={15}/></button>
              <button className="icon-btn"><Trash2 size={15} color="var(--rose)"/></button>
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* ADD / EDIT MODAL */}
    {(showAdd || editingMed) && <Modal title={editingMed ? "Edit Medicine Master" : "Add New Medicine"} close={handleClose}>
      {showAdd && !scannedData && !isScanning ? (
        <div className="vision-prompt panel" style={{textAlign:"center", padding:20, background:"var(--surface-2)", marginBottom:20, border:"1px dashed var(--primary)"}}>
           <Sparkles size={20} color="var(--primary)" style={{marginBottom:10}}/>
           <h4>AI Vision Scanner</h4>
           <p style={{fontSize:11, color:"var(--muted)", margin:"5px 0 10px"}}>Hold the medicine bottle to the camera to auto-extract product data.</p>
           <button className="primary" onClick={handleScan}><Camera size={14}/> Start Camera</button>
        </div>
      ) : isScanning ? (
        <div className="vision-scan-active panel" style={{textAlign:"center", padding:20, background:"#071a1a", color:"#eaf8f6", marginBottom:20, position:"relative", overflow:"hidden"}}>
           <div className="scanner-line"></div>
           <Camera size={30} className="pulse" style={{marginBottom:10, color:"var(--primary)"}}/>
           <h4>Analyzing Label...</h4>
           <p style={{fontSize:11, color:"#8faca9", margin:"5px 0 0"}}>Extracting via Neural Engine.</p>
        </div>
      ) : null}

      <div className="form-grid" style={{opacity: isScanning ? 0.3 : 1, pointerEvents: isScanning ? "none" : "auto", gridTemplateColumns:"1fr 1fr", gap:15}} onChange={() => setIsDirty(true)}>
        <label>Medicine Code<input defaultValue={editingMed?.code} placeholder="e.g. AMX500"/></label>
        <label>Generic Name<input defaultValue={editingMed?.genericName || scannedData?.genericName} placeholder="e.g. Amoxicillin"/></label>
        <label>Brand Name<input defaultValue={editingMed?.brandName || scannedData?.brandName} placeholder="e.g. Amoxil"/></label>
        <label>Strength<input defaultValue={editingMed?.strength || scannedData?.strength} placeholder="e.g. 500mg"/></label>
        
        <label>Category
          <select defaultValue={editingMed?.category || scannedData?.category}>
            <option>Antibiotic</option><option>Analgesic</option><option>Cardiology</option><option>Diabetes</option>
          </select>
        </label>
        <label>Dosage Form
          <select defaultValue={editingMed?.dosageForm}>
            <option>Tablet</option><option>Capsule</option><option>Injection</option><option>Syrup</option>
          </select>
        </label>
        <label>Manufacturer<input defaultValue={editingMed?.manufacturer || scannedData?.manufacturer}/></label>
        <label>Unit of Measure<select defaultValue={editingMed?.unit}><option>Tablet</option><option>Capsule</option><option>Vial</option></select></label>
        
        <label>Safety Stock<input type="number" defaultValue={editingMed?.safetyStock} placeholder="100"/></label>
        <label>Reorder Level<input type="number" defaultValue={editingMed?.reorderLevel} placeholder="200"/></label>
      </div>
      
      <div className="modal-actions" style={{marginTop:20}}>
        <button className="secondary" onClick={handleClose}>Cancel</button>
        <button className="primary" onClick={handleSave}>{editingMed ? "Save Changes" : "Save Medicine"}</button>
      </div>
    </Modal>}
  </div>;
}
