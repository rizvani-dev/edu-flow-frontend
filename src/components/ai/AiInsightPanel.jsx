import React from 'react';
import './aiPanels.css';

const normalizeItems = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

const AiInsightPanel = ({ title, subtitle, summary, progressPercent = 0, confidencePercent = 0, sections = [] }) => {
  return (
    <section className="ai-glass-panel ai-insight-panel">
      <div className="ai-panel-header">
        <div>
          <p className="ai-panel-kicker">AI Insight Layer</p>
          <h3>{title}</h3>
          {subtitle ? <p className="ai-panel-subtitle">{subtitle}</p> : null}
        </div>

        <div className="ai-metric-pills">
          <div className="ai-metric-pill">
            <span>Progress</span>
            <strong>{Math.max(0, Math.min(100, Number(progressPercent || 0)))}%</strong>
          </div>
          <div className="ai-metric-pill">
            <span>Confidence</span>
            <strong>{Math.max(0, Math.min(100, Number(confidencePercent || 0)))}%</strong>
          </div>
        </div>
      </div>

      <div className="ai-summary-card">
        <p>{summary || 'AI insight is ready to highlight performance, risk, and next best actions.'}</p>
      </div>

      <div className="ai-section-grid">
        {sections.map((section) => {
          const items = normalizeItems(section.items);
          if (!items.length && !section.content) return null;

          return (
            <article key={section.title} className="ai-section-card">
              <h4>{section.title}</h4>
              {section.content ? <p>{section.content}</p> : null}
              {items.length ? (
                <ul>
                  {items.map((item, index) => (
                    <li key={`${section.title}-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default AiInsightPanel;
