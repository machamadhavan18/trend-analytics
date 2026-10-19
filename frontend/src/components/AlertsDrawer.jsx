import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, Bell, CheckCircle2 } from 'lucide-react';

export default function AlertsDrawer({ alerts }) {
  const [filter, setFilter] = useState('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL': return <AlertCircle size={20} color="#fb7185" style={{ flexShrink: 0 }} />;
      case 'WARNING': return <AlertTriangle size={20} color="#fbbf24" style={{ flexShrink: 0 }} />;
      default: return <Info size={20} color="#60a5fa" style={{ flexShrink: 0 }} />;
    }
  };

  const getAlertClass = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'alert-critical';
      case 'WARNING': return 'alert-warning';
      default: return 'alert-info';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} color="#f59e0b" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
            Module 10: Threshold-Based Real-Time Alerts ({alerts.length})
          </h2>
        </div>

        {/* Severity Filter Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              style={{
                background: filter === lvl ? '#3b82f6' : '#1e293b',
                color: filter === lvl ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)' }}>
          <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
          <p>No active alerts matching filter "{filter}". Dynamic signals remain within nominal bounds.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredAlerts.map(alert => (
            <div key={alert.id} className={`alert-item ${getAlertClass(alert.severity)}`}>
              {getAlertIcon(alert.severity)}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{alert.title}</span>
                  <span style={{ 
                    fontSize: '0.68rem', 
                    fontWeight: 700, 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    background: alert.severity === 'CRITICAL' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}>
                    {alert.severity}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '6px' }}>
                  {alert.message}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', fontSize: '0.74rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Trigger Condition: <strong style={{ color: '#fff' }}>{alert.metric_trigger}</strong>
                  </span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>
                    Action: {alert.recommended_action}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
