import React, { useState, useEffect, useRef } from 'react';
import { PackageSearch, ThermometerSnowflake, AlertTriangle, Layers } from 'lucide-react';

export function ShelfMap({ setToast }) {
    const [activeShelf, setActiveShelf] = useState(null);

    return (
        <div className="page fade-in">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">DIGITAL TWIN</span>
                    <h1>Interactive Warehouse</h1>
                    <p>Real-time 3D spatial mapping of your inventory.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                <div className="panel" style={{ flex: 1, perspective: '1200px', minHeight: '500px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(56, 189, 248, 0.05), transparent)', pointerEvents: 'none' }} />
                    
                    {/* 3D Warehouse Environment */}
                    <div className="transform-style-3d animate-slow-spin-3d" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="rotate-x-60 rotate-z-45" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px' }}>
                            <ShelfBlock id="A" label="Aisle A (General)" color="var(--brand)" delay="0s" active={activeShelf} setActive={setActiveShelf} />
                            <ShelfBlock id="B" label="Aisle B (Cardio)" color="var(--brand)" delay="0.2s" active={activeShelf} setActive={setActiveShelf} />
                            <ShelfBlock id="C" label="Cold Storage" color="#3b82f6" delay="0.4s" active={activeShelf} setActive={setActiveShelf} isCold />
                            <ShelfBlock id="D" label="Quarantine" color="#f43f5e" delay="0.6s" active={activeShelf} setActive={setActiveShelf} isAlert />
                        </div>
                    </div>
                </div>

                <div className="panel" style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                        <Layers size={18} color="var(--brand)"/> 
                        Location Details
                    </h3>
                    
                    {activeShelf ? (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Zone</div>
                            <div style={{ fontSize: '20px', fontWeight: 600 }}>{activeShelf.label}</div>
                            
                            <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '4px', marginTop: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Capacity</div>
                                <div style={{ fontSize: '18px' }}>82% <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Full</span></div>
                                <div style={{ width: '100%', background: 'var(--bg)', borderRadius: '999px', height: '6px', marginTop: '8px' }}>
                                    <div style={{ background: 'var(--brand)', height: '100%', borderRadius: '999px', width: '82%' }} />
                                </div>
                            </div>
                            
                            {activeShelf.isCold && (
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '4px', padding: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
                                        <ThermometerSnowflake size={16} />
                                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Temperature</span>
                                    </div>
                                    <span style={{ color: '#93c5fd', fontWeight: 700 }}>4.2°C</span>
                                </div>
                            )}

                            {activeShelf.isAlert && (
                                <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '4px', padding: '12px', marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <AlertTriangle size={16} color="#fb7185" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#fb7185' }}>Restricted Access</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(253, 164, 175, 0.7)', marginTop: '4px' }}>Contains 12 recalled batches pending destruction.</div>
                                    </div>
                                </div>
                            )}
                            
                            <button className="primary" style={{ width: '100%', marginTop: '16px', padding: '8px' }} onClick={() => setToast("Opening inventory list for " + activeShelf.label)}>View Inventory List</button>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '14px', textAlign: 'center' }}>
                            <PackageSearch size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <p>Select a shelf block in the 3D map to view its properties and inventory.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ShelfBlock({ id, label, color, delay, active, setActive, isCold, isAlert }) {
    const isActive = active?.id === id;
    
    return (
        <div 
            onClick={() => setActive({ id, label, isCold, isAlert })}
            className={`transform-style-3d ${isActive ? 'active-shelf' : 'hover-shelf'}`}
            style={{ 
                position: 'relative', width: '160px', height: '224px', cursor: 'pointer', 
                transition: 'all 0.5s ease', animation: `float3d 8s ease-in-out ${delay} infinite`,
                transform: isActive ? 'translateY(-24px) scale(1.1)' : 'none'
            }}
        >
            {/* Shelf Base/Shadow */}
            <div style={{ position: 'absolute', bottom: '-32px', left: '-16px', width: '192px', height: '192px', background: 'rgba(0,0,0,0.4)', filter: 'blur(24px)', transform: 'rotateX(60deg)', zIndex: -10 }} />
            
            {/* 3D Box Representation using CSS planes */}
            <div style={{ 
                position: 'absolute', inset: 0, border: `2px solid ${color}`, 
                background: isActive ? 'rgba(30, 41, 59, 0.8)' : 'rgba(15, 23, 42, 0.6)', 
                backdropFilter: 'blur(4px)', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column',
                boxShadow: isActive ? '0 0 30px rgba(56,189,248,0.3)' : 'none'
            }}>
                <div style={{ height: '8px', width: '100%', background: isCold ? '#3b82f6' : isAlert ? '#f43f5e' : color, opacity: 0.8 }} />
                
                <div className="translate-z-10" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 'bold', color: 'rgba(100, 116, 139, 0.5)' }}>{id}</span>
                    
                    {isCold && <ThermometerSnowflake size={24} color="#3b82f6" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }} />}
                    {isAlert && <AlertTriangle size={24} color="#f43f5e" style={{ filter: 'drop-shadow(0 0 8px rgba(244,63,94,0.5))' }} />}
                </div>
            </div>
        </div>
    );
}
