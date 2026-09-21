import React from 'react';
import { FaRobot, FaDownload, FaChartLine, FaStar, FaUserGraduate, FaMoneyBillWave } from 'react-icons/fa';
import { resolveMediaUrl } from '../../utils/media';
import './aiPanels.css';

const AiTopAchieversPanel = ({ cards = [], summary, onExport, onAiConsult }) => {
  return (
    <section className="ai-glass-panel ai-achiever-panel">
      <div className="ai-panel-header">
        <div>
          <p className="ai-panel-kicker">AI Recognition Engine</p>
          <h3>Top Achievers Spotlight</h3>
          <p className="ai-panel-subtitle">{summary || 'Real-time performance metrics and AI-driven growth tracking.'}</p>
        </div>
        <button className="ai-export-btn" onClick={() => onExport?.(cards, summary)}>
          <FaDownload /> Export Report
        </button>
      </div>

      <div className="ai-achiever-grid">
        {cards.length ? (
          cards.map((card, index) => (
            <article key={`${card.studentId || index}-${card.category}`} className="ai-achiever-card">
              <div className="ai-achiever-glow" />
              
              <header className="achiever-card-identity">
                <div className="achiever-avatar-wrap">
                  {card.profileImage ? (
                    <img src={resolveMediaUrl(card.profileImage)} alt={card.title} className="achiever-img" />
                  ) : (
                    <div className="achiever-fallback">{card.title?.[0] || 'S'}</div>
                  )}
                  <span className="achiever-rank-pill">#{card.rank || index + 1}</span>
                </div>
                <div className="achiever-meta">
                  <h4>{card.title || 'Student Achievement'}</h4>
                  <span className="achiever-sub">ID: {card.studentId} • {card.className}</span>
                  <span className="ai-category-chip"><FaStar /> {card.category || 'Elite'}</span>
                </div>
              </header>

              <p className="achiever-bio">{card.bio || card.description || 'Consistent excellence detected in this evaluation cycle.'}</p>

              <div className="achiever-metrics-grid">
                <div className="metric-box">
                  <div className="metric-header"><span><FaChartLine /> Result</span> <strong>{card.resultPercent}%</strong></div>
                  <div className="metric-track"><span className="metric-fill result" style={{ width: `${card.resultPercent}%` }} /></div>
                </div>
                <div className="metric-box">
                  <div className="metric-header"><span><FaUserGraduate /> Att.</span> <strong>{card.attendancePercent}%</strong></div>
                  <div className="metric-track"><span className="metric-fill attendance" style={{ width: `${card.attendancePercent}%` }} /></div>
                </div>
                <div className="metric-box">
                  <div className="metric-header"><span><FaMoneyBillWave /> Fees</span> <strong>{card.feePercent}%</strong></div>
                  <div className="metric-track"><span className="metric-fill fee" style={{ width: `${card.feePercent}%` }} /></div>
                </div>
              </div>

              <div className="achiever-actions">
                <button className="btn-ai-consult" onClick={() => onAiConsult?.(card)}>
                  <FaRobot /> Growth Plan
                </button>
                <div className="achievement-score">
                  <div className="score-ring">
                    <svg viewBox="0 0 36 36">
                      <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="ring-fill" strokeDasharray={`${card.achievementPercent || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span>{Math.round(card.achievementPercent || 0)}%</span>
                  </div>
                </div>
              </div>
              
              <footer className="achiever-footer">
                <p>{card.schoolNote || 'Momentum is strong. Keep supporting this trajectory.'}</p>
              </footer>
            </article>
          ))
        ) : (
          <div className="ai-empty-state">AI achiever cards will appear here after enough academic activity is available.</div>
        )}
      </div>
    </section>
  );
};

export default AiTopAchieversPanel;
