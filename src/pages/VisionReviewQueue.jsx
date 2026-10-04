import React, { useState } from 'react';
import { Camera, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { facilityService } from '../services/facilityService';
import client from '../api/client';

export function VisionReviewQueue({ setToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const data = await facilityService.getOverview();
      setEvents(data.visionEvents || []);
    } catch (e) {
      setToast('Failed to load vision events');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEvents();
  }, []);
  
  const handleReview = async (id, newStatus) => {
    try {
      await facilityService.resolveVisionEvent(id, { status: newStatus });
      setToast(`Detection ${newStatus.toLowerCase().replace('_', ' ')}.`);
      fetchEvents();
    } catch (e) {
      setToast("Failed to resolve event");
    }
  };
  
  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow" style={{ color: 'var(--brand)' }}>COMPUTER VISION</span>
          <h1>Vision Review Queue</h1>
          <p>Human-in-the-loop validation for Edge AI detections</p>
        </div>
        <div className="heading-actions">
           <button className="primary" onClick={async () => {
               setToast("Triggering edge camera simulation...");
               try {
                  await client.post('/facility/vision/trigger-simulation', { deviceId: '123e4567-e89b-12d3-a456-426614174000' });
                  fetchEvents();
                  setToast("New vision event detected.");
               } catch (e) {
                  setToast("Failed to simulate camera event.");
               }
           }}><Camera size={16}/> Simulate Camera Feed</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {events.map(ev => (
           <div key={ev.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <div style={{ height: '160px', background: 'var(--bg)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                 <Camera size={48} color="var(--line)"/>
                 <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>{ev.deviceId}</div>
                 {/* Mock bounding box to simulate vision UI */}
                 <div style={{ position: 'absolute', width: '80px', height: '60px', border: '2px solid var(--brand)', top: '50px', left: '120px', borderRadius: '4px' }}>
                   <span style={{ position: 'absolute', top: '-18px', background: 'var(--brand)', color: '#fff', fontSize: '9px', padding: '2px 4px', fontWeight: 700 }}>{(ev.confidenceScore * 100).toFixed(0)}%</span>
                 </div>
              </div>
              
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div>
                       <b style={{ fontSize: '14px', color: 'var(--text)' }}>{ev.eventType ? ev.eventType.replace('_', ' ') : 'Unknown'}</b>
                       <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{new Date(ev.detectedAt || new Date()).toLocaleString()}</div>
                    </div>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, background: ev.resolved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: ev.resolved ? 'var(--green)' : 'var(--amber)' }}>{ev.resolved ? 'RESOLVED' : 'NEEDS_REVIEW'}</span>
                 </div>
                 
                 <div style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid var(--rose)', borderRadius: '8px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <AlertCircle size={16} color="var(--rose)" style={{ flexShrink: 0, marginTop: '2px' }}/>
                    <div style={{ fontSize: '12px' }}>
                       <div style={{ color: 'var(--text)' }}><b>Detected:</b> {ev.detection}</div>
                       <div style={{ color: 'var(--muted)', marginTop: '4px' }}><b>Expected:</b> {ev.expected}</div>
                    </div>
                 </div>
                 
                 {!ev.resolved ? (
                   <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button className="primary" style={{ flex: 1, padding: '8px', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }} onClick={() => handleReview(ev.id, 'CONFIRMED')}><CheckCircle size={14}/> Confirm</button>
                      <button style={{ flex: 1, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleReview(ev.id, 'REJECTED')}><XCircle size={14}/> Reject</button>
                   </div>
                 ) : (
                   <div style={{ color: 'var(--muted)', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>Review completed.</div>
                 )}
              </div>
           </div>
        ))}
      </div>
    </div>
  );
}
