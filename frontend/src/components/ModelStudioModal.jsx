import React, { useState, useEffect } from 'react';
import { Sliders, X, RotateCcw, Check, Sparkles, AlertCircle, Cpu, TrendingUp, Network, BarChart, Heart } from 'lucide-react';

export default function ModelStudioModal({ isOpen, onClose, onWeightsUpdated }) {
  const [weights, setWeights] = useState({
    growth_velocity: 0.35,
    acceleration: 0.25,
    network_spread: 0.20,
    volume_scale: 0.10,
    sentiment_intensity: 0.10
  });

  const [horizon, setHorizon] = useState(6);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/config/weights')
        .then(r => r.json())
        .then(data => {
          if (data && data.weights) {
            setWeights(data.weights);
            if (data.horizon_steps) setHorizon(data.horizon_steps);
          }
        })
        .catch(err => console.error("Error loading weights config:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSliderChange = (key, val) => {
    setWeights(prev => ({
      ...prev,
      [key]: parseFloat(val)
    }));
  };

  const totalRaw = Object.values(weights).reduce((a, b) => a + b, 0);

  const applyPreset = (preset) => {
    if (preset === 'balanced') {
      setWeights({
        growth_velocity: 0.35,
        acceleration: 0.25,
        network_spread: 0.20,
        volume_scale: 0.10,
        sentiment_intensity: 0.10
      });
      setHorizon(6);
    } else if (preset === 'viral_breakout') {
      setWeights({
        growth_velocity: 0.45,
        acceleration: 0.35,
        network_spread: 0.10,
        volume_scale: 0.05,
        sentiment_intensity: 0.05
      });
      setHorizon(3);
    } else if (preset === 'enterprise_steady') {
      setWeights({
        growth_velocity: 0.15,
        acceleration: 0.15,
        network_spread: 0.35,
        volume_scale: 0.30,
        sentiment_intensity: 0.05
      });
      setHorizon(12);
    } else if (preset === 'sentiment_polar') {
      setWeights({
        growth_velocity: 0.25,
        acceleration: 0.15,
        network_spread: 0.15,
        volume_scale: 0.10,
        sentiment_intensity: 0.35
      });
      setHorizon(6);
    }
  };

  const handleSaveWeights = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      // Normalize weights to sum exactly to 1.0
      const normWeights = {};
      const sum = totalRaw || 1.0;
      for (const [k, v] of Object.entries(weights)) {
        normWeights[k] = Math.round((v / sum) * 1000) / 1000;
      }

      const res = await fetch('/api/config/weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weights: normWeights,
          horizon_steps: horizon
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg("Scoring model recalculated across all monitored trends!");
        if (onWeightsUpdated) {
          onWeightsUpdated(data);
        }
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Save weights failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/config/reset_weights', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setWeights(data.weights);
        setHorizon(data.horizon_steps);
        setSuccessMsg("Model weights restored to baseline defaults.");
        if (onWeightsUpdated) {
          onWeightsUpdated(data);
        }
        setTimeout(() => setSuccessMsg(''), 1500);
      }
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="glass-panel" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '700px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          background: 'rgba(10, 14, 23, 0.95)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '6px', borderRadius: '8px', color: '#c084fc' }}>
              <Sliders size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Interactive Model Tuning & Scoring Weight Studio
              </h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                Customize Module 4 Weighted Trend Score & XGBoost Prediction Horizon in Real Time
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px', borderRadius: '8px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Formula Representation */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '16px',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
          color: '#cbd5e1'
        }}>
          Score = <span style={{ color: '#60a5fa' }}>w₁·Velocity</span> + <span style={{ color: '#06b6d4' }}>w₂·Accel</span> + <span style={{ color: '#a78bfa' }}>w₃·Diffusion</span> + <span style={{ color: '#f59e0b' }}>w₄·Volume</span> + <span style={{ color: '#ec4899' }}>w₅·Sentiment</span>
        </div>

        {/* Preset Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', alignSelf: 'center' }}>Presets:</span>
          <button onClick={() => applyPreset('balanced')} className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
            ⚖️ Balanced (Standard)
          </button>
          <button onClick={() => applyPreset('viral_breakout')} className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
            🚀 Breakout Hunter
          </button>
          <button onClick={() => applyPreset('enterprise_steady')} className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
            🏢 Steady Institutional
          </button>
          <button onClick={() => applyPreset('sentiment_polar')} className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
            ⚡ Sentiment Catalyst
          </button>
        </div>

        {/* Sliders Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {/* 1. Velocity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
              <span style={{ color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={13} /> Growth Velocity Weight (w_vel)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{weights.growth_velocity.toFixed(2)} ({Math.round((weights.growth_velocity / totalRaw) * 100)}%)</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={weights.growth_velocity}
              onChange={(e) => handleSliderChange('growth_velocity', e.target.value)}
              style={{ width: '100%', accentColor: '#3b82f6' }}
            />
          </div>

          {/* 2. Acceleration */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
              <span style={{ color: '#06b6d4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={13} /> Momentum Acceleration Weight (w_acc)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{weights.acceleration.toFixed(2)} ({Math.round((weights.acceleration / totalRaw) * 100)}%)</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={weights.acceleration}
              onChange={(e) => handleSliderChange('acceleration', e.target.value)}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>

          {/* 3. Network Spread */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
              <span style={{ color: '#a78bfa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Network size={13} /> Network Diffusion / Unique Reach (w_spread)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{weights.network_spread.toFixed(2)} ({Math.round((weights.network_spread / totalRaw) * 100)}%)</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={weights.network_spread}
              onChange={(e) => handleSliderChange('network_spread', e.target.value)}
              style={{ width: '100%', accentColor: '#8b5cf6' }}
            />
          </div>

          {/* 4. Volume Scale */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
              <span style={{ color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart size={13} /> Volume Scale (Logarithmic) (w_vol)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{weights.volume_scale.toFixed(2)} ({Math.round((weights.volume_scale / totalRaw) * 100)}%)</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={weights.volume_scale}
              onChange={(e) => handleSliderChange('volume_scale', e.target.value)}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />
          </div>

          {/* 5. Sentiment Catalyst */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
              <span style={{ color: '#ec4899', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Heart size={13} /> Sentiment Intensity Catalyst (w_sent)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{weights.sentiment_intensity.toFixed(2)} ({Math.round((weights.sentiment_intensity / totalRaw) * 100)}%)</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={weights.sentiment_intensity}
              onChange={(e) => handleSliderChange('sentiment_intensity', e.target.value)}
              style={{ width: '100%', accentColor: '#ec4899' }}
            />
          </div>

          {/* Prediction Horizon Selector */}
          <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
              XGBoost Regressor Forecast Horizon (Steps Ahead)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[3, 6, 12, 24].map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  style={{
                    flex: 1,
                    background: horizon === h ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid',
                    borderColor: horizon === h ? '#60a5fa' : 'var(--border-color)',
                    color: horizon === h ? '#fff' : '#94a3b8',
                    padding: '6px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  +{h} Hours
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleResetDefaults} className="btn btn-secondary" disabled={saving}>
            <RotateCcw size={13} /> Reset Defaults
          </button>

          {successMsg && (
            <span style={{ color: '#34d399', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} /> {successMsg}
            </span>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleSaveWeights} className="btn btn-primary" disabled={saving}>
              <Check size={13} /> {saving ? "Recalculating..." : "Apply & Recalculate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
