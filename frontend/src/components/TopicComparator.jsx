import React, { useState, useEffect } from 'react';
import PlotlyChart from './PlotlyChart';
import { GitCompare, Trophy, TrendingUp, CheckCircle, Info } from 'lucide-react';

export default function TopicComparator({ topics }) {
  const [topicAId, setTopicAId] = useState(topics[0]?.topic_id || 'generative_ai');
  const [topicBId, setTopicBId] = useState(topics[1]?.topic_id || 'quantum_sensing');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (topicAId && topicBId) {
      fetchComparison(topicAId, topicBId);
    }
  }, [topicAId, topicBId]);

  const fetchComparison = async (t1, t2) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/compare?t1=${t1}&t2=${t2}`);
      if (res.ok) {
        const data = await res.json();
        setComparison(data);
      }
    } catch (err) {
      console.error("Failed to fetch topic comparison:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!topics || topics.length < 2) {
    return <div className="glass-panel" style={{ padding: '20px' }}>At least 2 topics required for comparison.</div>;
  }

  const topicA = topics.find(t => t.topic_id === topicAId) || topics[0];
  const topicB = topics.find(t => t.topic_id === topicBId) || topics[1];

  // Prepare comparison grouped bar chart
  const compBarData = comparison ? [
    {
      name: comparison.topic_a.name,
      x: ['Trend Score', 'Growth Rate (%)', 'Sentiment (x100)', 'Projected XGB Growth (%)'],
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
      x: ['Trend Score', 'Growth Rate (%)', 'Sentiment (x100)', 'Projected XGB Growth (%)'],
      y: [
        comparison.topic_b.trend_score,
        comparison.topic_b.relative_growth_pct,
        comparison.topic_b.sentiment * 100,
        comparison.topic_b.projected_growth_xgb
      ],
      type: 'bar',
      marker: { color: '#06b6d4' }
    }
  ] : [];

  const compLayout = {
    title: {
      text: `Direct Head-to-Head Metric Contrast`,
      font: { size: 13, color: '#fff' }
    },
    barmode: 'group',
    legend: { orientation: 'h', x: 0, y: 1.15, font: { size: 10, color: '#94a3b8' } },
    xaxis: { gridcolor: 'rgba(255, 255, 255, 0.05)', tickfont: { size: 10, color: '#94a3b8' } },
    yaxis: { gridcolor: 'rgba(255, 255, 255, 0.05)', tickfont: { size: 10, color: '#94a3b8' } },
    margin: { t: 40, r: 20, b: 40, l: 40 }
  };

  return (
    <div className="comparison-container">
      {/* Selectors Bar */}
      <div className="comparison-selectors">
        <div className="select-group">
          <label>Topic A:</label>
          <select 
            className="custom-select" 
            value={topicAId} 
            onChange={(e) => setTopicAId(e.target.value)}
          >
            {topics.map(t => (
              <option key={t.topic_id} value={t.topic_id}>{t.topic_name}</option>
            ))}
          </select>
        </div>

        <span className="vs-badge">VS</span>

        <div className="select-group">
          <label>Topic B:</label>
          <select 
            className="custom-select" 
            value={topicBId} 
            onChange={(e) => setTopicBId(e.target.value)}
          >
            {topics.map(t => (
              <option key={t.topic_id} value={t.topic_id}>{t.topic_name}</option>
            ))}
          </select>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={() => {
            const temp = topicAId;
            setTopicAId(topicBId);
            setTopicBId(temp);
          }}
          style={{ marginLeft: 'auto' }}
        >
          <GitCompare size={14} /> Swap Topics
        </button>
      </div>

      {loading && <div style={{ color: 'var(--text-muted)' }}>Synthesizing comparative AI insights...</div>}

      {comparison && (
        <>
          {/* AI Comparative Narrative Box (Module 6) */}
          <div className="ai-spotlight-card" style={{ marginBottom: '0px' }}>
            <div className="ai-spotlight-header">
              <div className="ai-header-left">
                <span className="ai-badge">
                  <GitCompare size={13} />
                  AI Comparative Synthesis
                </span>
                <span className="caution-tag">
                  Non-Dogmatic • Multi-Signal Contrast
                </span>
              </div>
            </div>

            <div className="ai-narrative-box" style={{ marginBottom: '0' }}>
              <p style={{ lineHeight: 1.7 }}>
                {comparison.summary_verdict}
              </p>
            </div>
          </div>

          {/* Side-by-Side Chart & Dimension Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Chart */}
            <div className="glass-panel chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-card-title">
                    <TrendingUp size={16} color="#3b82f6" />
                    Comparative Visual Metrics
                  </h3>
                  <p className="chart-card-subtitle">Bar contrast across score, growth rate, sentiment and XGBoost forecast</p>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: '300px' }}>
                <PlotlyChart data={compBarData} layout={compLayout} />
              </div>
            </div>

            {/* Table */}
            <div className="glass-panel chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-card-title">
                    <Trophy size={16} color="#10b981" />
                    Dimensional Leader Breakdown
                  </h3>
                  <p className="chart-card-subtitle">Head-to-head comparison across core diffusion and predictive features</p>
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
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{dim.topic_a_val}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{dim.topic_b_val}</td>
                        <td>
                          <span className="leader-tag">
                            <CheckCircle size={11} /> {dim.leader}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
