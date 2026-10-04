import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, HeartPulse } from 'lucide-react';
import client from '../api/client';
import { Modal } from '../components/ui';

export function Patients({ setToast }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', mrn: '', gender: 'Male', contactNumber: '', bloodGroup: '' });

  const loadData = async () => {
    try {
      const res = await client.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      if (setToast) setToast("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if(!formData.name || !formData.mrn) return setToast("Name and MRN required");
    try {
      await client.post('/patients', formData);
      setToast("Patient saved successfully");
      setShowAdd(false);
      setFormData({ name: '', mrn: '', gender: 'Male', contactNumber: '', bloodGroup: '' });
      loadData();
    } catch (err) {
      setToast("Error saving patient");
    }
  };

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.mrn.includes(search));

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow text-blue-400 font-bold">CLINICAL</span>
          <h1 className="text-3xl font-bold text-white mt-1">Patient Management</h1>
          <p className="text-slate-400 mt-2">Manage patient profiles, demographics, and clinical identifiers.</p>
        </div>
        <div className="heading-actions">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
             <input className="bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:border-blue-500 outline-none" placeholder="Search MRN or Name..." value={search} onChange={e=>setSearch(e.target.value)} />
           </div>
           <button className="primary" onClick={()=>setShowAdd(true)}><Plus size={16}/> New Patient</button>
        </div>
      </div>

      <div className="panel" style={{padding: 0, overflow: 'hidden'}}>
         <div className="data-table">
            <div className="table-head" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr'}}>
               <span>Patient Details</span>
               <span>MRN</span>
               <span>Gender & Blood</span>
               <span>Contact</span>
               <span>Registered</span>
            </div>
            {loading ? <div className="p-10 text-center text-slate-400">Loading patients...</div> :
             filtered.length === 0 ? <div className="p-10 text-center text-slate-400">No patients found.</div> :
             filtered.map(p => (
               <div className="data-row" key={p.id} style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr'}}>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Users size={20} />
                     </div>
                     <div>
                       <div className="font-bold text-white">{p.name}</div>
                       <div className="text-xs text-slate-400">{p.email || 'No email provided'}</div>
                     </div>
                  </div>
                  <div className="font-mono text-sm text-slate-300">{p.mrn}</div>
                  <div>
                    <div className="text-slate-300">{p.gender}</div>
                    <div className="text-xs text-rose-400 font-bold">{p.bloodGroup}</div>
                  </div>
                  <div className="text-slate-300">{p.contactNumber || 'N/A'}</div>
                  <div className="text-sm text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</div>
               </div>
             ))
            }
         </div>
      </div>

      {showAdd && (
        <Modal title="Register New Patient" close={()=>setShowAdd(false)}>
           <div className="form-grid mt-4">
              <label>Full Name
                 <input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
              </label>
              <label>MRN (Medical Record Number)
                 <input value={formData.mrn} onChange={e=>setFormData({...formData, mrn: e.target.value})} placeholder="MRN-XXXXX" />
              </label>
              <label>Gender
                 <select value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})}>
                    <option>Male</option><option>Female</option><option>Other</option>
                 </select>
              </label>
              <label>Blood Group
                 <select value={formData.bloodGroup} onChange={e=>setFormData({...formData, bloodGroup: e.target.value})}>
                    <option value="">Unknown</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                 </select>
              </label>
              <label className="col-span-2">Contact Number
                 <input value={formData.contactNumber} onChange={e=>setFormData({...formData, contactNumber: e.target.value})} placeholder="+1 (555) 000-0000" />
              </label>
           </div>
           <div className="flex justify-end gap-3 mt-6">
              <button className="secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="primary" onClick={handleSave}>Register Patient</button>
           </div>
        </Modal>
      )}
    </div>
  );
}
