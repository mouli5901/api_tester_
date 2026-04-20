import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError('');
    setPassword(''); // usually a good idea to clear password explicitly
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-logo">🚀 API Testing</h1>
          <p className="login-subtitle">
            {isLogin ? 'Welcome back, developer.' : 'Create your workspace.'}
          </p>
        </div>

        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => !isLogin && toggleMode()}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => isLogin && toggleMode()}
          >
            Sign Up
          </button>
          <div className={`tab-indicator ${isLogin ? 'left' : 'right'}`} />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={submitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1" // Don't interrupt tab flow on form
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? (
              <span className="btn-spinner"></span>
            ) : isLogin ? (
              'Log In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
