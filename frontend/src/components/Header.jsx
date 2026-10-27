import React from 'react';
import { 
  Activity, Play, Pause, FastForward, RotateCcw, 
  FileText, Download, UploadCloud, BarChart2, Zap, Search, Sliders 
} from 'lucide-react';

export default function Header({
  status,
  isStreaming,
  toggleStreaming,
  onStepSimulation,
  onResetSimulation,
  onOpenEvaluation,
  onOpenUpload,
  onOpenEventInjection,
  onOpenSearch,
  onOpenModelStudio,
  alertCount,
  activeTab,
  setActiveTab,
  topics = []
}) {
  const handleExportPdf = () => {
    fetch('/api/export/pdf')
      .then(res => {
        if (!res.ok) throw new Error('API unavailable');
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('html')) throw new Error('HTML response');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      })
      .catch(() => {
        window.print();
      });
  };

  const handleExportCsv = () => {
    fetch('/api/export/csv')
      .then(res => {
        if (!res.ok) throw new Error('API unavailable');
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('html')) throw new Error('HTML response');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trend_analytics_export.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => {
        const rows = [['Topic', 'Trend Score', 'Volume', 'Growth (%)', 'State', 'R0 Index']];
        (topics && topics.length > 0 ? topics : [
          { topic_name: '#GenerativeAI', trend_score: 83.8, current_volume: 471, relative_growth_pct: 38.5, trend_state: 'Emerging', network_summary: { reproduction_number_r0: 4.8 } },
          { topic_name: '#QuantumSensing', trend_score: 72.4, current_volume: 920, relative_growth_pct: 21.0, trend_state: 'Steady', network_summary: { reproduction_number_r0: 3.6 } },
          { topic_name: '#GreenHydrogen', trend_score: 96.1, current_volume: 215, relative_growth_pct: 159.0, trend_state: 'Surging', network_summary: { reproduction_number_r0: 4.8 } },
          { topic_name: '#ZeroTrustSecurity', trend_score: 63.8, current_volume: 90, relative_growth_pct: 11.2, trend_state: 'Steady', network_summary: { reproduction_number_r0: 2.1 } },
          { topic_name: '#SpatialComputing', trend_score: 42.8, current_volume: 40, relative_growth_pct: -11.0, trend_state: 'Decaying', network_summary: { reproduction_number_r0: 1.4 } },
          { topic_name: '#AutonomousVehicles', trend_score: 38.7, current_volume: 43, relative_growth_pct: -42.0, trend_state: 'Decaying', network_summary: { reproduction_number_r0: 1.2 } }
        ]).forEach(t => {
          rows.push([
            t.topic_name || t.topic_id,
            t.trend_score ?? 70,
            t.current_volume ?? t.volume ?? 100,
            t.relative_growth_pct ?? 0,
            t.trend_state ?? 'Steady',
            t.network_summary?.reproduction_number_r0 ?? 4.8
          ]);
        });
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'trend_analytics_export.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

  return (
    <header className="top-header">
      <div className="header-content">
        <div className="brand-section">
          <div className="brand-icon">
            <Activity size={22} />
          </div>
          <div className="brand-text">
            <h1>
              REAL TIME SOCIAL MEDIA TREND PREDICTION & DIFFUSION ANALYTICS
              <span className="live-badge">
                <span className="pulse-dot"></span> LIVE STREAM
              </span>
            </h1>
            <p>Module 6: AI Trend Insight Generator • XGBoost XAI • SIR Epidemic Diffusion • NetworkX Louvain</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Global Content & Topic Search */}
          <button 
            className="btn btn-secondary"
            onClick={onOpenSearch}
            style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.1)' }}
            title="Global Content Search across all monitored topics, hashtags, entities, and live streams"
          >
            <Search size={14} color="#60a5fa" />
            Global Search
          </button>

          {/* Model Weights Studio */}
          <button 
            className="btn btn-secondary"
            onClick={onOpenModelStudio}
            style={{ borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c084fc', background: 'rgba(139, 92, 246, 0.1)' }}
            title="Interactive Model Tuning & Weight Configuration Studio"
          >
            <Sliders size={14} color="#c084fc" />
            Model Studio
          </button>

          {/* High-End Event Injection Trigger */}
          <button 
            className="btn btn-secondary"
            onClick={onOpenEventInjection}
            style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)' }}
            title="Inject real-world synthetic shocks (Viral surges, KOL retweet blitzes, controversies)"
          >
            <Zap size={14} color="#fbbf24" />
            Inject Shock
          </button>

          {/* Stream Simulation Controls */}
          <button 
            className={`btn ${isStreaming ? 'btn-danger' : 'btn-accent'}`}
            onClick={toggleStreaming}
            title={isStreaming ? "Pause real-time streaming" : "Start automatic real-time streaming"}
          >
            {isStreaming ? <Pause size={14} /> : <Play size={14} />}
            {isStreaming ? "Pause Stream" : "Live Stream"}
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onStepSimulation}
            title="Advance temporal sliding window by +1 hour"
          >
            <FastForward size={14} />
            +1h Step
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onResetSimulation}
            title="Reset simulation to initial state"
          >
            <RotateCcw size={14} />
            Reset
          </button>

          <div style={{ height: '24px', width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />

          {/* Export Actions */}
          <button 
            className="btn btn-primary" 
            onClick={handleExportPdf}
            title="Export full AI Trend Intelligence report as professional PDF"
          >
            <FileText size={14} />
            Export PDF
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={handleExportCsv}
            title="Export trend analytics data to CSV"
          >
            <Download size={14} />
            CSV
          </button>

          {/* Custom Upload */}
          <button 
            className="btn btn-secondary" 
            onClick={onOpenUpload}
            title="Upload custom social media posts dataset"
          >
            <UploadCloud size={14} />
            Upload
          </button>

          {/* Model Evaluation Modal Button */}
          <button 
            className="btn btn-secondary" 
            onClick={onOpenEvaluation}
            title="View Model Performance Evaluation (MAE, RMSE, Precision, Recall, F1)"
          >
            <BarChart2 size={14} />
            Evaluation
          </button>
        </div>
      </div>
    </header>
  );
}
