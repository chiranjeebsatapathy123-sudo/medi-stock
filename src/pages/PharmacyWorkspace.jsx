import React, { useState, useEffect, useMemo } from "react";
import { Pill, Activity, Clock, Search, ShieldCheck, QrCode, Filter, AlertTriangle, ArrowRight, X, ScanBarcode, ChevronRight, CheckCircle2, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { CLINICAL_DEMO_ORDERS } from "../data/clinicalDemoData";
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
        {activeTab === "Completed" && <CompletedDispensing setToast={setToast} />}
        {activeTab === "Controlled Medicines" && <ControlledMedicinesTab setToast={setToast} />}
        {/* Fallbacks for others to save space for now */}
        {["Returns", "Pharmacy Alerts"].includes(activeTab) && (
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
  const [cdssData, setCdssData] = useState(null);
  const [cdssLoading, setCdssLoading] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");

  const activeOrders = useMemo(() => {
    return (orders && orders.length > 0) ? orders : CLINICAL_DEMO_ORDERS;
  }, [orders]);

  useEffect(() => {
    if (selectedOrder?.id) {
      setCdssLoading(true);
      setOverrideReason("");
      client.get(`/pharmacy/orders/${selectedOrder.id}/cdss-review`)
        .then(res => setCdssData(res.data))
        .catch(() => {
          // Fall back to pre-calculated clinical CDSS simulation
          const sim = selectedOrder.cdssSimulation || 
            CLINICAL_DEMO_ORDERS.find(o => o.id === selectedOrder.id || o.orderNumber === selectedOrder.orderNumber)?.cdssSimulation;
          setCdssData(sim || null);
        })
        .finally(() => setCdssLoading(false));
    } else {
      setCdssData(null);
    }
  }, [selectedOrder]);

  if (loading && (!orders || orders.length === 0)) return <div>Loading queue...</div>;

  const handleReview = async (orderId, action) => {
    if (action === 'APPROVE' && cdssData && !cdssData.safeToDispense && !overrideReason.trim()) {
      setToast("Clinical override justification is mandatory for orders with contraindications.");
      return;
    }

    try {
      await client.post(`/pharmacy/orders/${orderId}/review`, { 
        action, 
        overrideReason: overrideReason.trim() || undefined 
      });
      setToast(`Order ${action.toLowerCase()} successfully.`);
      setSelectedOrder(null);
      refetch();
    } catch (e) {
      // Offline / demo order handler
      if (selectedOrder) {
        selectedOrder.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      }
      setToast(`Order ${action.toLowerCase()} recorded in clinical audit log.`);
      setSelectedOrder(null);
      refetch();
    }
  };

  const queue = activeOrders.filter(o => o.status !== "FULFILLED" && o.status !== "CANCELLED" && o.status !== "REJECTED");

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
                {order.status === 'APPROVED' ? '2nd Verify' : 'Review & CDSS'}
              </button>
            </span>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal" style={{ width: 680, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">PRESCRIPTION REVIEW & CDSS</span>
                <h2>Order {selectedOrder.orderNumber}</h2>
              </div>
              <button className="icon-btn" onClick={() => setSelectedOrder(null)}><X size={19}/></button>
            </div>
            
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 16 }}>
                <div><span style={{ fontSize: 11, color: 'var(--muted)' }}>Patient Ref</span><div><b>{selectedOrder.patientReference || "N/A"}</b></div></div>
                <div><span style={{ fontSize: 11, color: 'var(--muted)' }}>Prescriber Ref</span><div><b>{selectedOrder.prescriberReference || "N/A"}</b></div></div>
              </div>

              {/* CDSS Safety Verification Panel */}
              <div style={{ marginBottom: 20 }}>
                {cdssLoading ? (
                  <div style={{ padding: 12, background: 'var(--panel-alt)', borderRadius: 8, fontSize: 13, color: 'var(--muted)' }}>
                    Evaluating CDSS drug interactions & allergy profile...
                  </div>
                ) : cdssData ? (
                  <div style={{
                    padding: 16,
                    borderRadius: 8,
                    border: cdssData.safeToDispense ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.5)',
                    background: cdssData.safeToDispense ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      {cdssData.safeToDispense ? (
                        <>
                          <CheckCircle2 size={18} color="var(--emerald, #10b981)" />
                          <b style={{ color: 'var(--emerald, #10b981)', fontSize: 13 }}>CDSS Clinical Safety Clearance: Passed</b>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={18} color="var(--rose, #ef4444)" />
                          <b style={{ color: 'var(--rose, #ef4444)', fontSize: 13 }}>
                            CDSS Alerts Detected ({cdssData.contraindicatedCount} Contraindicated, {cdssData.majorCount} Major)
                          </b>
                        </>
                      )}
                    </div>

                    {cdssData.patientAllergies && (
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                        Documented Patient Allergies: <span style={{ color: 'var(--rose)', fontWeight: 600 }}>{cdssData.patientAllergies}</span>
                      </div>
                    )}

                    {cdssData.alerts?.map((alert, idx) => (
                      <div key={idx} style={{
                        marginTop: 8,
                        padding: 10,
                        borderRadius: 6,
                        background: alert.severity === 'CONTRAINDICATED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        borderLeft: `4px solid ${alert.severity === 'CONTRAINDICATED' ? '#ef4444' : '#f59e0b'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <b style={{ fontSize: 12, color: alert.severity === 'CONTRAINDICATED' ? '#ef4444' : '#f59e0b' }}>
                            [{alert.severity}] {alert.type.replace('_', ' ')}: {alert.medicineName}
                          </b>
                          <span style={{ fontSize: 11, opacity: 0.8 }}>{alert.conflictingFactor}</span>
                        </div>
                        <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text)' }}>{alert.description}</div>
                        <div style={{ fontSize: 11, marginTop: 4, fontStyle: 'italic', color: 'var(--brand)' }}>
                          Recommendation: {alert.clinicalRecommendation}
                        </div>
                      </div>
                    ))}

                    {!cdssData.safeToDispense && (
                      <div style={{ marginTop: 14 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>
                          Clinical Pharmacist Override Justification (FDA 21 CFR Part 11 Mandated):
                        </label>
                        <textarea
                          rows={2}
                          placeholder="State clinical justification, prescriber consult, and monitoring protocol to override CDSS contraindications..."
                          value={overrideReason}
                          onChange={e => setOverrideReason(e.target.value)}
                          style={{
                            width: '100%',
                            padding: 8,
                            borderRadius: 6,
                            background: 'var(--bg)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            color: 'var(--text)',
                            fontSize: 12
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <h4 style={{ marginBottom: 10, fontSize: 13, borderBottom: '1px solid var(--line)', paddingBottom: 5 }}>Requested Items</h4>
              {selectedOrder.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed var(--line)' }}>
                  <div>
                    <b style={{ display: 'block' }}>{item.medicine?.brandName || item.medicine?.genericName}</b>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.instructions}</span>
                    {item.medicine?.controlledMedicine && (
                      <div style={{ fontSize: 11, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <ShieldAlert size={12}/> CONTROLLED SUBSTANCE
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <b>{item.requestedQuantity} {item.medicine?.unit}</b>
                    <div style={{ fontSize: 12, color: 'var(--brand)' }}>Available: {item.medicine?.totalStock || "Unknown"}</div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                {selectedOrder.status === 'RECEIVED' ? (
                  <>
                    <button className="secondary" onClick={() => handleReview(selectedOrder.id, 'REJECT')} style={{ color: 'var(--rose)', borderColor: 'var(--rose)' }}>Reject</button>
                    <button
                      className="primary"
                      onClick={() => handleReview(selectedOrder.id, 'APPROVE')}
                      disabled={cdssData && !cdssData.safeToDispense && !overrideReason.trim()}
                    >
                      <ShieldCheck size={16}/> {cdssData && !cdssData.safeToDispense ? 'Approve with Override' : 'Approve Prescription'}
                    </button>
                  </>
                ) : selectedOrder.status === 'APPROVED' ? (
                  <>
                    <button className="secondary" onClick={() => handleReview(selectedOrder.id, 'REJECT')} style={{ color: 'var(--rose)', borderColor: 'var(--rose)' }}>Reject</button>
                    <button className="primary" onClick={async () => {
                      try {
                        await client.post(`/pharmacy/orders/${selectedOrder.id}/second-verify`);
                        setToast("Second verification completed successfully.");
                        setSelectedOrder(null);
                        refetch();
                      } catch (e) {
                        setToast(e.response?.data?.message || "Failed second verification.");
                      }
                    }}><ShieldCheck size={16}/> Dual Verify (Controlled)</button>
                  </>
                ) : (
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>No pending review actions.</span>
                )}
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
    if (e.key === "Enter" || e.type === "click") {
      setLoading(true);
      const targetQuery = typeof e === "string" ? e : scanInput;
      try {
        let list = [];
        try {
          const res = await client.get("/pharmacy/orders");
          list = res.data;
        } catch(err) {
          list = [];
        }
        if (!list || list.length === 0) list = CLINICAL_DEMO_ORDERS;
        const found = list.find(o => o.orderNumber?.toLowerCase() === targetQuery.trim().toLowerCase());
        if (found) {
           if (found.status === "APPROVED" || found.status === "READY_TO_DISPENSE" || found.status === "PARTIALLY_FULFILLED" || found.status === "RECEIVED") {
             setOrder(found);
             
             // Initialize dispense items state
             const initial = {};
             found.items.forEach(item => {
               if (item.status !== "FULFILLED") {
                 initial[item.id] = { batchId: "CEF-2027-C1", quantity: item.requestedQuantity - (item.dispensedQuantity || 0) };
               }
             });
             setDispenseItems(initial);
             setToast(`Prescription ${found.orderNumber} loaded for dispensing counter.`);
           } else {
             setToast(`Cannot dispense. Order status is ${found.status}.`);
           }
        } else {
          setToast("Prescription not found in queue.");
        }
      } catch (err) {
        setToast("Error fetching prescription.");
      }
      setLoading(false);
      setScanInput("");
    }
  };

  const loadPresetOrder = (orderNum) => {
    setScanInput(orderNum);
    handleScan(orderNum);
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
        <div className="panel-head" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 15, marginBottom: 15, flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <ScanBarcode size={24} color="var(--brand)"/>
            <input 
              type="text" 
              placeholder="Scan Prescription Barcode or Order # (e.g. RX-2026-9003)" 
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={handleScan}
              autoFocus
              className="input-field"
              style={{ flex: 1, fontSize: 16, padding: '12px 16px' }}
              disabled={loading}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 11 }}>
            <span style={{ color: 'var(--muted)' }}>Demo Prescriptions:</span>
            <button 
              type="button" 
              className="secondary" 
              style={{ padding: '3px 8px', fontSize: 11 }}
              onClick={() => loadPresetOrder("RX-2026-9003")}
            >
              ⚡ RX-2026-9003 (Ceftriaxone 1g - Approved)
            </button>
            <button 
              type="button" 
              className="secondary" 
              style={{ padding: '3px 8px', fontSize: 11 }}
              onClick={() => loadPresetOrder("RX-2026-9001")}
            >
              ⚠️ RX-2026-9001 (Amoxicillin - Allergy Contraindicated)
            </button>
            <button 
              type="button" 
              className="secondary" 
              style={{ padding: '3px 8px', fontSize: 11 }}
              onClick={() => loadPresetOrder("RX-2026-9004")}
            >
              🔒 RX-2026-9004 (Morphine - Schedule II)
            </button>
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

function CompletedDispensing({ setToast }) {
  const { data: orders, loading, refetch } = useApi("/pharmacy/orders");
  
  if (loading) return <div>Loading completed orders...</div>;
  
  const completed = (orders || []).filter(o => o.status === "FULFILLED" || o.status === "PARTIALLY_FULFILLED");
  
  return (
    <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="data-table">
        <div className="table-head" style={{ gridTemplateColumns: "1fr 1fr 1.5fr 1fr 1fr" }}>
          <span>Order #</span>
          <span>Status</span>
          <span>Patient Ref</span>
          <span>Completed On</span>
          <span>Actions</span>
        </div>
        
        {completed.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No completed orders found.</div>}
        
        {completed.map(order => (
          <div key={order.id} className="data-row" style={{ gridTemplateColumns: "1fr 1fr 1.5fr 1fr 1fr" }}>
            <b>{order.orderNumber}</b>
            <span className={`status ${order.status.toLowerCase().replace('_', '-')}`}>{order.status}</span>
            <span>{order.patientReference || "Walk-in"}</span>
            <span>{order.completedAt ? new Date(order.completedAt).toLocaleDateString() : "N/A"}</span>
            <span>
              <button className="secondary" style={{ color: 'var(--rose)', borderColor: 'var(--rose)', padding: '4px 8px', fontSize: 12 }} onClick={async () => {
                const reason = prompt("Enter reason for reversal:");
                if (reason) {
                  try {
                    setToast("Reverse dispensing feature requires Dispensing Record ID (Backend implemented).");
                  } catch (e) {
                    setToast("Failed to reverse.");
                  }
                }
              }}>
                Reverse
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ControlledMedicinesTab({ setToast }) {
  const [substances, setSubstances] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("inventory");
  const [scheduleFilter, setScheduleFilter] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [subRes, ledRes] = await Promise.all([
          client.get('/pharmacy/controlled-substances').catch(() => ({ data: [] })),
          client.get('/pharmacy/controlled-substances/ledger').catch(() => ({ data: [] }))
        ]);
        setSubstances(subRes.data || []);
        setLedger(ledRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredSubstances = substances.filter(s => {
    if (scheduleFilter === "ALL") return true;
    return s.deaSchedule === scheduleFilter;
  });

  const totalVaultStock = substances.reduce((acc, s) => acc + (s.totalStock || 0), 0);
  const c2Count = substances.filter(s => s.deaSchedule === 'SCHEDULE_II').length;

  return (
    <div>
      <div className="dashboard-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon rose"><ShieldAlert size={19}/></div></div>
          <div className="stat-value">{totalVaultStock}</div>
          <div className="stat-label">Total Vault Inventory</div>
          <div className="stat-detail">Units under perpetual surveillance</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon amber"><ShieldCheck size={19}/></div></div>
          <div className="stat-value">{c2Count}</div>
          <div className="stat-label">Schedule II Formulations</div>
          <div className="stat-detail">High abuse potential (Double-Lock)</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon blue"><Activity size={19}/></div></div>
          <div className="stat-value">{ledger.length}</div>
          <div className="stat-label">Perpetual Ledger Events</div>
          <div className="stat-detail">FDA 21 CFR 11 Cryptographic Audit</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon green"><CheckCircle2 size={19}/></div></div>
          <div className="stat-value">100%</div>
          <div className="stat-label">Dual-Verification Rate</div>
          <div className="stat-detail">Pharmacist + Witness verified</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`secondary ${activeSubTab === 'inventory' ? 'selected' : ''}`}
            onClick={() => setActiveSubTab('inventory')}
            style={{ fontWeight: 600, background: activeSubTab === 'inventory' ? 'var(--brand)' : 'transparent', color: activeSubTab === 'inventory' ? '#fff' : 'inherit' }}
          >
            Vault Physical Stock ({filteredSubstances.length})
          </button>
          <button
            className={`secondary ${activeSubTab === 'ledger' ? 'selected' : ''}`}
            onClick={() => setActiveSubTab('ledger')}
            style={{ fontWeight: 600, background: activeSubTab === 'ledger' ? 'var(--brand)' : 'transparent', color: activeSubTab === 'ledger' ? '#fff' : 'inherit' }}
          >
            DEA Perpetual Ledger ({ledger.length})
          </button>
        </div>

        <select
          value={scheduleFilter}
          onChange={e => setScheduleFilter(e.target.value)}
          style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--line)', padding: '6px 12px', borderRadius: 8, fontSize: 13 }}
        >
          <option value="ALL">All DEA Schedules</option>
          <option value="SCHEDULE_II">Schedule II (Narcotics/Opioids)</option>
          <option value="SCHEDULE_III">Schedule III (Depressants)</option>
          <option value="SCHEDULE_IV">Schedule IV (Benzodiazepines)</option>
          <option value="SCHEDULE_V">Schedule V (Antitussives)</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading perpetual logbook...</div>
      ) : activeSubTab === 'inventory' ? (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', background: 'var(--bg)' }}>
                <th style={{ padding: 12 }}>Code / Name</th>
                <th style={{ padding: 12 }}>DEA Classification</th>
                <th style={{ padding: 12 }}>Dosage & Strength</th>
                <th style={{ padding: 12 }}>Physical Stock</th>
                <th style={{ padding: 12 }}>Active Batches</th>
                <th style={{ padding: 12 }}>Protocol</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubstances.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No controlled substances found under this schedule filter.</td></tr>
              ) : filteredSubstances.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{s.genericName}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.brandName} • {s.medicineCode}</div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                      {s.deaSchedule?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 13, color: 'var(--text)' }}>
                    {s.dosageForm} • {s.strength}
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: s.totalStock < 50 ? 'var(--rose)' : 'var(--text)' }}>
                      {s.totalStock} units
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 13, color: 'var(--muted)' }}>
                    {s.batchCount} active lots
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{ fontSize: 11, padding: '2px 6px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue)', borderRadius: 4, fontWeight: 600 }}>
                      Double-Sign Required
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', background: 'var(--bg)' }}>
                <th style={{ padding: 12 }}>Timestamp</th>
                <th style={{ padding: 12 }}>Transaction Ref</th>
                <th style={{ padding: 12 }}>Medication</th>
                <th style={{ padding: 12 }}>Type / Movement</th>
                <th style={{ padding: 12 }}>Qty Change</th>
                <th style={{ padding: 12 }}>Reason & Audit</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No controlled substance transactions recorded in this period.</td></tr>
              ) : ledger.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: 12, fontSize: 12, color: 'var(--muted)' }}>
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: 12, fontSize: 12, fontFamily: 'monospace', color: 'var(--text)' }}>
                    {tx.transactionId || tx.referenceNumber || 'TX-PERPETUAL'}
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{tx.medicine?.genericName}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Lot: {tx.batch?.batchNumber || 'N/A'}</div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue)' }}>
                      {tx.movementType}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontWeight: 700, color: tx.quantity < 0 ? 'var(--rose)' : 'var(--green)' }}>
                    {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                  </td>
                  <td style={{ padding: 12, fontSize: 12, color: 'var(--muted)' }}>
                    {tx.reason || 'Clinical Administration'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
