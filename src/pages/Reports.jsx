import React, { useState } from "react";
import { Plus, BarChart3, Clock3, Truck, ShieldCheck, Download, Calendar, Filter, Send, Play } from "lucide-react";
import { Modal } from "../components/ui";

export function Reports({ setToast }) {
  const [showBuilder, setShowBuilder] = useState(false);

  const reports = [
    { title: "Monthly Stock Valuation", desc: "Current value of all inventory assets", type: "Financial", icon: BarChart3, schedule: "Monthly" },
    { title: "Expiry Risk Audit", desc: "Items expiring within 90 days", type: "Compliance", icon: Clock3, schedule: "Weekly" },
    { title: "Supplier Lead Times", desc: "Average fulfillment times per vendor", type: "Procurement", icon: Truck, schedule: "On-Demand" },
    { title: "Controlled Substances Log", desc: "Mandatory DEA/FDA tracking log", type: "Regulatory", icon: ShieldCheck, schedule: "Daily" },
    { title: "Cold Chain Incident History", desc: "Temperature excursions over last 30 days", type: "Quality", icon: ShieldCheck, schedule: "On-Demand" }
  ];

  return <div className="page animate-fade-in">
    <div className="page-heading">
      <div><span className="eyebrow">REPORTING</span><h1>Advanced Report Center</h1><p>Generate compliant, financial, and operational reports based on real-time data.</p></div>
      <div className="flex gap-2">
        <button className="secondary"><Calendar size={16}/> Scheduled Delivery</button>
        <button className="primary" onClick={() => setShowBuilder(true)}><Plus size={16}/> Report Builder</button>
      </div>
    </div>

    <div className="mb-6 flex gap-4">
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-4 flex gap-8">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Generated Today</div>
          <div className="text-xl font-medium text-white">12 Reports</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Scheduled</div>
          <div className="text-xl font-medium text-white">4 Active</div>
        </div>
      </div>
      <div className="flex-1 bg-brand/10 border border-brand/20 rounded-lg p-4 flex gap-4 items-center">
        <div className="w-10 h-10 rounded-full bg-brand/20 text-brand flex items-center justify-center shrink-0"><Play size={18}/></div>
        <div>
          <div className="text-sm font-medium text-brand">Automated Shift Report Ready</div>
          <div className="text-xs text-slate-400 mt-0.5">End of shift inventory reconciliation is complete.</div>
        </div>
        <button className="primary text-xs px-3 py-1.5 ml-auto">View Now</button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {reports.map(r => (
        <div key={r.title} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex gap-4 items-center hover:border-slate-600 transition-colors">
           <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-brand"><r.icon size={20}/></div>
           <div className="flex-1">
             <div className="flex items-center gap-2">
               <b className="text-white text-sm">{r.title}</b>
               <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-700 text-slate-300">{r.type}</span>
             </div>
             <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
             <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1"><Calendar size={10}/> Schedule: {r.schedule}</div>
           </div>
           <div className="flex flex-col gap-2 shrink-0">
             <button className="secondary text-xs py-1 px-2 flex items-center gap-1" onClick={() => setToast && setToast(`Generating ${r.title}...`)}><Download size={14}/> CSV</button>
             <button className="secondary text-xs py-1 px-2 flex items-center gap-1" onClick={() => setToast && setToast(`Sending ${r.title}...`)}><Send size={14}/> Send</button>
           </div>
        </div>
      ))}
    </div>

    {showBuilder && (
      <Modal title="Custom Report Builder" close={() => setShowBuilder(false)}>
        <p className="text-sm text-slate-400 mb-6">Select dimensions and metrics to generate a custom analytical report. Queries are safely abstracted.</p>
        
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <label>Report Domain
            <select>
              <option>Inventory Ledger</option>
              <option>Procurement & Suppliers</option>
              <option>Cold Chain Incidents</option>
              <option>Expiry & Waste</option>
            </select>
          </label>
          <label>Date Range
            <select>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Year to Date</option>
              <option>Custom Range...</option>
            </select>
          </label>
        </div>

        <div className="mt-6 border-t border-slate-700 pt-4">
          <label className="text-sm font-medium text-white mb-2 block">Select Metrics</label>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
            <label className="flex items-center gap-2"><input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-brand" defaultChecked/> Total Value</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-brand" defaultChecked/> Issue Quantity</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-brand"/> Spoilage Rate</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-brand"/> Stockout Count</label>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-700 pt-4">
          <label className="text-sm font-medium text-white mb-2 block">Group By (Dimensions)</label>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
            <label className="flex items-center gap-2"><input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-brand" defaultChecked/> Branch / Location</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-brand" defaultChecked/> Medicine Category</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-brand"/> Supplier</label>
          </div>
        </div>

        <div className="modal-actions mt-8 flex justify-between">
          <button className="secondary" onClick={() => setShowBuilder(false)}>Cancel</button>
          <button className="primary" onClick={() => { setShowBuilder(false); if(setToast) setToast("Executing custom report query safely..."); }}>Generate Report</button>
        </div>
      </Modal>
    )}
  </div>;
}
