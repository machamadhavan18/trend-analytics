import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '32px', 
            margin: '24px auto', 
            maxWidth: '680px', 
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.08), rgba(15, 23, 42, 0.95))',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', marginBottom: '16px' }}>
            <AlertTriangle size={36} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            {this.props.title || "Interface Component Temporarily Interrupted"}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            {this.props.message || "An isolated rendering event occurred. The rest of the AI Trend Insight platform remains operational."}
          </p>
          {this.state.error?.message && (
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.78rem', color: '#fca5a5', maxWidth: '540px', margin: '0 auto 20px', overflowX: 'auto', textAlign: 'left' }}>
              {this.state.error.message}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={this.handleReset}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={14} /> Retry View
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => window.location.reload()}
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
