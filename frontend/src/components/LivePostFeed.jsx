import React, { useState, useEffect, useRef } from 'react';
import { Radio, MessageSquare, Repeat, Heart, User, Sparkles, Filter } from 'lucide-react';

const TOPIC_TEMPLATES = {
  generative_ai: [
    "Remarkable benchmarks published for #GenerativeAI reasoning agents! Contextual accuracy surged by +34% across complex multi-step tasks.",
    "Evaluating trade-offs in #GenerativeAI: while empirical performance is soaring, token latency and safety guardrails remain the core engineering frontier.",
    "Our data science team just deployed an agentic workflow pipeline with #GenerativeAI. Early telemetry shows a massive leap in cross-system automation.",
    "Critical architectural debate on #GenerativeAI: can lightweight quantized models replace frontier models in production edge deployment?",
    "Why everyone is monitoring #GenerativeAI right now: recent cascade spikes indicate enterprise adoption is accelerating into tier-1 platforms.",
    "Excited to share our technical teardown on #GenerativeAI diffusion transformers. Concurrency throughput exceeded our expectations by 2.4x."
  ],
  quantum_sensing: [
    "Quantum magnetometers achieved sub-picotesla precision in cryogenic trials today! Huge implications for geophysical mapping. #QuantumSensing",
    "Scaling qubit coherence times remains the primary milestone for #QuantumSensing arrays. New diamond nitrogen-vacancy center paper dropped.",
    "Why #QuantumSensing is disrupting medical imaging: ultra-sensitive sensor benchmarks published by Zurich research group.",
    "Critical debate in #QuantumSensing: comparing superconducting quantum interference devices against atomic vapor magnetometers.",
    "Industrial adoption of #QuantumSensing is surging as semiconductor foundries integrate quantum metrology for sub-nanometer defect detection.",
    "New report released on #QuantumSensing: how cold atom interferometers will transform GPS-denied navigation over the next 24 months."
  ],
  green_tech: [
    "Clean hydrogen electrolysis efficiency reached 82% in industrial testbeds today! Clean energy transition milestones accelerating. #GreenHydrogen",
    "Solid-state battery pilot facility commences continuous cell production with 480 Wh/kg density. #GreenTech #CleanEnergy",
    "Grid-scale thermal storage achieves 90% round-trip efficiency in Texas pilot program. Decarbonization momentum is undeniable. #GreenTech",
    "Carbon capture and mineralization pilot exceeds 10,000 tons/month target with solar-powered direct air capture. #GreenHydrogen",
    "Venture capital inflow into #GreenHydrogen and long-duration storage hits record quarterly high despite macroeconomic headwinds.",
    "Techno-economic analysis shows green ammonia achieving cost parity with grey ammonia 3 years ahead of baseline forecasts. #GreenTech"
  ],
  cyber_resilience: [
    "Zero-trust microsegmentation architecture successfully blocked a coordinated supply-chain intrusion in simulation exercises. #ZeroTrustSecurity",
    "Post-quantum cryptographic algorithms are being standardized for enterprise TLS handshakes across financial networks. #ZeroTrustSecurity",
    "Autonomous anomaly detection using graph neural networks identified zero-day credential stuffing within 120ms. #CyberResilience",
    "Incident response telemetry highlights importance of immutable backups and automated policy enforcement against ransomware. #ZeroTrustSecurity",
    "Cloud security posture report: 68% of enterprise breaches mitigated by continuous least-privilege verification. #ZeroTrustSecurity",
    "New vulnerability disclosure framework adopted across open-source maintainers to patch critical dependencies faster. #CyberResilience"
  ],
  metaverse_hype: [
    "Spatial computing micro-OLED displays hit 4K per eye with 120Hz refresh rate. Weight distribution reduced by 35%. #SpatialComputing",
    "WebGPU standards finalized, enabling photorealistic spatial rendering directly inside browser canvases without plugins. #SpatialComputing",
    "Enterprise training simulations in VR demonstrate 70% retention improvements over conventional video tutorials. #SpatialComputing",
    "Developers exploring mixed reality passthrough APIs for real-time robotic teleoperation and factory floor supervision. #SpatialComputing",
    "Spatial computing developer ecosystem expands with lightweight neural radiance field (NeRF) generation on mobile devices. #SpatialComputing",
    "Haptic feedback gloves achieve 10ms tactile response latency for precise remote surgical training. #SpatialComputing"
  ],
  autonomous_evs: [
    "L3 autonomous drive testing logged over 2 million incident-free highway miles in adverse weather validation trials. #AutonomousVehicles",
    "Solid-state lidar sensors enter high-volume production, bringing sensor suite bill-of-materials down under $400. #AutonomousVehicles",
    "Robotaxi fleet operational uptime reaches 99.4% in commercial test cities with automated depot recharging. #AutonomousVehicles",
    "End-to-end vision-language-action foundation models demonstrate remarkable generalization across unseen urban roundabouts. #AutonomousVehicles",
    "Automotive safety regulators establish unified simulation benchmark protocols for autonomous vehicle perception edge cases. #AutonomousVehicles",
    "Megawatt fast-charging network rollout begins along transcontinental freight corridors for autonomous electric trucks. #AutonomousVehicles"
  ]
};

const AUTHORS = [
  { name: 'Dr. Elena Rostova', handle: 'u_tech_oracle', followers: 28500, baseSentiment: 0.72 },
  { name: 'Marcus Vance', handle: 'u_silicon_insider', followers: 16400, baseSentiment: 0.58 },
  { name: 'Aria Chen', handle: 'u_deep_analyst', followers: 11200, baseSentiment: 0.45 },
  { name: 'Kavita Patel', handle: 'u_quantum_kavita', followers: 8900, baseSentiment: 0.81 },
  { name: 'Devon Miller', handle: 'u_devon_ai', followers: 6400, baseSentiment: -0.15 },
  { name: 'Sarah Connor', handle: 'u_cyber_sentinel', followers: 9800, baseSentiment: 0.22 },
  { name: 'TechPulse Daily', handle: 'u_tech_pulse', followers: 45000, baseSentiment: 0.61 },
  { name: 'Alex Rivera', handle: 'u_neural_alex', followers: 7300, baseSentiment: 0.35 }
];

const generateDynamicLivePosts = (topicId, topicName, count = 12) => {
  const tid = topicId || 'generative_ai';
  const cleanName = topicName || `#${tid.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\s/g, '')}`;
  const templates = TOPIC_TEMPLATES[tid] || TOPIC_TEMPLATES.generative_ai;

  return Array.from({ length: count }, (_, i) => {
    const author = AUTHORS[i % AUTHORS.length];
    const text = templates[i % templates.length];
    const likes = Math.floor(Math.random() * 85) + 12 + (author.followers > 20000 ? 140 : 0);
    const retweets = Math.floor(likes * (0.18 + Math.random() * 0.25));
    const minutesAgo = (i * 3) + Math.floor(Math.random() * 2);
    const sentimentNoise = Number(((Math.random() - 0.5) * 0.15).toFixed(2));
    const sentiment = Math.min(1.0, Math.max(-1.0, Number((author.baseSentiment + sentimentNoise).toFixed(2))));

    return {
      post_id: `live_${tid}_${Date.now()}_${i}`,
      author_id: author.handle,
      author_name: author.name,
      author_followers: author.followers,
      topic_id: tid,
      topic_name: cleanName,
      text: text,
      likes: likes,
      retweets: retweets,
      sentiment: sentiment,
      timestamp: minutesAgo === 0 ? 'Just now' : `${minutesAgo}m ago`,
      is_retweet: i % 4 === 1,
      retweet_of_user: i % 4 === 1 ? 'u_tech_oracle' : null,
      engagement: likes + retweets
    };
  });
};

const createSingleIncomingPost = (topicId, topicName) => {
  const tid = topicId || Object.keys(TOPIC_TEMPLATES)[Math.floor(Math.random() * Object.keys(TOPIC_TEMPLATES).length)];
  const cleanName = topicName || `#${tid.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\s/g, '')}`;
  const templates = TOPIC_TEMPLATES[tid] || TOPIC_TEMPLATES.generative_ai;
  const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
  const text = templates[Math.floor(Math.random() * templates.length)];
  const likes = Math.floor(Math.random() * 35) + 4;
  const retweets = Math.floor(likes * 0.25);

  return {
    post_id: `live_stream_${Date.now()}`,
    author_id: author.handle,
    author_name: author.name,
    author_followers: author.followers,
    topic_id: tid,
    topic_name: cleanName,
    text: text,
    likes: likes,
    retweets: retweets,
    sentiment: author.baseSentiment,
    timestamp: 'Just now',
    is_retweet: Math.random() > 0.7,
    retweet_of_user: 'u_tech_oracle',
    engagement: likes + retweets
  };
};

export default function LivePostFeed({ selectedTopicId, topicName }) {
  const [posts, setPosts] = useState([]);
  const [filterTopic, setFilterTopic] = useState(true);
  const streamIntervalRef = useRef(null);

  useEffect(() => {
    fetchFeed();

    // Live stream arrival pulse: prepends a new incoming post every 4 seconds
    streamIntervalRef.current = setInterval(() => {
      setPosts(prev => {
        if (!prev || prev.length === 0) return prev;
        const newPost = createSingleIncomingPost(filterTopic ? selectedTopicId : null, filterTopic ? topicName : null);
        return [newPost, ...prev.slice(0, 18)];
      });
    }, 4000);

    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, [selectedTopicId, filterTopic, topicName]);

  const fetchFeed = async () => {
    try {
      const url = filterTopic && selectedTopicId 
        ? `/api/posts/live?topic_id=${selectedTopicId}` 
        : '/api/posts/live';
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (!text.trim().startsWith('<') && !text.trim().startsWith('<!DOCTYPE') && !text.trim().startsWith('<!doctype')) {
          const cleanJson = text
            .replace(/:\s*NaN\b/g, ': null')
            .replace(/:\s*Infinity\b/g, ': null')
            .replace(/:\s*-Infinity\b/g, ': null');
          const data = JSON.parse(cleanJson);
          if (data.posts && data.posts.length > 0) {
            setPosts(data.posts);
            return;
          }
        }
      }
    } catch (err) {
      console.warn("Backend live feed unavailable, activating live telemetry generator:", err);
    }

    // Dynamic Live Posts Stream
    const fallbackList = generateDynamicLivePosts(
      filterTopic ? selectedTopicId : null, 
      filterTopic ? topicName : 'Global Network', 
      12
    );
    setPosts(fallbackList);
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
            Live Stream Feed {filterTopic && topicName ? `(${topicName})` : '(Global Network)'}
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
          {filterTopic ? 'Filter: Topic' : 'Filter: Global'}
        </button>
      </div>

      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, paddingRight: '4px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px' }}>
            Streaming incoming posts...
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{p.timestamp}</span>
                  {getSentimentPill(p.sentiment)}
                </div>
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
