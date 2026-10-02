import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, 
  BrainCircuit, Database, Lock, Activity, RefreshCw, PowerOff, Filter,
  Bot, ShieldHalf, Scale, Search, ServerCog, Cpu, ZapOff, Loader
} from 'lucide-react';

export function AIOperationsCenter({ setToast }) {
  const [activeTab, setActiveTab] = useState("Model Health");
  const [killSwitchEngaged, setKillSwitchEngaged] = useState(false);
  const [models, setModels] = useState([]);
  const [modelHealth, setModelHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAiData = async () => {
      setLoading(true);
      try {
        const [modelsRes, healthRes] = await Promise.all([
          fetch('/api/ai/models').then(r => r.json()),
          fetch('/api/ai/model-health').then(r => r.json())
        ]);
        setModels(modelsRes || []);
        setModelHealth(healthRes || null);
      } catch (err) {
        console.error("Failed to fetch AI data", err);
        setToast("Failed to connect to AI Service.");
      } finally {
        setLoading(false);
      }
    };
    fetchAiData();
  }, [setToast]);

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow text-fuchsia-400 font-bold">AUTONOMOUS OPERATIONS</span>
          <h1 className="text-3xl font-bold text-white mt-1">AI Operations Center</h1>
          <p className="text-slate-400 mt-2">Continuous observation, real ML model evaluation, and human-controlled execution.</p>
        </div>
        <div className="heading-actions">
           <button className={`font-bold flex items-center gap-2 px-4 py-2 rounded transition-colors ${killSwitchEngaged ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30'}`} onClick={() => {
              setKillSwitchEngaged(!killSwitchEngaged);
              setToast(killSwitchEngaged ? "AI Execution re-engaged." : "KILL SWITCH ENGAGED. All AI execution halted.");
           }}>
             {killSwitchEngaged ? <ZapOff size={16}/> : <PowerOff size={16}/>}
             {killSwitchEngaged ? "AI HALTED - CLICK TO RESUME" : "KILL SWITCH"}
           </button>
        </div>
      </div>

      <div className="flex border-b border-slate-800 mb-6 gap-6">
        {["Model Health", "Models & Versions", "Approvals", "Policies"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-fuchsia-500 text-fuchsia-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {killSwitchEngaged && (
        <div className="bg-rose-500/10 border border-rose-500 text-rose-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertTriangle size={20} />
          <div>
            <h4 className="font-bold">AI Execution Halted</h4>
            <p className="text-sm">Agents can observe and analyze, but cannot create drafts, send notifications, or execute actions until resumed. Fallback to deterministic rules enabled.</p>
          </div>
        </div>
      )}

      {loading ? (
         <div className="flex flex-col items-center justify-center p-12 text-slate-400">
           <Loader className="animate-spin mb-4" size={32} />
           <p>Connecting to ML Service...</p>
         </div>
      ) : (
        <>
          {activeTab === "Model Health" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Models in Production</p>
                   <h3 className="text-2xl font-bold text-white mt-1">{models.filter(m => m.status === 'PRODUCTION').length}</h3>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Predictions</p>
                   <h3 className="text-2xl font-bold text-emerald-400 mt-1">{modelHealth?.prediction_count || 0}</h3>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Failed Predictions</p>
                   <h3 className="text-2xl font-bold text-rose-400 mt-1">{modelHealth?.error_count || 0}</h3>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Data Drift Alerts</p>
                   <h3 className="text-2xl font-bold text-amber-500 mt-1">{modelHealth?.drift_status === 'NORMAL' ? '0' : '1'}</h3>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                   <h3 className="font-bold text-white flex items-center gap-2 mb-4"><ServerCog size={18} className="text-blue-400"/> AI System Health</h3>
                   <div className="space-y-4">
                     <div>
                       <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Provider Latency</span><span className="text-white font-medium">{modelHealth?.inference_latency_ms || 0} ms</span></div>
                       <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '20%'}}></div></div>
                     </div>
                     <div>
                       <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Drift Status</span><span className="text-white font-medium">{modelHealth?.drift_status || "UNKNOWN"}</span></div>
                     </div>
                     <div>
                       <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Error Rate</span><span className="text-white font-medium">{modelHealth ? ((modelHealth.error_count / Math.max(1, modelHealth.prediction_count)) * 100).toFixed(2) : 0}%</span></div>
                       <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '2%'}}></div></div>
                     </div>
                   </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                   <h3 className="font-bold text-white flex items-center gap-2 mb-2"><Lock size={18} className="text-amber-400"/> Security & Tools</h3>
                   <p className="text-sm text-slate-400 mb-4">ML models are strictly isolated. All actions pass through the AI Action Gateway schema validation.</p>
                   <div className="flex gap-2 flex-wrap">
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono">predict/demand</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono">predict/stockout-risk</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded font-mono">ActionGateway.execute()</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Models & Versions" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2"><Cpu size={16} className="text-brand"/> Registered Models</h3>
                <button className="text-xs text-brand hover:text-brand-300 flex items-center gap-1"><RefreshCw size={14}/> Retrain Candidate</button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Model ID</th>
                    <th className="p-4 font-medium">Version</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Data Freshness</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {models.map((m, idx) => (
                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="p-4 font-medium text-white flex items-center gap-2"><Bot size={14} className="text-fuchsia-400"/> {m.model_name}</td>
                      <td className="p-4 text-slate-300">{m.version}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${m.status === 'PRODUCTION' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{m.status}</span></td>
                      <td className="p-4 text-slate-400">Live API</td>
                    </tr>
                  ))}
                  {models.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500">No models found in registry.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Approvals" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
               <div className="p-4 bg-blue-500/10 rounded-full mb-4"><CheckCircle2 size={32} className="text-blue-500"/></div>
               <h3 className="text-xl font-bold text-white mb-2">No Pending High-Risk Approvals</h3>
               <p className="text-slate-400 max-w-md">All AI-generated high-risk actions (disposals, quarantine, large purchases) have been reviewed through the Action Gateway.</p>
            </div>
          )}

          {activeTab === "Policies" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-8 text-center">
              <Scale size={32} className="text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">Action Gateway Rules</h3>
              <p className="text-slate-400 mt-2">All actions must pass through the deterministic Action Gateway schema.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
