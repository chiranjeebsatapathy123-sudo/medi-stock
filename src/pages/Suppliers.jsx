import React, { useState } from "react";
import { Plus, Truck, ChevronRight } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { Modal } from "../components/ui";

export function Suppliers({ setToast }) {
  const { data: suppliers, loading, refetch } = useApi("/suppliers");
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", contactPerson: "", leadTimeDays: 7, currency: "USD" });

  if (loading) {
    return <div className="page" style={{ padding: 40, textAlign: 'center' }}>Loading suppliers...</div>;
  }

  const supplierList = suppliers || [];

  const handleSave = async () => {
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(formData)
      });
      if(res.ok) {
        if(setToast) setToast("Supplier added successfully.");
        setShowAdd(false);
        setFormData({ name: "", email: "", contactPerson: "", leadTimeDays: 7, currency: "USD" });
        refetch();
      } else {
        if(setToast) setToast("Failed to add supplier.");
      }
    } catch(e) {
      if(setToast) setToast("Error adding supplier.");
    }
  };

  return <div className="page">
    <div className="page-heading">
      <div>
        <span className="eyebrow">PARTNERS</span>
        <h1>Suppliers</h1>
        <p>Manage vendors, evaluate performance metrics, and track lead times.</p>
      </div>
      <button className="primary" onClick={() => setShowAdd(true)}><Plus size={16}/> Add supplier</button>
    </div>
    
    <div className="supplier-grid">
      {supplierList.length === 0 && (
        <div style={{ color: 'var(--muted)' }}>No suppliers configured.</div>
      )}
      
      {supplierList.map(s => {
        let statusTone = s.status === "ACTIVE" ? "healthy" : s.status === "WARNING" ? "medium-risk" : "low-stock";

        return (
          <div key={s.id} className="panel supplier-card">
             <div className="sup-head">
               <div><Truck size={18}/> <b>{s.name}</b></div>
               <span className={`status ${statusTone}`}>{s.status}</span>
             </div>
             
             <div style={{fontSize:12, color:"var(--muted)", margin:"-5px 0 10px"}}>{s.contactPerson || s.email || "No contact"}</div>

             <div className="sup-body" style={{gridTemplateColumns: "1fr 1fr", rowGap: 15}}>
               <div className="sup-metric">
                 <span>On-time Delivery</span>
                 <b style={{color: "var(--muted)", fontWeight: "normal"}}>Insufficient Data</b>
               </div>
               <div className="sup-metric">
                 <span>Order Accuracy</span>
                 <b style={{color: "var(--muted)", fontWeight: "normal"}}>Insufficient Data</b>
               </div>
               <div className="sup-metric"><span>Avg. Lead Time</span><b>{s.leadTimeDays || "N/A"} days</b></div>
               <div className="sup-metric">
                 <span>Min Order Val</span>
                 <b>{s.currency} {s.minimumOrderValue || "0"}</b>
               </div>
             </div>
             
             <div className="sup-foot">
               <span>Status: {s.status}</span>
               <button className="link-btn">View profile <ChevronRight size={14}/></button>
             </div>
          </div>
        );
      })}
    </div>

    {showAdd && (
      <Modal title="Add Supplier" close={() => setShowAdd(false)}>
        <div className="form-grid">
          <label>Supplier Name
            <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
          </label>
          <label>Contact Email
            <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
          </label>
          <label>Contact Person
            <input type="text" value={formData.contactPerson} onChange={e=>setFormData({...formData, contactPerson: e.target.value})} />
          </label>
          <label>Lead Time (Days)
            <input type="number" value={formData.leadTimeDays} onChange={e=>setFormData({...formData, leadTimeDays: parseInt(e.target.value)})} />
          </label>
        </div>
        <div className="modal-actions mt-6 flex justify-between">
          <button className="secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="primary" onClick={handleSave}>Save Supplier</button>
        </div>
      </Modal>
    )}
  </div>;
}
