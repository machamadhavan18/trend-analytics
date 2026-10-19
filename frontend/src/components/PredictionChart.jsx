import React from 'react';
import PlotlyChart from './PlotlyChart';
import { Target, TrendingUp, Info } from 'lucide-react';

export default function PredictionChart({ predictionData, topicName }) {
  if (!predictionData || !predictionData.historical_windows) {
    return (
      <div className="glass-panel chart-card">
        <p style={{ color: 'var(--text-muted)' }}>Calculating XGBoost predictions...</p>
      </div>
    );
  }

  const histX = predictionData.historical_windows.map(w => `H${w}`);
  const histY = predictionData.historical_volumes;

  const foreX = predictionData.forecast_windows.map(w => `H${w}`);
  const foreXgb = predictionData.forecast_xgboost;
  const foreSma = predictionData.forecast_sma;
  const foreEma = predictionData.forecast_ema;
  const foreUpper = predictionData.forecast_upper;
  const foreLower = predictionData.forecast_lower;

  // Connect last historical point to first forecast point
  const lastHistX = histX[histX.length - 1];
  const lastHistY = histY[histY.length - 1];

  const fullForeX = [lastHistX, ...foreX];
  const fullXgb = [lastHistY, ...foreXgb];
  const fullSma = [lastHistY, ...foreSma];
  const fullEma = [lastHistY, ...foreEma];
  const fullUpper = [lastHistY, ...foreUpper];
  const fullLower = [lastHistY, ...foreLower];

  const plotData = [
    // Historical Volume Trace
    {
      name: 'Historical Observations',
      x: histX,
      y: histY,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#94a3b8', width: 2 },
      marker: { size: 5, color: '#94a3b8' }
    },
    // Confidence Interval Shading (Lower Bound)
    {
      name: 'Lower 95% CI Bound',
      x: fullForeX,
      y: fullLower,
      type: 'scatter',
      mode: 'lines',
      line: { width: 0, color: 'transparent' },
      showlegend: false
    },
    // Confidence Interval Shading (Upper Bound with Fill)
    {
      name: '95% Confidence Band',
      x: fullForeX,
      y: fullUpper,
      type: 'scatter',
      mode: 'lines',
      fill: 'tonexty',
      fillcolor: 'rgba(59, 130, 246, 0.15)',
      line: { width: 0, color: 'transparent' }
    },
    // XGBoost Forecast Trace
    {
      name: 'XGBoost Regressor (Forecast)',
      x: fullForeX,
      y: fullXgb,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#3b82f6', width: 3, dash: 'solid' },
      marker: { size: 7, color: '#3b82f6' }
    },
    // Moving Average Baseline (SMA-3)
    {
      name: 'Baseline: Moving Average (SMA-3)',
      x: fullForeX,
      y: fullSma,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#f59e0b', width: 2, dash: 'dash' }
    },
    // EMA Baseline
    {
      name: 'Baseline: Exp. Moving Avg (EMA)',
      x: fullForeX,
      y: fullEma,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#10b981', width: 1.8, dash: 'dot' }
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
      titlefont: { size: 10, color: '#94a3b8' },
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { size: 9, color: '#94a3b8' }
    },
    margin: { t: 25, r: 24, b: 35, l: 45 }
  };

  return (
    <div className="glass-panel chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">
            <Target size={16} color="#3b82f6" />
            Modules 5 & 6: Popularity Prediction & Baseline Comparison
          </h3>
          <p className="chart-card-subtitle">
            Trained XGBoost Regressor forecasting near-future windows with 95% confidence bounds vs. Moving Average baselines
          </p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: '300px' }}>
        <PlotlyChart data={plotData} layout={layout} />
      </div>

      {/* AI Prediction Summary Callout (Module 6) */}
      <div style={{
        marginTop: '12px',
        padding: '12px 14px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        fontSize: '0.82rem',
        lineHeight: 1.5,
        color: '#cbd5e1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#60a5fa', fontWeight: 600 }}>
          <Info size={14} />
          <span>AI Prediction Synthesis (Cautious Horizon Outlook)</span>
        </div>
        <p>{predictionData.summary_phrase}</p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Projected XGB Growth: <strong style={{ color: predictionData.projected_growth_pct_xgb >= 0 ? '#34d399' : '#fb7185' }}>{predictionData.projected_growth_pct_xgb > 0 ? `+${predictionData.projected_growth_pct_xgb}%` : `${predictionData.projected_growth_pct_xgb}%`}</strong></span>
          <span>Baseline SMA Growth: <strong style={{ color: '#f59e0b' }}>{predictionData.projected_growth_pct_sma > 0 ? `+${predictionData.projected_growth_pct_sma}%` : `${predictionData.projected_growth_pct_sma}%`}</strong></span>
          <span>Divergence: <strong style={{ color: '#fff' }}>{predictionData.baseline_divergence} posts</strong></span>
        </div>
      </div>
    </div>
  );
}
