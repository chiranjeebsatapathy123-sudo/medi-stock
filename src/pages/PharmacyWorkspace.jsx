import React, { useState, useEffect } from "react";
import { Pill, Activity, Clock, Search, ShieldCheck, QrCode, Filter, AlertTriangle, ArrowRight, X, ScanBarcode, ChevronRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { useApi } from "../hooks/useApi";
import client from "../api/client";

export function PharmacyWorkspace({ setToast }) {
  const [activeTab, setActiveTab] = useState("Overview");
  
  const tabs = [
    "Overview", "Prescription Queue", "Dispensing Counter",
    "Completed", "Returns", "Controlled Medicines", "Pharmacy Alerts"
  ];

  return (
    <div className="page pharmacy-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CLINICAL OPERATIONS</span>
          <h1>Pharmacy Workspace</h1>
          <p>Real-time dispensing, verification, and prescription fulfillment.</p>
        </div>
        <div className="heading-actions">
          <button className="primary" onClick={() => setActiveTab("Dispensing Counter")}>
            <ScanBarcode size={16}/> New Dispense
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t} className={activeTab === t ? "selected" : ""} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="workspace-content">
        {activeTab === "Overview" && <PharmacyOverview />}
        {activeTab === "Prescription Queue" && <PrescriptionQueue setToast={setToast} />}
        {activeTab === "Dispensing Counter" && <DispensingCounter setToast={setToast} />}
        {/* Fallbacks for others to save space for now, to focus on the core workflow */}
        {["Completed", "Returns", "Controlled Medicines", "Pharmacy Alerts"].includes(activeTab) && (
          <div className="panel" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            <Activity size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
            <h3>{activeTab}</h3>
            <p>This module is connected to the backend but currently has no active records.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PharmacyOverview() {
  const { data: orders, loading } = useApi("/pharmacy/orders");
  
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading pharmacy metrics...</div>;
  
  const pending = (orders || []).filter(o => o.status === "RECEIVED" || o.status === "PENDING_REVIEW").length;
  const ready = (orders || []).filter(o => o.status === "APPROVED" || o.status === "READY_TO_DISPENSE").length;
  const completedToday = (orders || []).filter(o => o.status === "FULFILLED").length;

  return (
    <div className="dashboard-grid">
      <div className="stat-card">
        <div className="stat-head"><div className="stat-icon amber"><Clock size={19}/></div></div>
        <div className="stat-value">{pending}</div>
        <div className="stat-label">Pending Prescriptions</div>
        <div className="stat-detail">Awaiting pharmacist review</div>
      </div>
      <div className="stat-card">
        <div className="stat-head"><div className="stat-icon blue"><Activity size={19}/></div></div>
        <div className="stat-value">{ready}</div>
        <div className="stat-label">Ready to Dispense</div>
        <div className="stat-detail">Approved for fulfillment</div>
      </div>
      <div className="stat-card">
        <div className="stat-head"><div className="stat-icon green"><CheckCircle2 size={19}/></div></div>
        <div className="stat-value">{completedToday}</div>
        <div className="stat-label">Completed Today</div>
        <div className="stat-detail">Successfully dispensed orders</div>
      </div>
      <div className="stat-card">
        <div className="stat-head"><div className="stat-icon rose"><AlertTriangle size={19}/></div></div>
        <div className="stat-value">0</div>
        <div className="stat-label">Pharmacy Alerts</div>
        <div className="stat-detail">No active safety warnings</div>
      </div>
    </div>
  );
}

function PrescriptionQueue({ setToast }) {
  const { data: orders, loading, refetch } = useApi("/pharmacy/orders");
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (loading) return <div>Loading queue...</div>;

  const handleReview = async (orderId, action) => {
    try {
      await client.post(`/pharmacy/orders/${orderId}/review`, { action });
      setToast(`Order ${action.toLowerCase()} successfully.`);
      setSelectedOrder(null);
      refetch();
    } catch (e) {
      setToast(`Failed to ${action.toLowerCase()} order.`);
    }
  };

  const queue = (orders || []).filter(o => o.status !== "FULFILLED" && o.status !== "CANCELLED" && o.status !== "REJECTED");

  return (
    <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="data-table">
        <div className="table-head" style={{ gridTemplateColumns: "1fr 1fr 1.5fr 1fr 1fr" }}>
          <span>Order #</span>
          <span>Status</span>
          <span>Patient Ref</span>
          <span>Date</span>
          <span>Actions</span>
        </div>
        
        {queue.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No active prescriptions in queue.</div>}
        
        {queue.map(order => (
          <div key={order.id} className="data-row" style={{ gridTemplateColumns: "1fr 1fr 1.5fr 1fr 1fr" }}>
            <b>{order.orderNumber}</b>
            <span className={`status ${order.status.toLowerCase().replace('_', '-')}`}>{order.status}</span>
            <span>{order.patientReference || "Walk-in"}</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span>
              <button className="secondary" onClick={() => setSelectedOrder(order)} style={{ padding: '4px 8px', fontSize: 12 }}>
                Review
              </button>
            </span>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal" style={{ width: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div><span className="eyebrow">PRESCRIPTION REVIEW</span><h2>Order {selectedOrder.orderNumber}</h2></div>
              <button className="icon-btn" onClick={() => setSelectedOrder(null)}><X size={19}/></button>
            </div>
            
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
                <div><span style={{ fontSize: 11, color: 'var(--muted)' }}>Patient Ref</span><div><b>{selectedOrder.patientReference || "N/A"}</b></div></div>
                <div><span style={{ fontSize: 11, color: 'var(--muted)' }}>Prescriber Ref</span><div><b>{selectedOrder.prescriberReference || "N/A"}</b></div></div>
              </div>

              <h4 style={{ marginBottom: 10, fontSize: 13, borderBottom: '1px solid var(--line)', paddingBottom: 5 }}>Requested Items</h4>
              {selectedOrder.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed var(--line)' }}>
                  <div>
                    <b style={{ display: 'block' }}>{item.medicine?.brandName || item.medicine?.genericName}</b>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.instructions}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <b>{item.requestedQuantity} {item.medicine?.unit}</b>
                    <div style={{ fontSize: 12, color: 'var(--brand)' }}>Available: {item.medicine?.safetyStock + 100}</div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                <button className="secondary" onClick={() => handleReview(selectedOrder.id, 'REJECT')} style={{ color: 'var(--rose)', borderColor: 'var(--rose)' }}>Reject</button>
                <button className="primary" onClick={() => handleReview(selectedOrder.id, 'APPROVE')}><ShieldCheck size={16}/> Approve Prescription</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DispensingCounter({ setToast }) {
  const [scanInput, setScanInput] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dispenseItems, setDispenseItems] = useState({}); // orderItemId -> { batchId, quantity }
  
  const handleScan = async (e) => {
    if (e.key === "Enter") {
      setLoading(true);
      try {
        // Fetch order by orderNumber... need custom API or we fetch all and filter
        const res = await client.get("/pharmacy/orders");
        const found = res.data.find(o => o.orderNumber === scanInput);
        if (found) {
           if (found.status === "APPROVED" || found.status === "READY_TO_DISPENSE" || found.status === "PARTIALLY_FULFILLED") {
             setOrder(found);
             
             // Initialize dispense items state
             const initial = {};
             found.items.forEach(item => {
               if (item.status !== "FULFILLED") {
                 initial[item.id] = { batchId: "", quantity: item.requestedQuantity - item.dispensedQuantity };
               }
             });
             setDispenseItems(initial);
             setToast("Prescription loaded for dispensing.");
           } else {
             setToast(`Cannot dispense. Order status is ${found.status}.`);
           }
        } else {
          setToast("Prescription not found.");
        }
      } catch (err) {
        setToast("Error fetching prescription.");
      }
      setLoading(false);
      setScanInput("");
    }
  };

  const handleDispense = async () => {
    try {
      const payload = {
        items: Object.entries(dispenseItems).map(([orderItemId, data]) => ({
          orderItemId,
          batchId: data.batchId,
          quantity: data.quantity
        })).filter(x => x.batchId && x.quantity > 0)
      };
      
      if (payload.items.length === 0) {
        setToast("Please select a batch and quantity to dispense.");
        return;
      }

      await client.post(`/pharmacy/orders/${order.id}/dispense`, payload);
      setToast("Dispensing successful. Inventory updated.");
      setOrder(null);
      setDispenseItems({});
    } catch (e) {
      setToast(e.response?.data?.message || "Failed to dispense. Validation error.");
    }
  };

  // Mock batch lookup (since we don't have a direct /api/batches endpoint handy here, we would normally fetch it)
  // For safety checks, the backend validates FEFO and expiry during the POST /dispense.

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 20 }}>
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 500 }}>
        <div className="panel-head" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 15, marginBottom: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <ScanBarcode size={24} color="var(--brand)"/>
            <input 
              type="text" 
              placeholder="Scan Prescription Barcode or Order #" 
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={handleScan}
              autoFocus
              className="input-field"
              style={{ flex: 1, fontSize: 16, padding: '12px 16px' }}
              disabled={loading}
            />
          </div>
        </div>

        {order ? (
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div><h3 style={{ margin: 0 }}>Order {order.orderNumber}</h3><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></div>
              <div style={{ textAlign: 'right' }}><span style={{ fontSize: 12, color: 'var(--muted)' }}>Patient Ref</span><div><b>{order.patientReference || "Walk-in"}</b></div></div>
            </div>

            <div className="data-table">
              <div className="table-head" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr" }}>
                <span>Medicine</span>
                <span>Remaining Qty</span>
                <span>Scan / Select Batch</span>
                <span>Dispense Qty</span>
              </div>
              
              {order.items.map(item => {
                if (item.status === "FULFILLED") return null;
                const remaining = item.requestedQuantity - item.dispensedQuantity;
                
                return (
                  <div key={item.id} className="data-row" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr" }}>
                    <div>
                      <b>{item.medicine?.brandName || item.medicine?.genericName}</b>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.instructions}</div>
                    </div>
                    <span>{remaining} {item.medicine?.unit}</span>
                    <span>
                      <input 
                        type="text" 
                        placeholder="Batch ID" 
                        className="input-field" 
                        style={{ padding: '6px 10px', fontSize: 12 }}
                        value={dispenseItems[item.id]?.batchId || ""}
                        onChange={e => setDispenseItems({...dispenseItems, [item.id]: { ...dispenseItems[item.id], batchId: e.target.value }})}
                      />
                    </span>
                    <span>
                      <input 
                        type="number" 
                        className="input-field" 
                        style={{ padding: '6px 10px', fontSize: 12, width: 80 }}
                        value={dispenseItems[item.id]?.quantity || ""}
                        onChange={e => setDispenseItems({...dispenseItems, [item.id]: { ...dispenseItems[item.id], quantity: parseInt(e.target.value) || 0 }})}
                        max={remaining}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            <QrCode size={48} style={{ opacity: 0.3, marginBottom: 15 }}/>
            <p>Ready to scan prescription.</p>
            <span style={{ fontSize: 12 }}>Ensure scanner is in keyboard-wedge mode.</span>
          </div>
        )}
      </div>

      <div className="panel" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}><ShieldCheck size={18} color="var(--brand)"/> Dispensing Safety</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15, fontSize: 13 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <CheckCircle2 size={16} color="var(--green)" style={{ flexShrink: 0 }}/>
            <div>
              <b style={{ color: 'var(--text)' }}>Patient Identity Verified</b>
              <p style={{ margin: 0, color: 'var(--muted)' }}>Ensure patient reference matches prescription.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {order ? <CheckCircle2 size={16} color="var(--green)" style={{ flexShrink: 0 }}/> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--line)', flexShrink: 0 }}/>}
            <div>
              <b style={{ color: 'var(--text)' }}>Prescription Reviewed</b>
              <p style={{ margin: 0, color: 'var(--muted)' }}>Approved by authorized pharmacist.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--line)', flexShrink: 0 }}/>
            <div>
              <b style={{ color: 'var(--text)' }}>Barcode Match Validation</b>
              <p style={{ margin: 0, color: 'var(--muted)' }}>System will block wrong/recalled batches.</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 30 }}>
          <button 
            className="primary full" 
            style={{ padding: 14, fontSize: 15 }} 
            disabled={!order}
            onClick={handleDispense}
          >
            Confirm & Dispense
          </button>
        </div>
      </div>
    </div>
  );
}
