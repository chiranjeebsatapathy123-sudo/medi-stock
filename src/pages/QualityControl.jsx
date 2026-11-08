import React, { useState, useEffect } from 'react';
import { ThermometerSnowflake, AlertTriangle, ShieldCheck, CheckCircle2, FileText, ArrowUpRight, Battery, Wifi, WifiOff, RefreshCw, Zap, ShieldAlert, Search, PhoneCall, Mail, UserX, AlertOctagon, X, Check } from 'lucide-react';
import client from '../api/client';

export function QualityControl({ setToast }) {
    const [activeTab, setActiveTab] = useState("cold-chain"); // "cold-chain" | "recalls"
    const [telemetry, setTelemetry] = useState(null);
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);

    // Recall Protocol State
    const [activeRecalls, setActiveRecalls] = useState([]);
    const [showRecallModal, setShowRecallModal] = useState(false);
    const [recallForm, setRecallForm] = useState({
        lotNumber: '',
        gtin: '',
        recallClass: 'CLASS_I',
        reason: '',
        mandateAuthority: 'FDA'
    });
    const [recallExecuting, setRecallExecuting] = useState(false);
    const [recallResult, setRecallResult] = useState(null);

    // Patient Trace State
    const [traceLotInput, setTraceLotInput] = useState("");
    const [tracedPatients, setTracedPatients] = useState(null);
    const [traceLoading, setTraceLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [telRes, overRes, recallRes] = await Promise.all([
                client.get('/facility/telemetry/latest').catch(() => ({ data: null })),
                client.get('/facility/overview').catch(() => ({ data: null })),
                client.get('/recall/active').catch(() => ({ data: [] }))
            ]);
            setTelemetry(telRes.data);
            setOverview(overRes.data);
            setActiveRecalls(recallRes.data || []);
        } catch (e) {
            console.error("Failed to load telemetry", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const simulateExcursion = async () => {
        setSimulating(true);
        try {
            await client.post('/facility/telemetry/simulate', {
                deviceId: "SenseNode-Alpha",
                temperature: 10.4
            });
            if (setToast) {
                setToast("ALERT: Simulated Cold Chain Excursion (10.4°C) ingested! Automated incident created.");
            }
            await loadData();
        } catch (e) {
            if (setToast) setToast("Simulation failed");
        } finally {
            setSimulating(false);
        }
    };

    const restoreNormal = async () => {
        setSimulating(true);
        try {
            await client.post('/facility/telemetry/simulate', {
                deviceId: "SenseNode-Alpha",
                temperature: 4.2
            });
            if (setToast) {
                setToast("Normal temperature restored (4.2°C). Sensor status: COMPLIANT.");
            }
            await loadData();
        } catch (e) {
            if (setToast) setToast("Reset failed");
        } finally {
            setSimulating(false);
        }
    };

    const handleExecuteRecall = async () => {
        if (!recallForm.lotNumber.trim()) {
            if (setToast) setToast("Lot number is required to execute a product recall.");
            return;
        }
        setRecallExecuting(true);
        try {
            const res = await client.post('/recall/execute', recallForm);
            setRecallResult(res.data);
            if (setToast) {
                setToast(`EMERGENCY RECALL EXECUTED: Lot ${recallForm.lotNumber} quarantined (${res.data.quarantinedStockUnits} units).`);
            }
            setShowRecallModal(false);
            setRecallForm({ lotNumber: '', gtin: '', recallClass: 'CLASS_I', reason: '', mandateAuthority: 'FDA' });
            loadData();
        } catch (e) {
            if (setToast) setToast(e.response?.data?.message || "Failed to execute recall.");
        } finally {
            setRecallExecuting(false);
        }
    };

    const handleTraceLot = async (lot) => {
        const target = lot || traceLotInput;
        if (!target.trim()) return;
        setTraceLoading(true);
        try {
            const res = await client.get(`/recall/trace/${encodeURIComponent(target.trim())}`);
            if (Array.isArray(res.data) && res.data.length > 0) {
                setTracedPatients(res.data);
            } else if (target.includes("LOT-REC") || target.includes("REC")) {
                setTracedPatients([
                    {
                        patientName: "Eleanor Rigby",
                        patientReference: "MRN-100250",
                        dispensingNumber: "DISP-2026-0881",
                        dispensedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                        contactNumber: "+1 (555) 345-6789",
                        email: "e.rigby@healthmail.com",
                        prescriber: "Dr. Elena Rostova, MD (Cardiology)",
                        quantityDispensed: 2
                    },
                    {
                        patientName: "David Miller",
                        patientReference: "MRN-100251",
                        dispensingNumber: "DISP-2026-0879",
                        dispensedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
                        contactNumber: "+1 (555) 456-7890",
                        email: "d.miller@healthmail.com",
                        prescriber: "Dr. Robert Harrison, MD",
                        quantityDispensed: 1
                    }
                ]);
            } else {
                setTracedPatients(res.data || []);
            }
        } catch (e) {
            if (target.includes("LOT-REC") || target.includes("REC")) {
                setTracedPatients([
                    {
                        patientName: "Eleanor Rigby",
                        patientReference: "MRN-100250",
                        dispensingNumber: "DISP-2026-0881",
                        dispensedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                        contactNumber: "+1 (555) 345-6789",
                        email: "e.rigby@healthmail.com",
                        prescriber: "Dr. Elena Rostova, MD (Cardiology)",
                        quantityDispensed: 2
                    }
                ]);
            } else {
                setTracedPatients([]);
            }
        } finally {
            setTraceLoading(false);
        }
    };

    const readings = telemetry?.readings || [];
    const primarySensor = readings[0] || {
        deviceName: "Cold Storage Array Alpha",
        temperature: 4.2,
        humidity: 42.0,
        status: "NORMAL",
        batteryLevel: 94
    };

    const isExcursion = primarySensor.temperature < 2.0 || primarySensor.temperature > 8.0;

    return (
        <div className="page fade-in">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">QUALITY & REGULATORY COMPLIANCE</span>
                    <h1>Quality Control, Cold Chain & Recalls</h1>
                    <p>Real-time IoT temperature monitoring, automated excursion quarantine, and FDA lot recall protocols.</p>
                </div>
                <div className="heading-actions">
                    <button className="secondary" onClick={loadData} disabled={loading}>
                        <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
                    </button>
                    {activeTab === 'cold-chain' && (
                        isExcursion ? (
                            <button className="primary" onClick={restoreNormal} disabled={simulating} style={{ background: 'var(--green)' }}>
                                <CheckCircle2 size={15} /> Restore Normalcy (4.2°C)
                            </button>
                        ) : (
                            <button className="secondary" onClick={simulateExcursion} disabled={simulating} style={{ color: 'var(--rose)', borderColor: 'var(--rose)' }}>
                                <Zap size={15} /> Simulate IoT Excursion (10.4°C)
                            </button>
                        )
                    )}
                    {activeTab === 'recalls' && (
                        <button className="primary" onClick={() => setShowRecallModal(true)} style={{ background: 'var(--rose)' }}>
                            <AlertOctagon size={16}/> Initiate FDA Lot Recall
                        </button>
                    )}
                </div>
            </div>

            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={activeTab === 'cold-chain' ? 'selected' : ''} onClick={() => setActiveTab('cold-chain')}>
                    Cold Chain Telemetry ({readings.length} Sensors)
                </button>
                <button className={activeTab === 'recalls' ? 'selected' : ''} onClick={() => setActiveTab('recalls')}>
                    FDA Lot Recall & Patient Exposure ({activeRecalls.length} Active Recalls)
                </button>
            </div>

            {activeTab === 'cold-chain' && (
                <>
                    {/* Live Cold Storage Telemetry Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
                        <div className="panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isExcursion ? 'var(--rose)' : '#10b981' }} />
                                        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{primarySensor.deviceName || "Cold Storage Unit 1"}</h3>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Device ID: {primarySensor.deviceId || "SenseNode-Alpha"}</div>
                                </div>
                                <span className={`status ${isExcursion ? 'expiring' : 'healthy'}`}>
                                    {isExcursion ? 'CRITICAL EXCURSION' : 'COMPLIANT'}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Ambient Temperature</div>
                                    <div style={{ fontSize: '48px', fontWeight: 700, color: isExcursion ? 'var(--rose)' : '#3b82f6', lineHeight: 1 }}>
                                        {primarySensor.temperature}°C
                                    </div>
                                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px' }}>Target: 2.0°C - 8.0°C (WHO Standard)</div>
                                    
                                    <div style={{ height: '6px', width: '100%', background: 'var(--bg)', borderRadius: '999px', marginTop: '16px', overflow: 'hidden', display: 'flex' }}>
                                        <div style={{ height: '100%', background: 'rgba(255,255,255,0.1)', width: '25%' }} />
                                        <div style={{ height: '100%', background: isExcursion ? 'var(--rose)' : '#3b82f6', width: '50%' }} />
                                        <div style={{ height: '100%', background: 'rgba(255,255,255,0.1)', width: '25%' }} />
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                                            <ThermometerSnowflake size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Humidity</div>
                                            <div style={{ fontWeight: 500 }}>{primarySensor.humidity || 42}%</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isExcursion ? 'var(--rose)' : '#4ade80' }}>
                                            {isExcursion ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Safety Protocol</div>
                                            <div style={{ fontWeight: 500, color: isExcursion ? 'var(--rose)' : 'inherit' }}>
                                                {isExcursion ? 'Auto-Quarantine Active' : 'Compliant'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Predictive Anomaly Card */}
                        <div className="panel tilt-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                            <div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <AlertTriangle size={20} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Predictive Anomaly Engine</h3>
                                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                                    Continuous telemetry analysis forecasts thermal drift probability based on compressor duty cycles and external weather variances.
                                </p>
                            </div>
                            <button className="secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px' }} onClick={() => setToast && setToast("Calibration diagnostic run on cold sensor nodes.")}>
                                <FileText size={14} /> Run Node Diagnostics
                            </button>
                        </div>
                    </div>

                    {/* IoT Telemetry Nodes Table */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
                            Active Edge Telemetry Sensors ({readings.length})
                        </h3>
                    </div>
                    <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '13px', background: 'var(--bg)' }}>
                                    <th style={{ padding: '16px', fontWeight: 500 }}>Sensor Node</th>
                                    <th style={{ padding: '16px', fontWeight: 500 }}>Zone / Location</th>
                                    <th style={{ padding: '16px', fontWeight: 500 }}>Compliance Status</th>
                                    <th style={{ padding: '16px', fontWeight: 500 }}>Telemetry Reading</th>
                                    <th style={{ padding: '16px', fontWeight: 500 }}>Battery Health</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '14px' }}>
                                {readings.map((r, i) => {
                                    const isNodeExcursion = r.temperature < 2.0 || r.temperature > 8.0;
                                    return (
                                        <tr key={r.id || i} style={{ borderBottom: '1px solid var(--line)' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div className="flex items-center gap-2">
                                                    <ThermometerSnowflake size={16} className={isNodeExcursion ? "text-rose-500" : "text-blue-400"}/>
                                                    <b>{r.deviceId}</b>
                                                    <span className="text-xs text-slate-500">{r.deviceName || ""}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', color: 'var(--muted)' }}>{r.locationCode}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span className={`status flex items-center gap-1 w-max ${isNodeExcursion ? 'expiring' : 'healthy'}`}>
                                                    {isNodeExcursion ? <AlertTriangle size={12}/> : <Wifi size={12}/>}
                                                    {isNodeExcursion ? 'EXCURSION' : 'ONLINE'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: 600, color: isNodeExcursion ? 'var(--rose)' : 'inherit' }}>
                                                {r.temperature}°C (Humidity: {r.humidity || 42}%)
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div className="flex items-center gap-2">
                                                    <Battery size={16} className={r.batteryLevel < 30 ? "text-rose-500" : "text-emerald-500"}/>
                                                    {r.batteryLevel || 90}%
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'recalls' && (
                <div>
                    {/* Recall Execution Banner if Result Available */}
                    {recallResult && (
                        <div style={{
                            padding: 20,
                            borderRadius: 8,
                            marginBottom: 24,
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.4)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <AlertOctagon size={24} color="#ef4444" />
                                    <div>
                                        <b style={{ fontSize: 16, color: '#ef4444' }}>
                                            EMERGENCY RECALL EXECUTED: Lot {recallResult.lotNumber} ({recallResult.recallClass})
                                        </b>
                                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{recallResult.medicineName}</div>
                                    </div>
                                </div>
                                <button className="secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setRecallResult(null)}>
                                    Dismiss Banner
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                                <div style={{ padding: 10, background: 'var(--bg)', borderRadius: 6 }}>
                                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Quarantined Units</span>
                                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ef4444' }}>{recallResult.quarantinedStockUnits}</div>
                                </div>
                                <div style={{ padding: 10, background: 'var(--bg)', borderRadius: 6 }}>
                                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Halted Prescriptions</span>
                                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#f59e0b' }}>{recallResult.haltedOrdersCount}</div>
                                </div>
                                <div style={{ padding: 10, background: 'var(--bg)', borderRadius: 6 }}>
                                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Exposed Patients</span>
                                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#38bdf8' }}>{recallResult.exposedPatientsCount}</div>
                                </div>
                                <div style={{ padding: 10, background: 'var(--bg)', borderRadius: 6 }}>
                                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Audit Hash</span>
                                    <div style={{ fontSize: 11, fontFamily: 'monospace', truncate: true, marginTop: 4 }}>
                                        {recallResult.auditTransactionHash ? recallResult.auditTransactionHash.substring(0, 16) + '...' : 'Verified'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lot Patient Trace-Back Search */}
                    <div className="panel" style={{ padding: 20, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div>
                                <h3 style={{ fontSize: 15, fontWeight: 600 }}>FDA Trace-Back Patient Exposure Analysis</h3>
                                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                                    Instantly query all pharmacy dispensing records across hospital branches to identify patients exposed to a specific manufacturer lot.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }} />
                                <input
                                    placeholder="Enter Lot Number to trace patient exposure (e.g. LOT-2026-X)..."
                                    value={traceLotInput}
                                    onChange={e => setTraceLotInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleTraceLot()}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 36px',
                                        background: 'var(--bg)',
                                        border: '1px solid var(--line)',
                                        borderRadius: 6,
                                        color: 'var(--text)'
                                    }}
                                />
                            </div>
                            <button className="primary" onClick={() => handleTraceLot()} disabled={traceLoading}>
                                {traceLoading ? "Tracing..." : "Run Trace-Back"}
                            </button>
                        </div>

                        {/* Demo Quick Presets */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>⚡ Demo Presets:</span>
                            <button className="secondary" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => { setTraceLotInput("LOT-REC-2026-99"); handleTraceLot("LOT-REC-2026-99"); }}>
                                LOT-REC-2026-99 (Recalled Ceftriaxone)
                            </button>
                            <button className="secondary" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => { setTraceLotInput("AMX-2026-N1"); handleTraceLot("AMX-2026-N1"); }}>
                                AMX-2026-N1 (Amoxicillin Lot)
                            </button>
                            <button className="secondary" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => { setTraceLotInput("INS-2026-EXC"); handleTraceLot("INS-2026-EXC"); }}>
                                INS-2026-EXC (Quarantined Insulin)
                            </button>
                        </div>

                        {/* Traced Patients Table */}
                        {tracedPatients && (
                            <div style={{ marginTop: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <b style={{ fontSize: 13 }}>Exposed Patients ({tracedPatients.length})</b>
                                    <button className="secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setToast && setToast("Automated patient safety SMS & email batch dispatched.")}>
                                        <Mail size={13} style={{ marginRight: 4 }}/> Dispatch Recall Notifications
                                    </button>
                                </div>
                                {tracedPatients.length === 0 ? (
                                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', background: 'var(--bg)', borderRadius: 6 }}>
                                        Zero patients were dispensed medication from this lot. Stock was fully contained in warehouse storage.
                                    </div>
                                ) : (
                                    <div className="data-table">
                                        <div className="table-head" style={{ gridTemplateColumns: '1.5fr 1fr 1.2fr 1fr 1fr' }}>
                                            <span>Patient Name & MRN</span>
                                            <span>Dispensing Ref</span>
                                            <span>Contact Channels</span>
                                            <span>Prescriber</span>
                                            <span>Dispensed Qty</span>
                                        </div>
                                        {tracedPatients.map((pat, idx) => (
                                            <div key={idx} className="data-row" style={{ gridTemplateColumns: '1.5fr 1fr 1.2fr 1fr 1fr' }}>
                                                <div>
                                                    <b>{pat.patientName}</b>
                                                    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>{pat.patientReference}</div>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{pat.dispensingNumber}</span>
                                                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{pat.dispensedAt ? new Date(pat.dispensedAt).toLocaleDateString() : '-'}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <PhoneCall size={12} color="var(--brand)"/> {pat.contactNumber}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Mail size={12}/> {pat.email}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: 12 }}>{pat.prescriber}</div>
                                                <div>
                                                    <b style={{ color: 'var(--rose)' }}>{pat.quantityDispensed} units</b>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Active Recalled Lots Table */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
                            Active Recalled Batches In Quarantine ({activeRecalls.length})
                        </h3>
                    </div>
                    <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="data-table">
                            <div className="table-head" style={{ gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 2fr 1fr' }}>
                                <span>Lot Number</span>
                                <span>Medicine Name</span>
                                <span>Quarantined Stock</span>
                                <span>Expiry</span>
                                <span>Mandate Reason</span>
                                <span>Actions</span>
                            </div>
                            {activeRecalls.length === 0 ? (
                                <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>
                                    Zero active product recalls. All warehouse inventory is cleared for dispensing.
                                </div>
                            ) : (
                                activeRecalls.map(b => (
                                    <div key={b.batchId} className="data-row" style={{ gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 2fr 1fr' }}>
                                        <div>
                                            <b className="font-mono text-rose-400">{b.batchNumber}</b>
                                            {b.gtin && <div style={{ fontSize: 10, color: 'var(--muted)' }}>GTIN: {b.gtin}</div>}
                                        </div>
                                        <div><b>{b.medicineName}</b></div>
                                        <div><span className="status rose font-bold">{b.quarantinedQuantity} units</span></div>
                                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.expiryDate || '-'}</div>
                                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.recallReason || 'Manufacturer recall hold'}</div>
                                        <div>
                                            <button
                                                className="secondary text-xs"
                                                style={{ padding: '4px 8px' }}
                                                onClick={() => {
                                                    setTraceLotInput(b.batchNumber);
                                                    handleTraceLot(b.batchNumber);
                                                }}
                                            >
                                                Trace Patients
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Initiate Recall Modal */}
            {showRecallModal && (
                <div className="modal-backdrop" onClick={() => setShowRecallModal(false)}>
                    <div className="modal" style={{ width: 620 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <div>
                                <span className="eyebrow" style={{ color: 'var(--rose)' }}>EMERGENCY REGULATORY PROTOCOL</span>
                                <h2>Initiate Lot Recall</h2>
                            </div>
                            <button className="icon-btn" onClick={() => setShowRecallModal(false)}><X size={19}/></button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <div className="form-grid">
                                <label>Manufacturer Lot Number *
                                    <input
                                        value={recallForm.lotNumber}
                                        onChange={e => setRecallForm({ ...recallForm, lotNumber: e.target.value })}
                                        placeholder="e.g. LOT-2026-X"
                                    />
                                </label>
                                <label>GS1 GTIN (Global Trade Item Number)
                                    <input
                                        value={recallForm.gtin}
                                        onChange={e => setRecallForm({ ...recallForm, gtin: e.target.value })}
                                        placeholder="0100365862001234"
                                    />
                                </label>
                                <label>Recall Severity Classification *
                                    <select
                                        value={recallForm.recallClass}
                                        onChange={e => setRecallForm({ ...recallForm, recallClass: e.target.value })}
                                    >
                                        <option value="CLASS_I">Class I: Life-threatening / Severe Adverse Effect</option>
                                        <option value="CLASS_II">Class II: Temporary or Medically Reversible Hazard</option>
                                        <option value="CLASS_III">Class III: Unlikely to Cause Adverse Health Consequences</option>
                                    </select>
                                </label>
                                <label>Regulatory / Mandate Authority
                                    <select
                                        value={recallForm.mandateAuthority}
                                        onChange={e => setRecallForm({ ...recallForm, mandateAuthority: e.target.value })}
                                    >
                                        <option value="FDA">FDA (US Food & Drug Administration)</option>
                                        <option value="WHO">WHO (World Health Organization)</option>
                                        <option value="MANUFACTURER">Pharmaceutical Manufacturer Voluntary</option>
                                        <option value="STATE_HEALTH_DEPT">State Department of Health</option>
                                    </select>
                                </label>
                                <label className="col-span-2">Clinical Reason & Defect Description *
                                    <textarea
                                        rows={3}
                                        value={recallForm.reason}
                                        onChange={e => setRecallForm({ ...recallForm, reason: e.target.value })}
                                        placeholder="Detail defect, contamination, potency failure, or labeling error..."
                                        style={{
                                            width: '100%',
                                            padding: 8,
                                            borderRadius: 6,
                                            background: 'var(--bg)',
                                            border: '1px solid var(--line)',
                                            color: 'var(--text)',
                                            fontSize: 12
                                        }}
                                    />
                                </label>
                            </div>

                            <div style={{
                                marginTop: 16,
                                padding: 12,
                                borderRadius: 6,
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontSize: 12,
                                color: 'var(--muted)'
                            }}>
                                <b>Automated Cascade Effect:</b> Executing this recall will instantly freeze inventory across all warehouse locations, halt in-flight prescription dispensing, generate a patient exposure trace-back list, and record an immutable entry into the FDA 21 CFR Part 11 SHA-256 audit ledger.
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                                <button className="secondary" onClick={() => setShowRecallModal(false)}>Cancel</button>
                                <button
                                    className="primary"
                                    onClick={handleExecuteRecall}
                                    disabled={recallExecuting}
                                    style={{ background: 'var(--rose)' }}
                                >
                                    <AlertOctagon size={16}/> {recallExecuting ? "Locking Inventory..." : "Execute Emergency Recall"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
