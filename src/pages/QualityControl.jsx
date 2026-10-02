import React, { useState } from 'react';
import { ThermometerSnowflake, AlertTriangle, ShieldCheck, CheckCircle2, FileText, ArrowUpRight, Battery, Wifi, WifiOff } from 'lucide-react';

export function QualityControl({ setToast }) {
    return (
        <div className="page fade-in">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">PREDICTIVE SENSOR NETWORK</span>
                    <h1>Quality Control & Cold Chain</h1>
                    <p>Real-time IoT temperature monitoring and batch anomaly detection.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
                {/* Real-time Status Card */}
                <div className="panel tilt-card" style={{ position: 'relative', overflow: 'hidden', perspective: '1200px' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '256px', height: '256px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', filter: 'blur(64px)', transform: 'translate(50%, -50%)' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ThermometerSnowflake color="#60a5fa" />
                                Cold Storage Array Alpha
                            </h2>
                            <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>IoT sensor streaming live from Shelf C</p>
                        </div>
                        <span style={{ padding: '4px 12px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', fontSize: '12px', fontWeight: 500, borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} /> Live
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', position: 'relative', zIndex: 10 }}>
                        <div>
                            <div style={{ fontSize: '48px', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '8px' }}>4.2<span style={{ fontSize: '24px', color: 'var(--muted)' }}>°C</span></div>
                            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Target: 2.0°C - 8.0°C</div>
                            
                            <div style={{ height: '6px', width: '100%', background: 'var(--bg)', borderRadius: '999px', marginTop: '16px', overflow: 'hidden', display: 'flex' }}>
                                <div style={{ height: '100%', background: 'rgba(255,255,255,0.1)', width: '25%' }} />
                                <div style={{ height: '100%', background: '#3b82f6', width: '50%' }} />
                                <div style={{ height: '100%', background: 'rgba(255,255,255,0.1)', width: '25%' }} />
                            </div>
                            <div style={{ width: '4px', height: '12px', background: '#fff', margin: '0 auto', marginTop: '-9px', boxShadow: '0 0 8px rgba(255,255,255,0.8)', position: 'relative', left: '-10%' }} />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                                    <ThermometerSnowflake size={16} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Humidity</div>
                                    <div style={{ fontWeight: 500 }}>42%</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}>
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Last Defrost Cycle</div>
                                    <div style={{ fontWeight: 500 }}>4 hours ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Predictive Alert */}
                <div className="panel tilt-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', perspective: '800px' }}>
                    <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '128px', height: '128px', background: 'rgba(245, 158, 11, 0.1)', filter: 'blur(32px)', transform: 'rotateX(60deg)' }} />
                    <div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <AlertTriangle size={20} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Predictive Maintenance</h3>
                        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                            AI anomaly detection suggests a 78% probability of compressor failure in <b style={{ color: 'var(--text-main)' }}>Cold Storage Array Beta</b> within 14 days due to irregular cooling cycles.
                        </p>
                    </div>
                    <button className="secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px' }} onClick={() => setToast("Service request generated and sent to facility management.")}>
                        <FileText size={14} /> Generate Service Request
                    </button>
                </div>
            </div>

            {/* IoT Devices Table */}
            <div className="flex items-center justify-between mt-10 mb-4">
                <h3 style={{ fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>IoT Devices</h3>
                <button className="secondary px-3 py-1.5 text-xs" onClick={() => setToast("Scanning for new devices...")}>Discover Devices</button>
            </div>
            <div className="panel" style={{ padding: 0, overflow: 'hidden', marginBottom: '40px' }}>
                <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '13px' }}>
                            <th style={{ padding: '16px', fontWeight: 500 }}>Device</th>
                            <th style={{ padding: '16px', fontWeight: 500 }}>Location</th>
                            <th style={{ padding: '16px', fontWeight: 500 }}>Status</th>
                            <th style={{ padding: '16px', fontWeight: 500 }}>Last Reading</th>
                            <th style={{ padding: '16px', fontWeight: 500 }}>Battery</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '14px' }}>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '16px' }}><div className="flex items-center gap-2"><ThermometerSnowflake size={16} className="text-blue-400"/> <b>SenseNode-A1</b><span className="text-xs text-slate-500">v2.1.4</span></div></td>
                            <td style={{ padding: '16px', color: 'var(--muted)' }}>Cold Storage A</td>
                            <td style={{ padding: '16px' }}><span className="status healthy flex items-center gap-1 w-max"><Wifi size={12}/> ONLINE</span></td>
                            <td style={{ padding: '16px' }}>4.2°C (2 mins ago)</td>
                            <td style={{ padding: '16px' }}><div className="flex items-center gap-2"><Battery size={16} className="text-emerald-500"/> 92%</div></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '16px' }}><div className="flex items-center gap-2"><ThermometerSnowflake size={16} className="text-blue-400"/> <b>SenseNode-B2</b><span className="text-xs text-slate-500">v2.1.4</span></div></td>
                            <td style={{ padding: '16px', color: 'var(--muted)' }}>Cold Storage B</td>
                            <td style={{ padding: '16px' }}><span className="status expiring flex items-center gap-1 w-max"><AlertTriangle size={12}/> WARNING</span></td>
                            <td style={{ padding: '16px' }}>8.5°C (10 mins ago)</td>
                            <td style={{ padding: '16px' }}><div className="flex items-center gap-2"><Battery size={16} className="text-emerald-500"/> 64%</div></td>
                        </tr>
                        <tr>
                            <td style={{ padding: '16px' }}><div className="flex items-center gap-2"><ThermometerSnowflake size={16} className="text-slate-500"/> <b>SenseNode-C1</b><span className="text-xs text-slate-500">v1.8.2</span></div></td>
                            <td style={{ padding: '16px', color: 'var(--muted)' }}>Transit Cooler 1</td>
                            <td style={{ padding: '16px' }}><span className="status flex items-center gap-1 w-max" style={{color: 'var(--muted)', background: 'var(--bg)'}}><WifiOff size={12}/> OFFLINE</span></td>
                            <td style={{ padding: '16px', color: 'var(--muted)' }}>Unknown (4 hrs ago)</td>
                            <td style={{ padding: '16px' }}><div className="flex items-center gap-2 text-rose-500"><Battery size={16} /> 5%</div></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Event Logs */}
            <h3 style={{ fontWeight: 500, marginTop: '40px', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>Recent Quality Events</h3>
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '13px' }}>
                            <th style={{ padding: '16px', fontWeight: 500 }}>Timestamp</th>
                            <th style={{ padding: '16px', fontWeight: 500 }}>Event Type</th>
                            <th style={{ padding: '16px', fontWeight: 500 }}>Location</th>
                            <th style={{ padding: '16px', fontWeight: 500 }}>Details</th>
                            <th style={{ padding: '16px', fontWeight: 500 }}>Status</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '14px' }}>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '16px', color: 'var(--muted)' }}>Today, 10:42 AM</td>
                            <td style={{ padding: '16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowUpRight size={14} color="#f59e0b"/> Temp Spike</div></td>
                            <td style={{ padding: '16px' }}>Cold Storage B</td>
                            <td style={{ padding: '16px' }}>Temperature rose to 8.5°C for 2 minutes.</td>
                            <td style={{ padding: '16px' }}><span className="status expiring">Resolved</span></td>
                        </tr>
                        <tr>
                            <td style={{ padding: '16px', color: 'var(--muted)' }}>Yesterday, 04:15 PM</td>
                            <td style={{ padding: '16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={14} color="#10b981"/> Audit Passed</div></td>
                            <td style={{ padding: '16px' }}>Aisle A</td>
                            <td style={{ padding: '16px' }}>Monthly visual inspection completed.</td>
                            <td style={{ padding: '16px' }}><span className="status healthy">Verified</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
