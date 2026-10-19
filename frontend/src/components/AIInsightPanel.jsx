import React, { useState } from 'react';
import { 
  Sparkles, ShieldAlert, CheckCircle, Info, TrendingUp, Cpu, 
  Network, Heart, BarChart, Search, Send, Briefcase, FlaskConical, AlertOctagon 
} from 'lucide-react';

export default function AIInsightPanel({ topic, insightData }) {
  const [activePersona, setActivePersona] = useState('executive'); // 'executive' | 'quant' | 'pr'
  const [userQuery, setUserQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResponse, setQueryResponse] = useState(null);

  if (!topic || !insightData) {
    return (
      <div className="glass-panel ai-spotlight-card">
        <p style={{ color: 'var(--text-muted)' }}>Loading AI Trend Insights...</p>
      </div>
    );
  }

  const { multi_persona, score_explanation } = insightData;
  const attributions = score_explanation?.factor_breakdown || [];
  const scoreDelta = topic.score_delta || 0;

  const handleSendQuery = async (queryText) => {
    const q = queryText || userQuery;
    if (!q.trim()) return;

    setQueryLoading(true);
    setQueryResponse(null);

    try {
      const res = await fetch('/api/insights/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          topic_id: topic.topic_id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setQueryResponse(data);
      }
    } catch (err) {
      console.error("Query failed:", err);
    } finally {
      setQueryLoading(false);
    }
  };

  const sampleQuestions = [
    { label: "💡 Explain why score increased", query: "Why did the trend score increase?" },
    { label: "🔮 Predict next 24h trajectory", query: "Will this trend peak in the next 12 hours?" },
    { label: "🤖 Detect bot & CIB astroturfing", query: "Is this trend organic or bot-driven astroturfing?" },
    { label: "🏢 Draft PR Executive Alert", query: "What is the recommended PR and communications strategy?" },
    { label: "🔬 Quant mathematical breakdown", query: "Provide quantitative signal decomposition with velocity and acceleration derivatives" },
    { label: "👥 Primary broadcasting hubs", query: "Who are the key broadcasting hubs and bridge accounts?" }
  ];

  const getFactorIcon = (factor) => {
    switch (factor) {
      case 'Velocity Surge': return <TrendingUp size={14} color="#3b82f6" />;
      case 'Acceleration Shock': return <Cpu size={14} color="#06b6d4" />;
      case 'Broad Community Diffusion': return <Network size={14} color="#8b5cf6" />;
      case 'Volume Magnitude': return <BarChart size={14} color="#f59e0b" />;
      case 'Sentiment Catalyst': return <Heart size={14} color="#ec4899" />;
      default: return <Info size={14} color="#94a3b8" />;
    }
  };

  return (
    <div className="ai-spotlight-card">
      {/* Header bar */}
      <div className="ai-spotlight-header">
        <div className="ai-header-left">
          <span className="ai-badge">
            <Sparkles size={13} />
            Module 6: AI Trend Insight Generator (Enterprise)
          </span>
          <span className="caution-tag">
            <ShieldAlert size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Calibrated • Non-Dogmatic Insights
          </span>
        </div>

        {/* Persona Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(10, 14, 23, 0.7)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActivePersona('executive')}
            style={{
              background: activePersona === 'executive' ? '#3b82f6' : 'transparent',
              color: activePersona === 'executive' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Briefcase size={11} /> Executive
          </button>

          <button
            onClick={() => setActivePersona('quant')}
            style={{
              background: activePersona === 'quant' ? '#3b82f6' : 'transparent',
              color: activePersona === 'quant' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FlaskConical size={11} /> Quant Deep Dive
          </button>

          <button
            onClick={() => setActivePersona('pr')}
            style={{
              background: activePersona === 'pr' ? '#3b82f6' : 'transparent',
              color: activePersona === 'pr' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <AlertOctagon size={11} /> PR & Crisis
          </button>
        </div>
      </div>

      {/* Target Topic & Headline */}
      <h3 className="ai-headline">{multi_persona?.headline}</h3>

      {/* Persona Narrative Content Box */}
      <div className="ai-narrative-box">
        {activePersona === 'executive' && (
          <div>
            <p style={{ lineHeight: 1.6, color: '#e2e8f0', fontSize: '0.88rem' }}>
              <strong>Executive Summary: </strong>
              {multi_persona?.executive_briefing}
            </p>
            <div style={{ marginTop: '10px', fontSize: '0.76rem', color: '#94a3b8' }}>
              <strong>Counterfactual Rule: </strong> {multi_persona?.counterfactual_analysis}
            </div>
          </div>
        )}

        {activePersona === 'quant' && (
          <div>
            <p style={{ lineHeight: 1.6, color: '#e2e8f0', fontSize: '0.86rem', fontFamily: 'var(--font-mono)' }}>
              {multi_persona?.quant_deep_dive}
            </p>
            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#60a5fa' }}>
              *Mathematical signals: First derivative (velocity), second derivative (acceleration), heterogeneous R₀, and Louvain modularity Q.
            </div>
          </div>
        )}

        {activePersona === 'pr' && (
          <div>
            <p style={{ lineHeight: 1.6, color: '#e2e8f0', fontSize: '0.88rem' }}>
              <strong>Communications & Brand Risk Strategy: </strong>
              {multi_persona?.pr_strategy}
            </p>
          </div>
        )}
      </div>

      {/* Interactive 'Ask AI Trend Insight' Query Bar */}
      <div style={{
        marginTop: '16px',
        padding: '12px 14px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Sparkles size={15} color="#60a5fa" />
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
            AI Trend Insight
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            (Search and ask any analytical question about emerging patterns)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Ask AI Trend Insight... e.g. Will this peak soon? Why did the score jump?"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              style={{
                width: '100%',
                background: '#0a0e17',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '7px 12px 7px 32px',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={() => handleSendQuery()}
            disabled={queryLoading}
            style={{ padding: '7px 14px', whiteSpace: 'nowrap' }}
          >
            <Send size={13} />
            {queryLoading ? "Analyzing..." : "Ask Insight"}
          </button>
        </div>

        {/* Quick Sample Questions Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
          {sampleQuestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUserQuery(item.query);
                handleSendQuery(item.query);
              }}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                color: '#93c5fd',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dynamic Query Response */}
        {queryResponse && (
          <div style={{
            marginTop: '12px',
            padding: '12px 14px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '8px',
            fontSize: '0.84rem',
            lineHeight: 1.55,
            color: '#e2e8f0',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Sparkles size={14} color="#60a5fa" />
              <strong style={{ color: '#60a5fa' }}>AI Trend Insight Intelligence:</strong>
            </div>
            <div>{queryResponse.answer}</div>

            {queryResponse.evidence_signals && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Empirical Signals:</span>
                <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                  Score: {queryResponse.evidence_signals.trend_score}/100
                </span>
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                  R₀ Virality: {queryResponse.evidence_signals.r0_number}
                </span>
                {queryResponse.evidence_signals.organic_authenticity && (
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                    Organic: {queryResponse.evidence_signals.organic_authenticity}%
                  </span>
                )}
                <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                  Driver: {queryResponse.evidence_signals.primary_driver}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Factor Attribution Breakdown */}
      <div style={{ marginTop: '16px', marginBottom: '8px' }}>
        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={15} color="#3b82f6" />
          Mathematical Factor Decomposition of Score Movement ({scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts)
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
          {score_explanation?.explanation_text}
        </p>
      </div>

      <div className="factor-decomposition-grid">
        {attributions.map((item, index) => (
          <div key={index} className="factor-card">
            <div className="factor-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#fff' }}>
                {getFactorIcon(item.factor)}
                {item.factor}
              </span>
              <span className="factor-pct">{item.percentage}%</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(100, item.percentage)}%` }}
              />
            </div>
            <p className="factor-desc">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
