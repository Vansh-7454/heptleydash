'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Eye, EyeOff, ShieldCheck, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { setRole, showToast } = useDashboard();

  const [selectedRole, setSelectedRole] = useState<'admin' | 'sales'>('admin');
  const [email, setEmail] = useState('admin@heptley.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Handle switching between roles
  const handleRoleChange = (role: 'admin' | 'sales') => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@heptley.in');
      setPassword('••••••••••••');
    } else {
      setEmail('sales@heptley.in');
      setPassword('••••••••••••');
    }
  };

  // Standard submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (email.toLowerCase().includes('sales') || selectedRole === 'sales') {
        setRole('sales');
        showToast('Signed in to Sales Workspace', 'success');
      } else {
        setRole('admin');
        showToast('Signed in to Admin Dashboard', 'success');
      }
    }, 300);
  };

  // 1-Click quick login
  const handleQuickLogin = (role: 'admin' | 'sales') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRole(role);
      showToast(
        role === 'admin'
          ? 'Signed in to Admin Dashboard'
          : 'Signed in to Sales Workspace',
        'success'
      );
    }, 200);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-logo">
            <span>h</span>
          </div>
          <div className="brand-title">
            heptley<span className="brand-dot">.</span>
          </div>
          <p className="brand-subtitle">Business Management Portal</p>
        </div>

        {/* Clean Segmented Role Switcher */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
            disabled={isLoading}
          >
            <ShieldCheck size={16} />
            <span>Executive Admin</span>
          </button>
          <button
            type="button"
            className={`role-btn ${selectedRole === 'sales' ? 'active' : ''}`}
            onClick={() => handleRoleChange('sales')}
            disabled={isLoading}
          >
            <UserCheck size={16} />
            <span>Sales Representative</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-box">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                required
                placeholder="name@heptley.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="label-row">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                className="forgot-link"
                onClick={() =>
                  showToast('Demo environment: Enter session credentials or click sign in', 'info')
                }
              >
                Forgot password?
              </button>
            </div>
            <div className="input-box">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="remember-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Remember me for 30 days</span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign in as {selectedRole === 'admin' ? 'Admin' : 'Sales'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Subtle Divider */}
        <div className="divider">
          <span className="divider-line" />
          <span className="divider-text">or 1-click instant demo</span>
          <span className="divider-line" />
        </div>

        {/* 1-Click Fast Demo Buttons */}
        <div className="quick-demo-row">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            disabled={isLoading}
            className="demo-btn"
          >
            <ShieldCheck size={15} style={{ color: '#0f172a' }} />
            <span>Admin Demo</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('sales')}
            disabled={isLoading}
            className="demo-btn"
          >
            <UserCheck size={15} style={{ color: '#e11d48' }} />
            <span>Sales Demo</span>
          </button>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <span>© 2026 heptley · Internal Business Portal</span>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          width: 100%;
          background-color: #f8fafc;
          background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
          background-size: 24px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          font-family: var(--font-family, system-ui, -apple-system, sans-serif);
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03);
          padding: 2.25rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: fadeIn 0.25s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Brand */
        .brand-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .brand-logo {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background-color: #e11d48;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.35rem;
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);
          margin-bottom: 0.75rem;
        }
        .brand-title {
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0f172a;
          line-height: 1.1;
        }
        .brand-dot {
          color: #e11d48;
        }
        .brand-subtitle {
          font-size: 0.8125rem;
          color: #64748b;
          margin-top: 0.35rem;
        }

        /* Segmented Role Switcher */
        .role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.35rem;
          background-color: #f1f5f9;
          padding: 0.3rem;
          border-radius: 10px;
        }
        .role-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.55rem 0.5rem;
          border-radius: 7px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #64748b;
          background-color: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .role-btn:hover {
          color: #0f172a;
        }
        .role-btn.active {
          background-color: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .form-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #334155;
        }
        .forgot-link {
          font-size: 0.75rem;
          color: #e11d48;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .forgot-link:hover {
          text-decoration: underline;
        }

        .input-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-box :global(.input-icon) {
          position: absolute;
          left: 0.75rem;
          color: #94a3b8;
          pointer-events: none;
        }
        .form-input {
          width: 100%;
          padding: 0.6rem 0.75rem 0.6rem 2.25rem;
          font-size: 0.875rem;
          color: #0f172a;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .form-input:focus {
          border-color: #e11d48;
          box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.12);
        }
        .toggle-password {
          position: absolute;
          right: 0.75rem;
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.2rem;
        }
        .toggle-password:hover {
          color: #475569;
        }

        .remember-row {
          display: flex;
          align-items: center;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: #64748b;
          cursor: pointer;
        }
        .checkbox-label input {
          accent-color: #e11d48;
          cursor: pointer;
        }

        /* Submit Button */
        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.65rem 1rem;
          background-color: #0f172a;
          color: #ffffff;
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.15s ease, transform 0.1s ease;
          margin-top: 0.25rem;
        }
        .submit-btn:hover:not(:disabled) {
          background-color: #1e293b;
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: -0.25rem 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background-color: #e2e8f0;
        }
        .divider-text {
          font-size: 0.75rem;
          color: #94a3b8;
          white-space: nowrap;
        }

        /* Quick Demo Row */
        .quick-demo-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.625rem;
        }
        .demo-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.55rem 0.75rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .demo-btn:hover:not(:disabled) {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }

        /* Footer */
        .login-footer {
          text-align: center;
          font-size: 0.75rem;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
          padding-top: 1rem;
          margin-top: -0.25rem;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 1.75rem 1.25rem;
            border-radius: 14px;
          }
          .role-btn {
            font-size: 0.75rem;
            padding: 0.5rem 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
