import React, { useState, useEffect, useMemo } from "react";
import { Filter, Plus, RefreshCw, PackageSearch, Camera, Sparkles, Edit, Trash2, AlertOctagon, QrCode, Copy, Check, ThermometerSnowflake, ShieldAlert, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { inventoryService } from "../services/inventoryService";
import { Status, Modal, EmptyState } from "../components/ui";
import { MedicineDetail } from "./MedicineDetail";
import { CameraScanner } from "../components/CameraScanner";
import { Gs1LabelModal } from "../components/Gs1LabelModal";
import { CLINICAL_DEMO_MEDICINES } from "../data/clinicalDemoData";
import client from "../api/client";

export function Inventory({ search, setToast }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filter, setFilter] = useState("All");
  
  // Modals state
  const [showAdd, setShowAdd] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [selectedDetailMed, setSelectedDetailMed] = useState(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedMedForLabel, setSelectedMedForLabel] = useState(null);

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

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      if (setToast) setToast("Populating enterprise clinical medicine catalog...");
      await client.post('/dashboard/seed-demo');
      await loadMeds();
      if (setToast) setToast("Seeded 18 clinical medicines, 15 batches, and 4 clinical patients!");
    } catch(err) {
      setMedicines(CLINICAL_DEMO_MEDICINES);
      if (setToast) setToast("Clinical demo catalog loaded from local memory.");
    } finally {
      setSeeding(false);
    }
  };

  const copyGs1 = (m) => {
    const lot = `${m.code.replace('MED-', '')}-2026-L1`;
    const exp = "271231";
    const gtin = m.gtin || "00312345678906";
    const sn = `SN-${Math.floor(100000 + Math.random() * 900000)}`;
    const gs1 = `(01)${gtin}(17)${exp}(10)${lot}(21)${sn}`;
    navigator.clipboard.writeText(gs1);
    if (setToast) setToast(`Copied GS1 string: ${gs1}`);
  };

  const applyPreset = (presetKey) => {
    const preset = CLINICAL_DEMO_MEDICINES.find(m => m.code === presetKey);
    if (preset) {
      setScannedData({
        code: preset.code,
        genericName: preset.genericName,
        brandName: preset.brandName,
        strength: preset.strength,
        category: preset.category,
        dosageForm: preset.dosageForm,
        manufacturer: preset.manufacturer,
        unit: preset.unit,
        storageRequirement: preset.storageRequirement,
        safetyStock: preset.safetyStock,
        reorderLevel: preset.reorderLevel,
        description: preset.description
      });
      if (setToast) setToast(`Loaded clinical preset: ${preset.genericName}`);
    }
  };

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
      const matchSearch = `${m.genericName} ${m.brandName} ${m.code} ${m.category} ${m.storageRequirement || ''}`.toLowerCase().includes((search || "").toLowerCase());
      if (!matchSearch) return false;
      const stock = m.totalStock || 0;
      const stat = m.status || "ACTIVE";
      if (filter === "All") return true;
      if (filter === "Healthy") return stock >= (m.safetyStock || 0) && stat === "ACTIVE";
      if (filter === "Low stock") return stock < (m.safetyStock || 0) && stock > 0 && stat === "ACTIVE";
      if (filter === "Out of stock") return stock === 0 && stat === "ACTIVE";
      if (filter === "Cold Chain") return m.temperatureSensitive || (m.storageRequirement && m.storageRequirement.includes('2-8'));
      if (filter === "Controlled") return m.controlledMedicine || (m.deaSchedule && m.deaSchedule !== 'NON_CONTROLLED');
      if (filter === "High Alert") return m.ismpHighAlert;
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
        <button 
          className="secondary" 
          style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
          onClick={handleSeedDemo}
          disabled={seeding}
        >
          <Sparkles size={16} className={seeding ? "spin" : ""} /> {seeding ? "Seeding..." : "Seed Demo Catalog"}
        </button>
        <button className="secondary"><Filter size={16}/> Filters</button>
        <button className="primary" onClick={()=>setShowAdd(true)}><Plus size={17}/> Add medicine</button>
      </div>
    </div>
    
    <div className="inventory-toolbar">
      <div className="tabs">
        {["All","Healthy","Low stock","Out of stock","Cold Chain","Controlled","High Alert","Archived"].map(x => {
          const count = x==="All" ? medicines.length :
            x==="Healthy" ? medicines.filter(m=>(m.totalStock || 0) >= (m.safetyStock || 0) && (m.status || "ACTIVE")==="ACTIVE").length :
            x==="Low stock" ? medicines.filter(m=>(m.totalStock || 0) > 0 && (m.totalStock || 0) < (m.safetyStock || 0) && (m.status || "ACTIVE")==="ACTIVE").length :
            x==="Out of stock" ? medicines.filter(m=>(m.totalStock || 0) === 0 && (m.status || "ACTIVE")==="ACTIVE").length :
            x==="Cold Chain" ? medicines.filter(m=>m.temperatureSensitive || (m.storageRequirement && m.storageRequirement.includes('2-8'))).length :
            x==="Controlled" ? medicines.filter(m=>m.controlledMedicine || (m.deaSchedule && m.deaSchedule !== 'NON_CONTROLLED')).length :
            x==="High Alert" ? medicines.filter(m=>m.ismpHighAlert).length :
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
         filtered.length === 0 ? (
           medicines.length === 0 ? (
             <EmptyState 
               icon={PackageSearch} 
               title="Clinical Catalog is Empty" 
               description="Initialize the hospital pharmaceutical catalog with 12 realistic medicines, 15 FEFO batches, and clinical patients." 
               actionText="Seed Clinical Catalog" 
               onAction={handleSeedDemo} 
             />
           ) : (
             <EmptyState 
               icon={PackageSearch} 
               title="No medicines found" 
               description="There are no medicines matching your current filters." 
               actionText="Clear Filters" 
               onAction={()=>setFilter("All")} 
             />
           )
         ) :
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <b>{m.genericName} {m.strength}</b>
                  {m.ismpHighAlert && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(239,68,68,0.18)', color: '#ef4444', fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                      <ShieldAlert size={10} /> HIGH ALERT
                    </span>
                  )}
                  {(m.temperatureSensitive || (m.storageRequirement && m.storageRequirement.includes('2-8'))) && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(56,189,248,0.18)', color: '#38bdf8', fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                      <ThermometerSnowflake size={10} /> 2-8°C
                    </span>
                  )}
                  {(m.controlledMedicine || (m.deaSchedule && m.deaSchedule !== 'NON_CONTROLLED')) && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(245,158,11,0.18)', color: '#f59e0b', fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                      🔒 {m.deaSchedule?.replace('_', ' ') || 'C-II'}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {m.code} • {m.brandName} {m.ndc ? `• NDC ${m.ndc}` : ''}
                </span>
              </div>
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
            <span style={{display:"flex", gap:8}}>
              <button 
                className="icon-btn" 
                title="View & Print GS1 2D DataMatrix Thermal Label"
                onClick={(e)=>{ 
                  e.stopPropagation(); 
                  setSelectedMedForLabel(m); 
                  setShowLabelModal(true); 
                }}
              >
                <QrCode size={15} color="var(--primary)"/>
              </button>
              <button 
                className="icon-btn" 
                title="Copy GS1-128 AI Barcode String"
                onClick={(e)=>{ 
                  e.stopPropagation(); 
                  copyGs1(m); 
                }}
              >
                <Copy size={14}/>
              </button>
              <button className="icon-btn" title="Edit Medicine" onClick={(e)=>{ e.stopPropagation(); setEditingMed(m); }}><Edit size={15}/></button>
              <button className="icon-btn" title="Delete Medicine" onClick={(e)=>{ e.stopPropagation(); handleDelete(m.id); }}><Trash2 size={15} color="var(--rose)"/></button>
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

      {showAdd && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, background: 'rgba(99,102,241,0.08)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.25)' }}>
          <Zap size={16} color="var(--primary)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Quick Demo Drug Preset:</span>
          <select 
            onChange={(e) => applyPreset(e.target.value)} 
            style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }}
            defaultValue=""
          >
            <option value="" disabled>Choose an enterprise medicine preset to auto-fill...</option>
            {CLINICAL_DEMO_MEDICINES.map(cd => (
              <option key={cd.code} value={cd.code}>
                {cd.genericName} {cd.strength} ({cd.brandName}) • {cd.category}
              </option>
            ))}
          </select>
        </div>
      )}

      <form id="medicineForm" className="form-grid" style={{gridTemplateColumns:"1fr 1fr", gap:15}} onChange={() => setIsDirty(true)} onSubmit={handleSave}>
        <label>Medicine Code<input name="code" defaultValue={editingMed?.code || scannedData?.code} placeholder="e.g. AMX500" required/></label>
        <label>Generic Name<input name="genericName" defaultValue={editingMed?.genericName || scannedData?.genericName} placeholder="e.g. Amoxicillin" required/></label>
        <label>Brand Name<input name="brandName" defaultValue={editingMed?.brandName || scannedData?.brandName} placeholder="e.g. Amoxil" required/></label>
        <label>Strength<input name="strength" defaultValue={editingMed?.strength || scannedData?.strength} placeholder="e.g. 500mg" required/></label>
        
        <label>Category
          <select name="category" defaultValue={editingMed?.category || scannedData?.category}>
            <option>Antibiotic</option><option>Analgesic</option><option>Cardiovascular</option><option>Controlled Substance</option><option>Endocrine</option><option>Emergency</option><option>Oncology</option><option>Vaccine</option>
          </select>
        </label>
        <label>Dosage Form
          <select name="dosageForm" defaultValue={editingMed?.dosageForm || scannedData?.dosageForm}>
            <option>Tablet</option><option>Capsule</option><option>Injection</option><option>Injection Vial</option><option>Injection Ampoule</option><option>Syrup</option><option>Auto-Injector</option><option>Sublingual Tablet</option>
          </select>
        </label>
        <label>Manufacturer<input name="manufacturer" defaultValue={editingMed?.manufacturer || scannedData?.manufacturer}/></label>
        <label>Unit of Measure<select name="unit" defaultValue={editingMed?.unit || scannedData?.unit}><option>Tablet</option><option>Capsule</option><option>Vial</option><option>Ampoule</option><option>Auto-Injector</option><option>Pen</option><option>Bottle</option></select></label>
        
        <label>Storage Requirements<input name="storageRequirement" defaultValue={editingMed?.storageRequirement || scannedData?.storageRequirement} placeholder="e.g. 2-8°C, Protect from light"/></label>
        
        <label style={{gridColumn: "1 / -1"}}>Description
          <textarea name="description" rows="3" defaultValue={editingMed?.description || scannedData?.description} placeholder="Enter medicine description, active ingredients, and indications..." style={{width:"100%", padding:"10px", borderRadius:"6px", border:"1px solid var(--line)", background:"var(--bg)", color:"var(--text)"}}></textarea>
        </label>
        
        <label>Safety Stock<input name="safetyStock" type="number" defaultValue={editingMed?.safetyStock ?? scannedData?.safetyStock ?? 100} placeholder="100"/></label>
        <label>Reorder Level<input name="reorderLevel" type="number" defaultValue={editingMed?.reorderLevel ?? scannedData?.reorderLevel ?? 200} placeholder="200"/></label>
        
      <div className="modal-actions" style={{gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop:20}}>
        <button type="button" className="secondary" onClick={handleClose}>Cancel</button>
        <button type="submit" className="primary">{editingMed ? "Save Changes" : "Save Medicine"}</button>
      </div>
      </form>
    </Modal>}
    {showCamera && <CameraScanner onClose={() => setShowCamera(false)} onScanComplete={handleScanComplete} />}
    
    {/* GS1 Thermal Label Modal */}
    {showLabelModal && selectedMedForLabel && (
      <Gs1LabelModal 
        open={showLabelModal} 
        onClose={() => setShowLabelModal(false)} 
        item={{
          gtin: selectedMedForLabel.gtin || "00312345678906",
          batchNumber: `${selectedMedForLabel.code?.replace("MED-", "")}-2026-L1`,
          expiryDate: "2027-12-31",
          serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
          medicine: selectedMedForLabel,
          medicineName: `${selectedMedForLabel.genericName} ${selectedMedForLabel.strength}`
        }}
      />
    )}
  </div>;
}
