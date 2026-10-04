import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import client from '../api/client';
import { Modal } from '../components/ui';

export function Invoices({ setToast }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ invoiceNumber: '', amount: '', status: 'PENDING', notes: '' });

  const loadData = async () => {
    try {
      const res = await client.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
      if (setToast) setToast("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if(!formData.invoiceNumber || !formData.amount) return setToast("Invoice Number and Amount required");
    try {
      await client.post('/invoices', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setToast("Invoice generated successfully");
      setShowAdd(false);
      setFormData({ invoiceNumber: '', amount: '', status: 'PENDING', notes: '' });
      loadData();
    } catch (err) {
      setToast("Error saving invoice");
    }
  };

  const filtered = invoices.filter(i => i.invoiceNumber.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow text-emerald-400 font-bold">BILLING</span>
          <h1 className="text-3xl font-bold text-white mt-1">Invoice Management</h1>
          <p className="text-slate-400 mt-2">Track patient billing, payments, and overdue accounts.</p>
        </div>
        <div className="heading-actions">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
             <input className="bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:border-emerald-500 outline-none" placeholder="Search Invoice #..." value={search} onChange={e=>setSearch(e.target.value)} />
           </div>
           <button className="primary" onClick={()=>setShowAdd(true)}><Plus size={16}/> Create Invoice</button>
        </div>
      </div>

      <div className="panel" style={{padding: 0, overflow: 'hidden'}}>
         <div className="data-table">
            <div className="table-head" style={{gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr'}}>
               <span>Invoice #</span>
               <span>Amount</span>
               <span>Status</span>
               <span>Issued Date</span>
               <span>Notes</span>
               <span>Actions</span>
            </div>
            {loading ? <div className="p-10 text-center text-slate-400">Loading invoices...</div> :
             filtered.length === 0 ? <div className="p-10 text-center text-slate-400">No invoices found.</div> :
             filtered.map(inv => (
               <div className="data-row" key={inv.id} style={{gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr'}}>
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded flex items-center justify-center ${inv.status==='PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        <FileText size={20} />
                     </div>
                     <div className="font-bold text-white font-mono">{inv.invoiceNumber}</div>
                  </div>
                  <div className="font-bold text-slate-200">₹{parseFloat(inv.amount).toFixed(2)}</div>
                  <div>
                    {inv.status === 'PAID' ? 
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded font-bold border border-emerald-500/30 flex items-center gap-1 w-max"><CheckCircle2 size={12}/> PAID</span> : 
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded font-bold border border-amber-500/30 flex items-center gap-1 w-max"><AlertCircle size={12}/> {inv.status}</span>
                    }
                  </div>
                  <div className="text-sm text-slate-400">{new Date(inv.issuedDate).toLocaleDateString()}</div>
                  <div className="text-xs text-slate-400 truncate">{inv.notes || '-'}</div>
                  <div>
                     <button className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1" onClick={() => {
                         if (setToast) setToast(`Exporting Invoice ${inv.invoiceNumber} to PDF...`);
                     }}><Download size={14}/> PDF</button>
                  </div>
               </div>
             ))
            }
         </div>
      </div>

      {showAdd && (
        <Modal title="Create Invoice" close={()=>setShowAdd(false)}>
           <div className="form-grid mt-4">
              <label>Invoice Number
                 <input value={formData.invoiceNumber} onChange={e=>setFormData({...formData, invoiceNumber: e.target.value})} placeholder="INV-2026-XXXX" />
              </label>
              <label>Amount (₹)
                 <input type="number" step="0.01" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
              </label>
              <label>Status
                 <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}>
                    <option>PENDING</option><option>PAID</option><option>OVERDUE</option><option>CANCELLED</option>
                 </select>
              </label>
              <label>Notes
                 <input value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} placeholder="Optional notes..." />
              </label>
           </div>
           <div className="flex justify-end gap-3 mt-6">
              <button className="secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="primary" onClick={handleSave}>Generate Invoice</button>
           </div>
        </Modal>
      )}
    </div>
  );
}
