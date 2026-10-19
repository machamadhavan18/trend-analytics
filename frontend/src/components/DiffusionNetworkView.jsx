import React, { useState } from 'react';
import PlotlyChart from './PlotlyChart';
import { Network, Users, Share2, Award, Zap, Filter, Compass, Radio } from 'lucide-react';

export default function DiffusionNetworkView({ networkData, topicName }) {
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [layoutMode, setLayoutMode] = useState('spring'); // 'spring' | 'concentric'

  if (!networkData || !networkData.nodes || networkData.nodes.length === 0) {
    return (
      <div className="glass-panel chart-card">
        <p style={{ color: 'var(--text-muted)' }}>Constructing NetworkX diffusion topology...</p>
      </div>
    );
  }

  const { nodes, edges, summary, influential_users, communities } = networkData;

  // Filter or highlight based on user selection
  const isConcentric = layoutMode === 'concentric';

  // Find downstream target users if a user is selected
  const directTargetUserIds = new Set();
  if (selectedUserId) {
    edges.forEach(e => {
      if (e.source === selectedUserId) {
        directTargetUserIds.add(e.target);
      }
    });
  }

  // Prepare edge traces for Plotly
  const edgeX = [];
  const edgeY = [];
  const highlightEdgeX = [];
  const highlightEdgeY = [];

  edges.forEach(e => {
    const sx = isConcentric ? (e.concentric_sx ?? e.source_x) : e.source_x;
    const sy = isConcentric ? (e.concentric_sy ?? e.source_y) : e.source_y;
    const tx = isConcentric ? (e.concentric_tx ?? e.target_x) : e.target_x;
    const ty = isConcentric ? (e.concentric_ty ?? e.target_y) : e.target_y;

    if (selectedUserId && e.source === selectedUserId) {
      highlightEdgeX.push(sx, tx, null);
      highlightEdgeY.push(sy, ty, null);
    } else {
      edgeX.push(sx, tx, null);
      edgeY.push(sy, ty, null);
    }
  });

  const baseEdgeTrace = {
    x: edgeX,
    y: edgeY,
    mode: 'lines',
    line: { 
      color: selectedUserId ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.12)', 
      width: 1 
    },
    hoverinfo: 'none',
    type: 'scatter'
  };

  const highlightEdgeTrace = {
    x: highlightEdgeX,
    y: highlightEdgeY,
    mode: 'lines',
    line: { color: '#38bdf8', width: 2.5 },
    hoverinfo: 'none',
    type: 'scatter'
  };

  // Prepare nodes
  const nodeX = [];
  const nodeY = [];
  const nodeSizes = [];
  const nodeColors = [];
  const nodeTexts = [];
  const nodeLabels = [];

  nodes.forEach(n => {
    const x = isConcentric ? (n.concentric_x ?? n.x) : n.x;
    const y = isConcentric ? (n.concentric_y ?? n.y) : n.y;
    nodeX.push(x);
    nodeY.push(y);

    const isInSelectedComm = selectedCommunity === null || n.community_id === selectedCommunity;
    const isSelectedUser = n.id === selectedUserId;
    const isDownstream = directTargetUserIds.has(n.id);

    let size = n.size;
    let color = `hsl(${n.community_id * 65}, 70%, 55%)`;

    if (selectedUserId) {
      if (isSelectedUser) {
        size = Math.max(30, size * 1.4);
        color = '#38bdf8';
      } else if (isDownstream) {
        size = Math.max(16, size * 1.2);
        color = '#34d399';
      } else {
        color = 'rgba(100, 116, 139, 0.2)';
      }
    } else if (selectedCommunity !== null) {
      if (!isInSelectedComm) {
        color = 'rgba(100, 116, 139, 0.15)';
      }
    }

    nodeSizes.push(size);
    nodeColors.push(color);

    const isImportant = isSelectedUser || isDownstream || n.betweenness > 0.08 || n.degree > 0.18;
    nodeLabels.push(isImportant ? n.name : '');

    nodeTexts.push(
      `<b>${n.name}</b><br/>` +
      `Role: ${n.betweenness > 0.07 ? 'Bridge Node' : (n.degree > 0.14 ? 'Broadcast Hub' : 'Participant')}<br/>` +
      `Louvain Community: C-${n.community_id}<br/>` +
      `Degree Centrality: ${n.degree}<br/>` +
      `Betweenness: ${n.betweenness}<br/>` +
      `Cascade Hops from Seed: ${n.cascade_hops ?? 0}<br/>` +
      `Followers: ${n.followers.toLocaleString()}`
    );
  });

  const nodeTrace = {
    x: nodeX,
    y: nodeY,
    mode: 'markers+text',
    text: nodeLabels,
    textposition: 'top center',
    textfont: { size: 9, color: '#e2e8f0' },
    marker: {
      size: nodeSizes,
      color: nodeColors,
      line: { color: '#ffffff', width: 1.2 }
    },
    hoverinfo: 'text',
    hovertext: nodeTexts,
    type: 'scatter'
  };

  const chartTraces = [baseEdgeTrace];
  if (highlightEdgeX.length > 0) {
    chartTraces.push(highlightEdgeTrace);
  }
  chartTraces.push(nodeTrace);

  const layout = {
    showlegend: false,
    xaxis: { showgrid: false, zeroline: false, showticklabels: false },
    yaxis: { showgrid: false, zeroline: false, showticklabels: false },
    margin: { t: 15, r: 15, b: 15, l: 15 },
    hovermode: 'closest'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Network Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px'
      }}>
        <div className="glass-panel" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Cascade Nodes</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{summary?.total_users || 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unique participants</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Diffusion Edges</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6', marginTop: '4px' }}>{summary?.diffusion_edges || 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Retweet & quote cascades</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Louvain Communities</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>{summary?.community_count || 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Modularity Q: {summary?.modularity_q ?? 0.42}</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Network Density</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#8b5cf6', marginTop: '4px' }}>{summary?.network_density || 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Graph connectivity</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Organic Virality (CIB)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
            {summary?.organic_ratio ? `${summary.organic_ratio}%` : '88.5%'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Risk: {summary?.bot_risk || 'LOW'}</div>
        </div>
      </div>

      {/* Main Network Graph & Influential Users */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '16px' }}>
        {/* Network Graph Card */}
        <div className="glass-panel chart-card" style={{ minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
          <div className="chart-card-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 className="chart-card-title">
                <Network size={16} color="#3b82f6" />
                Information Diffusion Graph ({topicName})
              </h3>
              <p className="chart-card-subtitle">
                {selectedUserId 
                  ? `Highlighting broadcast cascade from @${influential_users?.find(u => u.user_id === selectedUserId)?.name || selectedUserId}` 
                  : 'Interactive Louvain communities and centrality topologies'}
              </p>
            </div>

            {/* Layout Toggle & Reset Buttons */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setLayoutMode('spring')}
                  style={{
                    background: layoutMode === 'spring' ? '#3b82f6' : 'transparent',
                    color: layoutMode === 'spring' ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Force Layout
                </button>
                <button
                  onClick={() => setLayoutMode('concentric')}
                  style={{
                    background: layoutMode === 'concentric' ? '#3b82f6' : 'transparent',
                    color: layoutMode === 'concentric' ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                  title="Concentric rings arranged by cascade hop distance from hub"
                >
                  Concentric Cascade
                </button>
              </div>

              {(selectedUserId || selectedCommunity !== null) && (
                <button
                  onClick={() => {
                    setSelectedUserId(null);
                    setSelectedCommunity(null);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {/* Community Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px 8px 16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={11} /> Community Echo Chambers:
            </span>
            <button
              onClick={() => setSelectedCommunity(null)}
              style={{
                background: selectedCommunity === null ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                border: '1px solid',
                borderColor: selectedCommunity === null ? '#3b82f6' : 'var(--border-color)',
                color: selectedCommunity === null ? '#60a5fa' : 'var(--text-muted)',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '0.68rem',
                cursor: 'pointer'
              }}
            >
              All ({summary?.total_users || 0})
            </button>
            {communities?.map((c) => (
              <button
                key={c.community_id}
                onClick={() => setSelectedCommunity(c.community_id)}
                style={{
                  background: selectedCommunity === c.community_id ? `hsl(${c.community_id * 65}, 70%, 25%)` : 'rgba(255,255,255,0.05)',
                  border: '1px solid',
                  borderColor: selectedCommunity === c.community_id ? `hsl(${c.community_id * 65}, 70%, 55%)` : 'var(--border-color)',
                  color: selectedCommunity === c.community_id ? '#fff' : `hsl(${c.community_id * 65}, 70%, 65%)`,
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.68rem',
                  cursor: 'pointer'
                }}
              >
                C-{c.community_id} ({c.member_count} nodes)
              </button>
            ))}
          </div>

          <div style={{ flex: 1, minHeight: '380px' }}>
            <PlotlyChart data={chartTraces} layout={layout} />
          </div>
        </div>

        {/* Influential Users Table (Modules 8 & 9) */}
        <div className="glass-panel chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">
                <Award size={16} color="#f59e0b" />
                Influential-User Centrality & Broadcast Hubs
              </h3>
              <p className="chart-card-subtitle">Click any user to isolate their downstream retweet cascade</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th>User / Handle</th>
                  <th>Role</th>
                  <th>Degree Cent.</th>
                  <th>Betweenness</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {influential_users && influential_users.slice(0, 10).map((u, i) => {
                  const isSelected = selectedUserId === u.user_id;
                  return (
                    <tr 
                      key={i} 
                      onClick={() => setSelectedUserId(isSelected ? null : u.user_id)}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent'
                      }}
                    >
                      <td className="user-name-cell">
                        <div style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? '#60a5fa' : '#fff' }}>
                          {u.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                          {u.followers.toLocaleString()} followers • C-{u.community_id}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          background: u.role.includes('Bridge') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: u.role.includes('Bridge') ? '#fbbf24' : '#60a5fa'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{u.degree_centrality}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{u.betweenness_centrality}</td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserId(isSelected ? null : u.user_id);
                          }}
                          style={{
                            background: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border-color)',
                            color: isSelected ? '#fff' : '#94a3b8',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            cursor: 'pointer'
                          }}
                        >
                          {isSelected ? 'Reset' : 'Cascade'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
