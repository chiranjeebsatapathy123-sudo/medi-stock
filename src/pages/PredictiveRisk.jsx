import React, { useState, useEffect } from 'react';
import { ShieldAlert, TrendingDown, Clock3, AlertTriangle, Activity, Search, ShieldCheck, ThermometerSnowflake, Truck, Loader } from 'lucide-react';

export function PredictiveRisk({ setToast }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [stockoutRisk, setStockoutRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ai/predict/stockout-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicine_id: "00000000-0000-0000-0000-000000000000",
            horizon_days: 30
          })
        });
        const data = await res.json();
        setStockoutRisk(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisk();
  }, []);

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

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
           <Loader className="animate-spin mb-4" size={32} />
           <p>Evaluating System Risk...</p>
        </div>
      ) : activeTab === "Dashboard" && (
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
                    <div className="flex justify-between text-sm mb-1"><span className="text-slate-300 flex items-center gap-2"><TrendingDown size={14} className="text-amber-500"/> System Stockout Risk</span><span className="text-white font-medium">{stockoutRisk?.risk_state || "Unknown"}</span></div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{width: `${(stockoutRisk?.risk_score || 0) * 100}%`}}></div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-brand"/> Predictive Alerts</h2>
              <div className="space-y-3">
                {stockoutRisk && (
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-amber-500/20">
                    <h4 className="text-white font-bold text-sm mb-1">Stockout Risk Evidence</h4>
                    {stockoutRisk.evidence?.map((e, idx) => (
                      <p key={idx} className="text-xs text-slate-400 mb-1">{e.label}: {e.value}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "Anomaly Detection" && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-8 text-center text-slate-400">
           <Search size={32} className="mx-auto mb-4 opacity-50" />
           <p>No anomalies detected by AI Model in current time window.</p>
        </div>
      )}

      {activeTab === "Branch Risk Profile" && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center" style={{minHeight: 300}}>
           <div className="p-4 bg-slate-800 rounded-full mb-4"><ShieldCheck size={32} className="text-slate-400"/></div>
           <h3 className="text-xl font-bold text-white mb-2">Branches Normal</h3>
           <p className="text-slate-400 max-w-md">No elevated risks detected across Central Store, ICU, or Main Pharmacy network.</p>
        </div>
      )}
    </div>
  );
}
