import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, 
  BrainCircuit, Database, Lock, Activity, RefreshCw, PowerOff, Filter,
  Bot, ShieldHalf, Scale, Search, ServerCog, Cpu, ZapOff
} from 'lucide-react';

export function AIOperationsCenter({ setToast }) {
  const [activeTab, setActiveTab] = useState("Situations");
  const [killSwitchEngaged, setKillSwitchEngaged] = useState(false);

  const mockSituations = [
    {
      id: "SIT-4892",
      type: "Supply Risk",
      agent: "Risk Agent",
      severity: "High",
      status: "ACTION_REQUIRED",
      evidence: "Medicine: Azithromycin 250mg. Current stock: 182. Avg daily consumption: 45. Supplier NovaMed lead time: 7 days. Projected shortage in 4.04 days.",
      confidence: "Moderate",
      dataCoverage: "100%",
      recommendation: "Expedite Purchase Order PO-2026-188.",
      alternatives: [
        { label: "Transfer from Central Store", risk: "Low", impact: "Fulfills demand temporarily but drops Central Store below safety stock." }
      ]
    },
    {
      id: "SIT-4893",
      type: "Expiry Alert",
      agent: "Expiry Agent",
      severity: "Medium",
      status: "APPROVAL_PENDING",
      evidence: "Batch CEF-26A5 (Ceftriaxone 1g) expires in 17 days. Quantity: 48 units. Value: ₹595.",
      confidence: "High",
      dataCoverage: "100%",
      recommendation: "Transfer 48 units to ER Ward immediately based on recent consumption patterns (5/day).",
      alternatives: []
    }
  ];

  const mockAgents = [
    { name: "Inventory Agent", purpose: "Monitor stockout risks and variances", mode: "OBSERVE / RECOMMEND", health: "Healthy", calls: 142 },
    { name: "Expiry Agent", purpose: "Detect and mitigate expiry losses", mode: "OBSERVE / RECOMMEND", health: "Healthy", calls: 89 },
    { name: "Procurement Agent", purpose: "Identify delayed POs and reorder needs", mode: "DRAFT", health: "Healthy", calls: 310 },
    { name: "Supplier Agent", purpose: "Monitor supplier fill rates and delays", mode: "OBSERVE", health: "Healthy", calls: 45 },
    { name: "Cold Chain Agent", purpose: "Monitor IoT temperature excursions", mode: "APPROVAL_REQUIRED", health: "Degraded", calls: 12 },
    { name: "Risk Agent", purpose: "Aggregate cross-domain operational risk", mode: "RECOMMEND", health: "Healthy", calls: 56 }
  ];

  const mockPolicies = [
    { id: "POL-01", agent: "Expiry Agent", action: "Create Notification", risk: "Low", mode: "Automatic", status: "Active" },
    { id: "POL-02", agent: "Procurement Agent", action: "Create PO Draft", risk: "Low", mode: "Automatic", status: "Active" },
    { id: "POL-03", agent: "Inventory Agent", action: "Execute Stock Transfer", risk: "High", mode: "Approval Required", status: "Active" },
    { id: "POL-04", agent: "Cold Chain Agent", action: "Quarantine Batch", risk: "High", mode: "Approval Required", status: "Active" }
  ];

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow text-fuchsia-400 font-bold">AUTONOMOUS OPERATIONS</span>
          <h1 className="text-3xl font-bold text-white mt-1">AI Operations Center</h1>
          <p className="text-slate-400 mt-2">Continuous observation, multi-agent evaluation, and human-controlled execution.</p>
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
        {["Situations", "Approvals", "Agents & Health", "Policies"].map(tab => (
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
            <p className="text-sm">Agents can observe and analyze, but cannot create drafts, send notifications, or execute actions until resumed.</p>
          </div>
        </div>
      )}

      {activeTab === "Situations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Situations</p>
               <h3 className="text-2xl font-bold text-white mt-1">14</h3>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Action Required</p>
               <h3 className="text-2xl font-bold text-amber-500 mt-1">3</h3>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Approvals</p>
               <h3 className="text-2xl font-bold text-blue-400 mt-1">5</h3>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Resolved Today</p>
               <h3 className="text-2xl font-bold text-emerald-400 mt-1">28</h3>
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2"><Sparkles size={16} className="text-fuchsia-400"/> AI Situation Center</h3>
              <button className="text-xs text-brand hover:text-brand-300 flex items-center gap-1"><Filter size={14}/> Filter</button>
            </div>
            <div className="p-0">
              {mockSituations.map(sit => (
                <div key={sit.id} className="p-5 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sit.severity === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>{sit.severity} Severity</span>
                      <h4 className="text-white font-bold text-base">{sit.type}</h4>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Bot size={12}/> {sit.agent}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${sit.status === 'ACTION_REQUIRED' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{sit.status.replace("_", " ")}</span>
                  </div>
                  
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-4">
                    <h5 className="text-xs text-slate-400 uppercase font-bold mb-2">Evidence & Analysis</h5>
                    <p className="text-sm text-slate-300">{sit.evidence}</p>
                    <div className="flex gap-4 mt-3">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><ShieldHalf size={12} className="text-emerald-400"/> Confidence: <span className="text-emerald-400 font-bold">{sit.confidence}</span></span>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Database size={12} className="text-blue-400"/> Data Coverage: {sit.dataCoverage}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-6">
                       <h5 className="text-xs text-fuchsia-400 uppercase font-bold mb-1 flex items-center gap-1"><Sparkles size={12}/> Primary Recommendation</h5>
                       <p className="text-sm text-white font-medium mb-3">{sit.recommendation}</p>
                       
                       {sit.alternatives.length > 0 && (
                         <div>
                           <h5 className="text-xs text-slate-400 uppercase font-bold mb-1">Alternative Options</h5>
                           {sit.alternatives.map((alt, idx) => (
                             <p key={idx} className="text-xs text-slate-300"><span className="text-slate-500 mr-2">Option {idx+1}:</span> {alt.label} (Risk: {alt.risk})</p>
                           ))}
                         </div>
                       )}
                    </div>
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      {sit.status === 'ACTION_REQUIRED' ? (
                        <>
                          <button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold py-2 px-3 rounded transition-colors w-full" onClick={()=>setToast("Action execution started")}>Execute Primary</button>
                          <button className="bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 px-3 rounded transition-colors w-full" onClick={()=>setToast("Requesting human review workflow")}>Request Review</button>
                        </>
                      ) : (
                        <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded transition-colors w-full" onClick={()=>setToast("Approval window opened")}>Review Approval</button>
                      )}
                      <button className="bg-transparent hover:bg-slate-800 text-slate-400 text-xs py-2 px-3 rounded transition-colors w-full">Dismiss</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Agents & Health" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
               <h3 className="font-bold text-white flex items-center gap-2 mb-4"><Cpu size={18} className="text-brand"/> AI Agent Registry</h3>
               <div className="space-y-3">
                 {mockAgents.map(a => (
                   <div key={a.name} className="flex justify-between items-center p-3 bg-slate-800/30 rounded border border-slate-800">
                     <div>
                       <h4 className="text-white text-sm font-bold flex items-center gap-2">{a.name} <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{a.mode}</span></h4>
                       <p className="text-xs text-slate-400 mt-1">{a.purpose}</p>
                     </div>
                     <div className="text-right">
                       <span className={`text-xs font-bold ${a.health === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>{a.health}</span>
                       <p className="text-[10px] text-slate-500 mt-1">{a.calls} calls/24h</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                 <h3 className="font-bold text-white flex items-center gap-2 mb-4"><ServerCog size={18} className="text-blue-400"/> AI System Health</h3>
                 <div className="space-y-4">
                   <div>
                     <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Provider Latency</span><span className="text-white font-medium">124ms</span></div>
                     <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '20%'}}></div></div>
                   </div>
                   <div>
                     <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Token Budget (Daily)</span><span className="text-white font-medium">42% Used</span></div>
                     <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: '42%'}}></div></div>
                   </div>
                   <div>
                     <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Error Rate</span><span className="text-white font-medium">0.14%</span></div>
                     <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '5%'}}></div></div>
                   </div>
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                 <h3 className="font-bold text-white flex items-center gap-2 mb-2"><Lock size={18} className="text-amber-400"/> Security & Tools</h3>
                 <p className="text-sm text-slate-400 mb-4">Agents are strictly restricted from direct database access. All actions pass through the AI Action Gateway schema validation.</p>
                 <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono">getInventory()</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono">getForecast()</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded font-mono">createTransferDraft()</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded font-mono">createPurchaseDraft()</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Approvals" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
           <div className="p-4 bg-blue-500/10 rounded-full mb-4"><CheckCircle2 size={32} className="text-blue-500"/></div>
           <h3 className="text-xl font-bold text-white mb-2">No Pending High-Risk Approvals</h3>
           <p className="text-slate-400 max-w-md">All AI-generated high-risk actions (disposals, quarantine, large purchases) have been reviewed.</p>
        </div>
      )}

      {activeTab === "Policies" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2"><Scale size={16} className="text-brand"/> Automation Policy Center</h3>
            <button className="text-xs bg-brand hover:bg-brand-600 text-white font-bold px-3 py-1.5 rounded transition-colors">Create Policy</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Policy ID</th>
                <th className="p-4 font-medium">Agent</th>
                <th className="p-4 font-medium">Action Target</th>
                <th className="p-4 font-medium">Risk Level</th>
                <th className="p-4 font-medium">Execution Mode</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockPolicies.map(pol => (
                <tr key={pol.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="p-4 font-medium text-slate-300">{pol.id}</td>
                  <td className="p-4 text-white font-medium flex items-center gap-2"><Bot size={14} className="text-slate-500"/> {pol.agent}</td>
                  <td className="p-4 text-slate-300">{pol.action}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${pol.risk === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{pol.risk}</span></td>
                  <td className="p-4 font-medium text-white">{pol.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
