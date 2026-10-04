import React, { useEffect, useState } from "react";
import { Download, Plus, Boxes, AlertTriangle, Clock3, ShieldCheck, ArrowUpRight, ArrowDownRight, Sparkles, CalendarClock, ShoppingCart, ChevronRight, PackageSearch } from "lucide-react";
import { StatCard, MiniChart } from "../components/ui";
import { inventoryService } from "../services/inventoryService";

export function Dashboard({ setActive, setToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await inventoryService.getDashboardStats();
      setStats(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="page" style={{display:"flex", alignItems:"center", justifyContent:"center", color:"var(--muted)"}}>Loading dashboard...</div>;

  return <div className="page">
    <div className="page-heading">
      <div><span className="eyebrow">OVERVIEW</span><h1>Good morning, Admin</h1><p>Here’s what’s happening across your inventory today.</p></div>
      <div className="heading-actions">
        <button className="secondary" onClick={() => setToast("Exporting dashboard report...")}><Download size={16}/> Export</button>
        <button className="primary" onClick={()=>setActive("Inventory")}><Plus size={17}/> Add medicine</button>
      </div>
    </div>
    
    <div className="stat-grid">
      <StatCard icon={Boxes} tone="blue" value={stats.totalStockUnits?.toLocaleString()} label="Total units in stock" change="+8.4%" detail="vs. last month"/>
      <StatCard icon={AlertTriangle} tone={stats.lowStockItems > 0 ? "amber" : "green"} value={stats.lowStockItems + stats.criticalItems} label="Low & Critical items" change="-12.1%" detail="vs. last month"/>
      <StatCard icon={Clock3} tone={stats.expiringItems > 0 ? "rose" : "green"} value={stats.expiringItems} label="Expiring within 30 days" change="+5.7%" detail="requires attention"/>
      <StatCard icon={ShieldCheck} tone={stats.inventoryHealth > 80 ? "green" : "amber"} value={`${stats.inventoryHealth?.toFixed(1) || 0}%`} label="Inventory health" change="+2.6%" detail="computed score"/>
    </div>
    
    <div className="dashboard-grid">
      <section className="panel chart-panel">
        <div className="panel-head">
          <div><h3>Inventory value</h3><p>Monthly stock valuation</p></div>
          <select><option>Last 12 months</option><option>Last 6 months</option></select>
        </div>
        <div className="chart-total">₹{((stats.inventoryValue || 0)/100000).toFixed(2)}L <span><ArrowUpRight size={14}/> 12.8%</span></div>
        <MiniChart/>
      </section>
      <section className="panel ai-panel">
        <div className="panel-head">
          <div><h3><Sparkles size={17}/> AI inventory brief</h3><p>Automated recommendations</p></div>
          <span className="ai-live">LIVE</span>
        </div>
        <div className="ai-score">
          <div className="score-ring">{stats.inventoryHealth?.toFixed(0) || 0}<span>/100</span></div>
          <div><b>{stats.inventoryHealth > 80 ? "Inventory health is strong" : "Inventory needs attention"}</b><p>{stats.healthReasons?.[0] || 'Analyzing...'}</p></div>
        </div>
        <div className="ai-list">
          {stats.healthReasons?.slice(1).map((r, i) => (
             <div key={i}><AlertTriangle size={16}/><span>{r}</span></div>
          ))}
          <div><ShoppingCart size={16}/><span>Consider ordering <b>480 units</b> this week</span><ChevronRight size={15}/></div>
        </div>
        <button className="ai-button" onClick={()=>setActive("AI Insights")}>Open AI insights <ChevronRight size={16}/></button>
      </section>
    </div>
    
    <div className="lower-grid">
      <section className="panel">
        <div className="panel-head">
          <div><h3>Recent activity</h3><p>Latest inventory events</p></div>
          <button className="link-btn" onClick={()=>setActive("Activity Log")}>View all</button>
        </div>
        <div className="activity-list">
          {stats.recentMovements?.slice(0, 3).map((m) => {
            return <div className="activity" key={m.id}>
              <div className={`activity-icon ${m.type==="PURCHASE_RECEIVED"?"in":"out"}`}>
                {m.type==="PURCHASE_RECEIVED"?<ArrowDownRight size={16}/>:<ArrowUpRight size={16}/>}
              </div>
              <div><b>{m.type.replace("_", " ")}</b><p>{Math.abs(m.quantity)} units of {m.medicine?.genericName || m.medicineName}</p></div>
              <time>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
            </div>
          })}
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div><h3>Expiry watchlist</h3><p>Prioritized by remaining days</p></div>
          <button className="link-btn" onClick={()=>setActive("Batches & Expiry")}>View all</button>
        </div>
        <div className="table-list">
          {stats.expiringBatches && stats.expiringBatches.length > 0 ? stats.expiringBatches.map(b => {
             const days = Math.ceil((new Date(b.expiryDate) - new Date()) / (1000*60*60*24));
             return <div className="table-row" key={b.id}>
               <div className="medicine-icon"><PackageSearch size={17}/></div>
               <div className="row-main"><b>{b.medicine?.genericName || b.medicineName}</b><span>{b.batchNumber} • {b.currentQuantity || b.currentQty} units</span></div>
               <div className="expiry-days">{days} days</div>
             </div>
          }) : <div style={{padding:20, color:"var(--muted)", textAlign:"center"}}>No batches expiring soon.</div>}
        </div>
      </section>
    </div>
  </div>;
}
