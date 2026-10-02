import React from "react";
import { Download, BarChart3, Activity, PackageSearch, TrendingDown, ArrowDownRight } from "lucide-react";
import { StatCard, MiniChart } from "../components/ui";

export function Analytics() {
  return <div className="page">
    <div className="page-heading">
      <div><span className="eyebrow">INSIGHTS</span><h1>Analytics</h1><p>Inventory movement and financial intelligence.</p></div>
      <div className="heading-actions">
        <button className="secondary"><Download size={16}/> Export Report</button>
        <select className="secondary" style={{padding:"8px 12px", border:"1px solid var(--line)"}}>
           <option>This Quarter</option>
           <option>This Year</option>
        </select>
      </div>
    </div>
    
    <div className="stat-grid" style={{marginBottom: 15}}>
      <StatCard icon={BarChart3} tone="blue" value="₹14.2L" label="Total Purchase Value" change="+12%" detail="vs. last quarter"/>
      <StatCard icon={Activity} tone="green" value="2.4%" label="Wastage Rate" change="-0.8%" detail="from expired stock"/>
      <StatCard icon={PackageSearch} tone="amber" value="4.2x" label="Inventory Turnover" change="+0.4x" detail="annualized"/>
      <StatCard icon={TrendingDown} tone="rose" value="₹1.1L" label="Capital Tied Up" change="-5%" detail="in excess stock"/>
    </div>
    
    <div className="dashboard-grid">
      <section className="panel chart-panel">
        <div className="panel-head"><div><h3>Stock Burn Rate</h3><p>Consumption of top medicines over time</p></div></div>
        <div style={{marginTop: 15}}><MiniChart /></div>
      </section>
      <section className="panel">
         <div className="panel-head"><div><h3>Top Movers</h3><p>Highest volume items</p></div></div>
         <div className="table-list">
            <div className="table-row"><div className="medicine-icon"><Activity size={16}/></div><div className="row-main"><b>Paracetamol 500mg</b><span>2,400 units dispensed</span></div></div>
            <div className="table-row"><div className="medicine-icon"><Activity size={16}/></div><div className="row-main"><b>Amoxicillin 500mg</b><span>1,850 units dispensed</span></div></div>
            <div className="table-row"><div className="medicine-icon"><Activity size={16}/></div><div className="row-main"><b>Metformin 500mg</b><span>1,200 units dispensed</span></div></div>
         </div>
      </section>
    </div>
  </div>;
}
