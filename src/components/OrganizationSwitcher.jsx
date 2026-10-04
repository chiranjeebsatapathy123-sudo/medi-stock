import React, { useState } from 'react';
import { ChevronDown, Building, MapPin, Settings, Server, Plus, X, Activity } from 'lucide-react';

export function OrganizationSwitcher() {
    const [open, setOpen] = useState(false);
    
    const [currentOrg] = useState({ name: "Hospital Central", id: "org-1" });
    const initialBranch = JSON.parse(localStorage.getItem('medistock_branch')) || { name: "Main Pharmacy", id: "br-1" };
    const [currentBranch, setCurrentBranch] = useState(initialBranch);
    
    const branches = [
        { name: "Main Pharmacy", id: "br-1", status: "Optimal", sync: "LIVE", latency: "12ms" }
    ];

    const [manageOpen, setManageOpen] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors"
                style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)' }}
            >
                <Building size={14} style={{ color: 'var(--brand)' }} />
                <div className="text-left leading-tight hidden sm:block">
                    <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>{currentOrg.name}</div>
                    <div style={{ color: 'var(--text)', fontWeight: 500 }}>{currentBranch.name}</div>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--muted)' }} />
            </button>
            
            {open && (
                <div className="absolute top-full left-0 mt-1 w-64 rounded shadow-xl z-50 py-2" style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
                    <div className="px-3 pb-2 mb-2" style={{ borderBottom: '1px solid var(--line)' }}>
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--muted)' }}>Switch Workspace</span>
                    </div>
                    {branches.map(b => (
                        <button 
                            key={b.id}
                            onClick={() => { 
                                setCurrentBranch(b); 
                                localStorage.setItem('medistock_branch', JSON.stringify(b));
                                setOpen(false); 
                                window.location.reload();
                            }}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors`}
                            style={{ color: currentBranch.id === b.id ? 'var(--brand)' : 'var(--text)', background: 'transparent' }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <MapPin size={14} /> {b.name}
                        </button>
                    ))}
                    <div className="mt-2 pt-2 px-3 pb-1" style={{ borderTop: '1px solid var(--line)' }}>
                        <button 
                            onClick={() => { setManageOpen(true); setOpen(false); }}
                            className="text-xs font-semibold w-full text-left py-2 flex items-center gap-2"
                            style={{ color: 'var(--brand)' }}
                        >
                            <Settings size={12}/> Manage Branches...
                        </button>
                    </div>
                </div>
            )}

            {/* Manage Branches Modal (No separate workspace, just a quick overlay) */}
            {manageOpen && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setManageOpen(false)}>
                    <div className="rounded-2xl w-[650px] shadow-2xl overflow-hidden flex flex-col" style={{ background: 'var(--bg)', border: '1px solid var(--line)' }} onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
                            <div>
                                <h2 className="text-lg font-bold m-0 flex items-center gap-2" style={{ color: 'var(--text)' }}><Server size={18} style={{ color: 'var(--brand)' }}/> Global Branch Network</h2>
                                <p className="text-xs m-0 mt-1" style={{ color: 'var(--muted)' }}>Manage interconnected pharmacy nodes in real-time.</p>
                            </div>
                            <button onClick={() => setManageOpen(false)} style={{ color: 'var(--muted)' }} className="p-2 rounded-lg transition-colors" onMouseOver={e=>e.currentTarget.style.background='var(--line)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
                            <div className="flex flex-col gap-3">
                                {branches.map(b => (
                                    <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: currentBranch.id === b.id ? 'var(--brand)' : 'var(--line)', background: currentBranch.id === b.id ? 'rgba(27,180,162,0.05)' : 'var(--surface)' }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: currentBranch.id === b.id ? 'rgba(27,180,162,0.1)' : 'var(--bg)', color: currentBranch.id === b.id ? 'var(--brand)' : 'var(--muted)' }}>
                                                <Building size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold m-0 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                                                    {b.name} 
                                                    {currentBranch.id === b.id && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--brand)', color: '#fff' }}>CURRENT</span>}
                                                </h4>
                                                <div className="text-xs mt-1 flex items-center gap-3" style={{ color: 'var(--muted)' }}>
                                                    <span className="flex items-center gap-1" style={{ color: b.status === 'Warning' ? 'var(--amber)' : 'var(--green)' }}><Activity size={12} /> {b.status}</span>
                                                    <span>•</span>
                                                    <span className="font-mono" style={{ color: 'var(--brand)' }}>{b.latency} ping</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors" style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--line)' }}>Configure</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors" style={{ color: 'var(--muted)' }} onMouseOver={e=>e.currentTarget.style.color='var(--text)'} onMouseOut={e=>e.currentTarget.style.color='var(--muted)'}>
                                <Plus size={16} /> Deploy New Node
                            </button>
                            <button onClick={() => setManageOpen(false)} className="px-6 py-2 rounded-lg text-sm font-bold transition-colors" style={{ background: 'var(--brand)', color: '#fff' }}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
