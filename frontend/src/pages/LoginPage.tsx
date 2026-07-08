import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await authAPI.checkAuth();
        if (result.authenticated) {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.login(password);
      window.location.href = '/';
    } catch (error) {
      setError(error instanceof Error ? error.message : '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-form-wrap">
          <h1 className="login-title">健身记录</h1>
          <p className="login-subtitle">请输入密码登录</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field-group pwd-wrapper">
              <input
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoFocus
              />
              <span className="field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M17 9h-1V7c0-2.2-1.8-4-4-4S8 4.8 8 7v2H7c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zM10 7c0-1.1.9-2 2-2s2 .9 2 2v2h-4V7zm6 11H8v-7h8v7z"/></svg>
              </span>
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="切换密码可见"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              <span>{loading ? '登录中...' : '立即登录'}</span>
              <span className="login-btn-arrow" aria-hidden="true">›</span>
            </button>
          </form>
        </div>

        <div className="login-bottom">
          <p className="login-bottom-label">健身CODE 团队</p>
          <div className="login-bottom-icons" aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
