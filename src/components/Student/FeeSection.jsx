import React, { useMemo } from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';

const FeeSection = React.memo(({
  fees,
  feeStats,
  onPayFeeClick
}) => {
  const feeRows = useMemo(() => fees.map((fee, index) => (
    <tr key={fee.id || index}>
      <td>{fee.month} {fee.year}</td>
      <td>PKR {fee.amount}</td>
      <td>
        <span className={`badge ${fee.status}`}>
          {fee.status.toUpperCase()}
        </span>
      </td>
    </tr>
  )), [fees]);

  return (
    <div className="info-card">
      <h3>
        <FaMoneyBillWave /> Fee Status
      </h3>
      <div className="student-hero-stats" style={{ marginTop: 10, justifyContent: 'flex-start' }}>
        <div className="hero-stat-pill">
          <span>
            Paid: <strong>{feeStats.paidCount}</strong> (PKR {feeStats.paidAmount})
          </span>
        </div>
        <div className="hero-stat-pill">
          <span>
            Pending: <strong>{feeStats.pendingCount}</strong> (PKR {feeStats.pendingAmount})
          </span>
        </div>
        <button
          type="button"
          className="btn"
          style={{ marginLeft: 'auto' }}
          onClick={onPayFeeClick}
        >
          Pay fee manually
        </button>
      </div>
      {fees.length > 0 ? (
        <table className="student-table">
          <thead>
            <tr>
              <th>Month/Year</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {feeRows}
          </tbody>
        </table>
      ) : (
        <p className="empty-state">No fee records found.</p>
      )}
    </div>
  );
});

FeeSection.displayName = 'FeeSection';

export default FeeSection;