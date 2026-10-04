import React, { useState } from "react";
import { Plus, PackageCheck, ScanLine, ShoppingCart, Truck, ChevronRight } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { EmptyState, Modal } from "../components/ui";

export function Purchases({ setToast }) {
  const { data: purchaseOrders, loading, refetch } = useApi("/procurement/purchase-orders");
  const [showReceiving, setShowReceiving] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [grnForm, setGrnForm] = useState({ poId: "", batch: "", expiry: "", quantity: "" });

  const handleReceiveGRN = async () => {
    if (!grnForm.poId) return setToast("Select a PO first.");
    const selectedPo = purchaseOrders.find(p => p.id === grnForm.poId);
    if (!selectedPo || !selectedPo.items || selectedPo.items.length === 0) return setToast("PO has no items.");
    
    // Create payload
    const payload = {
      grnNumber: "GRN-" + Date.now(),
      notes: "Auto-received via UI",
      items: selectedPo.items.map(item => ({
        purchaseOrderItem: { id: item.id },
        receivedQuantity: parseInt(grnForm.quantity) || item.quantity,
        acceptedQuantity: parseInt(grnForm.quantity) || item.quantity
      }))
    };

    try {
      const res = await fetch(`/api/procurement/purchase-orders/${grnForm.poId}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setToast("GRN Received and Inventory Updated.");
        setShowReceiving(false);
        setGrnForm({ poId: "", batch: "", expiry: "", quantity: "" });
        refetch();
      } else {
        setToast("Failed to receive GRN.");
      }
    } catch (e) {
      setToast("Error receiving GRN.");
    }
  };

  if (loading) {
    return <div className="page" style={{ padding: 40, textAlign: 'center' }}>Loading procurement data...</div>;
  }

  const pos = purchaseOrders || [];
  
  const filteredPos = activeTab === "All" ? pos : pos.filter(po => {
    if (activeTab === "Pending Approval") return po.status === "PENDING_APPROVAL" || po.status === "DRAFT";
    if (activeTab === "Approved") return po.status === "APPROVED";
    if (activeTab === "Partially Received") return po.status === "PARTIALLY_RECEIVED";
    return true;
  });

  return <div className="page">
    <div className="page-heading">
      <div>
        <span className="eyebrow">PROCUREMENT COMMAND CENTER</span>
        <h1>Purchase Orders</h1>
        <p>Manage purchase lifecycle, supplier performance, and receiving.</p>
      </div>
      <div className="heading-actions flex gap-2">
        <button className="secondary" onClick={() => setShowReceiving(true)}><PackageCheck size={16}/> Receive GRN</button>
        <button className="primary" onClick={() => setToast("Create PO feature opens.")}><Plus size={16}/> New PO</button>
      </div>
    </div>

    <div className="tabs" style={{ display: "flex", gap: 20, borderBottom: "1px solid var(--line)", marginBottom: 20 }}>
      {["All", "Pending Approval", "Approved", "Partially Received"].map(tab => (
        <button 
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{ 
            background: "transparent", 
            border: "none", 
            padding: "10px 0",
            color: activeTab === tab ? "var(--primary)" : "var(--muted)",
            borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
            cursor: "pointer",
            fontWeight: activeTab === tab ? 600 : 400
          }}
        >
          {tab}
        </button>
      ))}
    </div>

    <div className="po-grid" style={{display: "grid", gap: 15}}>
      {filteredPos.length === 0 ? <EmptyState icon={ShoppingCart} title="No Purchase Orders" description="No active purchase orders found in this category." /> : 
       filteredPos.map(po => (
        <div key={po.id} className="panel po-card" style={{display:"flex", flexDirection:"column", gap:15}}>
          <div className="po-head" style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
            <div className="po-title">
              <ShoppingCart size={18} color="var(--primary)"/> 
              <h3>{po.poNumber}</h3>
            </div>
            <span className={`status ${po.status.toLowerCase().replace('_', '-')}`}>{po.status}</span>
          </div>
          
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
             <div style={{display:"flex", alignItems:"center", gap:15}}>
                <div style={{display:"flex", alignItems:"center", gap:5, fontSize:12, color:"var(--text)"}}>
                  <Truck size={14} color="var(--muted)"/> {po.supplier?.name || "Unknown Supplier"}
                </div>
                <div style={{display:"flex", alignItems:"center", gap:5, fontSize:12, color:"var(--text)"}}>
                  Total: <b>{po.currency} {po.total.toLocaleString()}</b>
                </div>
             </div>
             <div className="po-actions" style={{display:"flex", gap:10}}>
                {(po.status === "DRAFT" || po.status === "PENDING_APPROVAL") && (
                  <button className="secondary" onClick={async () => {
                     try {
                       const res = await fetch(`/api/procurement/purchase-orders/${po.id}/approve`, {
                         method: 'POST',
                         headers: {
                           'Content-Type': 'application/json',
                           'Authorization': `Bearer ${localStorage.getItem('token')}`
                         }
                       });
                       if(res.ok) {
                         setToast("PO Approved successfully.");
                         refetch();
                       } else {
                         setToast("Failed to approve PO.");
                       }
                     } catch(e) {
                       setToast("Error approving PO.");
                     }
                  }}>Approve</button>
                )}
                <button className="primary" onClick={() => setToast("View PO Details.")}>View</button>
             </div>
          </div>
        </div>
      ))}
    </div>

    {showReceiving && (
      <Modal title="Goods Receipt Note (GRN)" close={() => setShowReceiving(false)}>
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-center justify-between mb-6">
          <div>
            <h4 className="text-white font-medium flex items-center gap-2"><ScanLine className="text-brand" size={18}/> Scan Barcode or QR Code</h4>
            <p className="text-sm text-slate-400 mt-1">Scan the shipment manifest or PO barcode to auto-fill.</p>
          </div>
          <button className="primary px-4">Start Scanner</button>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <label>Purchase Order Ref
            <select value={grnForm.poId} onChange={e=>setGrnForm({...grnForm, poId: e.target.value})}>
               <option value="">Select Approved PO...</option>
               {pos.filter(p => p.status === "APPROVED" || p.status === "PARTIALLY_RECEIVED").map(p => (
                 <option key={p.id} value={p.id}>{p.poNumber}</option>
               ))}
            </select>
          </label>
          <label>Batch Number
            <input type="text" placeholder="Scan or enter batch" value={grnForm.batch} onChange={e=>setGrnForm({...grnForm, batch: e.target.value})} />
          </label>
          <label>Expiry Date
            <input type="date" value={grnForm.expiry} onChange={e=>setGrnForm({...grnForm, expiry: e.target.value})} />
          </label>
          <label>Quantity Received (Auto-applies to all items)
            <input type="number" placeholder="Enter quantity" value={grnForm.quantity} onChange={e=>setGrnForm({...grnForm, quantity: e.target.value})} />
          </label>
          <label>Storage Location
            <select>
              <option>Central Warehouse (Aisle A)</option>
              <option>Cold Storage Array Alpha</option>
            </select>
          </label>
        </div>

        <div className="modal-actions mt-6 flex justify-between">
          <button className="secondary" onClick={() => setShowReceiving(false)}>Cancel</button>
          <button className="primary" onClick={handleReceiveGRN}>Confirm & Receive into Inventory</button>
        </div>
      </Modal>
    )}
  </div>;
}
