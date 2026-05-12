import React from 'react';

const palette = {
  blue: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  green: 'linear-gradient(135deg, #059669 0%, #0f766e 100%)',
  purple: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
  orange: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
};

const StatCard = ({ title, value, icon: IconComponent, color = 'blue', subtitle }) => (
  <div
    className="stat-card"
    style={{
      background: palette[color] || palette.blue,
      color: '#fff',
      borderRadius: '24px',
      padding: '24px',
      boxShadow: '0 18px 40px rgba(37, 99, 235, 0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '18px',
      textAlign: 'left',
    }}
  >
    <div>
      <p style={{ fontSize: '0.95rem', opacity: 0.88 }}>{title}</p>
      <p style={{ fontSize: '2.35rem', fontWeight: 800, marginTop: '8px', lineHeight: 1 }}>
        {value}
      </p>
      {subtitle ? (
        <p style={{ marginTop: '10px', fontSize: '0.82rem', opacity: 0.82 }}>{subtitle}</p>
      ) : null}
    </div>
    <div style={{ fontSize: '2.6rem', opacity: 0.9 }}>
      {IconComponent ? <IconComponent /> : null}
    </div>
  </div>
);

export default StatCard;
