import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, VolumeX, Sparkles, Activity, Music, RefreshCw, Layers, Award } from 'lucide-react';

const TALA_CYCLES = [
  { id: 'adi', name: 'Adi Tala (8 Matras)', totalBeats: 8, structure: ['Ta (Samam)', 'Dhi', 'Thom', 'Nam', 'Ta', 'Ka', 'Dhi', 'Mi'], accents: [0, 4, 6] },
  { id: 'rupaka', name: 'Rupaka Tala (6 Matras)', totalBeats: 6, structure: ['Dhritham (1)', 'Dhritham (2)', 'Ta', 'Ka', 'Dhi', 'Mi'], accents: [0, 2] },
  { id: 'misra_chapu', name: 'Misra Chapu (7 Matras)', totalBeats: 7, structure: ['Ta', 'Ki', 'Ta', 'Ta', 'Ka', 'Dhi', 'Mi'], accents: [0, 3, 5] },
  { id: 'khanda_chapu', name: 'Khanda Chapu (5 Matras)', totalBeats: 5, structure: ['Ta', 'Ka', 'Ta', 'Ki', 'Ta'], accents: [0, 2] },
  { id: 'teental', name: 'Teental (16 Matras - Kathak)', totalBeats: 16, structure: ['Dha (Sam)', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Tin', 'Tin', 'Ta (Khali)', 'Ta', 'Dhin', 'Dhin', 'Dha'], accents: [0, 4, 8, 12] },
];

export default function TalaMetronome() {
  const [selectedTala, setSelectedTala] = useState(TALA_CYCLES[0]);
  const [bpm, setBpm] = useState(72);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Tap Tempo state
  const [tapTimes, setTapTimes] = useState([]);
  const [footworkScore, setFootworkScore] = useState(94);

  const audioContextRef = useRef(null);
  const timerRef = useRef(null);

  // Play synthetic Nattuvangam woodblock beat
  const playClick = (isAccent) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isAccent ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(isAccent ? 880 : 440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(isAccent ? 0.9 : 0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.log('AudioContext note:', e);
    }
  };

  // Metronome Interval Loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    timerRef.current = setInterval(() => {
      setCurrentBeat(prev => {
        const next = (prev + 1) % selectedTala.totalBeats;
        const isAccent = selectedTala.accents.includes(next);
        playClick(isAccent);
        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, selectedTala, soundEnabled]);

  // Tap tempo handler
  const handleTapTempo = () => {
    const now = Date.now();
    const newTaps = [...tapTimes.slice(-3), now];
    setTapTimes(newTaps);

    if (newTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        setBpm(calculatedBpm);
      }
    }
  };

  const isCurrentAccent = selectedTala.accents.includes(currentBeat);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header Banner */}
      <div className="temple-panel" style={{ padding: '2.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-gold"><Sparkles size={13} /> Nattuvangam & Laya AI</span>
            <span className="badge badge-purple">Multi-Tala Rhythmic Synthesizer</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Tala & Rhythm Metronome Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.4rem' }}>
            Acoustic Nattuvangam Beat Synthesizer, Matra Pulse Tracking & Footwork Synchronizer
          </p>
        </div>

        {/* Tala Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <label style={{ fontWeight: 700, color: 'var(--gold-dark)', fontSize: '0.86rem', textTransform: 'uppercase' }}>
            Tala:
          </label>
          <select 
            value={selectedTala.id} 
            onChange={(e) => {
              const t = TALA_CYCLES.find(x => x.id === e.target.value);
              if (t) {
                setSelectedTala(t);
                setCurrentBeat(0);
              }
            }}
            className="form-select"
            style={{ width: '220px', background: '#f8fafc', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '6px 10px', fontSize: '0.9rem' }}
          >
            {TALA_CYCLES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Interactive Visual Metronome Engine */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', alignItems: 'center', borderTop: '4px solid var(--gold-primary)' }}>
          
          {/* Circular Beat Display */}
          <div style={{
            position: 'relative',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: isCurrentAccent ? 'radial-gradient(circle, #fef3c7 0%, #ffffff 70%)' : '#f8fafc',
            border: `3px solid ${isCurrentAccent ? 'var(--gold-light)' : '#e2e8f0'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isCurrentAccent ? '0 4px 20px rgba(217, 119, 6, 0.15)' : 'var(--shadow-sm)',
            transition: 'all 0.1s ease'
          }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Matra Beat
            </span>
            <div style={{ fontSize: '4.2rem', fontWeight: 800, color: isCurrentAccent ? 'var(--gold-dark)' : 'var(--text-primary)', lineHeight: 1 }}>
              {currentBeat + 1}
            </div>
            <span style={{ fontSize: '0.9rem', color: isCurrentAccent ? 'var(--gold-dark)' : 'var(--text-secondary)', fontWeight: 600 }}>
              {selectedTala.structure[currentBeat] || 'Beat'}
            </span>
          </div>

          {/* Matras Beat Grid Indicators */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '360px' }}>
            {selectedTala.structure.map((label, idx) => {
              const isBeat = currentBeat === idx;
              const isAccent = selectedTala.accents.includes(idx);
              return (
                <div
                  key={idx}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.84rem',
                    fontWeight: isBeat ? 800 : 600,
                    color: isBeat ? '#ffffff' : (isAccent ? 'var(--gold-dark)' : 'var(--text-secondary)'),
                    background: isBeat ? 'var(--grad-primary)' : (isAccent ? 'var(--gold-bg)' : '#f8fafc'),
                    border: isAccent ? '1.5px solid var(--gold-light)' : '1px solid var(--border-subtle)',
                    boxShadow: isBeat ? '0 2px 8px rgba(15, 23, 42, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title={label}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '360px' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-primary"
              style={{ flex: 1, padding: '12px', fontSize: '1rem' }}
            >
              {isPlaying ? (
                <>
                  <Square size={18} /> Stop Tala
                </>
              ) : (
                <>
                  <Play size={18} /> Start Tala
                </>
              )}
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="btn-secondary"
              style={{ padding: '12px', fontSize: '0.9rem' }}
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 size={18} color="var(--gold-light)" /> : <VolumeX size={18} />}
            </button>
          </div>

        </div>

        {/* Right Column: Tempo Controls & Footwork Sync */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Tempo Controls Card */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--purple-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Music size={18} color="var(--purple-primary)" />
                Tempo / Laya Speed
              </h3>
              <span className="badge badge-purple" style={{ fontSize: '0.8rem' }}>
                {bpm} BPM
              </span>
            </div>

            {/* Speed Presets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { label: 'Vilamba (Slow)', val: 60 },
                { label: 'Madhyama (Medium)', val: 84 },
                { label: 'Druta (Fast)', val: 112 }
              ].map(preset => (
                <button
                  key={preset.val}
                  onClick={() => setBpm(preset.val)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: bpm === preset.val ? '1.5px solid var(--purple-primary)' : '1px solid var(--border-subtle)',
                    background: bpm === preset.val ? 'rgba(168, 85, 247, 0.12)' : '#f8fafc',
                    color: bpm === preset.val ? 'var(--purple-primary)' : 'var(--text-secondary)',
                    fontWeight: bpm === preset.val ? 800 : 600,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* BPM Slider */}
            <div>
              <input
                type="range"
                min="40"
                max="200"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--purple-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>40 BPM</span>
                <span>120 BPM</span>
                <span>200 BPM</span>
              </div>
            </div>

            {/* Tap Tempo Button */}
            <button
              onClick={handleTapTempo}
              className="btn-secondary"
              style={{ width: '100%', padding: '10px', fontSize: '0.88rem', borderColor: 'var(--purple-primary)', color: 'var(--purple-primary)' }}
            >
              <Activity size={16} /> Tap Tempo (Click to set rhythm)
            </button>
          </div>

          {/* Tala Structure Breakdown Card */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--gold-primary)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
              {selectedTala.name} Structure
            </h3>
            
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedTala.structure.map((syllable, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: selectedTala.accents.includes(i) ? 'var(--gold-bg)' : '#ffffff',
                      color: selectedTala.accents.includes(i) ? 'var(--gold-dark)' : 'var(--text-secondary)',
                      border: selectedTala.accents.includes(i) ? '1px solid #fde68a' : '1px solid var(--border-subtle)',
                      fontSize: '0.78rem',
                      fontWeight: selectedTala.accents.includes(i) ? 700 : 500
                    }}
                  >
                    {i + 1}. {syllable}
                  </span>
                ))}
              </div>
            </div>
          </div>


        </div>

      </div>

    </div>
  );
}
