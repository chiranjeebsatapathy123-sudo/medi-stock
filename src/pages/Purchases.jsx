import React, { useState, useEffect } from "react";
import { Plus, Sparkles, ShoppingCart, Truck, CalendarClock, ChevronRight, PackageCheck, ScanLine, ThermometerSnowflake } from "lucide-react";
import { db } from "../services/mockDb";
import { EmptyState, Modal } from "../components/ui";

export function Purchases({ setToast }) {
  const [recommendations, setRecommendations] = useState([]);
  const [showReceiving, setShowReceiving] = useState(false);

  useEffect(() => {
    // Generate AI recommendations based on stock health
    const recs = db.medicines.map(med => {
      const batches = db.batches.filter(b => b.medicineId === med.id);
      const currentStock = batches.reduce((sum, b) => sum + b.currentQty, 0);
      
      if (currentStock < med.safetyStock + 50) {
        const supplier = db.suppliers.find(s => s.id === "SUP-001") || db.suppliers[0];
        const suggestedQuantity = med.maxStock - currentStock;
        const avgDemand = Math.floor(med.reorderLevel / 2); // mock data
        
        return {
          id: `REC-${med.id}`,
          medicine: med,
          currentStock,
          avgDemand,
          forecastDemand: Math.floor(avgDemand * 1.2), // predicting +20% demand
          supplier,
          suggestedQuantity,
          estimatedCost: suggestedQuantity * (batches[0]?.purchasePrice || 2.5),
          reason: currentStock < med.safetyStock ? "Below safety stock" : "Upcoming seasonal trend",
          status: "DRAFT"
        };
      }
      return null;
    }).filter(Boolean);

    setRecommendations(recs);
  }, []);

  return <div className="page">
    <div className="page-heading">
      <div>
        <span className="eyebrow">PROCUREMENT</span>
        <h1>Smart Purchases</h1>
        <p>AI-driven purchase orders and procurement planning.</p>
      </div>
      <div className="heading-actions flex gap-2">
        <button className="secondary" onClick={() => setShowReceiving(true)}><PackageCheck size={16}/> Receive Goods</button>
        <button className="primary" onClick={() => setToast && setToast("Opening New PO dialog...")}><Plus size={16}/> New PO</button>
      </div>
    </div>

    <div className="panel" style={{marginBottom: 20, background: "var(--surface-2)", border: "1px dashed var(--primary)"}}>
      <div className="panel-head">
        <div><h3 style={{display:"flex", alignItems:"center", gap:8}}><Sparkles size={18} color="var(--primary)"/> AI Purchase Planner</h3><p>Recommendations based on FEFO exhaustion and seasonal demand models.</p></div>
      </div>
    </div>

    <div className="po-grid" style={{display: "grid", gap: 15}}>
      {recommendations.length === 0 ? <EmptyState icon={ShoppingCart} title="No purchases recommended" description="Inventory levels are optimal. No restock recommendations at this time." /> : 
       recommendations.map(r => (
        <div key={r.id} className="panel po-card" style={{display:"flex", flexDirection:"column", gap:15}}>
          <div className="po-head" style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
            <div className="po-title">
              <ShoppingCart size={18} color="var(--primary)"/> 
              <h3>Restock: {r.medicine.genericName} {r.medicine.strength}</h3>
            </div>
            <span className={`status ${r.reason.includes("Below") ? "critical" : "watch"}`}>{r.reason}</span>
          </div>
          
          <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:15, padding:"15px 0", borderTop:"1px solid var(--line)", borderBottom:"1px solid var(--line)"}}>
             <div style={{display:"flex", flexDirection:"column", gap:4}}><span style={{fontSize:11, color:"var(--muted)"}}>Current Stock</span><b>{r.currentStock} {r.medicine.unit}</b></div>
             <div style={{display:"flex", flexDirection:"column", gap:4}}><span style={{fontSize:11, color:"var(--muted)"}}>Safety / Max</span><b>{r.medicine.safetyStock} / {r.medicine.maxStock}</b></div>
             <div style={{display:"flex", flexDirection:"column", gap:4}}><span style={{fontSize:11, color:"var(--muted)"}}>Avg / Forecast Demand</span><b>{r.avgDemand} / {r.forecastDemand} {r.medicine.unit}/mo</b></div>
             <div style={{display:"flex", flexDirection:"column", gap:4}}><span style={{fontSize:11, color:"var(--muted)"}}>Suggested Qty</span><b style={{color:"var(--primary)"}}>+{r.suggestedQuantity} {r.medicine.unit}</b></div>
          </div>
          
           <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
             <div style={{display:"flex", alignItems:"center", gap:15}}>
                <div style={{display:"flex", alignItems:"center", gap:5, fontSize:12, color:"var(--text)"}}><Truck size={14} color="var(--muted)"/> {r.supplier.name} ({r.supplier.leadTimeDays}d lead)</div>
                <div style={{display:"flex", alignItems:"center", gap:5, fontSize:12, color:"var(--text)"}}>Estimated Cost: <b>₹{r.estimatedCost.toLocaleString()}</b></div>
             </div>
             <div className="po-actions" style={{display:"flex", gap:10}}>
                <button className="secondary" onClick={() => setToast("Opening editor...")}>Edit</button>
                <button className="primary" onClick={() => {
                  setToast(`Purchase Order generated for ${r.suggestedQuantity} ${r.medicine.unit} of ${r.medicine.genericName}.`);
                  setRecommendations(recommendations.filter(rec => rec.id !== r.id));
                }}>Create Purchase Order</button>
             </div>
          </div>
        </div>
      ))}
    </div>

    {showReceiving && (
      <Modal title="Advanced Goods Receiving Workspace" close={() => setShowReceiving(false)}>
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-center justify-between mb-6">
          <div>
            <h4 className="text-white font-medium flex items-center gap-2"><ScanLine className="text-brand" size={18}/> Scan Barcode or QR Code</h4>
            <p className="text-sm text-slate-400 mt-1">Scan the shipment manifest, PO barcode, or GS1 batch code to auto-fill.</p>
          </div>
          <button className="primary px-4">Start Scanner</button>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <label>Purchase Order Ref
            <input type="text" placeholder="PO-2026-..." />
          </label>
          <label>Supplier
            <select>
              <option>AmerisourceBergen</option>
              <option>McKesson</option>
            </select>
          </label>
          <label>Batch Number
            <input type="text" placeholder="Scan or enter batch" />
          </label>
          <label>Expiry Date
            <input type="date" />
          </label>
          <label>Quantity Received
            <input type="number" placeholder="Enter quantity" />
          </label>
          <label>Storage Location
            <select>
              <option>Central Warehouse (Aisle A)</option>
              <option>Cold Storage Array Alpha</option>
            </select>
          </label>
        </div>

        <div className="mt-4 p-4 border border-rose-500/20 bg-rose-500/5 rounded flex gap-3">
          <ThermometerSnowflake className="text-blue-400 shrink-0 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-medium text-white">Cold Chain Verification Required</div>
            <div className="text-xs text-slate-300 mt-1">This product requires 2°C - 8°C storage. Please verify temperature logger reading before accepting into inventory.</div>
            <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer">
              <input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-brand focus:ring-brand" />
              I verify the temperature log is within acceptable limits.
            </label>
          </div>
        </div>

        <div className="modal-actions mt-6 flex justify-between">
          <button className="secondary" onClick={() => setShowReceiving(false)}>Cancel</button>
          <button className="primary" onClick={() => { setShowReceiving(false); if(setToast) setToast("Goods received and inventory updated transactionally."); }}>Confirm & Receive into Inventory</button>
        </div>
      </Modal>
    )}
  </div>;
}
