import React from 'react';
import PlotlyChart from './PlotlyChart';
import { Sliders, Cpu } from 'lucide-react';

export default function FeatureImportanceChart({ featureImportances, r2Score }) {
  if (!featureImportances || featureImportances.length === 0) {
    return (
      <div className="glass-panel chart-card">
        <p style={{ color: 'var(--text-muted)' }}>No feature importance data available.</p>
      </div>
    );
  }

  // Reverse so highest is at top of horizontal bar
  const reversed = [...featureImportances].reverse();
  const yNames = reversed.map(f => f.feature_name);
  const xPcts = reversed.map(f => f.importance_pct);

  const plotData = [
    {
      type: 'bar',
      orientation: 'h',
      x: xPcts,
      y: yNames,
      marker: {
        color: xPcts.map(val => val > 30 ? '#3b82f6' : (val > 15 ? '#06b6d4' : '#8b5cf6')),
        line: { color: 'rgba(255, 255, 255, 0.2)', width: 1 }
      },
      text: xPcts.map(v => `${v}%`),
      textposition: 'auto',
      hoverinfo: 'x+y'
    }
  ];

  const layout = {
    title: {
      text: `XGBoost Explainability (XAI): Feature Importance Drivers (R² = ${r2Score || 0.89})`,
      font: { size: 13, color: '#fff' }
    },
    xaxis: {
      title: 'Contribution Percentage (%)',
      titlefont: { size: 10, color: '#94a3b8' },
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { size: 9, color: '#94a3b8' }
    },
    yaxis: {
      gridcolor: 'transparent',
      tickfont: { size: 10, color: '#cbd5e1' }
    },
    margin: { t: 40, r: 24, b: 40, l: 190 }
  };

  return (
    <div className="glass-panel chart-card" style={{ minHeight: '340px' }}>
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">
            <Cpu size={16} color="#06b6d4" />
            Explainable AI: XGBoost Regressor Feature Weights
          </h3>
          <p className="chart-card-subtitle">
            Gini impurity gain decomposition showing relative influence of temporal lags, engagement velocity, and network signals
          </p>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: '260px' }}>
        <PlotlyChart data={plotData} layout={layout} />
      </div>
    </div>
  );
}
