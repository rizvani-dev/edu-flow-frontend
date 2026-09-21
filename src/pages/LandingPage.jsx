import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaBolt,
  FaChartLine,
  FaComments,
  FaGraduationCap,
  FaLayerGroup,
  FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import { getDefaultRouteByRole } from '../utils/roleRedirect';
import './landingPage.css';

const features = [
  {
    icon: <FaLayerGroup />,
    title: 'One workspace for every role',
    copy: 'Admins, teachers, and students each get a focused dashboard with only the tools they need.',
  },
  {
    icon: <FaComments />,
    title: 'Real-time school communication',
    copy: 'Keep chats, announcements, and workflow updates synced across devices with streamlined messaging.',
  },
  {
    icon: <FaChartLine />,
    title: 'Academic and fee insights',
    copy: 'Track attendance, performance, dues, and class activity from polished operational views.',
  },
];

const steps = [
  'Sign in with your school account to enter your role-specific workspace.',
  'Manage announcements, homework, attendance, fees, and AI-assisted reports from one system.',
  'Return faster next time with cached dashboard data that appears instantly while fresh data syncs in the background.',
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate(user ? getDefaultRouteByRole(user.role) : '/login');
  };

  return (
    <div className="landing-shell">
      <section className="landing-hero">
        <div className="landing-nav">
          <div className="landing-brand">
            <div className="landing-brand__logo">
              <FaGraduationCap />
            </div>
            <div>
              <p>EduFlow</p>
              <span>School management SaaS</span>
            </div>
          </div>

          <button type="button" className="landing-login-btn" onClick={handleLoginClick}>
            {user ? 'Open Dashboard' : 'Login'}
          </button>
        </div>

        <div className="landing-hero__content">
          <div className="landing-copy">
            <span className="landing-kicker">Modern school operations platform</span>
            <h1>EduFlow helps schools run faster, communicate better, and keep every dashboard in sync.</h1>
            <p>
              EduFlow is a professional school management software platform for admins, teachers, and students.
              Manage attendance, fees, homework, AI reports, and real-time communication from one polished SaaS workspace.
            </p>

            <div className="landing-actions">
              <button type="button" className="landing-primary-btn" onClick={handleLoginClick}>
                {user ? 'Continue to your workspace' : 'Login to EduFlow'} <FaArrowRight />
              </button>
              <a className="landing-secondary-link" href="#how-it-works">
                See how it works
              </a>
            </div>

            <div className="landing-proof">
              <div>
                <strong>Role-aware</strong>
                <span>Admin, teacher, and student flows</span>
              </div>
              <div>
                <strong>Real-time</strong>
                <span>Chat, notifications, and live status</span>
              </div>
              <div>
                <strong>AI-ready</strong>
                <span>Summaries, reports, and insight generation</span>
              </div>
            </div>
          </div>

          <div className="landing-visual" aria-label="EduFlow software preview">
            <div className="visual-window visual-window--main">
              <div className="visual-window__bar">
                <span />
                <span />
                <span />
              </div>
              <div className="visual-window__body">
                <div className="visual-metric">
                  <FaBolt />
                  <div>
                    <strong>Instant dashboard load</strong>
                    <span>Cached views appear first, live data refreshes only when needed.</span>
                  </div>
                </div>
                <div className="visual-chart">
                  <div className="visual-chart__line" />
                  <div className="visual-chart__cards">
                    <article>
                      <strong>Attendance</strong>
                      <span>92% on-track rate</span>
                    </article>
                    <article>
                      <strong>Homework</strong>
                      <span>Teacher workflow automation</span>
                    </article>
                    <article>
                      <strong>Reports</strong>
                      <span>AI summaries with copy and PDF export</span>
                    </article>
                  </div>
                </div>
              </div>
            </div>
            <div className="visual-window visual-window--side">
              <div className="visual-pill">
                <FaComments />
                <span>Shared chat UI across every dashboard</span>
              </div>
              <div className="visual-pill">
                <FaShieldAlt />
                <span>Secure, role-based access control</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section__head">
          <span>Why schools choose EduFlow</span>
          <h2>Everything needed to operate a modern digital campus in one system.</h2>
        </div>
        <div className="landing-feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="landing-card">
              <div className="landing-card__icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-section--how">
        <div className="landing-section__head">
          <span>How to use EduFlow</span>
          <h2>Simple onboarding for schools, staff, and students.</h2>
        </div>
        <div className="landing-steps">
          {steps.map((step, index) => (
            <article key={step} className="landing-step">
              <strong>0{index + 1}</strong>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <span>Ready to streamline your campus?</span>
          <h2>Use EduFlow to centralize communication, operations, and AI-powered insights.</h2>
        </div>
        <button type="button" className="landing-primary-btn" onClick={handleLoginClick}>
          {user ? 'Go to dashboard' : 'Login now'} <FaArrowRight />
        </button>
      </section>

      <footer className="landing-footer">
        <p>EduFlow school management software for attendance, homework, fees, communication, and AI reporting.</p>
        <Link to="/login">Portal Access</Link>
      </footer>
    </div>
  );
}
