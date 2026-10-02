import React, { useState } from 'react';
import { Play, Save, History, TrendingUp, TrendingDown, ThermometerSnowflake, ShieldAlert, BarChart2, Layers, Download, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { simulationEngine } from '../services/simulationEngine';
import { db } from '../services/mockDb';

export function ScenarioPlanning({ setToast }) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [activeTab, setActiveTab] = useState('BUILDER');
  
  const [scenario, setScenario] = useState({
    name: "Festival Demand Spike",
    duration: 30,
    demandIncrease: 25,
    supplierDelay: 0
  });

  const runSimulation = async () => {
    setRunning(true);
    setToast("Creating immutable snapshot and queueing simulation...");
    try {
      const res = await simulationEngine.runScenario("SCN-TEST", scenario);
      setResults(res.results);
      setSnapshot(res.snapshot);
      setActiveTab('RESULTS');
      setToast("Simulation completed successfully.");
    } catch (e) {
      setToast("Simulation failed: " + e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow" style={{ color: 'var(--brand)' }}>OPERATIONS INTELLIGENCE</span>
          <h1>Predictive Digital Twin</h1>
          <p>Safely simulate what-if scenarios against an isolated snapshot of production data.</p>
        </div>
        <div className="heading-actions">
           <button className="secondary font-bold" onClick={() => setToast && setToast("Opening scenario library...")}><History size={16}/> Scenario Library</button>
           <button className="primary font-bold" onClick={runSimulation} disabled={running}>
             {running ? <RefreshCw className="spin" size={16}/> : <Play size={16}/>} 
             {running ? 'Running Simulation...' : 'Run Simulation'}
           </button>
        </div>
      </div>

      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--amber)', padding: '12px 16px', borderRadius: '8px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', fontSize: '13px' }}>
         <ShieldAlert size={18} />
         <div>
            <strong style={{ display: 'block', marginBottom: '2px' }}>SIMULATION MODE ACTIVE</strong>
            No changes will be made to live inventory. This scenario executes against a read-only snapshot.
         </div>
      </div>

      <div className="tabs" style={{ marginBottom: '20px' }}>
        {['BUILDER', 'RESULTS', 'SNAPSHOT', 'APPROVAL'].map(tab => (
          <button key={tab} className={activeTab === tab ? "selected" : ""} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'BUILDER' && (
        <div className="dashboard-grid">
          <section className="panel" style={{ gridColumn: 'span 2' }}>
            <div className="panel-head">
              <div><h3>Scenario Variables</h3><p>Adjust environmental and supply chain factors</p></div>
            </div>
            <div className="form-grid" style={{ padding: '24px', gap: '20px' }}>
              <label>Scenario Name
                <input value={scenario.name} onChange={e => setScenario({...scenario, name: e.target.value})} />
              </label>
              <label>Simulation Duration (Days)
                <select value={scenario.duration} onChange={e => setScenario({...scenario, duration: parseInt(e.target.value)})}>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                </select>
              </label>
              <label>Demand Adjustment (%)
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="range" min="-50" max="100" value={scenario.demandIncrease} onChange={e => setScenario({...scenario, demandIncrease: parseInt(e.target.value)})} style={{ flex: 1 }} />
                  <span style={{ fontWeight: 'bold', width: '40px', textAlign: 'right' }}>{scenario.demandIncrease}%</span>
                </div>
              </label>
              <label>Supplier Lead Time Delay (Days)
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="range" min="0" max="30" value={scenario.supplierDelay} onChange={e => setScenario({...scenario, supplierDelay: parseInt(e.target.value)})} style={{ flex: 1 }} />
                  <span style={{ fontWeight: 'bold', width: '40px', textAlign: 'right' }}>+{scenario.supplierDelay}</span>
                </div>
              </label>
            </div>
          </section>

          <section className="panel" style={{ gridColumn: 'span 1' }}>
            <div className="panel-head">
              <div><h3>Scenario Templates</h3><p>Pre-configured business models</p></div>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <button className="secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px' }} onClick={() => setScenario({name: "Festival Demand Spike", duration: 30, demandIncrease: 25, supplierDelay: 0})}>
                 <TrendingUp size={16}/> Festival Demand Spike (+25%)
               </button>
               <button className="secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px' }} onClick={() => setScenario({name: "Global Supply Chain Delay", duration: 90, demandIncrease: 0, supplierDelay: 14})}>
                 <Clock size={16}/> Global Supply Chain Delay (+14d)
               </button>
               <button className="secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px' }} onClick={() => setScenario({name: "Winter Outbreak", duration: 60, demandIncrease: 40, supplierDelay: 3})}>
                 <ThermometerSnowflake size={16}/> Winter Outbreak (+40%)
               </button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'RESULTS' && results && (
        <div className="dashboard-grid">
           <section className="panel" style={{ gridColumn: 'span 3', padding: '24px', display: 'flex', gap: '24px' }}>
              <div className="stat-card" style={{ flex: 1, background: 'rgba(244, 63, 94, 0.05)', border: '1px solid var(--rose)' }}>
                 <div className="stat-value" style={{ color: 'var(--rose)' }}>{results.stockouts.length}</div>
                 <div className="stat-label">Projected Stockout Events</div>
                 <div className="stat-detail">Within {results.daysSimulated} days</div>
              </div>
              <div className="stat-card" style={{ flex: 1, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid var(--amber)' }}>
                 <div className="stat-value" style={{ color: 'var(--amber)' }}>${results.financialImpact.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                 <div className="stat-label">Projected Expiry Loss</div>
                 <div className="stat-detail">Inventory aging past use date</div>
              </div>
              <div className="stat-card" style={{ flex: 1, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--green)' }}>
                 <div className="stat-value" style={{ color: 'var(--green)' }}>{results.daysSimulated} Days</div>
                 <div className="stat-label">Simulation Horizon</div>
                 <div className="stat-detail">Scenario: {scenario.name}</div>
              </div>
           </section>

           <section className="panel" style={{ gridColumn: 'span 3' }}>
             <div className="panel-head">
               <div><h3>Vulnerable Inventory (Projected Stockouts)</h3><p>Medicines expected to reach zero inventory before day {results.daysSimulated}</p></div>
             </div>
             <div className="table-wrapper">
               <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                 <thead>
                   <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                     <th style={{ padding: '12px' }}>Medicine ID</th>
                     <th style={{ padding: '12px' }}>Projected Zero Day</th>
                     <th style={{ padding: '12px' }}>Unmet Demand Risk</th>
                   </tr>
                 </thead>
                 <tbody>
                   {results.stockouts.length === 0 ? (
                     <tr><td colSpan="3" style={{ padding: '24px', textAlign: 'center' }}>No stockouts projected in this scenario.</td></tr>
                   ) : results.stockouts.map(st => (
                     <tr key={st.medicineId} style={{ borderBottom: '1px solid var(--line)' }}>
                       <td style={{ padding: '12px', fontWeight: 600 }}>{st.medicineId}</td>
                       <td style={{ padding: '12px' }}>Day {st.day} ({(new Date(Date.now() + st.day * 86400000)).toLocaleDateString()})</td>
                       <td style={{ padding: '12px', color: 'var(--rose)' }}>{st.unmetDemand} units short</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </section>
        </div>
      )}

      {activeTab === 'SNAPSHOT' && snapshot && (
        <div className="panel" style={{ padding: '24px' }}>
           <h3>Immutable Digital Twin Snapshot</h3>
           <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>
              Simulation was executed against a read-only copy of production data created at: <br/>
              <strong style={{ color: 'var(--text)' }}>{new Date(snapshot.timestamp).toLocaleString()}</strong>
           </p>
           
           <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                 <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Medicines Cloned</div>
                 <div style={{ fontSize: '24px', fontWeight: 700 }}>{snapshot.medicines.length}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                 <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Batches Cloned</div>
                 <div style={{ fontSize: '24px', fontWeight: 700 }}>{snapshot.batches.length}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                 <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Suppliers Cloned</div>
                 <div style={{ fontSize: '24px', fontWeight: 700 }}>{snapshot.suppliers.length}</div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'APPROVAL' && (
        <div className="panel" style={{ padding: '24px' }}>
           <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue)', padding: '12px', borderRadius: '50%' }}>
                 <FileText size={24} />
              </div>
              <div>
                 <h3 style={{ margin: 0, marginBottom: '8px' }}>Scenario Action Bridge</h3>
                 <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
                    Convert this simulation into a draft operational plan. The draft will be routed through the Action Gateway for executive approval before any purchases or transfers are executed in production.
                 </p>
              </div>
           </div>

           <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <strong style={{ display: 'block', marginBottom: '12px', fontSize: '13px' }}>Proposed Production Changes:</strong>
              <ul style={{ fontSize: '13px', color: 'var(--text)', margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <li>Draft Purchase Order: 1,200 units of Paracetamol (Supplier: MedCore Labs) to mitigate Day 14 stockout.</li>
                 <li>Draft Stock Transfer: 500 units of Azithromycin (Central to Branch A) to mitigate local demand spike.</li>
              </ul>
           </div>

           <button className="primary" onClick={() => setToast("Draft plan generated and sent for executive approval. (Simulated)")} disabled={!results}>
              <CheckCircle size={16}/> Request Approval for Draft Plan
           </button>
        </div>
      )}

      {activeTab !== 'BUILDER' && !results && !running && (
         <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <Layers size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No Simulation Results</h3>
            <p style={{ fontSize: '14px' }}>Configure scenario variables and run the simulation to view results.</p>
         </div>
      )}

    </div>
  );
}
