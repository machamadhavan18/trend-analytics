import React from 'react';
import PlotlyChart from './PlotlyChart';
import { Activity } from 'lucide-react';

export default function TrendTrajectoryChart({ history, topicName }) {
  if (!history || history.length === 0) {
    return (
      <div className="glass-panel chart-card">
        <p style={{ color: 'var(--text-muted)' }}>No historical sliding window data available.</p>
      </div>
    );
  }

  const windows = history.map(h => `Hour ${h.window_index}`);
  const volumes = history.map(h => h.volume);
  const velocities = history.map(h => h.velocity);
  const scores = history.map(h => h.trend_score);

  const plotData = [
    {
      name: 'Conversational Volume',
      x: windows,
      y: volumes,
      type: 'bar',
      marker: {
        color: 'rgba(59, 130, 246, 0.45)',
        line: { color: '#3b82f6', width: 1.5 }
      },
      yaxis: 'y'
    },
    {
      name: 'Velocity (Δ Volume)',
      x: windows,
      y: velocities,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#06b6d4', width: 2.5, shape: 'spline' },
      marker: { size: 6, color: '#06b6d4' },
      yaxis: 'y2'
    },
    {
      name: 'Trend Score (0-100)',
      x: windows,
      y: scores,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#ec4899', width: 2, dash: 'dot' },
      yaxis: 'y2'
    }
  ];

  const layout = {
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.05,
      font: { size: 10, color: '#94a3b8' }
    },
    xaxis: {
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { size: 10, color: '#94a3b8' }
    },
    yaxis: {
      title: 'Volume (Posts)',
      titlefont: { size: 10, color: '#3b82f6' },
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { size: 9, color: '#94a3b8' }
    },
    yaxis2: {
      title: 'Velocity / Score',
      titlefont: { size: 10, color: '#06b6d4' },
      overlaying: 'y',
      side: 'right',
      gridcolor: 'transparent',
      tickfont: { size: 9, color: '#94a3b8' }
    },
    margin: { t: 25, r: 45, b: 35, l: 45 }
  };

  return (
    <div className="glass-panel chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">
            <Activity size={16} color="#3b82f6" />
            Modules 3 & 4: Sliding Window & Trend Scoring
          </h3>
          <p className="chart-card-subtitle">Volume bars with 1st discrete derivative velocity and normalized multi-factor score</p>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: '300px' }}>
        <PlotlyChart data={plotData} layout={layout} />
      </div>
    </div>
  );
}
