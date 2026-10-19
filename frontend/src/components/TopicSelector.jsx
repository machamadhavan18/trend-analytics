import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Layers, Search, Filter, Plus, X } from 'lucide-react';

export default function TopicSelector({ topics, selectedTopicId, onSelectTopic, onOpenAddTopic }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'volume' | 'growth'

  const getStateClass = (state) => {
    switch (state) {
      case 'Surging': return 'state-surging';
      case 'Emerging': return 'state-emerging';
      case 'Volatile': return 'state-volatile';
      case 'Decaying': return 'state-decaying';
      default: return 'state-steady';
    }
  };

  // Filter topics based on search and state
  const filteredTopics = topics.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = t.topic_name.toLowerCase().includes(q);
    const catMatch = (t.category || '').toLowerCase().includes(q);
    const kwMatch = (t.keywords || []).some(k => k.toLowerCase().includes(q));
    const matchesSearch = !q || nameMatch || catMatch || kwMatch;

    const matchesState = selectedState === 'ALL' || t.trend_state === selectedState;
    return matchesSearch && matchesState;
  });

  // Sort topics
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortBy === 'score') return b.trend_score - a.trend_score;
    if (sortBy === 'volume') return (b.current_volume || b.volume) - (a.current_volume || a.volume);
    if (sortBy === 'growth') return b.relative_growth_pct - a.relative_growth_pct;
    return 0;
  });

  const stateChips = ['ALL', 'Surging', 'Emerging', 'Steady', 'Volatile', 'Decaying'];

  return (
    <div className="glass-panel topic-list-card">
      {/* Header */}
      <div className="topic-list-header">
        <h2 className="section-title">
          <Layers size={18} color="#3b82f6" />
          Detected Topics ({topics.length})
        </h2>

        {onOpenAddTopic && (
          <button
            onClick={onOpenAddTopic}
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Search & Add a New Custom Trend Topic"
          >
            <Plus size={12} /> Add Topic
          </button>
        )}
      </div>

      {/* Real-Time Topic Search Input */}
      <div style={{ position: 'relative', width: '100%' }}>
        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        <input
          type="text"
          placeholder="Search topics, #tags, keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(10, 14, 23, 0.7)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '7px 28px 7px 30px',
            color: '#fff',
            fontSize: '0.78rem',
            outline: 'none'
          }}
        />
        {searchQuery && (
          <X 
            size={13} 
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', cursor: 'pointer' }}
          />
        )}
      </div>

      {/* State Filter Chips */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
        {stateChips.map(st => (
          <button
            key={st}
            onClick={() => setSelectedState(st)}
            style={{
              background: selectedState === st ? '#3b82f6' : 'rgba(255, 255, 255, 0.04)',
              color: selectedState === st ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              padding: '2px 7px',
              borderRadius: '4px',
              fontSize: '0.68rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Sort selection bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
        <span>Showing {sortedTopics.length} of {topics.length}</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            background: '#1e293b',
            color: '#cbd5e1',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            fontSize: '0.7rem',
            padding: '2px 6px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="score">Sort: Score</option>
          <option value="volume">Sort: Volume</option>
          <option value="growth">Sort: Growth %</option>
        </select>
      </div>

      {/* Topic Items List */}
      <div className="topic-items-wrapper">
        {sortedTopics.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px 10px', fontSize: '0.8rem' }}>
            No topics match "{searchQuery}".
          </div>
        ) : (
          sortedTopics.map((t) => {
            const isSelected = t.topic_id === selectedTopicId;
            const isDeltaPositive = (t.score_delta || 0) >= 0;

            return (
              <div
                key={t.topic_id}
                className={`topic-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectTopic(t.topic_id)}
              >
                <div className="topic-item-header">
                  <span className="topic-tag-name">{t.topic_name}</span>
                  <span className={`state-badge ${getStateClass(t.trend_state)}`}>
                    {t.trend_state}
                  </span>
                </div>

                <div className="topic-metrics-row">
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.74rem' }}>Vol: </span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{t.current_volume || t.volume}</span>
                    <span style={{ 
                      marginLeft: '6px', 
                      color: t.relative_growth_pct >= 0 ? '#34d399' : '#fb7185',
                      fontSize: '0.74rem',
                      fontWeight: 600
                    }}>
                      {t.relative_growth_pct > 0 ? `+${t.relative_growth_pct}%` : `${t.relative_growth_pct}%`}
                    </span>
                  </div>

                  <div className="score-pill">
                    <span>Score: {t.trend_score}</span>
                    <span className={isDeltaPositive ? 'score-delta-up' : 'score-delta-down'}>
                      {isDeltaPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {isDeltaPositive ? `+${t.score_delta}` : t.score_delta}
                    </span>
                  </div>
                </div>

                {/* Keywords & Category Preview */}
                {t.keywords && t.keywords.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {t.keywords.slice(0, 3).map((kw, i) => (
                      <span 
                        key={i} 
                        style={{ 
                          fontSize: '0.66rem', 
                          padding: '1px 5px', 
                          borderRadius: '4px', 
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)'
                        }}
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
