import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { FaArrowRight, FaEnvelope, FaLock, FaSchool } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AuthShell from '../components/layout/AuthShell';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email.trim(), password);

      if (!success) {
        toast.error('Login failed. Please check your email and password.');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please try again.';
      toast.error(errorMessage);
      console.error('Full login error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="login-container">
        <div className="login-card">
          <div className="login-card__hero">
            <div className="login-badge">
              <FaSchool />
              <span>EduFlow Access</span>
            </div>
            <h1>Welcome back to your school workspace.</h1>
            <p>
              Continue with your official school email and password to access
              dashboards, communication, and daily operations.
            </p>
            <div className="login-hero__stats">
              <div>
                <strong>Fast</strong>
                <span>Optimized media and chat delivery</span>
              </div>
              <div>
                <strong>Secure</strong>
                <span>Email-based sign in for every role</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form__head">
              <p className="login-form__eyebrow">Sign In</p>
              <h2>EDU FLOW Portal</h2>
              <span>Only email and password are required.</span>
            </div>

            <label className="form-group">
              <span className="input-label">Email Address</span>
              <div className="input-shell">
                <FaEnvelope className="input-icon" />
                <input
                  className="form-input"
                  type="email"
                  placeholder="name@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="form-group">
              <span className="input-label">Password</span>
              <div className="input-shell">
                <FaLock className="input-icon" />
                <input
                  className="form-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            <button type="submit" disabled={loading} className="submit-btn">
              <span>{loading ? 'Signing in...' : 'Enter Dashboard'}</span>
              {!loading ? <FaArrowRight /> : null}
            </button>

            <div className="login-footer">
              <span>After Login You can access Your panel </span>
              <strong>email@school.com / password</strong>
            </div>
          </form>
        </div>
      </div>
    </AuthShell>
  );
};

export default Login;
