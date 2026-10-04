import React, { useState } from "react";
import { Plus, PackageCheck, ScanLine, ShoppingCart, Truck, ChevronRight } from "lucide-react";
import { useApi } from "../hooks/useApi";
import client from "../api/client";
import { EmptyState, Modal } from "../components/ui";

export function Purchases({ setToast }) {
  const { data: purchaseOrders, loading, refetch } = useApi("/procurement/purchase-orders");
  const { data: suppliers } = useApi("/suppliers");
  const { data: medicines } = useApi("/medicines");
  const [showReceiving, setShowReceiving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [viewingPo, setViewingPo] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [grnForm, setGrnForm] = useState({ poId: "", batch: "", expiry: "", quantity: "" });
  const [poForm, setPoForm] = useState({ poNumber: "PO-" + Date.now(), supplierId: "", items: [{ medicineId: "", quantity: 1, unitPrice: 0 }] });

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
      const res = await client.post(`/procurement/purchase-orders/${grnForm.poId}/receive`, payload);
      if (res.status === 200 || res.status === 201) {
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

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!poForm.supplierId) return setToast("Select a supplier.");
    if (poForm.items.length === 0 || !poForm.items[0].medicineId) return setToast("Add at least one item.");

    let total = 0;
    const payload = {
      poNumber: poForm.poNumber,
      supplier: { id: poForm.supplierId },
      items: poForm.items.map(item => {
        total += (item.quantity * item.unitPrice);
        return {
          medicine: { id: item.medicineId },
          quantity: parseInt(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          totalPrice: (item.quantity * item.unitPrice)
        };
      }),
      total: total,
      subtotal: total
    };

    try {
      const res = await client.post('/procurement/purchase-orders', payload);
      if (res.status === 200 || res.status === 201) {
        setToast("Purchase Order created successfully.");
        setShowCreate(false);
        setPoForm({ poNumber: "PO-" + Date.now(), supplierId: "", items: [{ medicineId: "", quantity: 1, unitPrice: 0 }] });
        refetch();
      } else {
        setToast("Failed to create PO.");
      }
    } catch (e) {
      setToast("Error creating PO.");
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
        <button className="primary" onClick={() => setShowCreate(true)}><Plus size={16}/> New PO</button>
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
                       const res = await client.post(`/procurement/purchase-orders/${po.id}/approve`, {});
                       if(res.status === 200) {
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
                <button className="primary" onClick={() => setViewingPo(po)}>View</button>
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

    {showCreate && (
      <Modal title="Create Purchase Order" close={() => setShowCreate(false)}>
        <form className="form-grid" onSubmit={handleCreatePO}>
          <label>PO Number
            <input type="text" value={poForm.poNumber} onChange={e=>setPoForm({...poForm, poNumber: e.target.value})} required/>
          </label>
          <label>Supplier
            <select value={poForm.supplierId} onChange={e=>setPoForm({...poForm, supplierId: e.target.value})} required>
               <option value="">Select Supplier...</option>
               {(suppliers || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          
          <div style={{gridColumn: "1 / -1", borderTop: "1px solid var(--line)", paddingTop: 15, marginTop: 15}}>
             <h4 style={{marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>Order Items 
               <button type="button" className="link-btn flex items-center gap-1" onClick={() => setPoForm({...poForm, items: [...poForm.items, { medicineId: "", quantity: 1, unitPrice: 0 }]})}>
                 <Plus size={14}/> Add Item
               </button>
             </h4>
             
             {poForm.items.map((item, index) => (
               <div key={index} style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 10}}>
                 <select value={item.medicineId} onChange={e => {
                   const newItems = [...poForm.items];
                   newItems[index].medicineId = e.target.value;
                   setPoForm({...poForm, items: newItems});
                 }} required>
                   <option value="">Select Medicine</option>
                   {(medicines || []).map(m => <option key={m.id} value={m.id}>{m.genericName} ({m.code})</option>)}
                 </select>
                 <input type="number" placeholder="Qty" value={item.quantity} onChange={e => {
                   const newItems = [...poForm.items];
                   newItems[index].quantity = e.target.value;
                   setPoForm({...poForm, items: newItems});
                 }} required min="1"/>
                 <input type="number" step="0.01" placeholder="Unit Price" value={item.unitPrice} onChange={e => {
                   const newItems = [...poForm.items];
                   newItems[index].unitPrice = e.target.value;
                   setPoForm({...poForm, items: newItems});
                 }} required min="0"/>
               </div>
             ))}
          </div>

          <div className="modal-actions mt-6 flex justify-between" style={{gridColumn: "1 / -1"}}>
            <button type="button" className="secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="primary">Create PO</button>
          </div>
        </form>
      </Modal>
    )}

    {viewingPo && (
      <Modal title={`Purchase Order Details - ${viewingPo.poNumber}`} close={() => setViewingPo(null)}>
        <div style={{ padding: "0 10px" }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20, padding: 15, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--line)' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 5, letterSpacing: 0.5 }}>Supplier</p>
              <h4 style={{ margin: 0, color: 'var(--text)', fontSize: 14 }}>{viewingPo.supplier?.name || "Unknown"}</h4>
            </div>
            <div>
              <p className="eyebrow" style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 5, letterSpacing: 0.5 }}>Status</p>
              <span className={`status ${viewingPo.status?.toLowerCase().replace('_', '-')}`} style={{ display: 'inline-block' }}>{viewingPo.status}</span>
            </div>
          </div>
          
          <h4 style={{ marginBottom: 15, color: 'var(--text)', borderBottom: '1px solid var(--line)', paddingBottom: 8, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={16} color="var(--primary)" /> Order Items
          </h4>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>
                <th style={{ padding: '10px 5px', fontWeight: 500 }}>Medicine</th>
                <th style={{ padding: '10px 5px', fontWeight: 500 }}>Qty</th>
                <th style={{ padding: '10px 5px', fontWeight: 500 }}>Unit Price</th>
                <th style={{ padding: '10px 5px', textAlign: 'right', fontWeight: 500 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {viewingPo.items?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dashed var(--line)', color: 'var(--text)' }}>
                  <td style={{ padding: '12px 5px' }}>
                    <div style={{ fontWeight: 500 }}>{item.medicine?.genericName || "Unknown"}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.medicine?.medicineCode}</div>
                  </td>
                  <td style={{ padding: '12px 5px' }}>{item.quantity}</td>
                  <td style={{ padding: '12px 5px' }}>{viewingPo.currency || 'USD'} {Number(item.unitPrice || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px 5px', textAlign: 'right', fontWeight: 500 }}>{viewingPo.currency || 'USD'} {Number(item.totalPrice || 0).toFixed(2)}</td>
                </tr>
              ))}
              {(!viewingPo.items || viewingPo.items.length === 0) && (
                <tr><td colSpan="4" style={{ padding: '15px 5px', textAlign: 'center', color: 'var(--muted)' }}>No items found</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ padding: '20px 5px 5px 5px', textAlign: 'right', fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>Total Amount:</td>
                <td style={{ padding: '20px 5px 5px 5px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>{viewingPo.currency || 'USD'} {Number(viewingPo.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
          <div className="modal-actions mt-6 flex justify-end" style={{ borderTop: '1px solid var(--line)', paddingTop: 15, marginTop: 20 }}>
            <button className="primary" onClick={() => setViewingPo(null)}>Close</button>
          </div>
        </div>
      </Modal>
    )}
  </div>;
}
