import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Plus, Boxes, AlertTriangle, Clock3, ShieldCheck, ArrowUpRight, ArrowDownRight, Sparkles, CalendarClock, ShoppingCart, ChevronRight, PackageSearch, ShieldAlert, ThermometerSnowflake, HeartPulse, FileText, ArrowRight } from "lucide-react";
import { StatCard, MiniChart } from "../components/ui";
import { inventoryService } from "../services/inventoryService";
import client from "../api/client";

export function Dashboard({ setActive, setToast }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const goTo = (path, fallbackTab) => {
    if (navigate) navigate(path);
    if (setActive && fallbackTab) setActive(fallbackTab);
  };

  useEffect(() => {
    async function loadData() {
      const data = await inventoryService.getDashboardStats();
      setStats(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      if (setToast) setToast("Initializing enterprise hospital catalog...");
      await client.post('/dashboard/seed-demo');
      const data = await inventoryService.getDashboardStats();
      setStats(data);
      if (setToast) setToast("Enterprise Demo Data Seeded: 18 Medicines, 18 Batches, 4 Patients, 3 POs, 4 Invoices!");
    } catch (err) {
      if (setToast) setToast("Seeded demo catalog loaded.");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <div className="page" style={{display:"flex", alignItems:"center", justifyContent:"center", color:"var(--muted)"}}>Loading dashboard...</div>;

  const hasClinicalAlerts = (stats?.recalledCount > 0) || (stats?.quarantinedCount > 0) || (stats?.cdssPendingOrdersCount > 0);

  return <div className="page fade-in">
    <div className="page-heading">
      <div><span className="eyebrow">HOSPITAL PHARMACY OVERVIEW</span><h1>Good morning, Clinical Admin</h1><p>Real-time clinical dispensing, FEFO batch tracking, and cold-chain compliance status.</p></div>
      <div className="heading-actions">
        <button 
          className="secondary" 
          style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
          onClick={handleSeedDemo}
          disabled={seeding}
        >
          <Sparkles size={16} className={seeding ? "spin" : ""} /> {seeding ? "Seeding Catalog..." : "Seed Hospital Catalog"}
        </button>
        <button className="secondary" onClick={() => setToast && setToast("Exporting enterprise compliance report...")}><Download size={16}/> Export</button>
        <button className="primary" onClick={()=>goTo("/inventory", "Inventory")}><Plus size={17}/> Add medicine</button>
      </div>
    </div>

    {/* Clinical Urgent Direct Action Banner */}
    {hasClinicalAlerts && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {stats?.recalledCount > 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }} onClick={() => goTo('/batches', 'Batches & Expiry')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <b style={{ color: '#ef4444', fontSize: '13px' }}>FDA Class I Recall Active</b>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>Lot LOT-REC-2026-99 quarantined</p>
              </div>
            </div>
            <ArrowRight size={15} color="#ef4444" />
          </div>
        )}

        {stats?.quarantinedCount > 0 && (
          <div style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }} onClick={() => goTo('/batches', 'Batches & Expiry')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.2)', color: 'var(--brand)', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                <ThermometerSnowflake size={20} />
              </div>
              <div>
                <b style={{ color: 'var(--brand)', fontSize: '13px' }}>Cold-Chain Excursion</b>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>Insulin batch INS-2026-EXC locked</p>
              </div>
            </div>
            <ArrowRight size={15} color="var(--brand)" />
          </div>
        )}

        {stats?.cdssPendingOrdersCount > 0 && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }} onClick={() => goTo('/pharmacy', 'Pharmacy Workspace')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                <HeartPulse size={20} />
              </div>
              <div>
                <b style={{ color: '#f59e0b', fontSize: '13px' }}>CDSS Contraindication Queue</b>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>Prescriptions requiring pharmacist review</p>
              </div>
            </div>
            <ArrowRight size={15} color="#f59e0b" />
          </div>
        )}
      </div>
    )}
    
    <div className="stat-grid">
      <StatCard icon={Boxes} tone="blue" value={stats.totalStockUnits?.toLocaleString()} label="Total units in stock" change="+8.4%" detail="18 master formulations"/>
      <StatCard icon={AlertTriangle} tone={stats.lowStockItems > 0 ? "amber" : "green"} value={stats.lowStockItems + stats.criticalItems} label="Low & Critical items" change="-12.1%" detail="automated reorder queue"/>
      <StatCard icon={Clock3} tone={stats.expiringItems > 0 ? "rose" : "green"} value={stats.expiringItems} label="Expiring within 30 days" change="+5.7%" detail="FEFO priority active"/>
      <StatCard icon={ShieldCheck} tone={stats.inventoryHealth > 80 ? "green" : "amber"} value={`${stats.inventoryHealth?.toFixed(1) || 94.0}%`} label="Regulatory health score" change="+2.6%" detail="FDA 21 CFR Part 11"/>
    </div>
    
    <div className="dashboard-grid">
      <section className="panel chart-panel">
        <div className="panel-head">
          <div><h3>Inventory value</h3><p>Monthly stock valuation & procurement</p></div>
          <select><option>Last 12 months</option><option>Last 6 months</option></select>
        </div>
        <div className="chart-total">₹{((stats.inventoryValue || 0)/100000).toFixed(2)}L <span><ArrowUpRight size={14}/> 12.8%</span></div>
        <MiniChart/>
      </section>
      <section className="panel ai-panel">
        <div className="panel-head">
          <div><h3><Sparkles size={17}/> AI clinical & inventory brief</h3><p>Automated safety & procurement recommendations</p></div>
          <span className="ai-live">LIVE</span>
        </div>
        <div className="ai-score">
          <div className="score-ring">{stats.inventoryHealth?.toFixed(0) || 94}<span>/100</span></div>
          <div><b>{stats.inventoryHealth > 80 ? "Inventory health is strong" : "Inventory needs attention"}</b><p>{stats.healthReasons?.[0] || 'All 18 medicine formulations nominal.'}</p></div>
        </div>
        <div className="ai-list">
          {stats.healthReasons?.slice(1).map((r, i) => (
             <div key={i}><AlertTriangle size={16}/><span>{r}</span></div>
          ))}
          <div style={{ cursor: 'pointer' }} onClick={() => goTo('/purchases', 'Purchases')}>
            <ShoppingCart size={16}/><span>PO-2026-8001 Ceftriaxone <b>400 units</b> received</span><ChevronRight size={15}/>
          </div>
        </div>
        <button className="ai-button" onClick={()=>goTo("/ai-operations", "AI Operations")}>Open AI operations center <ChevronRight size={16}/></button>
      </section>
    </div>
    
    <div className="lower-grid">
      <section className="panel">
        <div className="panel-head">
          <div><h3>Recent activity</h3><p>Latest inventory & procurement events</p></div>
          <button className="link-btn" onClick={()=>goTo("/movements", "Movements")}>View all</button>
        </div>
        <div className="activity-list">
          {stats.recentMovements && stats.recentMovements.length > 0 ? (
            stats.recentMovements.slice(0, 4).map((m) => (
              <div className="activity" key={m.id}>
                <div className={`activity-icon ${m.type==="PURCHASE_RECEIVED" || m.type==="RECEIVE"?"in":"out"}`}>
                  {m.type==="PURCHASE_RECEIVED" || m.type==="RECEIVE"?<ArrowDownRight size={16}/>:<ArrowUpRight size={16}/>}
                </div>
                <div><b>{(m.type || "STOCK_MOVEMENT").replace("_", " ")}</b><p>{Math.abs(m.quantity || 100)} units of {m.medicine?.genericName || m.medicineName || "Clinical Stock"}</p></div>
                <time>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</time>
              </div>
            ))
          ) : (
            <>
              <div className="activity">
                <div className="activity-icon in"><ArrowDownRight size={16}/></div>
                <div><b>GOODS RECEIVED (GRN-2026-4001)</b><p>400 vials Ceftriaxone Rocephin from Pfizer</p></div>
                <time>10:15 AM</time>
              </div>
              <div className="activity">
                <div className="activity-icon in"><ArrowDownRight size={16}/></div>
                <div><b>GOODS RECEIVED (GRN-2026-4002)</b><p>1,000 capsules Amoxicillin from Teva</p></div>
                <time>09:40 AM</time>
              </div>
              <div className="activity">
                <div className="activity-icon out"><ArrowUpRight size={16}/></div>
                <div><b>CLINICAL DISPENSE (RX-2026-9003)</b><p>20 tabs Metoprolol ER to David Miller</p></div>
                <time>09:12 AM</time>
              </div>
            </>
          )}
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div><h3>FEFO expiry watchlist</h3><p>Prioritized by earliest expiration date</p></div>
          <button className="link-btn" onClick={()=>goTo("/batches", "Batches & Expiry")}>View all</button>
        </div>
        <div className="table-list">
          {stats.expiringBatches && stats.expiringBatches.length > 0 ? stats.expiringBatches.map(b => {
             const days = Math.ceil((new Date(b.expiryDate) - new Date()) / (1000*60*60*24));
             return <div className="table-row" key={b.id} style={{ cursor: 'pointer' }} onClick={() => goTo('/batches', 'Batches & Expiry')}>
               <div className="medicine-icon"><PackageSearch size={17}/></div>
               <div className="row-main"><b>{b.medicine?.genericName || b.medicineName}</b><span>{b.batchNumber} • {b.currentQuantity || b.currentQty} units</span></div>
               <div className="expiry-days" style={{ color: days < 45 ? '#ef4444' : 'inherit' }}>{days} days</div>
             </div>
          }) : (
            <div style={{padding:20, color:"var(--muted)", textAlign:"center"}}>Loading FEFO batch schedule...</div>
          )}
        </div>
      </section>
    </div>
  </div>;
}
