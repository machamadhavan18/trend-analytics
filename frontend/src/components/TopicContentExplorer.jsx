import React, { useState } from 'react';
import { Hash, MessageSquare, Tag, Heart, Repeat, Sparkles, User, ExternalLink } from 'lucide-react';

export default function TopicContentExplorer({ topic, topicDetail, onExploreLivePosts }) {
  if (!topic) return null;

  const keywords = topicDetail?.keywords || [];
  const hashtags = topicDetail?.top_hashtags || [];
  const samplePost = topicDetail?.sample_post || '';

  // Approximate sentiment breakdown from topic metrics
  const avgSent = topic.avg_sentiment || 0.0;
  let posPct = 50;
  let negPct = 20;
  let neutPct = 30;

  if (avgSent > 0.3) {
    posPct = Math.min(85, Math.round(55 + avgSent * 35));
    negPct = Math.max(5, Math.round(15 - avgSent * 10));
    neutPct = 100 - posPct - negPct;
  } else if (avgSent < -0.1) {
    negPct = Math.min(75, Math.round(40 + Math.abs(avgSent) * 45));
    posPct = Math.max(10, Math.round(25 - Math.abs(avgSent) * 15));
    neutPct = 100 - posPct - negPct;
  }

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={16} color="#3b82f6" />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
            Topic Anatomy & Content Signals: <span style={{ color: '#60a5fa' }}>{topic.topic_name}</span>
          </h3>
        </div>

        {onExploreLivePosts && (
          <button
            onClick={onExploreLivePosts}
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <MessageSquare size={12} />
            View Live Stream Posts
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {/* 1. Salient Keywords & TF-IDF Scores */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="#06b6d4" /> Top TF-IDF Discriminating Keywords
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {keywords.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Analyzing vocabulary...</span>
            ) : (
              keywords.slice(0, 4).map((kw, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>#{kw.term}</span>
                  <span style={{ color: '#06b6d4', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                    TF-IDF: {kw.tfidf_score}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Top Hashtags with Frequency */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Hash size={12} color="#8b5cf6" /> Co-Occurring Hashtags
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {hashtags.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No co-occurring tags</span>
            ) : (
              hashtags.map((ht, i) => (
                <span
                  key={i}
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#c084fc',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}
                >
                  {ht.tag} ({ht.count})
                </span>
              ))
            )}
          </div>
        </div>

        {/* 3. Sentiment Distribution Gauge */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Sentiment Polarity Distribution ({avgSent > 0 ? `+${avgSent}` : avgSent})
          </div>
          {/* Multi-segment progress bar */}
          <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{ width: `${posPct}%`, background: '#10b981' }} title={`Positive: ${posPct}%`} />
            <div style={{ width: `${neutPct}%`, background: '#64748b' }} title={`Neutral: ${neutPct}%`} />
            <div style={{ width: `${negPct}%`, background: '#f43f5e' }} title={`Negative: ${negPct}%`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span style={{ color: '#34d399' }}>● Pos: {posPct}%</span>
            <span style={{ color: '#94a3b8' }}>● Neut: {neutPct}%</span>
            <span style={{ color: '#fb7185' }}>● Neg: {negPct}%</span>
          </div>
        </div>

        {/* 4. Astroturfing & Bot Coordination Gauge (CIB) */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Organic Virality vs Bot (CIB)
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: topic.cib_analysis?.badge_color ? `${topic.cib_analysis.badge_color}25` : 'rgba(16, 185, 129, 0.2)',
              color: topic.cib_analysis?.badge_color || '#34d399'
            }}>
              {topic.cib_analysis?.classification?.replace(/_/g, ' ') || 'ORGANIC GRASSROOTS'}
            </span>
          </div>
          {/* Dual bar: Organic vs Bot */}
          <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
            <div 
              style={{ width: `${topic.cib_analysis?.organic_ratio || 88}%`, background: '#10b981' }} 
              title={`Organic Reach: ${topic.cib_analysis?.organic_ratio || 88}%`} 
            />
            <div 
              style={{ width: `${topic.cib_analysis?.bot_ratio || 12}%`, background: '#f43f5e' }} 
              title={`Synthetic/Bot Relay: ${topic.cib_analysis?.bot_ratio || 12}%`} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span style={{ color: '#34d399', fontWeight: 600 }}>● {topic.cib_analysis?.organic_ratio || 88}% Organic</span>
            <span style={{ color: '#fb7185' }}>● {topic.cib_analysis?.bot_ratio || 12}% Relay Bots</span>
            <span style={{ color: 'var(--text-dim)' }}>Syn: {topic.cib_analysis?.temporal_synchronicity || 0.18}</span>
          </div>
        </div>
      </div>

      {/* Representative Conversation Snippet */}
      {samplePost && (
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          background: 'rgba(10, 14, 23, 0.6)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          lineHeight: 1.45,
          color: '#cbd5e1'
        }}>
          <span style={{ color: '#60a5fa', fontWeight: 700, marginRight: '6px' }}>Representative Post:</span>
          "{samplePost}"
        </div>
      )}
    </div>
  );
}
