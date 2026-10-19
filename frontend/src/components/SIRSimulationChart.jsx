import React from 'react';
import PlotlyChart from './PlotlyChart';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function SIRSimulationChart({ sirData, summaryData, topicName }) {
  if (!sirData || !sirData.steps) {
    return (
      <div className="glass-panel chart-card">
        <p style={{ color: 'var(--text-muted)' }}>Calculating epidemiological diffusion simulation...</p>
      </div>
    );
  }

  const { steps, susceptible, active_broadcasting, saturated_recovered, r0, virality_state } = sirData;

  const plotData = [
    {
      name: 'Susceptible Audience (%)',
      x: steps,
      y: susceptible,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#64748b', width: 2, dash: 'dash' }
    },
    {
      name: 'Actively Broadcasting / Retweeting (%)',
      x: steps,
      y: active_broadcasting,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#f43f5e', width: 3 },
      fill: 'tozeroy',
      fillcolor: 'rgba(244, 63, 94, 0.12)'
    },
    {
      name: 'Saturated / Recovered (%)',
      x: steps,
      y: saturated_recovered,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#10b981', width: 2 }
    }
  ];

  const layout = {
    title: {
      text: `Epidemiological Cascade Projection (SIR Model) for ${topicName}`,
      font: { size: 13, color: '#fff' }
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.15,
      font: { size: 10, color: '#94a3b8' }
    },
    xaxis: {
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { size: 10, color: '#94a3b8' }
    },
    yaxis: {
      title: 'Population Fraction (%)',
      titlefont: { size: 10, color: '#94a3b8' },
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { size: 10, color: '#94a3b8' }
    },
    margin: { t: 40, r: 24, b: 40, l: 48 }
  };

  const isSupercritical = r0 > 1.2;

  return (
    <div className="glass-panel chart-card" style={{ minHeight: '360px' }}>
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">
            <Zap size={16} color="#f43f5e" />
            Epidemiological Information Diffusion (SIR Model & R₀)
          </h3>
          <p className="chart-card-subtitle">
            Simulates viral propagation across user network nodes using non-linear transmission dynamics
          </p>
        </div>

        {/* R0 Virality Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: isSupercritical ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${isSupercritical ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          padding: '4px 10px',
          borderRadius: '8px'
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Reproduction Number</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isSupercritical ? '#fb7185' : '#34d399' }}>
              R₀ = {r0}
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isSupercritical ? '#fb7185' : '#34d399' }}>
            {virality_state}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: '260px' }}>
        <PlotlyChart data={plotData} layout={layout} />
      </div>
    </div>
  );
}
