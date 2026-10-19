import React, { useState, useEffect } from 'react';
import { Radio, MessageSquare, Repeat, Heart, User, Sparkles, Filter } from 'lucide-react';

export default function LivePostFeed({ selectedTopicId, topicName }) {
  const [posts, setPosts] = useState([]);
  const [filterTopic, setFilterTopic] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 4000);
    return () => clearInterval(interval);
  }, [selectedTopicId, filterTopic]);

  const fetchFeed = async () => {
    try {
      const url = filterTopic && selectedTopicId 
        ? `/api/posts/live?topic_id=${selectedTopicId}` 
        : '/api/posts/live';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to fetch live feed:", err);
    }
  };

  const getSentimentPill = (val) => {
    if (val > 0.3) {
      return <span style={{ color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>+{val} Pos</span>;
    } else if (val < -0.1) {
      return <span style={{ color: '#fb7185', background: 'rgba(244, 63, 94, 0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>{val} Neg</span>;
    }
    return <span style={{ color: '#94a3b8', background: 'rgba(148, 163, 184, 0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>{val} Neut</span>;
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={16} color="#10b981" className="pulse-dot" style={{ width: '8px', height: '8px' }} />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
            Live Stream Feed {filterTopic && topicName ? `(${topicName})` : '(Global)'}
          </h3>
        </div>

        <button 
          onClick={() => setFilterTopic(!filterTopic)}
          style={{
            background: filterTopic ? 'rgba(59, 130, 246, 0.15)' : '#1e293b',
            color: filterTopic ? '#60a5fa' : 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Filter size={11} />
          {filterTopic ? 'Filter: Topic' : 'Filter: All'}
        </button>
      </div>

      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, paddingRight: '4px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px' }}>
            No incoming posts detected in this observation window.
          </div>
        ) : (
          posts.map((p, idx) => (
            <div 
              key={p.post_id || idx}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.8rem',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: '0.65rem', fontWeight: 700 }}>
                    {p.author_name ? p.author_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{p.author_name}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    {p.author_followers ? `${(p.author_followers / 1000).toFixed(0)}k` : '1k'}
                  </span>
                </div>
                {getSentimentPill(p.sentiment)}
              </div>

              <p style={{ color: '#cbd5e1', lineHeight: 1.35, fontSize: '0.78rem', marginBottom: '6px' }}>
                {p.text}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Heart size={11} color="#fb7185" /> {p.likes || 0}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Repeat size={11} color="#34d399" /> {p.retweets || 0}
                  </span>
                  {p.is_retweet && (
                    <span style={{ color: '#60a5fa', fontSize: '0.66rem' }}>
                      via @{p.retweet_of_user}
                    </span>
                  )}
                </div>
                <span style={{ color: '#64748b' }}>{p.topic_name}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
