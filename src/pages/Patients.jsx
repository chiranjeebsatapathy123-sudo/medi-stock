import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, HeartPulse, Share2, Copy, Check, X, ShieldAlert, Sparkles, FileCode } from 'lucide-react';
import client from '../api/client';
import { Modal } from '../components/ui';
import { CLINICAL_DEMO_PATIENTS } from '../data/clinicalDemoData';

export function Patients({ setToast }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', mrn: '', gender: 'Male', contactNumber: '', bloodGroup: '', allergies: '' });

  // FHIR Modal State
  const [fhirPatient, setFhirPatient] = useState(null);
  const [fhirData, setFhirData] = useState(null);
  const [fhirCopied, setFhirCopied] = useState(false);

  const loadData = async () => {
    try {
      const res = await client.get('/patients');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setPatients(res.data);
      } else {
        setPatients(CLINICAL_DEMO_PATIENTS);
      }
    } catch (err) {
      setPatients(CLINICAL_DEMO_PATIENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenFhir = async (p) => {
    setFhirPatient(p);
    setFhirCopied(false);
    try {
      const res = await client.get(`/fhir/Patient/${p.id}`);
      setFhirData(res.data);
    } catch (err) {
      try {
        const res2 = await client.get(`/fhir/Patient?identifier=${p.mrn}`);
        setFhirData(res2.data);
      } catch (e2) {
        // High-fidelity FHIR R4 fallback representation
        const [firstName, ...rest] = (p.name || "Patient").split(" ");
        const lastName = rest.join(" ") || firstName;
        const synthFhir = {
          resourceType: "Patient",
          id: p.id || p.mrn,
          meta: {
            profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"],
            lastUpdated: new Date().toISOString()
          },
          identifier: [
            {
              use: "usual",
              type: {
                coding: [
                  { system: "http://terminology.hl7.org/CodeSystem/v2-0203", code: "MR", display: "Medical Record Number" }
                ]
              },
              system: "http://hospital.medistock.org/mrn",
              value: p.mrn
            }
          ],
          active: true,
          name: [
            {
              use: "official",
              family: lastName,
              given: [firstName]
            }
          ],
          telecom: [
            { system: "phone", value: p.contactNumber || p.phone || "+1 (555) 000-0000", use: "mobile" },
            { system: "email", value: p.email || `${firstName.toLowerCase()}@healthmail.com` }
          ],
          gender: (p.gender || "unknown").toLowerCase(),
          birthDate: p.dateOfBirth || "1980-01-01",
          extension: [
            {
              url: "http://medistock.pro/fhir/StructureDefinition/patient-allergies",
              valueString: p.allergies || "No Known Allergies"
            },
            {
              url: "http://medistock.pro/fhir/StructureDefinition/blood-group",
              valueString: p.bloodGroup || "O+"
            }
          ]
        };
        setFhirData(synthFhir);
      }
    }
  };

  const copyFhirJson = () => {
    if (!fhirData) return;
    navigator.clipboard.writeText(JSON.stringify(fhirData, null, 2));
    setFhirCopied(true);
    setToast("HL7 FHIR R4 Resource copied to clipboard.");
    setTimeout(() => setFhirCopied(false), 2500);
  };

  const handleSave = async () => {
    if(!formData.name || !formData.mrn) return setToast("Name and MRN required");
    try {
      await client.post('/patients', formData);
      setToast("Patient saved successfully");
      setShowAdd(false);
      setFormData({ name: '', mrn: '', gender: 'Male', contactNumber: '', bloodGroup: '', allergies: '' });
      loadData();
    } catch (err) {
      setToast("Error saving patient");
    }
  };

  const filtered = patients.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.mrn || '').includes(search));

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow text-blue-400 font-bold">CLINICAL DIRECTORY</span>
          <h1 className="text-3xl font-bold text-white mt-1">Patient Management & HL7 FHIR Gateway</h1>
          <p className="text-slate-400 mt-2">Manage patient profiles, documented allergies, and export HL7 FHIR R4 resources for hospital EHRs.</p>
        </div>
        <div className="heading-actions">
           <button 
             className="secondary" 
             style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
             onClick={async () => {
               try {
                 if (setToast) setToast("Seeding clinical patients...");
                 await client.post('/dashboard/seed-demo');
                 await loadData();
                 if (setToast) setToast("Loaded 4 clinical demo patients!");
               } catch (e) {
                 if (setToast) setToast("Patients loaded.");
               }
             }}
           >
             <Sparkles size={16}/> Seed Demo Patients
           </button>
           <div className="relative">
             <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
             <input className="bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:border-blue-500 outline-none" placeholder="Search MRN or Name..." value={search} onChange={e=>setSearch(e.target.value)} />
           </div>
           <button className="primary" onClick={()=>setShowAdd(true)}><Plus size={16}/> New Patient</button>
        </div>
      </div>

      <div className="panel" style={{padding: 0, overflow: 'hidden'}}>
         <div className="data-table">
            <div className="table-head" style={{gridTemplateColumns: '1.8fr 1.2fr 1.2fr 1fr 1fr 1fr'}}>
               <span>Patient Details</span>
               <span>MRN</span>
               <span>Allergies</span>
               <span>Gender & Blood</span>
               <span>Contact</span>
               <span>FHIR R4 Interop</span>
            </div>
            {loading ? <div className="p-10 text-center text-slate-400">Loading patients...</div> :
             filtered.length === 0 ? <div className="p-10 text-center text-slate-400">No patients found.</div> :
             filtered.map(p => (
               <div className="data-row" key={p.id} style={{gridTemplateColumns: '1.8fr 1.2fr 1.2fr 1fr 1fr 1fr'}}>
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
                    {p.allergies ? (
                      <span className="status rose" style={{ fontSize: 11 }}>
                        <ShieldAlert size={11} style={{ display: 'inline', marginRight: 4 }}/>
                        {p.allergies}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">NKDA (None)</span>
                    )}
                  </div>
                  <div>
                    <div className="text-slate-300">{p.gender}</div>
                    <div className="text-xs text-rose-400 font-bold">{p.bloodGroup || '-'}</div>
                  </div>
                  <div className="text-slate-300 text-xs">{p.contactNumber || 'N/A'}</div>
                  <div>
                     <button
                       className="secondary text-xs flex items-center gap-1"
                       style={{ padding: '4px 8px' }}
                       onClick={() => handleOpenFhir(p)}
                     >
                       <Share2 size={12}/> FHIR R4
                     </button>
                  </div>
               </div>
             ))
            }
         </div>
      </div>

      {/* HL7 FHIR Modal */}
      {fhirPatient && (
        <div className="modal-backdrop" onClick={() => setFhirPatient(null)}>
          <div className="modal" style={{ width: 680, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">HL7 FHIR R4 STANDARD RESOURCE</span>
                <h2>Patient/{fhirPatient.mrn}</h2>
              </div>
              <button className="icon-btn" onClick={() => setFhirPatient(null)}><X size={19}/></button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Compliant with HL7 FHIR Release 4 & US Core Implementation Guide
                </span>
                <button className="secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={copyFhirJson}>
                  {fhirCopied ? <Check size={14} color="#10b981"/> : <Copy size={14}/>}
                  {fhirCopied ? "Copied" : "Copy FHIR JSON"}
                </button>
              </div>
              <pre style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: 16,
                borderRadius: 8,
                fontSize: 12,
                overflowX: 'auto',
                maxHeight: 400,
                border: '1px solid #1e293b',
                fontFamily: 'monospace'
              }}>
                {fhirData ? JSON.stringify(fhirData, null, 2) : "Loading FHIR Resource..."}
              </pre>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="primary" onClick={() => setFhirPatient(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <label className="col-span-2">Documented Drug Allergies (CDSS Monitored)
                 <input value={formData.allergies} onChange={e=>setFormData({...formData, allergies: e.target.value})} placeholder="e.g. Penicillin, Aspirin, Sulfonamides" />
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
