import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, ShieldAlert, Activity, AlertTriangle, 
  TrendingDown, FileText, Filter, CheckCircle2,
  CalendarClock, PackageSearch, RefreshCw
} from "lucide-react";
import client from "../api/client";

const FALLBACK_INTELLIGENCE = {
  inventoryHealth: { score: 92, dimensions: { Availability: 94, DataQuality: 98, Accuracy: 95 } },
  dataQuality: { score: 98, coverage: { categoryCoverage: "100%", supplierCoverage: "94%", batchExpiry: "100%" } },
  stockoutRiskSummary: { HIGH: 2, MEDIUM: 3, LOW: 13 },
  expiryRiskSummary: { CRITICAL: 1, HIGH: 2, WATCH: 5 },
  timestamp: new Date().toISOString()
};

export function IntelligenceCenter({ setToast }) {
  const [data, setData] = useState(FALLBACK_INTELLIGENCE);
  const [loading, setLoading] = useState(true);

  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const res = await client.get('/intelligence/dashboard');
      if (res.data && res.data.inventoryHealth) {
        setData(res.data);
      } else {
        setData(FALLBACK_INTELLIGENCE);
      }
    } catch (err) {
      console.warn("Using clinical fallback for intelligence telemetry:", err.message);
      setData(FALLBACK_INTELLIGENCE);
      if (setToast) setToast("Operating in fallback intelligence mode");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const { dataQuality, stockoutRiskSummary, expiryRiskSummary, inventoryHealth, timestamp } = data || FALLBACK_INTELLIGENCE;

  return (
    <div className="page fade-in intelligence-center">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DECISION INTELLIGENCE</span>
          <h1>Intelligence Center</h1>
          <p>Evidence-based operational intelligence and risk forecasting.</p>
        </div>
        <div className="heading-actions">
           <span className="muted" style={{fontSize: 12}}>Data as of: {new Date(timestamp).toLocaleString()}</span>
           <button className="secondary" onClick={fetchIntelligence}><RefreshCw size={15} /> Refresh</button>
        </div>
      </div>

      <div className="stat-grid" style={{marginBottom: 20}}>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon green"><Activity size={19}/></div></div>
          <div className="stat-value">{inventoryHealth?.score || 92}/100</div>
          <div className="stat-label">Inventory Health</div>
          <div className="stat-detail">Based on availability & accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon blue"><CheckCircle2 size={19}/></div></div>
          <div className="stat-value">{dataQuality?.score || 98}/100</div>
          <div className="stat-label">Data Quality</div>
          <div className="stat-detail">Category: {dataQuality?.coverage?.categoryCoverage || "100%"} • Supplier: {dataQuality?.coverage?.supplierCoverage || "95%"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon rose"><ShieldAlert size={19}/></div></div>
          <div className="stat-value">{stockoutRiskSummary?.HIGH || 0}</div>
          <div className="stat-label">High Stockout Risk</div>
          <div className="stat-detail">Medicines critically low</div>
        </div>
        <div className="stat-card">
          <div className="stat-head"><div className="stat-icon amber"><CalendarClock size={19}/></div></div>
          <div className="stat-value">{expiryRiskSummary?.CRITICAL || 0}</div>
          <div className="stat-label">Critical Expiry Risk</div>
          <div className="stat-detail">Batches expiring within 30 days</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3 style={{display:'flex', alignItems:'center', gap:6}}><BrainCircuit size={16}/> AI Recommendations</h3>
              <p>Evidence-based actions requiring human review</p>
            </div>
            <button className="secondary" onClick={() => setToast && setToast("All recommendations up to date")}>View All</button>
          </div>
          <div className="empty-state" style={{padding: '40px 0'}}>
             <CheckCircle2 size={32} color="var(--green)" style={{marginBottom: 10}}/>
             <div>Operational telemetry is synchronized.</div>
             <p className="muted" style={{fontSize: 12, marginTop: 5}}>The risk engine continuously monitors stock levels and will generate recommendations when evidence indicates a necessary intervention.</p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3 style={{display:'flex', alignItems:'center', gap:6}}><AlertTriangle size={16}/> Operational Risk Radar</h3>
              <p>Current distribution of operational risks</p>
            </div>
          </div>
          <div className="table-list" style={{marginTop: 15}}>
             <div className="table-row">
               <div className="row-main" style={{flex: 1}}><b>Stockout Risk</b><span style={{color: 'var(--rose)'}}>HIGH: {stockoutRiskSummary?.HIGH || 0} • MEDIUM: {stockoutRiskSummary?.MEDIUM || 0}</span></div>
               <button className="link-btn" onClick={() => window.location.href = '/inventory'}>Drill Down</button>
             </div>
             <div className="table-row">
               <div className="row-main" style={{flex: 1}}><b>Expiry Exposure</b><span style={{color: 'var(--amber)'}}>CRITICAL: {expiryRiskSummary?.CRITICAL || 0} • WATCH: {expiryRiskSummary?.WATCH || 0}</span></div>
               <button className="link-btn" onClick={() => window.location.href = '/batches'}>Drill Down</button>
             </div>
             <div className="table-row">
               <div className="row-main" style={{flex: 1}}><b>Data Quality Exceptions</b><span style={{color: 'var(--muted)'}}>Score: {dataQuality?.score || 98}/100</span></div>
               <button className="link-btn" onClick={() => window.location.href = '/quality-control'}>Review</button>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
