import React, { useState } from "react";
import { Plus, Truck, ChevronRight, Edit, Trash2, Mail, User, Clock, DollarSign, Activity } from "lucide-react";
import { useApi } from "../hooks/useApi";
import client from "../api/client";
import { Modal } from "../components/ui";
import { motion, AnimatePresence } from "framer-motion";

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
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginTop: '20px' }}>
      {supplierList.length === 0 && (
        <div style={{ color: 'var(--muted)', gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--line)' }}>
          No suppliers configured. Click "Add supplier" to create one.
        </div>
      )}
      
      <AnimatePresence>
      {supplierList.map((s, index) => {
        let statusTone = s.status === "ACTIVE" ? "healthy" : s.status === "WARNING" ? "medium-risk" : "low-stock";

        return (
          <motion.div 
            key={s.id} 
            className="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.15)', borderColor: 'var(--primary)' }}
            style={{ display: 'flex', flexDirection: 'column', padding: '20px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--line)', transition: 'border-color 0.2s' }}
          >
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: '15px', marginBottom: '15px' }}>
               <div style={{ display: 'flex', gap: '12px' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Truck size={20} />
                 </div>
                 <div>
                   <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text)' }}>{s.name}</h3>
                   <span className={`status ${statusTone}`} style={{ marginTop: '6px', display: 'inline-block', fontSize: '10px' }}>{s.status}</span>
                 </div>
               </div>
               <div style={{ display:"flex", gap: '5px' }}>
                 <button className="icon-btn" style={{ background: 'var(--surface-2)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text)' }} onClick={(e) => { e.stopPropagation(); setEditingSup(s); setFormData({name: s.name, email: s.email, contactPerson: s.contactPerson, leadTimeDays: s.leadTimeDays, currency: s.currency}); setShowAdd(true); }}><Edit size={14}/></button>
                 <button className="icon-btn" style={{ background: 'var(--rose-soft)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: 'var(--rose)' }} onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}><Trash2 size={14}/></button>
               </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
                 <User size={14} /> {s.contactPerson || "No contact person"}
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
                 <Mail size={14} /> {s.email || "No email provided"}
               </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'var(--surface-2)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Avg. Lead Time</span>
                 <b style={{ fontSize: '14px', color: 'var(--text)' }}>{s.leadTimeDays || "N/A"} days</b>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={12}/> Min Order Val</span>
                 <b style={{ fontSize: '14px', color: 'var(--text)' }}>{s.currency} {s.minimumOrderValue || "0"}</b>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12}/> On-time Delivery</span>
                 <b style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>98.5%</b>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12}/> Order Accuracy</span>
                 <b style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>99.1%</b>
               </div>
             </div>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
               <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Supplier ID: #{s.id.substring(0,6)}</span>
               <button className="link-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '500' }} onClick={() => setToast && setToast("Opening full supplier profile...")}>
                 View profile <ChevronRight size={14}/>
               </button>
             </div>
          </motion.div>
        );
      })}
      </AnimatePresence>
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
