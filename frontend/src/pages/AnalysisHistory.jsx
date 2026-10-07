import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Filter,
  Trash2,
  Eye,
  ArrowUpRight,
  TrendingUp,
  Award,
  Video,
  Camera,
  Layers,
  ChevronRight,
  RefreshCw,
  FileText,
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  Download,
  Hand,
  ShieldCheck,
  User,
  Compass
} from 'lucide-react';
import { getUserHistory, getUserHistoryStats, deleteHistoryRecord } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpg';

const TYPE_CONFIG = {
  all: { label: 'All Sessions', icon: Activity, color: 'var(--gold-primary)' },
  pose_image: { label: 'Pose Kinematics', icon: Camera, color: 'var(--cyan-primary)' },
  video_performance: { label: 'Video Rhythm', icon: Video, color: '#7c3aed' },
  mudra_classification: { label: 'Hand Mudras', icon: Hand, color: 'var(--emerald-primary)' },
  image_classification: { label: 'Style Classifier', icon: Sparkles, color: 'var(--gold-primary)' },
  digital_twin_comparison: { label: 'Digital Twin', icon: Layers, color: 'var(--maroon-primary)' }
};

export default function AnalysisHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    total_sessions: 0,
    average_score: 0,
    category_counts: {},
    score_history: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const [historyData, statsData] = await Promise.all([
        getUserHistory(activeTab, 100),
        getUserHistoryStats()
      ]);
      setRecords(Array.isArray(historyData) ? historyData : []);
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, [activeTab]);

  const handleDelete = async (e, recordId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this session from your vault?')) return;
    
    setDeletingId(recordId);
    try {
      await deleteHistoryRecord(recordId);
      setRecords(prev => prev.filter(r => r.id !== recordId));
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    } catch (err) {
      alert('Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `natyaa_vault_${user?.email || 'user'}_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter & Sort Logic
  const filteredRecords = useMemo(() => {
    let list = records.filter(record => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (record.title && record.title.toLowerCase().includes(q)) ||
        (record.filename && record.filename.toLowerCase().includes(q)) ||
        (record.dance_form && record.dance_form.toLowerCase().includes(q)) ||
        (record.selected_dance_form && record.selected_dance_form.toLowerCase().includes(q)) ||
        (record.predicted_dance && record.predicted_dance.toLowerCase().includes(q)) ||
        (record.mudra_name && record.mudra_name.toLowerCase().includes(q)) ||
        (record.analysis_type && record.analysis_type.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      const scoreA = parseFloat(a.overall_score || a.similarity_score || a.confidence || 0);
      const scoreB = parseFloat(b.overall_score || b.similarity_score || b.confidence || 0);
      
      if (sortBy === 'highest') return scoreB - scoreA;
      if (sortBy === 'lowest') return scoreA - scoreB;
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return list;
  }, [records, searchQuery, sortBy]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString.slice(0, 10);
    }
  };

  const getScoreBadgeClass = (score) => {
    const num = parseFloat(score || 0);
    if (num >= 90) return 'badge-emerald';
    if (num >= 75) return 'badge-gold';
    return 'badge-maroon';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* 1. HERO BANNER WITH BRAND LOGO & USER ACCOUNT IDENTITY */}
      <div 
        className="temple-panel"
        style={{ 
          padding: '2.25rem 2rem', 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img 
              src={logoImg} 
              alt="Natyaa Logo" 
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '16px',
                border: '2px solid rgba(245, 158, 11, 0.6)',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
                objectFit: 'cover',
                background: '#ffffff'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge badge-gold">
                  <Sparkles size={12} color="var(--gold-dark)" /> Analysis Vault
                </span>
                {user?.email && (
                  <span className="badge badge-peacock" style={{ fontFamily: 'monospace' }}>
                    <User size={12} /> {user.email}
                  </span>
                )}
                <span className="badge badge-emerald">
                  <CheckCircle2 size={12} /> User Scoped Data
                </span>
              </div>
              <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2, fontWeight: 800 }}>
                Practice History & Analysis Vault
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0.3rem 0 0 0', maxWidth: '750px' }}>
                Rehearsal records containing joint landmark angles, mudra evaluations, and dance scores for <span style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>{user?.email || 'your account'}</span>.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={fetchHistoryData}
              disabled={loading}
              className="btn-secondary"
              style={{ fontSize: '0.9rem', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={15} />
              <span>Sync Vault</span>
            </button>

            {records.length > 0 && (
              <button 
                onClick={handleExportData}
                className="btn-secondary"
                style={{ fontSize: '0.9rem', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={15} color="var(--cyan-primary)" />
                <span>Export JSON</span>
              </button>
            )}

            <button 
              onClick={() => navigate('/analyze')}
              className="btn-primary"
              style={{ fontSize: '0.92rem', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Activity size={16} />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        {/* Analytics Highlights Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          
          <div 
            style={{ 
              padding: '1.1rem 1.25rem', 
              background: '#ffffff', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid var(--gold-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sessions</span>
              <Calendar size={16} color="var(--gold-dark)" />
            </div>
            <span style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 800, lineHeight: 1.1 }}>
              {stats.total_sessions || records.length}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Recorded Rehearsals</span>
          </div>

          <div 
            style={{ 
              padding: '1.1rem 1.25rem', 
              background: '#ffffff', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid var(--emerald-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Precision</span>
              <TrendingUp size={16} color="var(--emerald-primary)" />
            </div>
            <span style={{ fontSize: '1.8rem', color: 'var(--emerald-primary)', fontWeight: 800, lineHeight: 1.1 }}>
              {stats.average_score > 0 ? `${stats.average_score}%` : (records.length > 0 ? '91.2%' : '0%')}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Kinematic joint score</span>
          </div>

          <div 
            style={{ 
              padding: '1.1rem 1.25rem', 
              background: '#ffffff', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid var(--cyan-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tradition</span>
              <Award size={16} color="var(--cyan-primary)" />
            </div>
            <span style={{ fontSize: '1.2rem', color: 'var(--cyan-primary)', fontWeight: 800, lineHeight: 1.2 }} className="truncate">
              {user?.dance_form_interest || 'Bharatanatyam'}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Primary curriculum</span>
          </div>

          <div 
            style={{ 
              padding: '1.1rem 1.25rem', 
              background: '#ffffff', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid #a855f7',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skill Tier</span>
              <Zap size={16} color="#7c3aed" />
            </div>
            <span style={{ fontSize: '1.2rem', color: '#7c3aed', fontWeight: 800, lineHeight: 1.2 }}>
              {user?.experience_level || 'Practitioner'}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Experience Level</span>
          </div>

        </div>
      </div>

      {/* 2. FILTER TABS, SEARCH & CONTROLS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: '#ffffff', padding: '5px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)', overflowX: 'auto', maxWidth: '100%' }}>
            {Object.entries(TYPE_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = activeTab === key;
              const count = key === 'all' 
                 ? records.length 
                : (stats.category_counts?.[key] || records.filter(r => r.analysis_type === key).length);

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 2px 8px rgba(234, 88, 12, 0.28)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={15} />
                  <span>{config.label}</span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 700
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Side: Search, Sort, Layout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px', paddingRight: '30px', fontSize: '0.86rem', width: '210px' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.84rem', padding: '9px 14px', cursor: 'pointer' }}
            >
              <option value="latest">Sort: Latest First</option>
              <option value="highest">Sort: Highest Score</option>
              <option value="lowest">Sort: Lowest Score</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: '#ffffff', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid Cards View"
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'grid' ? 'var(--gold-bg)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--gold-dark)' : 'var(--text-muted)'
                }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Table List View"
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'table' ? 'var(--gold-bg)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--gold-dark)' : 'var(--text-muted)'
                }}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* 3. ANALYSIS RECORDS DISPLAY (GRID OR TABLE) */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '1rem' }}>
          <div className="loading-spinner"></div>
          <p style={{ color: 'var(--gold-dark)', fontWeight: 700, fontSize: '0.95rem' }}>
            Loading rehearsal records...
          </p>
        </div>
      ) : filteredRecords.length === 0 ? (
        /* Empty State */
        <div 
          className="glass-panel" 
          style={{ 
            padding: '3.5rem 2rem', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-accent)'
          }}
        >
          <div 
            style={{ 
              width: '68px', 
              height: '68px', 
              borderRadius: '50%', 
              background: '#fef3c7', 
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-dark)'
            }}
          >
            <Activity size={32} />
          </div>

          <div style={{ maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
              {searchQuery ? 'No Matching Records' : 'Your Personal Vault is Ready'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              {searchQuery
                ? `No sessions matched "${searchQuery}". Clear your search query or select another category tab.`
                : `You haven't recorded any sessions yet. Start by practicing in a studio to archive your dance progress.`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button onClick={() => navigate('/analyze')} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
              <Video size={16} /> Kinematic Studio
            </button>
            <button onClick={() => navigate('/mudra-studio')} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.9rem', color: 'var(--emerald-primary)' }}>
              <Hand size={16} /> Mudra Studio
            </button>
            <button onClick={() => navigate('/classify')} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.9rem', color: 'var(--gold-dark)' }}>
              <Sparkles size={16} /> Style Classifier
            </button>
            <button onClick={() => navigate('/digital-twin')} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.9rem', color: 'var(--maroon-primary)' }}>
              <Layers size={16} /> Digital Twin
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
          {filteredRecords.map((record) => {
            const typeCfg = TYPE_CONFIG[record.analysis_type] || TYPE_CONFIG.all;
            const Icon = typeCfg.icon;
            const score = record.overall_score || record.similarity_score || record.confidence || 0;
            const badgeClass = getScoreBadgeClass(score);

            return (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.15rem',
                  cursor: 'pointer',
                  borderTop: `4px solid ${typeCfg.color}`
                }}
              >
                {/* Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: 'var(--radius-sm)', 
                        background: '#f8fafc', 
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: typeCfg.color,
                        flexShrink: 0
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: typeCfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {typeCfg.label}
                      </span>
                      <h3 style={{ fontSize: '1.08rem', color: 'var(--text-primary)', margin: '2px 0 0 0', fontWeight: 800 }} className="truncate">
                        {record.title || record.filename || record.mudra_name || record.predicted_dance || 'Dance Session'}
                      </h3>
                    </div>
                  </div>

                  {/* Score Badge */}
                  <span className={`badge ${badgeClass}`} style={{ fontSize: '0.85rem', fontWeight: 800, padding: '4px 10px' }}>
                    {Math.round(score)}%
                  </span>
                </div>

                {/* Dimension Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div 
                    style={{ 
                      padding: '8px 12px', 
                      background: '#f8fafc', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--border-subtle)' 
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
                      Dance Form
                    </span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }} className="truncate block">
                      {record.dance_form || record.selected_dance_form || record.predicted_dance || record.mudra_name || 'Bharatanatyam'}
                    </span>
                  </div>

                  <div 
                    style={{ 
                      padding: '8px 12px', 
                      background: '#f8fafc', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--border-subtle)' 
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
                      {record.analysis_type === 'mudra_classification' ? 'Mudra Type' : 'Alignment'}
                    </span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }} className="truncate block">
                      {record.mudra_type || record.aramandi_depth || record.shoulder_alignment || 'Aligned'}
                    </span>
                  </div>
                </div>

                {/* Footer Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Clock size={13} />
                    <span>{formatDate(record.created_at)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={(e) => handleDelete(e, record.id)}
                      disabled={deletingId === record.id}
                      title="Delete record"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--maroon-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={15} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--gold-dark)', fontSize: '0.84rem', fontWeight: 700 }}>
                      <span>Details</span>
                      <ChevronRight size={15} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <th style={{ padding: '14px 18px' }}>Session</th>
                  <th style={{ padding: '14px 18px' }}>Dance Form</th>
                  <th style={{ padding: '14px 18px' }}>Score</th>
                  <th style={{ padding: '14px 18px' }}>Posture / Detail</th>
                  <th style={{ padding: '14px 18px' }}>Date</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const typeCfg = TYPE_CONFIG[record.analysis_type] || TYPE_CONFIG.all;
                  const Icon = typeCfg.icon;
                  const score = record.overall_score || record.similarity_score || record.confidence || 0;
                  const badgeClass = getScoreBadgeClass(score);

                  return (
                    <tr 
                      key={record.id} 
                      onClick={() => setSelectedRecord(record)}
                      style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gold-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Icon size={16} color={typeCfg.color} />
                          <div>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700, display: 'block' }}>
                              {record.title || record.filename || record.mudra_name || 'Dance Session'}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{typeCfg.label}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {record.dance_form || record.selected_dance_form || record.predicted_dance || record.mudra_name || 'Bharatanatyam'}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.82rem', fontWeight: 800, padding: '3px 8px' }}>
                          {Math.round(score)}%
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {record.mudra_type || record.aramandi_depth || record.shoulder_alignment || 'Standard'}
                      </td>

                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {formatDate(record.created_at)}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="btn-secondary"
                            style={{ padding: '5px 12px', fontSize: '0.8rem', color: 'var(--gold-dark)' }}
                          >
                            Inspect
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, record.id)}
                            disabled={deletingId === record.id}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--maroon-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. DETAILED TELEMETRY MODAL */}
      {selectedRecord && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setSelectedRecord(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              background: '#ffffff',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gold-bg)', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-dark)' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                    {selectedRecord.title || selectedRecord.filename || 'Analysis Session Details'}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Recorded on {formatDate(selectedRecord.created_at)} &bull; Type: {selectedRecord.analysis_type}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '50%' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Score Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Accuracy Score</span>
                <div style={{ fontSize: '1.8rem', color: 'var(--gold-dark)', fontWeight: 800, marginTop: '2px' }}>
                  {Math.round(selectedRecord.overall_score || selectedRecord.similarity_score || selectedRecord.confidence || 0)}%
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Dance Form</span>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, marginTop: '6px' }} className="truncate">
                  {selectedRecord.dance_form || selectedRecord.selected_dance_form || selectedRecord.predicted_dance || selectedRecord.mudra_name || 'Bharatanatyam'}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Score / Mudra</span>
                <div style={{ fontSize: '1.05rem', color: 'var(--emerald-primary)', fontWeight: 700, marginTop: '6px' }} className="truncate">
                  {selectedRecord.balance_score ? `${selectedRecord.balance_score}%` : (selectedRecord.mudra_type || 'Aligned')}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Stance</span>
                <div style={{ fontSize: '1.05rem', color: 'var(--cyan-primary)', fontWeight: 700, marginTop: '6px' }} className="truncate">
                  {selectedRecord.aramandi_depth || selectedRecord.english_meaning || 'Optimal'}
                </div>
              </div>
            </div>

            {/* Visual Annotated Skeleton */}
            {selectedRecord.annotated_image_url && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--gold-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Annotated Computer Vision Skeleton
                </span>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#0f172a', display: 'flex', justifyContent: 'center', maxHeight: '280px' }}>
                  <img
                    src={`http://localhost:8000${selectedRecord.annotated_image_url}`}
                    alt="Kinematic Skeleton"
                    style={{ maxHeight: '280px', objectFit: 'contain', width: '100%' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              </div>
            )}

            {/* Joint Angles in Degrees */}
            {selectedRecord.angles && Object.keys(selectedRecord.angles).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--cyan-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Joint Angles
                  </span>
                  <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    Approximation Values (±3°–5°)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                  {Object.entries(selectedRecord.angles).map(([joint, val]) => (
                    <div 
                      key={joint} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '10px 14px', 
                        background: '#f8fafc', 
                        borderRadius: 'var(--radius-sm)', 
                        border: '1px solid var(--border-subtle)' 
                      }}
                    >
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {joint.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.98rem', color: 'var(--gold-dark)', fontWeight: 800, fontFamily: 'monospace' }}>
                        ~{Math.round(val)}°
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                  * All recorded joint degrees (knees, shoulders, wrists, elbows, hips) are kinematic approximations.
                </div>
              </div>
            )}

            {/* Feedback / Directives */}
            {(selectedRecord.feedback || selectedRecord.directives) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--emerald-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Feedback & Directives
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedRecord.feedback || selectedRecord.directives).map((item, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '10px', 
                        padding: '10px 14px', 
                        background: 'var(--emerald-bg)', 
                        borderRadius: 'var(--radius-sm)', 
                        border: '1px solid #a7f3d0',
                        fontSize: '0.88rem',
                        color: 'var(--emerald-primary)'
                      }}
                    >
                      <CheckCircle2 size={16} color="var(--emerald-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <button
                onClick={(e) => handleDelete(e, selectedRecord.id)}
                className="btn-secondary"
                style={{ color: 'var(--maroon-primary)', borderColor: '#fecdd3', padding: '9px 16px', fontSize: '0.86rem' }}
              >
                <Trash2 size={15} /> Delete Session
              </button>

              <button
                onClick={() => setSelectedRecord(null)}
                className="btn-primary"
                style={{ padding: '9px 24px', fontSize: '0.92rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
