import React, { useState, useRef } from 'react';

export function Medicine3DBox({ genericName, brandName, strength, category }) {
  const [rotation, setRotation] = useState({ x: -15, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    setRotation(prev => ({
      x: prev.x - dy * 0.5,
      y: prev.y + dx * 0.5
    }));
    
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const faceStyle = {
    position: 'absolute',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(27,180,162,0.9), rgba(9,9,11,0.9))',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
    color: '#fff',
    backfaceVisibility: 'visible',
    padding: '10px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div 
      style={{
        width: '100%',
        height: '250px',
        perspective: '800px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '12px',
        border: '1px solid var(--line)',
        overflow: 'hidden'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={{
        position: 'relative',
        width: '100px',
        height: '160px',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease',
      }}>
        {/* Front */}
        <div style={{ ...faceStyle, width: '100px', height: '160px', transform: 'translateZ(30px)' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>{brandName}</h4>
          <p style={{ margin: '5px 0', fontSize: '10px', opacity: 0.8 }}>{genericName}</p>
          <div style={{ background: '#fff', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>{strength}</div>
        </div>
        {/* Back */}
        <div style={{ ...faceStyle, width: '100px', height: '160px', transform: 'rotateY(180deg) translateZ(30px)' }}>
          <p style={{ fontSize: '10px', opacity: 0.8 }}>Rx Only</p>
          <div style={{ width: '60px', height: '20px', background: '#fff', marginTop: '10px' }}>
             {/* Fake Barcode */}
             <div style={{width:'100%', height:'100%', background:'repeating-linear-gradient(to right, #000, #000 2px, #fff 2px, #fff 4px)'}}></div>
          </div>
        </div>
        {/* Right */}
        <div style={{ ...faceStyle, width: '60px', height: '160px', transform: 'rotateY(90deg) translateZ(50px)' }}>
           <p style={{ fontSize: '8px', transform: 'rotate(90deg)', whiteSpace: 'nowrap' }}>{category}</p>
        </div>
        {/* Left */}
        <div style={{ ...faceStyle, width: '60px', height: '160px', transform: 'rotateY(-90deg) translateZ(50px)' }}>
           <p style={{ fontSize: '8px', transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>MediStock Pro</p>
        </div>
        {/* Top */}
        <div style={{ ...faceStyle, width: '100px', height: '60px', transform: 'rotateX(90deg) translateZ(80px)', background: '#1bb4a2' }}>
        </div>
        {/* Bottom */}
        <div style={{ ...faceStyle, width: '100px', height: '60px', transform: 'rotateX(-90deg) translateZ(80px)' }}>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 10, color: 'var(--muted)', pointerEvents: 'none' }}>Drag to rotate</div>
    </div>
  );
}
