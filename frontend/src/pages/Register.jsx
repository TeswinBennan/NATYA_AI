import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

const DANCE_FORMS = [
  "Bharatanatyam",
  "Kuchipudi",
  "Mohiniyattam",
  "Kathak",
  "Kathakali"
];

const EXPERIENCE_LEVELS = [
  "Beginner / Student",
  "Intermediate Practitioner",
  "Advanced Performer",
  "Guru / Teacher / Researcher"
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    dance_form_interest: 'Bharatanatyam',
    experience_level: 'Beginner / Student',
    role: 'dancer'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Field validation states
  const [errors, setErrors] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const [touched, setTouched] = useState({
    full_name: false,
    email: false,
    password: false,
    confirm_password: false
  });

  const validateField = (name, value, allData = formData) => {
    switch (name) {
      case 'full_name':
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters.';
        return '';
      case 'email':
        if (!value.trim()) return 'Email address is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
        return '';
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        return '';
      case 'confirm_password':
        if (!value) return 'Please confirm your password.';
        if (value !== allData.password) return 'Passwords do not match.';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value, updatedData)
      }));
    }
    if (name === 'password' && touched.confirm_password) {
      setErrors(prev => ({
        ...prev,
        confirm_password: validateField('confirm_password', updatedData.confirm_password, updatedData)
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({
      ...prev,
      [field]: validateField(field, formData[field])
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const fnErr = validateField('full_name', formData.full_name);
    const emErr = validateField('email', formData.email);
    const pwErr = validateField('password', formData.password);
    const cpErr = validateField('confirm_password', formData.confirm_password);

    setErrors({
      full_name: fnErr,
      email: emErr,
      password: pwErr,
      confirm_password: cpErr
    });
    setTouched({
      full_name: true,
      email: true,
      password: true,
      confirm_password: true
    });

    if (fnErr || emErr || pwErr || cpErr) {
      setError('Please resolve the highlighted field errors below.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(formData);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      const message = err.response?.data?.detail || 'Registration failed. Please check your details and try again.';
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
        maxWidth: '540px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2.25rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-card)',
        background: '#ffffff',
      }}>
        
        {/* Centered Logo & Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '1.75rem'
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
            Join <span style={{ color: 'var(--gold-light)' }}>NATYA AI</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            margin: 0,
            fontWeight: 500
          }}>
            Create your Classical Indian Dance Artist Profile
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
              Full Name <span style={{ color: 'var(--gold-light)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
                onBlur={() => handleBlur('full_name')}
                className="form-input"
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  borderColor: touched.full_name && errors.full_name ? 'var(--rose-primary)' : '#cbd5e1',
                  background: '#ffffff',
                  color: 'var(--text-primary)'
                }}
              />
              <User 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: touched.full_name && errors.full_name ? 'var(--rose-primary)' : 'var(--text-muted)'
                }}
              />
            </div>
            {touched.full_name && errors.full_name && (
              <span style={{ fontSize: '0.76rem', color: 'var(--rose-primary)', marginTop: '4px', display: 'block' }}>
                {errors.full_name}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
              Email Address <span style={{ color: 'var(--gold-light)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                placeholder="dancer@classical.art"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                className="form-input"
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  borderColor: touched.email && errors.email ? 'var(--rose-primary)' : '#cbd5e1',
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
                  color: touched.email && errors.email ? 'var(--rose-primary)' : 'var(--text-muted)'
                }}
              />
            </div>
            {touched.email && errors.email && (
              <span style={{ fontSize: '0.76rem', color: 'var(--rose-primary)', marginTop: '4px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Dance Form & Experience Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                Primary Dance Form
              </label>
              <select
                name="dance_form_interest"
                value={formData.dance_form_interest}
                onChange={handleChange}
                className="form-select"
                style={{ width: '100%', background: '#ffffff', color: 'var(--text-primary)', borderColor: '#cbd5e1' }}
              >
                {DANCE_FORMS.map(form => (
                  <option key={form} value={form} style={{ background: '#ffffff', color: '#0f172a' }}>
                    {form}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                Experience Level
              </label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="form-select"
                style={{ width: '100%', background: '#ffffff', color: 'var(--text-primary)', borderColor: '#cbd5e1' }}
              >
                {EXPERIENCE_LEVELS.map(lvl => (
                  <option key={lvl} value={lvl} style={{ background: '#ffffff', color: '#0f172a' }}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password & Confirm Password Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                Password <span style={{ color: 'var(--gold-light)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  className="form-input"
                  style={{
                    width: '100%',
                    paddingLeft: '38px',
                    paddingRight: '36px',
                    borderColor: touched.password && errors.password ? 'var(--rose-primary)' : '#cbd5e1',
                    background: '#ffffff',
                    color: 'var(--text-primary)'
                  }}
                />
                <Lock 
                  size={16} 
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: touched.password && errors.password ? 'var(--rose-primary)' : 'var(--text-muted)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
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
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <span style={{ fontSize: '0.74rem', color: 'var(--rose-primary)', marginTop: '3px', display: 'block' }}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                Confirm Password <span style={{ color: 'var(--gold-light)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  placeholder="Re-enter password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirm_password')}
                  className="form-input"
                  style={{
                    width: '100%',
                    paddingLeft: '38px',
                    paddingRight: '36px',
                    borderColor: touched.confirm_password && errors.confirm_password ? 'var(--rose-primary)' : '#cbd5e1',
                    background: '#ffffff',
                    color: 'var(--text-primary)'
                  }}
                />
                <Lock 
                  size={16} 
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: touched.confirm_password && errors.confirm_password ? 'var(--rose-primary)' : 'var(--text-muted)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
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
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.confirm_password && errors.confirm_password && (
                <span style={{ fontSize: '0.74rem', color: 'var(--rose-primary)', marginTop: '3px', display: 'block' }}>
                  {errors.confirm_password}
                </span>
              )}
            </div>
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
                <span>Creating Artist Profile...</span>
              </div>
            ) : (
              <>
                <span>Begin Classical Practice</span>
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
          Already registered?{' '}
          <Link 
            to="/login" 
            style={{ 
              color: 'var(--gold-light)', 
              fontWeight: 700, 
              textDecoration: 'none',
              marginLeft: '4px'
            }}
          >
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}
