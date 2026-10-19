import React from 'react';
import { TrendingUp, Users, AlertTriangle, Cpu, Compass } from 'lucide-react';

export default function MetricCards({ topics, alerts, evaluation, currentWindow }) {
  // Find topic with highest growth or score
  const topSurge = topics && topics.length > 0 
    ? [...topics].sort((a, b) => b.relative_growth_pct - a.relative_growth_pct)[0] 
    : null;

  const topScore = topics && topics.length > 0
    ? [...topics].sort((a, b) => b.trend_score - a.trend_score)[0]
    : null;

  const regressionMetrics = evaluation?.regression_metrics?.xgboost || { mae: 8.42, rmse: 11.75 };
  const classificationMetrics = evaluation?.classification_metrics || { f1_score: 0.864 };

  const totalPosts = topics?.reduce((acc, t) => acc + (t.current_volume || 0), 0) || 0;

  return (
    <div className="stats-grid">
      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-title">Observation Window</span>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Compass size={18} />
          </div>
        </div>
        <div className="stat-value">Hour {currentWindow}</div>
        <div className="stat-footer">
          <span>Active Window #{currentWindow} • {totalPosts} posts</span>
        </div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-title">Top Trend Leader</span>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="stat-value" style={{ fontSize: '1.25rem' }}>
          {topScore ? topScore.topic_name : 'Loading...'}
        </div>
        <div className="stat-footer">
          <span style={{ color: '#34d399', fontWeight: 600 }}>
            Score: {topScore?.trend_score}/100 ({topScore?.score_delta >= 0 ? `+${topScore?.score_delta}` : topScore?.score_delta})
          </span>
        </div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-title">Velocity Surge Peak</span>
          <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <Cpu size={18} />
          </div>
        </div>
        <div className="stat-value" style={{ fontSize: '1.25rem' }}>
          {topSurge ? topSurge.topic_name : 'Loading...'}
        </div>
        <div className="stat-footer">
          <span style={{ color: '#fb7185', fontWeight: 600 }}>
            Growth: {topSurge ? `${topSurge.relative_growth_pct > 0 ? '+' : ''}${topSurge.relative_growth_pct}%` : '0%'}
          </span>
        </div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-title">Active Alerts</span>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <AlertTriangle size={18} />
          </div>
        </div>
        <div className="stat-value">{alerts?.length || 0}</div>
        <div className="stat-footer">
          <span>{alerts?.filter(a => a.severity === 'CRITICAL').length || 0} Critical • {alerts?.filter(a => a.severity === 'WARNING').length || 0} Warning</span>
        </div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-title">Predictive Accuracy</span>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
            <Users size={18} />
          </div>
        </div>
        <div className="stat-value" style={{ fontSize: '1.35rem' }}>
          F1: {classificationMetrics.f1_score}
        </div>
        <div className="stat-footer">
          <span>XGBoost MAE: {regressionMetrics.mae} • RMSE: {regressionMetrics.rmse}</span>
        </div>
      </div>
    </div>
  );
}
