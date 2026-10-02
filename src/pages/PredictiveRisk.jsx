import React, { useState } from 'react';
import { ShieldAlert, TrendingDown, Clock3, AlertTriangle, Activity, Search, ShieldCheck, ThermometerSnowflake, Truck } from 'lucide-react';
import { db } from '../services/mockDb';

export function PredictiveRisk({ setToast }) {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow text-amber-500 font-bold">RISK & ANOMALIES</span>
          <h1 className="text-3xl font-bold text-white mt-1">Predictive Risk Engine</h1>
          <p className="text-slate-400 mt-2">AI-driven anomaly detection and operational risk scoring.</p>
        </div>
      </div>

      <div className="flex border-b border-slate-800 mb-6 gap-6">
        {["Dashboard", "Anomaly Detection", "Branch Risk Profile"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Dashboard" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
              <div className="p-6 pl-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">Operational Risk Score</h2>
                    <p className="text-xs text-slate-400">Aggregate risk across inventory, supply chain, and compliance.</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500 flex items-center justify-center text-xl font-bold text-white">42</div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-slate-300 flex items-center gap-2"><TrendingDown size={14} className="text-amber-500"/> Stockout Risk</span><span className="text-white font-medium">Moderate</span></div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{width: '60%'}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-slate-300 flex items-center gap-2"><Clock3 size={14} className="text-rose-500"/> Expiry Exposure</span><span className="text-white font-medium">High</span></div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-rose-500 h-1.5 rounded-full" style={{width: '85%'}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-slate-300 flex items-center gap-2"><Truck size={14} className="text-emerald-500"/> Supplier Reliability</span><span className="text-white font-medium">Healthy</span></div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '20%'}}></div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-brand"/> Predictive Alerts</h2>
              <div className="space-y-3">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-rose-500/20">
                  <h4 className="text-white font-bold text-sm mb-1">Likely Stockout: Azithromycin 250mg</h4>
                  <p className="text-xs text-slate-400 mb-2">Demand has spiked 40% above baseline. Current stock will deplete in 3.2 days. Supplier lead time is 7 days.</p>
                  <button className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors" onClick={()=>setToast("Drafting emergency PO")}>Draft Emergency PO</button>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-amber-500/20">
                  <h4 className="text-white font-bold text-sm mb-1">Potential Delay: NovaMed</h4>
                  <p className="text-xs text-slate-400 mb-2">Supplier has delayed 2 of the last 3 deliveries by an average of 48 hours.</p>
                  <button className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors" onClick={()=>setToast("Adjusting safety stock algorithm")}>Adjust Safety Stock</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "Anomaly Detection" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
            <h3 className="font-bold text-white flex items-center gap-2"><Search size={16} className="text-blue-400"/> Anomaly Engine 2.0</h3>
            <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">3 Anomalies Detected</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
               <div className="mt-1"><AlertTriangle size={20} className="text-amber-500"/></div>
               <div>
                 <h4 className="text-white font-bold text-sm">Repeated Inventory Adjustments</h4>
                 <p className="text-xs text-slate-400 mt-1">Paracetamol 500mg has had 4 negative manual adjustments in the ICU branch over the last 14 days, totaling -24 units.</p>
                 <div className="mt-3 flex gap-2">
                   <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded">View Ledger Evidence</button>
                   <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded">Acknowledge</button>
                 </div>
               </div>
            </div>
            
            <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
               <div className="mt-1"><ThermometerSnowflake size={20} className="text-cyan-500"/></div>
               <div>
                 <h4 className="text-white font-bold text-sm">Unusual Cold Chain Fluctuation</h4>
                 <p className="text-xs text-slate-400 mt-1">IoT sensor at Main Pharmacy Fridge B recorded a spike to 7.8°C for 45 minutes during off-hours (02:15 AM).</p>
                 <div className="mt-3 flex gap-2">
                   <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded">View Sensor Log</button>
                   <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded">Acknowledge</button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Branch Risk Profile" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center" style={{minHeight: 300}}>
           <div className="p-4 bg-slate-800 rounded-full mb-4"><ShieldCheck size={32} className="text-slate-400"/></div>
           <h3 className="text-xl font-bold text-white mb-2">Branches Normal</h3>
           <p className="text-slate-400 max-w-md">No elevated risks detected across Central Store, ICU, or Main Pharmacy network.</p>
        </div>
      )}
    </div>
  );
}
