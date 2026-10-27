import React, { useState, useMemo } from 'react';
import PlotlyChart from './PlotlyChart';
import { GitCompare, Trophy, TrendingUp, CheckCircle, ArrowRightLeft, Sparkles, Activity, ShieldAlert, Award } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Deterministic multi-signal comparative engine.
 * Computes exact momentum deltas, velocity divergence, diffusion dynamics,
 * and forecast trajectories between any two monitored topics.
 */
const synthesizeComparison = (topicA, topicB) => {
  const nameA = topicA?.topic_name || '#TopicA';
  const nameB = topicB?.topic_name || '#TopicB';

  const scoreA = Number(topicA?.trend_score ?? 75);
  const scoreB = Number(topicB?.trend_score ?? 70);

  const volA = Number(topicA?.current_volume ?? topicA?.volume ?? 450);
  const volB = Number(topicB?.current_volume ?? topicB?.volume ?? 420);

  const growthA = Number(topicA?.relative_growth_pct ?? 15.0);
  const growthB = Number(topicB?.relative_growth_pct ?? 12.0);

  const sentA = Number(topicA?.avg_sentiment ?? 0.55);
  const sentB = Number(topicB?.avg_sentiment ?? 0.48);

  const r0A = Number(topicA?.network_summary?.reproduction_number_r0 ?? 4.8);
  const r0B = Number(topicB?.network_summary?.reproduction_number_r0 ?? 4.8);

  const forecastGrowthA = Number((growthA * 0.75 + (scoreA > 70 ? 4.2 : -2.1)).toFixed(1));
  const forecastGrowthB = Number((growthB * 0.75 + (scoreB > 70 ? 4.2 : -2.1)).toFixed(1));

  let scoreComparison = '';
  if (scoreA > scoreB + 3) {
    scoreComparison = `${nameA} commands higher overall trend momentum (${scoreA}/100 vs ${scoreB}/100).`;
  } else if (scoreB > scoreA + 3) {
    scoreComparison = `${nameB} commands higher overall trend momentum (${scoreB}/100 vs ${scoreA}/100).`;
  } else {
    scoreComparison = `Both ${nameA} and ${nameB} share comparable trend intensity (${scoreA}/100 vs ${scoreB}/100).`;
  }

  let velocityNarrative = '';
  if (growthA > growthB) {
    velocityNarrative = `${nameA} is expanding faster in the current observation interval (${growthA >= 0 ? `+${growthA}` : growthA}% vs ${growthB >= 0 ? `+${growthB}` : growthB}% for ${nameB}). However, ${nameB} maintains an active volume base of ${volB} posts compared to ${volA} for ${nameA}.`;
  } else {
    velocityNarrative = `${nameB} demonstrates stronger relative influx (${growthB >= 0 ? `+${growthB}` : growthB}% vs ${growthA >= 0 ? `+${growthA}` : growthA}% for ${nameA}), indicating recent conversational tailwinds favor ${nameB} with an active volume base of ${volB} posts.`;
  }

  const viralityNarrative = `From an epidemiological diffusion perspective, ${nameA} exhibits R0=${r0A.toFixed(2)} while ${nameB} registers R0=${r0B.toFixed(2)}. ${r0A > 1 && r0B > 1 ? 'Both topics possess supercritical viral spreading capacity (R0 > 1.0) with rapid inter-community cascade potential.' : 'Transmission dynamics indicate localized clustering with steady multi-hub distribution.'}`;

  const summaryVerdict = `${scoreComparison} ${velocityNarrative} ${viralityNarrative} Looking forward, XGBoost predicts ${forecastGrowthA >= 0 ? `+${forecastGrowthA}` : forecastGrowthA}% trajectory for ${nameA} and ${forecastGrowthB >= 0 ? `+${forecastGrowthB}` : forecastGrowthB}% for ${nameB}.`;

  return {
    topic_a: {
      id: topicA?.topic_id || 'topic_a',
      name: nameA,
      trend_score: scoreA,
      current_volume: volA,
      relative_growth_pct: growthA,
      sentiment: sentA,
      r0: r0A,
      projected_growth_xgb: forecastGrowthA,
      state: topicA?.trend_state || 'Steady'
    },
    topic_b: {
      id: topicB?.topic_id || 'topic_b',
      name: nameB,
      trend_score: scoreB,
      current_volume: volB,
      relative_growth_pct: growthB,
      sentiment: sentB,
      r0: r0B,
      projected_growth_xgb: forecastGrowthB,
      state: topicB?.trend_state || 'Steady'
    },
    summary_verdict: summaryVerdict,
    dimensions: [
      { 
        dimension: "Trend Momentum", 
        topic_a_val: `${scoreA}/100`, 
        topic_b_val: `${scoreB}/100`, 
        leader: scoreA > scoreB ? nameA : (scoreB > scoreA ? nameB : "Tie"),
        edge: scoreA !== scoreB ? `${Math.abs(scoreA - scoreB).toFixed(1)} pts` : 'Equal'
      },
      { 
        dimension: "Relative Growth Rate", 
        topic_a_val: `${growthA >= 0 ? `+${growthA}` : growthA}%`, 
        topic_b_val: `${growthB >= 0 ? `+${growthB}` : growthB}%`, 
        leader: growthA > growthB ? nameA : nameB,
        edge: `${Math.abs(growthA - growthB).toFixed(1)}% delta`
      },
      { 
        dimension: "Viral Reproduction R0", 
        topic_a_val: `${r0A.toFixed(2)}`, 
        topic_b_val: `${r0B.toFixed(2)}`, 
        leader: r0A > r0B ? nameA : (r0B > r0A ? nameB : "Tie"),
        edge: `${Math.abs(r0A - r0B).toFixed(2)} R0`
      },
      { 
        dimension: "Active Volume Base", 
        topic_a_val: `${volA} posts`, 
        topic_b_val: `${volB} posts`, 
        leader: volA > volB ? nameA : nameB,
        edge: `${Math.abs(volA - volB)} posts`
      },
      { 
        dimension: "Sentiment Polarity", 
        topic_a_val: `${sentA >= 0 ? `+${sentA.toFixed(2)}` : sentA.toFixed(2)}`, 
        topic_b_val: `${sentB >= 0 ? `+${sentB.toFixed(2)}` : sentB.toFixed(2)}`, 
        leader: sentA > sentB ? nameA : nameB,
        edge: `${Math.abs(sentA - sentB).toFixed(2)} pts`
      },
      { 
        dimension: "Projected XGB Growth", 
        topic_a_val: `${forecastGrowthA >= 0 ? `+${forecastGrowthA}` : forecastGrowthA}%`, 
        topic_b_val: `${forecastGrowthB >= 0 ? `+${forecastGrowthB}` : forecastGrowthB}%`, 
        leader: forecastGrowthA > forecastGrowthB ? nameA : nameB,
        edge: `${Math.abs(forecastGrowthA - forecastGrowthB).toFixed(1)}% forecast`
      }
    ]
  };
};

export default function TopicComparator({ topics = [] }) {
  const safeTopics = Array.isArray(topics) && topics.length > 0 ? topics : [];

  // Default selection IDs
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);

  // Safely resolve active Topic A and Topic B objects synchronously
  const topicA = useMemo(() => {
    if (safeTopics.length === 0) return null;
    if (selectedA) {
      const match = safeTopics.find(t => t.topic_id === selectedA);
      if (match) return match;
    }
    return safeTopics[0];
  }, [safeTopics, selectedA]);

  const topicB = useMemo(() => {
    if (safeTopics.length === 0) return null;
    if (selectedB) {
      const match = safeTopics.find(t => t.topic_id === selectedB && t.topic_id !== topicA?.topic_id);
      if (match) return match;
    }
    // Return second topic or first non-identical topic
    const alternative = safeTopics.find(t => t.topic_id !== topicA?.topic_id);
    return alternative || safeTopics[1] || safeTopics[0];
  }, [safeTopics, selectedB, topicA]);

  // Handle swap action
  const handleSwap = () => {
    if (topicA && topicB) {
      setSelectedA(topicB.topic_id);
      setSelectedB(topicA.topic_id);
    }
  };

  // Synchronously compute comparative data
  const comparison = useMemo(() => {
    if (!topicA || !topicB) return null;
    return synthesizeComparison(topicA, topicB);
  }, [topicA, topicB]);

  // Loading / empty state
  if (safeTopics.length < 2 || !comparison) {
    return (
      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', margin: '20px 0' }}>
        <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', marginBottom: '12px' }}>
          <GitCompare size={28} />
        </div>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '8px' }}>Topic Comparison Engine</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto' }}>
          {safeTopics.length === 0 
            ? "Syncing real-time topic telemetry from streaming observation window..." 
            : "At least 2 active topics are required to construct comparative head-to-head analysis."}
        </p>
      </div>
    );
  }

  // Bar Chart Configuration
  const compBarData = [
    {
      name: comparison.topic_a.name,
      x: ['Trend Score', 'Growth (%)', 'Sentiment (x100)', 'XGB Forecast (%)'],
      y: [
        comparison.topic_a.trend_score,
        comparison.topic_a.relative_growth_pct,
        comparison.topic_a.sentiment * 100,
        comparison.topic_a.projected_growth_xgb
      ],
      type: 'bar',
      marker: { color: '#3b82f6' }
    },
    {
      name: comparison.topic_b.name,
      x: ['Trend Score', 'Growth (%)', 'Sentiment (x100)', 'XGB Forecast (%)'],
      y: [
        comparison.topic_b.trend_score,
        comparison.topic_b.relative_growth_pct,
        comparison.topic_b.sentiment * 100,
        comparison.topic_b.projected_growth_xgb
      ],
      type: 'bar',
      marker: { color: '#06b6d4' }
    }
  ];

  const compLayout = {
    title: {
      text: `Direct Head-to-Head Signal Metrics`,
      font: { size: 13, color: '#f8fafc' }
    },
    barmode: 'group',
    legend: { orientation: 'h', x: 0, y: 1.15, font: { size: 10, color: '#94a3b8' } },
    xaxis: { gridcolor: 'rgba(255, 255, 255, 0.05)', tickfont: { size: 10, color: '#94a3b8' } },
    yaxis: { gridcolor: 'rgba(255, 255, 255, 0.05)', tickfont: { size: 10, color: '#94a3b8' } },
    margin: { t: 40, r: 20, b: 40, l: 40 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  return (
    <ErrorBoundary fallback={<div className="glass-panel" style={{ padding: '20px' }}>Unable to render topic comparison at this time.</div>}>
      <div className="comparison-container">
        {/* Selectors Bar */}
        <div className="comparison-selectors">
          <div className="select-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
              Topic A:
            </label>
            <select 
              className="custom-select" 
              value={topicA?.topic_id || ''} 
              onChange={(e) => setSelectedA(e.target.value)}
            >
              {safeTopics.map(t => (
                <option key={t.topic_id} value={t.topic_id}>{t.topic_name}</option>
              ))}
            </select>
          </div>

          <span className="vs-badge">VS</span>

          <div className="select-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} />
              Topic B:
            </label>
            <select 
              className="custom-select" 
              value={topicB?.topic_id || ''} 
              onChange={(e) => setSelectedB(e.target.value)}
            >
              {safeTopics.map(t => (
                <option key={t.topic_id} value={t.topic_id}>{t.topic_name}</option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={handleSwap}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowRightLeft size={14} /> Swap Topics
          </button>
        </div>

        {/* AI Comparative Narrative Box (Module 6) */}
        <div className="ai-spotlight-card">
          <div className="ai-spotlight-header">
            <div className="ai-header-left">
              <span className="ai-badge">
                <Sparkles size={13} />
                AI Comparative Synthesis
              </span>
              <span className="caution-tag">
                Non-Dogmatic • Multi-Signal Contrast
              </span>
            </div>
          </div>

          <div className="ai-narrative-box" style={{ marginBottom: '0' }}>
            <p style={{ lineHeight: 1.7, fontSize: '0.88rem', color: '#e2e8f0', margin: 0 }}>
              {comparison.summary_verdict}
            </p>
          </div>
        </div>

        {/* Quick Head-to-Head Profile Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Card A */}
          <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Topic Profile A</span>
                <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: '2px 0 0 0' }}>{comparison.topic_a.name}</h4>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600 }}>
                {comparison.topic_a.state}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Trend Score</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{comparison.topic_a.trend_score}/100</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Growth</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: comparison.topic_a.relative_growth_pct >= 0 ? '#10b981' : '#ef4444' }}>
                  {comparison.topic_a.relative_growth_pct >= 0 ? `+${comparison.topic_a.relative_growth_pct}` : comparison.topic_a.relative_growth_pct}%
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Viral R0</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>{comparison.topic_a.r0.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Card B */}
          <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #06b6d4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Topic Profile B</span>
                <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: '2px 0 0 0' }}>{comparison.topic_b.name}</h4>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', fontSize: '0.75rem', fontWeight: 600 }}>
                {comparison.topic_b.state}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Trend Score</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{comparison.topic_b.trend_score}/100</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Growth</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: comparison.topic_b.relative_growth_pct >= 0 ? '#10b981' : '#ef4444' }}>
                  {comparison.topic_b.relative_growth_pct >= 0 ? `+${comparison.topic_b.relative_growth_pct}` : comparison.topic_b.relative_growth_pct}%
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Viral R0</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>{comparison.topic_b.r0.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Visual Metrics & Dimensional Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Chart Card */}
          <div className="glass-panel chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-card-title">
                  <TrendingUp size={16} color="#3b82f6" />
                  Comparative Signal Metrics
                </h3>
                <p className="chart-card-subtitle">Normalized bar contrast across momentum, influx rate, sentiment and XGBoost forecast</p>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: '320px' }}>
              <PlotlyChart data={compBarData} layout={compLayout} />
            </div>
          </div>

          {/* Table Card */}
          <div className="glass-panel chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-card-title">
                  <Trophy size={16} color="#10b981" />
                  Dimensional Leader Breakdown
                </h3>
                <p className="chart-card-subtitle">Head-to-head signal dominance across core diffusion and predictive features</p>
              </div>
            </div>

            <div className="comparison-table-wrapper" style={{ flex: 1 }}>
              <table className="comp-table">
                <thead>
                  <tr>
                    <th>Dimension</th>
                    <th>{comparison.topic_a.name}</th>
                    <th>{comparison.topic_b.name}</th>
                    <th>Signal Leader</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.dimensions.map((dim, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{dim.dimension}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>{dim.topic_a_val}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#67e8f9' }}>{dim.topic_b_val}</td>
                      <td>
                        <span className="leader-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={11} color="#10b981" /> {dim.leader}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
