import React, { useState, useEffect } from 'react';
import { Stethoscope, ClipboardList, PackageMinus, RefreshCcw, AlertOctagon, CheckCircle2, ShieldAlert, ArrowRight, User } from 'lucide-react';
import { pharmacyService } from '../services/pharmacyService';

export function PharmacyOperations({ setToast }) {
  const [activeTab, setActiveTab] = useState("Dispensing");
  const [returns, setReturns] = useState([{ id: "REQ-104", desc: "2x Paracetamol 500mg from ICU", status: "Inspection Required" }]);
  const [damageLog, setDamageLog] = useState([
    { item: "Insulin Glargine (1 Vial)", reason: "Broken during transport", disposition: "Disposed", color: "text-rose-400" },
    { item: "Amoxicillin (50 Caps)", reason: "Water damage in store", disposition: "Supplier Return", color: "text-amber-400" }
  ]);

  const [dispenseQueue, setDispenseQueue] = useState([]);
  
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const orders = await pharmacyService.getOrders();
      // Map backend orders to our table format
      const queue = orders.map(o => ({
        id: o.id,
        patient: o.patientName,
        med: o.medicine?.brandName || o.medicineId,
        qty: o.quantity,
        status: o.status === 'PENDING' ? 'Pending' : o.status === 'REVIEWED' ? 'Processing' : o.status,
        urgency: o.priority === 'HIGH' ? 'Critical' : 'Normal',
        note: o.notes
      }));
      setDispenseQueue(queue);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispense = async (id) => {
    setToast(`Validating ${id} using FEFO rules...`);
    try {
      // Mocking the dispensing request payload since we don't have batch selection UI here yet
      await pharmacyService.dispenseOrder(id, { batches: [] });
      setToast(`FEFO Validation Passed. Stock issued for ${id}.`);
      loadOrders();
    } catch (err) {
      setToast(`Error dispensing order: ${err.message}`);
    }
  };

  const handleReview = async (id) => {
    const item = dispenseQueue.find(i => i.id === id);
    if (item) {
      setToast(item.note || 'Reviewing...');
      try {
        await pharmacyService.reviewOrder(id, 'APPROVE');
        setToast(`Review completed. ${id} is now processing.`);
        loadOrders();
      } catch (err) {
        setToast(`Failed to review order: ${err.message}`);
      }
    }
  };

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow text-blue-400 font-bold">OPERATIONS</span>
          <h1 className="text-3xl font-bold text-white mt-1">Pharmacy Center</h1>
          <p className="text-slate-400 mt-2">Dispensing, returns, and controlled substance management.</p>
        </div>
        <div className="heading-actions">
          <button className="primary" onClick={() => setToast("New dispensing request started.")}><PackageMinus size={16}/> Direct Dispense</button>
        </div>
      </div>

      <div className="flex border-b border-slate-800 mb-6 gap-6">
        {["Dispensing", "Stock Requests", "Returns & Damage", "Controlled Inventory"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-brand text-brand' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Dispensing" && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <h3 className="font-bold text-white flex items-center gap-2"><ClipboardList size={16} className="text-blue-400"/> Active Dispensing Queue</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Order / Rx ID</th>
                  <th className="p-4 font-medium">Recipient</th>
                  <th className="p-4 font-medium">Medicine</th>
                  <th className="p-4 font-medium">Qty</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {dispenseQueue.map(item => (
                  <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-4 font-medium text-white">{item.id}</td>
                    <td className="p-4 text-slate-300 flex items-center gap-2"><User size={14} className="text-slate-500"/> {item.patient}</td>
                    <td className="p-4 text-slate-300">{item.med}</td>
                    <td className="p-4 text-slate-300">{item.qty}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.status === 'Pending' ? 'bg-slate-700 text-slate-300' :
                        item.status === 'Processing' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                      {item.urgency === 'Critical' && <span className="ml-2 text-rose-400 text-xs font-bold">CRITICAL</span>}
                    </td>
                    <td className="p-4 text-right">
                       {item.status === 'Needs Review' ? (
                         <button className="text-xs bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold px-3 py-1.5 rounded transition-colors" onClick={()=>handleReview(item.id)}>Review</button>
                      ) : (
                         <button className="text-xs bg-brand hover:bg-brand-600 text-white font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1 ml-auto" onClick={()=>handleDispense(item.id)}>Issue <ArrowRight size={12}/></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Returns & Damage" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4"><RefreshCcw size={16} className="text-brand"/> Return-to-Stock Workflow</h3>
            <p className="text-sm text-slate-400 mb-4">Process returns from wards. Items must pass inspection before returning to active inventory.</p>
            {returns.length > 0 ? returns.map(ret => (
              <div key={ret.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-4">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-white font-medium">Return {ret.id}</span>
                   <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded font-bold">{ret.status}</span>
                 </div>
                 <p className="text-sm text-slate-400 mb-3">{ret.desc}</p>
                 <div className="flex gap-2">
                   <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded transition-colors" onClick={()=>{ setToast("Quarantined for further review"); setReturns(returns.filter(r => r.id !== ret.id)); }}>Quarantine</button>
                   <button className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs py-2 rounded transition-colors" onClick={()=>{ setToast("Marked as damaged"); setDamageLog([{item: ret.desc, reason: "Marked damaged during inspection", disposition: "Pending Disposal", color: "text-rose-400"}, ...damageLog]); setReturns(returns.filter(r => r.id !== ret.id)); }}>Mark Damaged</button>
                   <button className="flex-1 bg-brand hover:bg-brand-600 text-white text-xs py-2 rounded transition-colors" onClick={()=>{ setToast("Restocked successfully"); setReturns(returns.filter(r => r.id !== ret.id)); }}>Restock</button>
                 </div>
              </div>
            )) : (
              <div className="text-slate-400 text-sm text-center py-4 border border-dashed border-slate-700 rounded-lg">No pending returns.</div>
            )}
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4"><AlertOctagon size={16} className="text-rose-500"/> Damaged Inventory Log</h3>
            <p className="text-sm text-slate-400 mb-4">Recent damage reports and dispositions.</p>
            <div className="space-y-3">
               {damageLog.map((log, idx) => (
                 <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                   <div>
                     <p className="text-white">{log.item}</p>
                     <p className="text-xs text-slate-500">{log.reason}</p>
                   </div>
                   <span className={`${log.color} text-xs font-bold`}>{log.disposition}</span>
                 </div>
               ))}
            </div>
            <button className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white text-sm py-2 rounded transition-colors" onClick={() => setToast("Damage report form opened.")}>Report Damage</button>
          </div>
        </div>
      )}

      {activeTab === "Controlled Inventory" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center" style={{minHeight: 300}}>
           <div className="p-4 bg-rose-500/10 rounded-full mb-4"><ShieldAlert size={32} className="text-rose-500"/></div>
           <h3 className="text-xl font-bold text-white mb-2">Restricted Workspace</h3>
           <p className="text-slate-400 max-w-md">Controlled substance management requires elevated privileges. Dual-authorization is required for all movements.</p>
           <button className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2">Request Authorization</button>
        </div>
      )}
      
      {activeTab === "Stock Requests" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center" style={{minHeight: 300}}>
           <div className="p-4 bg-slate-800 rounded-full mb-4"><ClipboardList size={32} className="text-slate-400"/></div>
           <h3 className="text-xl font-bold text-white mb-2">No pending requests</h3>
           <p className="text-slate-400 max-w-md">All branch and ward stock requests have been fulfilled.</p>
        </div>
      )}
    </div>
  );
}
