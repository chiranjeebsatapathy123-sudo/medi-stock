import React, { useState } from 'react';
import { IndianRupee, TrendingUp, AlertCircle, PieChart, Activity, Filter, Download, PackageSearch, Clock3 } from 'lucide-react';
import { db } from '../services/mockDb';
import { MiniChart } from '../components/ui';

export function FinancialIntelligence({ setToast }) {
  const [activeTab, setActiveTab] = useState("Valuation");
  const [valuationMethod, setValuationMethod] = useState("WAC");

  // Mock calculations
  const totalValue = db.batches.reduce((sum, b) => sum + (b.currentQty * b.purchasePrice), 0);
  const expiringValue = db.batches.filter(b => new Date(b.expiryDate) < new Date(Date.now() + 90*86400000)).reduce((sum, b) => sum + (b.currentQty * b.purchasePrice), 0);
  const deadStockValue = 14500; // Mocked inactive inventory value

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow text-emerald-400 font-bold">INTELLIGENCE</span>
          <h1 className="text-3xl font-bold text-white mt-1">Financial Intelligence</h1>
          <p className="text-slate-400 mt-2">Valuation, cost analysis, and loss prevention.</p>
        </div>
        <div className="heading-actions">
          <select className="bg-slate-800 border border-slate-700 text-white rounded px-3 py-2 text-sm" value={valuationMethod} onChange={(e)=>setValuationMethod(e.target.value)}>
            <option value="WAC">Weighted Average Cost (WAC)</option>
            <option value="FIFO">First-In, First-Out (FIFO)</option>
            <option value="FEFO">First-Expire, First-Out (FEFO)</option>
          </select>
          <button className="secondary" onClick={() => setToast("Exporting financial report...")}><Download size={16}/> Export</button>
        </div>
      </div>

      <div className="flex border-b border-slate-800 mb-6 gap-6">
        {["Valuation", "Price Variances", "Scenario Planner (What-If)"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Valuation" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><IndianRupee size={20}/></div>
          </div>
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Inventory Value</p>
          <h3 className="text-2xl font-bold text-white">₹{(totalValue).toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-2">Across all branches</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><TrendingUp size={20}/></div>
          </div>
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Estimated Expiry Loss</p>
          <h3 className="text-2xl font-bold text-white">₹{(expiringValue).toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-2">Next 90 days exposure</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-slate-700/50 text-slate-300 rounded-lg"><PackageSearch size={20}/></div>
          </div>
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Inactive / Dead Stock</p>
          <h3 className="text-2xl font-bold text-white">₹{(deadStockValue).toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-2">No movement &gt; 180 days</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Activity size={20}/></div>
          </div>
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Inventory Turnover</p>
          <h3 className="text-2xl font-bold text-white">4.2x</h3>
          <p className="text-xs text-slate-500 mt-2">Annualized rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">Value by Location</h2>
          <p className="text-xs text-slate-400 mb-6">Current inventory valuation breakdown.</p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Central Store</span><span className="text-white font-medium">₹2,45,000</span></div>
              <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-brand h-2 rounded-full" style={{width: '65%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Main Pharmacy</span><span className="text-white font-medium">₹85,200</span></div>
              <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '25%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Cold Storage Unit</span><span className="text-white font-medium">₹32,400</span></div>
              <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-cyan-500 h-2 rounded-full" style={{width: '10%'}}></div></div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">Inventory Value Trend</h2>
          <p className="text-xs text-slate-400 mb-6">Historical valuation over the last 6 months.</p>
          <div style={{height: 150}}>
            <MiniChart />
          </div>
        </div>
      </div>
      </>
      )}

      {activeTab === "Price Variances" && (
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
            <h3 className="font-bold text-white flex items-center gap-2"><AlertCircle size={16} className="text-amber-500"/> Unusual Price Variances</h3>
            <button className="text-xs text-brand hover:text-brand-300 flex items-center gap-1"><Filter size={14}/> Filter</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Medicine</th>
                <th className="p-4 font-medium">Supplier</th>
                <th className="p-4 font-medium">Previous Cost</th>
                <th className="p-4 font-medium">Current Cost</th>
                <th className="p-4 font-medium text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="p-4 font-medium text-white">Azithromycin 250mg</td>
                <td className="p-4 text-slate-300">NovaMed</td>
                <td className="p-4 text-slate-300">₹6.00</td>
                <td className="p-4 text-slate-300">₹8.50</td>
                <td className="p-4 text-right"><span className="text-rose-400 font-bold bg-rose-400/10 px-2 py-1 rounded">+41.6%</span></td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-4 font-medium text-white">Insulin Glargine</td>
                <td className="p-4 text-slate-300">BioNova</td>
                <td className="p-4 text-slate-300">₹22.00</td>
                <td className="p-4 text-slate-300">₹25.50</td>
                <td className="p-4 text-right"><span className="text-rose-400 font-bold bg-rose-400/10 px-2 py-1 rounded">+15.9%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      )}

      {activeTab === "Scenario Planner (What-If)" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
               <h3 className="font-bold text-white mb-4">Simulation Assumptions</h3>
               <div className="space-y-4">
                 <label className="block">
                   <span className="text-xs text-slate-400 font-bold uppercase">Demand Shift (%)</span>
                   <input type="number" defaultValue={15} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
                 </label>
                 <label className="block">
                   <span className="text-xs text-slate-400 font-bold uppercase">Supplier Lead Time (Days)</span>
                   <input type="number" defaultValue={2} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
                 </label>
                 <label className="block">
                   <span className="text-xs text-slate-400 font-bold uppercase">Expiry Warning Threshold (Days)</span>
                   <input type="number" defaultValue={45} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
                 </label>
                 <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded transition-colors mt-2" onClick={()=>setToast("Running scenario simulation...")}>Run Simulation</button>
               </div>
             </div>
          </div>
          <div className="lg:col-span-2">
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="font-bold text-white text-lg">Scenario: "Festival Demand Increase"</h3>
                   <p className="text-sm text-slate-400 mt-1">Comparing Current Baseline vs. Projected Scenario. (Safe Simulation Mode: Production data is NOT altered).</p>
                 </div>
                 <button className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors">Save Scenario</button>
               </div>
               
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                     <th className="pb-3">Metric</th>
                     <th className="pb-3">Current</th>
                     <th className="pb-3">Scenario Projected</th>
                     <th className="pb-3 text-right">Impact</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   <tr className="border-b border-slate-800/50">
                     <td className="py-4 text-white font-medium">Estimated Monthly Procurement Spend</td>
                     <td className="py-4 text-slate-400">₹4.2L</td>
                     <td className="py-4 text-slate-300">₹4.8L</td>
                     <td className="py-4 text-right"><span className="text-rose-400 font-bold">+14.2%</span></td>
                   </tr>
                   <tr className="border-b border-slate-800/50">
                     <td className="py-4 text-white font-medium">Stockout Risk Incidents</td>
                     <td className="py-4 text-slate-400">2 items</td>
                     <td className="py-4 text-slate-300">5 items</td>
                     <td className="py-4 text-right"><span className="text-rose-400 font-bold">+150%</span></td>
                   </tr>
                   <tr className="border-b border-slate-800/50">
                     <td className="py-4 text-white font-medium">Estimated Expiry Loss</td>
                     <td className="py-4 text-slate-400">₹14,500</td>
                     <td className="py-4 text-slate-300">₹11,200</td>
                     <td className="py-4 text-right"><span className="text-emerald-400 font-bold">-22.7%</span></td>
                   </tr>
                 </tbody>
               </table>
               
               <div className="mt-6 p-4 bg-slate-800/50 rounded border border-slate-700">
                 <p className="text-sm text-slate-300"><strong className="text-emerald-400">AI Recommendation:</strong> Due to the projected 15% demand shift, increasing safety stock for critical antibiotics by 20% will mitigate the 150% jump in stockout risk while only increasing holding costs marginally.</p>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
