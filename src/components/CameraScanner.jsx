import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, ScanLine, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export function CameraScanner({ onClose, onScanComplete }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Start camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError('Camera access denied or unavailable. Please check permissions.');
        console.error("Camera error:", err);
      }
    }
    setupCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array to run only once

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || processing) return;
    
    setScanning(false);
    setProcessing(true);
    
    // Simulate AI processing time (e.g. sending to Python backend)
    setTimeout(() => {
      setProcessing(false);
      // Mocked AI Extracted Data
      onScanComplete({
        name: 'Amoxicillin 500mg',
        batchNumber: 'BATCH-AMX-992',
        expiryDate: '2027-11-01',
        manufacturer: 'PharmaCorp',
        quantity: 100
      });
    }, 2500);
  }, [processing, onScanComplete]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '32px', right: '32px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', zIndex: 100 }}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 10 }}>
          <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <ScanLine color="#1bb4a2" size={32} /> AI Vision Scanner
          </h2>
          <p style={{ color: '#94a3b8', margin: 0 }}>Position the medicine box or barcode within the frame.</p>
        </div>

        {error ? (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', padding: '24px', borderRadius: '16px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '400px', textAlign: 'center' }}>
            <AlertTriangle size={24} />
            {error}
          </div>
        ) : (
          <div style={{ position: 'relative', width: '90%', maxWidth: '500px', aspectRatio: '3/4', background: '#000', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(27,180,162,0.3)', border: '2px solid rgba(27,180,162,0.3)' }}>
            
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: processing ? 0.3 : 1, transition: 'opacity 0.3s' }}
            />

            {/* Futuristic Targeting Reticle */}
            <div style={{ position: 'absolute', inset: '10%', border: '2px solid rgba(27,180,162,0.5)', borderRadius: '16px', pointerEvents: 'none' }}>
               {/* Corners */}
               <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #1bb4a2', borderLeft: '4px solid #1bb4a2', borderTopLeftRadius: '16px' }} />
               <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #1bb4a2', borderRight: '4px solid #1bb4a2', borderTopRightRadius: '16px' }} />
               <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #1bb4a2', borderLeft: '4px solid #1bb4a2', borderBottomLeftRadius: '16px' }} />
               <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #1bb4a2', borderRight: '4px solid #1bb4a2', borderBottomRightRadius: '16px' }} />
            </div>

            {/* Scanning Laser Animation */}
            {scanning && (
              <>
                <motion.div 
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', left: '5%', right: '5%', height: '2px', background: '#1bb4a2', boxShadow: '0 0 20px 4px rgba(27,180,162,0.6)', zIndex: 20 }}
                />
              </>
            )}

            {/* Processing Overlay */}
            {processing && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(9,9,11,0.7)' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 size={48} color="#1bb4a2" />
                </motion.div>
                <motion.h3 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ color: '#1bb4a2', marginTop: '16px', letterSpacing: '2px' }}
                >
                  AI EXTRACTING DATA...
                </motion.h3>
              </div>
            )}
          </div>
        )}

        {!error && scanning && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCapture}
            style={{
              marginTop: '40px', padding: '16px 32px', borderRadius: '50px', background: '#1bb4a2', border: 'none', color: '#fff', fontSize: '18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(27,180,162,0.4)', zIndex: 10
            }}
          >
            <Camera size={24} /> Capture & Analyze
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
