import React from 'react';

const clamp = (value) => Math.max(0, Math.min(100, Number(value || 0)));

export const ProgressListChart = ({ title, subtitle, data = [] }) => (
  <article className="ui-card lite-chart-card">
    <div className="section-header">
      <div>
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </div>
    <div className="lite-progress-list">
      {data.length ? data.map((item) => (
        <div key={item.name} className="lite-progress-row">
          <strong>{item.name}</strong>
          <div className="lite-track">
            <div className="lite-fill" style={{ width: `${clamp(item.value)}%` }} />
          </div>
          <span>{clamp(item.value)}%</span>
        </div>
      )) : <p className="glass-muted">No chart data available yet.</p>}
    </div>
  </article>
);

export const SegmentedBarChart = ({ title, subtitle, data = [] }) => (
  <article className="ui-card lite-chart-card">
    <div className="section-header">
      <div>
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </div>
    <div className="lite-segment-list">
      {data.length ? data.map((item) => {
        const collected = Number(item.collected || 0);
        const pending = Number(item.pending || 0);
        const total = Math.max(collected + pending, 1);
        return (
          <div key={item.name} className="lite-segment-row">
            <strong>{item.name}</strong>
            <div className="lite-segments">
              <span className="collected" style={{ width: `${(collected / total) * 100}%` }} />
              <span className="pending" style={{ width: `${(pending / total) * 100}%` }} />
            </div>
            <span>{Math.round((collected / total) * 100)}%</span>
          </div>
        );
      }) : <p className="glass-muted">No fee data available yet.</p>}
    </div>
  </article>
);

export const DonutSummaryChart = ({ title, subtitle, data = [], totalLabel = 'Total' }) => {
  const sanitized = data.map((item) => ({
    ...item,
    value: Math.max(0, Number(item.value || 0)),
  }));
  const total = sanitized.reduce((sum, item) => sum + item.value, 0);
  const stops = [];
  let current = 0;
  sanitized.forEach((item) => {
    const start = total ? (current / total) * 100 : 0;
    current += item.value;
    const end = total ? (current / total) * 100 : 0;
    stops.push(`${item.color} ${start}% ${end}%`);
  });

  return (
    <article className="ui-card lite-chart-card">
      <div className="section-header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="lite-donut-shell">
        <div className="lite-donut" style={{ background: `conic-gradient(${stops.join(', ') || '#cbd5e1 0 100%'})` }}>
          <div className="lite-donut-center">
            <strong>{total}</strong>
            <div>{totalLabel}</div>
          </div>
        </div>
        <div className="lite-donut-legend">
          {sanitized.map((item) => (
            <div key={item.name} className="lite-donut-legend-item">
              <span><span className="lite-dot" style={{ background: item.color }} />{item.name}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};
