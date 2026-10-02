import React from "react";
import { Plus, Truck, ChevronRight } from "lucide-react";
import { db } from "../services/mockDb";

export function Suppliers() {
  const suppliers = db.suppliers.map(s => {
    const onTimeDelivery = s.totalOrders > 0 ? ((s.fulfilledOrders - s.delayedOrders) / s.totalOrders * 100).toFixed(0) : 0;
    const orderAccuracy = s.totalOrders > 0 ? ((s.fulfilledOrders - s.returnedOrders) / s.totalOrders * 100).toFixed(0) : 0;
    const activePOs = Math.floor(Math.random() * 5); // Simulated active POs
    
    let statusTone = s.status === "ACTIVE" ? "healthy" : s.status === "WARNING" ? "medium-risk" : "low-stock";

    return { ...s, onTimeDelivery, orderAccuracy, activePOs, statusTone };
  });

  return <div className="page">
    <div className="page-heading">
      <div>
        <span className="eyebrow">PARTNERS</span>
        <h1>Suppliers</h1>
        <p>Manage vendors, evaluate performance metrics, and track lead times.</p>
      </div>
      <button className="primary"><Plus size={16}/> Add supplier</button>
    </div>
    
    <div className="supplier-grid">
      {suppliers.map(s => (
        <div key={s.id} className="panel supplier-card">
           <div className="sup-head">
             <div><Truck size={18}/> <b>{s.name}</b></div>
             <span className={`status ${s.statusTone}`}>{s.status}</span>
           </div>
           
           <div style={{fontSize:12, color:"var(--muted)", margin:"-5px 0 10px"}}>{s.contact}</div>

           <div className="sup-body" style={{gridTemplateColumns: "1fr 1fr", rowGap: 15}}>
             <div className="sup-metric"><span>On-time Delivery</span><b style={{color: s.onTimeDelivery >= 90 ? "var(--green)" : "var(--rose)"}}>{s.onTimeDelivery}%</b></div>
             <div className="sup-metric"><span>Order Accuracy</span><b>{s.orderAccuracy}%</b></div>
             <div className="sup-metric"><span>Avg. Lead Time</span><b>{s.leadTimeDays} days</b></div>
             <div className="sup-metric"><span>Total Value</span><b>₹{(s.totalValue/1000).toFixed(1)}k</b></div>
           </div>
           
           <div className="sup-foot">
             <span>Active POs: {s.activePOs}</span>
             <button className="link-btn">View profile <ChevronRight size={14}/></button>
           </div>
        </div>
      ))}
    </div>
  </div>;
}
