import React, { useState } from "react";
import { Plus, BarChart3, Clock3, Truck, ShieldCheck, Download, Calendar, Filter, Send, Play } from "lucide-react";
import { Modal } from "../components/ui";

export function Reports({ setToast }) {
  const [showBuilder, setShowBuilder] = useState(false);

  const handleExportCsv = (title) => {
    let rows = [];
    let filename = title.toLowerCase().replace(/\s+/g, '_') + '.csv';

    if (title.includes("Controlled")) {
      rows = [
        ["Timestamp", "Medication", "DEA_Schedule", "Lot_Number", "Balance_Units", "Vault_Location", "Authorized_Pharmacist", "Integrity_Hash"],
        [new Date().toISOString(), "Morphine Sulfate 15mg/mL", "Schedule II", "MPH-2027-C2", "110", "Biometric Safe Vault", "Dr. Robert Harrison, MD", "e3b0c44298fc1c149afbf4c8996fb924"],
        [new Date().toISOString(), "Fentanyl Citrate 100mcg/2mL", "Schedule II", "FNT-2027-F1", "110", "Biometric Safe Vault", "Dr. Elena Rostova, MD", "a591a6d40bf420404a011733cfb7b190"],
        [new Date().toISOString(), "Lorazepam 1mg", "Schedule IV", "LOR-2027-A1", "340", "Secured Cabinet Bay 3", "Chief Pharmacist", "2c26b46b68ffc68ff99b453c1d304134"]
      ];
    } else if (title.includes("Expiry")) {
      rows = [
        ["Medication", "Brand", "Lot_Number", "Expiry_Date", "Days_Remaining", "Quantity", "FEFO_Priority", "Status"],
        ["Ceftriaxone Sodium 1g", "Rocephin", "LOT-REC-2026-99", "2026-08-15", "45", "100", "LOCKED", "RECALLED"],
        ["Insulin Glargine 100 U/mL", "Lantus", "INS-2026-EXC", "2026-09-30", "52", "150", "LOCKED", "QUARANTINED"],
        ["Amoxicillin Trihydrate 500mg", "Amoxil", "AMX-2026-N1", "2026-11-20", "104", "850", "FEFO #1", "ACTIVE"],
        ["Epinephrine 0.3mg", "EpiPen", "EPI-2026-E1", "2026-12-10", "124", "42", "FEFO #2", "ACTIVE"]
      ];
    } else if (title.includes("Cold Chain")) {
      rows = [
        ["Device_ID", "Storage_Area", "Min_Target_C", "Max_Target_C", "Logged_Temp_C", "Excursion_Duration_Mins", "Incident_State", "Resolution"],
        ["SenseNode-Alpha", "Refrigeration Unit 1", "2.0", "8.0", "10.4", "145", "QUARANTINED", "Batch INS-2026-EXC isolated from dispensing"],
        ["SenseNode-Beta", "Vaccine Ultra-Freezer", "-25.0", "-15.0", "-19.4", "0", "COMPLIANT", "Nominal operation"],
        ["SenseNode-Vault", "C-II Biometric Safe", "15.0", "25.0", "21.2", "0", "COMPLIANT", "Nominal operation"]
      ];
    } else {
      rows = [
        ["Medication_Code", "Generic_Name", "Brand", "Category", "Stock_Units", "Unit_Cost_USD", "Total_Valuation_USD"],
        ["MED-AMX-500", "Amoxicillin Trihydrate 500mg", "Amoxil", "Antibiotic", "850", "2.75", "2337.50"],
        ["MED-CEF-1G", "Ceftriaxone Sodium 1g", "Rocephin", "Antibiotic", "400", "14.50", "5800.00"],
        ["MED-INS-100", "Insulin Glargine 100 U/mL", "Lantus", "Endocrine", "250", "34.00", "8500.00"],
        ["MED-WRF-5MG", "Warfarin Sodium 5mg", "Coumadin", "Cardiovascular", "800", "4.20", "3360.00"],
        ["MED-MPH-15", "Morphine Sulfate 15mg/mL", "Infumorph", "Controlled", "110", "18.50", "2035.00"]
      ];
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (setToast) setToast(`Exported ${title} to ${filename}`);
  };

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
             <button className="secondary text-xs py-1 px-2 flex items-center gap-1" onClick={() => handleExportCsv(r.title)}><Download size={14}/> CSV</button>
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
