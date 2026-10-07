import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Field validation errors & touched states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  const from = location.state?.from?.pathname || '/';

  const validateEmail = (val) => {
    if (!val.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Please enter a valid email address.';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required.';
    if (val.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (touched.email) setEmailError(validateEmail(val));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) setPasswordError(validatePassword(val));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') setEmailError(validateEmail(email));
    if (field === 'password') setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    
    setEmailError(eErr);
    setPasswordError(pErr);
    setTouched({ email: true, password: true });

    if (eErr || pErr) {
      setError('Please resolve the highlighted field errors below.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.detail || 'Invalid email or password. Please verify your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      animation: 'fadeIn 0.4s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2.25rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-card)',
        background: '#ffffff',
      }}>
        
        {/* Centered Logo & Title */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            marginBottom: '1rem',
            borderRadius: '50%',
            padding: '3px',
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)'
          }}>
            <img 
              src={logoImg} 
              alt="Natyaa AI Logo" 
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                background: '#f8fafc',
                display: 'block'
              }}
            />
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 0.25rem 0'
          }}>
            NATYA <span style={{ color: 'var(--gold-light)' }}>AI</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            margin: 0,
            fontWeight: 500
          }}>
            Classical Motion & Mudra Intelligence
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            background: 'var(--rose-bg)',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--rose-primary)',
            fontSize: '0.86rem',
            marginBottom: '1.25rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Email Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Email Address <span style={{ color: 'var(--gold-light)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="dancer@classical.art"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => handleBlur('email')}
                className="form-input"
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  borderColor: touched.email && emailError ? 'var(--rose-primary)' : '#cbd5e1',
                  background: '#ffffff',
                  color: 'var(--text-primary)'
                }}
              />
              <Mail 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: touched.email && emailError ? 'var(--rose-primary)' : 'var(--text-muted)'
                }}
              />
            </div>
            {touched.email && emailError && (
              <span style={{ fontSize: '0.76rem', color: 'var(--rose-primary)', marginTop: '4px', display: 'block' }}>
                {emailError}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Password <span style={{ color: 'var(--gold-light)' }}>*</span>
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur('password')}
                className="form-input"
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  borderColor: touched.password && passwordError ? 'var(--rose-primary)' : '#cbd5e1',
                  background: '#ffffff',
                  color: 'var(--text-primary)'
                }}
              />
              <Lock 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: touched.password && passwordError ? 'var(--rose-primary)' : 'var(--text-muted)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && passwordError && (
              <span style={{ fontSize: '0.76rem', color: 'var(--rose-primary)', marginTop: '4px', display: 'block' }}>
                {passwordError}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.94rem',
              fontWeight: 700,
              marginTop: '0.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                <span>Signing In...</span>
              </div>
            ) : (
              <>
                <span>Enter Natya Studio</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{
          marginTop: '1.75rem',
          textAlign: 'center',
          fontSize: '0.86rem',
          color: 'var(--text-secondary)'
        }}>
          Don't have an account?{' '}
          <Link 
            to="/register" 
            style={{ 
              color: 'var(--gold-light)', 
              fontWeight: 700, 
              textDecoration: 'none',
              marginLeft: '4px'
            }}
          >
            Create Artist Account
          </Link>
        </div>

      </div>
    </div>
  );
}
