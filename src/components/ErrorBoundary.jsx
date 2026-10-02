import React from 'react';
import { RefreshCw, ServerOff } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, errorId: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = `REQ-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    this.setState({ errorInfo, errorId });
    
    // Log to simulated structured logging
    console.error("STRUCTURED LOG:", JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "CRITICAL",
      service: "frontend-react",
      request_id: errorId,
      message: error.message,
      stack: errorInfo.componentStack
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#f8fafc', padding: '20px', textAlign: 'center' }}>
          <div style={{ background: '#0f172a', padding: '40px', borderRadius: '16px', border: '1px solid #1e293b', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <ServerOff size={48} color="#f43f5e" style={{ margin: '0 auto 20px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>We couldn't load the application.</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              Your data was not changed. The operation was safely halted to prevent corruption.
            </p>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px dashed #334155', marginBottom: '24px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Reference ID</span>
              <code style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 'bold', userSelect: 'all' }}>{this.state.errorId || 'REQ-PENDING'}</code>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => window.location.reload()} 
                style={{ flex: 1, padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <RefreshCw size={16} /> Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}
