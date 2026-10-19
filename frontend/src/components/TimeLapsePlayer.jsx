import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock, Radio, Compass } from 'lucide-react';

export default function TimeLapsePlayer({ 
  currentWindow, 
  activeWindow, 
  onSelectWindow, 
  onJumpToLive 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1200); // ms per step
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        onSelectWindow((prev) => {
          if (prev >= currentWindow - 1) {
            setIsPlaying(false);
            return currentWindow - 1;
          }
          return prev + 1;
        });
      }, playSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentWindow, playSpeed]);

  const isLive = activeWindow >= currentWindow - 1;

  const togglePlay = () => {
    if (isLive && !isPlaying) {
      // If at the end, restart from beginning
      onSelectWindow(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '12px',
      padding: '10px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    }}>
      {/* Left Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: isLive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          color: isLive ? '#34d399' : '#fbbf24',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.72rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {isLive ? (
            <>
              <span className="pulse-dot" style={{ background: '#10b981' }} />
              LIVE TELEMETRY
            </>
          ) : (
            <>
              <Clock size={12} />
              TIME-LAPSE REPLAY: HOUR {activeWindow + 1}
            </>
          )}
        </div>

        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Viewing: <strong style={{ color: '#fff' }}>Window #{activeWindow}</strong> of {currentWindow - 1}
        </div>
      </div>

      {/* Center Scrubber Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
        <button
          onClick={togglePlay}
          className={`btn ${isPlaying ? 'btn-danger' : 'btn-primary'}`}
          style={{ padding: '6px 12px', fontSize: '0.74rem', whiteSpace: 'nowrap' }}
          title={isPlaying ? "Pause replay" : "Play 24-hour time-lapse replay"}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          {isPlaying ? "Pause" : (isLive ? "Replay 24h" : "Play Replay")}
        </button>

        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>H0</span>
        <input
          type="range"
          min="0"
          max={Math.max(0, currentWindow - 1)}
          value={activeWindow}
          onChange={(e) => {
            setIsPlaying(false);
            onSelectWindow(parseInt(e.target.value));
          }}
          style={{
            flex: 1,
            accentColor: isLive ? '#10b981' : '#3b82f6',
            cursor: 'pointer'
          }}
        />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>H{currentWindow - 1}</span>
      </div>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Speed toggle */}
        <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '2px' }}>
          {[1200, 600, 300].map((spd, idx) => (
            <button
              key={spd}
              onClick={() => setPlaySpeed(spd)}
              style={{
                background: playSpeed === spd ? 'rgba(59, 130, 246, 0.4)' : 'transparent',
                color: playSpeed === spd ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {idx === 0 ? '1x' : (idx === 1 ? '2x' : '4x')}
            </button>
          ))}
        </div>

        {!isLive && (
          <button
            onClick={() => {
              setIsPlaying(false);
              onJumpToLive();
            }}
            className="btn btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              color: '#34d399',
              borderColor: 'rgba(16, 185, 129, 0.4)',
              background: 'rgba(16, 185, 129, 0.1)'
            }}
          >
            <Radio size={12} />
            Jump to Live
          </button>
        )}
      </div>
    </div>
  );
}
