import React, { useState } from "react";
import { Plus, Truck, ChevronRight, Edit, Trash2 } from "lucide-react";
import { useApi } from "../hooks/useApi";
import client from "../api/client";
import { Modal } from "../components/ui";

export function Suppliers({ setToast }) {
  const { data: suppliers, loading, refetch } = useApi("/suppliers");
  const [showAdd, setShowAdd] = useState(false);
  const [editingSup, setEditingSup] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", contactPerson: "", leadTimeDays: 7, currency: "USD" });

  if (loading) {
    return <div className="page" style={{ padding: 40, textAlign: 'center' }}>Loading suppliers...</div>;
  }

  const supplierList = suppliers || [];

  const handleSave = async () => {
    try {
      if (editingSup) {
        await client.put(`/suppliers/${editingSup.id}`, formData);
      } else {
        await client.post('/suppliers', formData);
      }
      setShowAdd(false);
      setEditingSup(null);
      refetch();
      if(setToast) setToast(editingSup ? "Supplier updated successfully." : "Supplier added successfully.");
    } catch(e) {
      if(setToast) setToast("Failed to save supplier.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await client.delete(`/suppliers/${id}`);
        refetch();
        if(setToast) setToast("Supplier deleted successfully.");
      } catch(e) {
        if(setToast) setToast("Failed to delete supplier.");
      }
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
               <div style={{display:"flex", gap:5, alignItems:"center"}}>
                 <span className={`status ${statusTone}`}>{s.status}</span>
                 <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setEditingSup(s); setFormData({name: s.name, email: s.email, contactPerson: s.contactPerson, leadTimeDays: s.leadTimeDays, currency: s.currency}); setShowAdd(true); }}><Edit size={14}/></button>
                 <button className="icon-btn" onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}><Trash2 size={14} color="var(--rose)"/></button>
               </div>
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
      <Modal title={editingSup ? "Edit Supplier" : "Add Supplier"} close={() => { setShowAdd(false); setEditingSup(null); }}>
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
          <button className="secondary" onClick={() => { setShowAdd(false); setEditingSup(null); }}>Cancel</button>
          <button className="primary" onClick={handleSave}>{editingSup ? "Save Changes" : "Save Supplier"}</button>
        </div>
      </Modal>
    )}
  </div>;
}
