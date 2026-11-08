import React, { useState, useEffect } from "react";
import { Plus, PackageCheck, ScanLine, ShoppingCart, Truck, ChevronRight, Zap, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, RefreshCw } from "lucide-react";
import { useApi } from "../hooks/useApi";
import client from "../api/client";
import { EmptyState, Modal } from "../components/ui";
import { CLINICAL_DEMO_PURCHASE_ORDERS } from "../data/clinicalDemoData";

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

  // Reorder & Stockout Prevention State
  const [riskAnalysis, setRiskAnalysis] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [triggeringReorder, setTriggeringReorder] = useState(false);

  const loadReorderData = async () => {
    setReorderLoading(true);
    try {
      const [resAnalysis, resRequests] = await Promise.all([
        client.get('/procurement/reorder/analysis').catch(() => ({ data: [] })),
        client.get('/procurement/purchase-requests').catch(() => ({ data: [] }))
      ]);
      setRiskAnalysis(resAnalysis.data || []);
      setPurchaseRequests(resRequests.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setReorderLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Autonomous Reorder") {
      loadReorderData();
    }
  }, [activeTab]);

  const handleTriggerReorder = async () => {
    setTriggeringReorder(true);
    try {
      const res = await client.post('/procurement/reorder/trigger');
      if (res.status === 200) {
        setToast(`Autonomous Purchase Request ${res.data.id ? 'generated' : 'created'} for endangered items!`);
      } else {
        setToast("All medication inventory is currently at optimal levels.");
      }
      loadReorderData();
    } catch (e) {
      setToast("Failed to trigger reorder scan.");
    } finally {
      setTriggeringReorder(false);
    }
  };

  const handleConvertToPo = async (requestId) => {
    try {
      const res = await client.post(`/procurement/purchase-requests/${requestId}/convert-to-po`);
      setToast(`Purchase Order ${res.data.poNumber} generated and approved!`);
      loadReorderData();
      refetch();
    } catch (e) {
      setToast(e.response?.data?.message || "Failed to convert request to PO.");
    }
  };

  const handleReceiveGRN = async () => {
    if (!grnForm.poId) return setToast("Select a PO first.");
    const selectedPo = (purchaseOrders || []).find(p => p.id === grnForm.poId);
    if (!selectedPo || !selectedPo.items || selectedPo.items.length === 0) return setToast("PO has no items.");
    
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

  const pos = (purchaseOrders && purchaseOrders.length > 0) ? purchaseOrders : CLINICAL_DEMO_PURCHASE_ORDERS;
  
  const filteredPos = activeTab === "All" ? pos : pos.filter(po => {
    if (activeTab === "Pending Approval") return po.status === "PENDING_APPROVAL" || po.status === "DRAFT";
    if (activeTab === "Approved") return po.status === "APPROVED";
    if (activeTab === "Partially Received") return po.status === "PARTIALLY_RECEIVED";
    return true;
  });

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PROCUREMENT COMMAND CENTER</span>
          <h1>Purchase Orders & Autonomous Reordering</h1>
          <p>Autonomous stockout prevention, consumption velocity replenishment, and PO lifecycle management.</p>
        </div>
        <div className="heading-actions flex gap-2">
          {activeTab === "Autonomous Reorder" ? (
            <button className="primary" onClick={handleTriggerReorder} disabled={triggeringReorder} style={{ background: 'var(--amber)' }}>
              <Zap size={16}/> {triggeringReorder ? "Scanning..." : "Trigger Reorder Protocol"}
            </button>
          ) : (
            <>
              <button className="secondary" onClick={() => setShowReceiving(true)}><PackageCheck size={16}/> Receive GRN</button>
              <button className="primary" onClick={() => setShowCreate(true)}><Plus size={16}/> New PO</button>
            </>
          )}
        </div>
      </div>

      <div className="tabs" style={{ display: "flex", gap: 20, borderBottom: "1px solid var(--line)", marginBottom: 20 }}>
        {["All", "Pending Approval", "Approved", "Partially Received", "Autonomous Reorder"].map(tab => (
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
            {tab === "Autonomous Reorder" ? `⚡ ${tab}` : tab}
          </button>
        ))}
      </div>

      {activeTab === "Autonomous Reorder" ? (
        <div>
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginBottom: 20 }}>
            <div className="panel" style={{ padding: 16 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Endangered Medicines</span>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--rose)', marginTop: 4 }}>
                {riskAnalysis.filter(r => r.riskLevel === 'CRITICAL_STOCKOUT' || r.riskLevel === 'HIGH_RISK').length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Stockout hazard within lead time</div>
            </div>
            <div className="panel" style={{ padding: 16 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Recommended Restock Units</span>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--amber)', marginTop: 4 }}>
                {riskAnalysis.reduce((acc, r) => acc + (r.riskLevel !== 'OPTIMAL' ? r.recommendedReorderQuantity : 0), 0)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Calculated EOQ replenishment volume</div>
            </div>
            <div className="panel" style={{ padding: 16 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Active Purchase Requests</span>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--brand)', marginTop: 4 }}>
                {purchaseRequests.filter(pr => pr.status === 'SUBMITTED').length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Awaiting PO conversion</div>
            </div>
          </div>

          {/* Generated Purchase Requests */}
          {purchaseRequests.length > 0 && (
            <div className="panel" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '12px 16px', background: 'var(--panel-alt)', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: 13 }}>Autonomous Purchase Requests ({purchaseRequests.length})</b>
              </div>
              <div className="data-table">
                <div className="table-head" style={{ gridTemplateColumns: '1fr 1.2fr 2fr 1fr 1.2fr' }}>
                  <span>Priority</span>
                  <span>Status</span>
                  <span>Safeguard Reason</span>
                  <span>Items</span>
                  <span>Actions</span>
                </div>
                {purchaseRequests.map(pr => (
                  <div key={pr.id} className="data-row" style={{ gridTemplateColumns: '1fr 1.2fr 2fr 1fr 1.2fr' }}>
                    <div>
                      <span className={`status ${pr.priority?.includes('EMERGENCY') ? 'rose' : 'amber'}`}>
                        {pr.priority}
                      </span>
                    </div>
                    <div>
                      <span className={`status ${pr.status === 'CONVERTED_TO_PO' ? 'green' : 'blue'}`}>
                        {pr.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12 }}>{pr.reason}</div>
                    <div><b>{pr.items?.length || 0} meds</b></div>
                    <div>
                      {pr.status !== 'CONVERTED_TO_PO' ? (
                        <button
                          className="primary text-xs"
                          style={{ padding: '4px 10px' }}
                          onClick={() => handleConvertToPo(pr.id)}
                        >
                          Convert to PO <ArrowRight size={12}/>
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>PO Active</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stockout Risk Analysis Table */}
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'var(--panel-alt)', borderBottom: '1px solid var(--line)' }}>
              <b style={{ fontSize: 13 }}>Continuous Consumption Velocity & Stockout Risk Analysis</b>
            </div>
            {reorderLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Evaluating burn rates and safety stock thresholds...</div>
            ) : (
              <div className="data-table">
                <div className="table-head" style={{ gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1.2fr 1.2fr 1.2fr' }}>
                  <span>Medicine</span>
                  <span>Active Stock</span>
                  <span>Daily Burn Rate</span>
                  <span>Runout</span>
                  <span>Risk Status</span>
                  <span>Reorder Qty</span>
                  <span>Preferred Supplier</span>
                </div>
                {riskAnalysis.map(item => (
                  <div key={item.medicineId} className="data-row" style={{ gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1.2fr 1.2fr 1.2fr' }}>
                    <div>
                      <b>{item.brandName || item.genericName}</b>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.medicineCode}</div>
                    </div>
                    <div>
                      <b style={{ color: item.currentStock === 0 ? 'var(--rose)' : 'inherit' }}>{item.currentStock} units</b>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>Reorder: {item.reorderLevel}</div>
                    </div>
                    <div>{item.dailyBurnRate} units/day</div>
                    <div>
                      <b style={{ color: item.runoutDays <= 7 ? 'var(--rose)' : 'inherit' }}>
                        {item.runoutDays > 365 ? "> 1 yr" : `${item.runoutDays} days`}
                      </b>
                    </div>
                    <div>
                      <span className={`status ${
                        item.riskLevel === 'CRITICAL_STOCKOUT' ? 'rose' :
                        item.riskLevel === 'HIGH_RISK' ? 'amber' :
                        item.riskLevel === 'MODERATE_RISK' ? 'blue' : 'green'
                      }`}>
                        {item.riskLevel.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div>
                      <b>+{item.recommendedReorderQuantity}</b>
                    </div>
                    <div style={{ fontSize: 12 }}>
                      <div>{item.preferredSupplierName}</div>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>Lead: {item.supplierLeadTimeDays}d</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
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
                      Total: <b>{po.currency} {po.total ? po.total.toLocaleString() : 0}</b>
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
      )}

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
            <label>Quantity Received
              <input type="number" placeholder="Enter quantity" value={grnForm.quantity} onChange={e=>setGrnForm({...grnForm, quantity: e.target.value})} />
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
                     {(medicines || []).map(m => <option key={m.id} value={m.id}>{m.genericName || m.brandName} ({m.medicineCode || m.code})</option>)}
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
                      <div style={{ fontWeight: 500 }}>{item.medicine?.genericName || item.medicine?.brandName || "Unknown"}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.medicine?.medicineCode}</div>
                    </td>
                    <td style={{ padding: '12px 5px' }}>{item.quantity}</td>
                    <td style={{ padding: '12px 5px' }}>{viewingPo.currency || 'USD'} {Number(item.unitPrice || 0).toFixed(2)}</td>
                    <td style={{ padding: '12px 5px', textAlign: 'right', fontWeight: 500 }}>{viewingPo.currency || 'USD'} {Number(item.totalPrice || 0).toFixed(2)}</td>
                  </tr>
                ))}
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
    </div>
  );
}
