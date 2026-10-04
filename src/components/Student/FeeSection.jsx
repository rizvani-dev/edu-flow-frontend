import React, { useMemo } from 'react';
import { FaMoneyBillWave, FaDownload, FaCalendarCheck, FaExclamationCircle, FaCheckCircle, FaClock } from 'react-icons/fa';

const FeeSection = React.memo(({
  fees = [],
  feeStats = { paidCount: 0, pendingCount: 0, paidAmount: 0, pendingAmount: 0 },
  currentFee = null,
  onPayFeeClick,
  onDownloadReceipt,
  downloadingReceiptId = null,
  reminderFees = [],
}) => {
  const currentStatus = String(currentFee?.status || 'unavailable').toLowerCase();
  const isCurrentPaid = currentStatus === 'paid';
  const isCurrentPending = currentStatus === 'pending';
  const isCurrentPayable = Boolean(currentFee?.id) && ['unpaid', 'overdue', 'rejected'].includes(currentStatus) && currentFee?.selectable !== false;

  const currentMonthName = currentFee?.month || new Date().toLocaleString('en-US', { month: 'long' });
  const currentYear = currentFee?.year || new Date().getFullYear();
  const currentAmount = currentFee?.amount == null ? null : Number(currentFee.amount);

  const dueDateObj = currentFee?.due_date ? new Date(currentFee.due_date) : new Date(currentYear, new Date().getMonth(), 10);
  const today = new Date();
  const diffDays = Number.isNaN(dueDateObj.getTime())
    ? null
    : Math.ceil((dueDateObj - today) / (1000 * 60 * 60 * 24));

  const feeRows = useMemo(() => fees.map((fee, index) => {
    const status = String(fee.status || 'unpaid').toLowerCase();
    const isApproved = status === 'paid';
    const isPending = status === 'pending';
    const isPayable = Boolean(fee.id) && fee.selectable !== false && ['unpaid', 'overdue', 'rejected'].includes(status);
    const receiptId = fee.payment_request_id || fee.id;
    return (
      <tr key={fee.id || index}>
        <td data-label="Period">
          <div className="fee-period-title">{fee.month} {fee.year}</div>
          <small className="fee-period-meta">
            {fee.due_date ? `Due: ${new Date(fee.due_date).toLocaleDateString()}` : 'Monthly Fee'}
          </small>
        </td>
        <td data-label="Amount">
          <strong>PKR {Number(fee.amount || 0).toLocaleString()}</strong>
          {(Number(fee.tax_amount) > 0 || Number(fee.discount_amount) > 0 || Number(fee.fine_amount) > 0) && (
            <small className="fee-period-meta fee-breakdown-note">
              {Number(fee.tax_amount) > 0 ? `Tax PKR ${Number(fee.tax_amount).toLocaleString()} · ` : ''}
              {Number(fee.fine_amount) > 0 ? `Fine PKR ${Number(fee.fine_amount).toLocaleString()} · ` : ''}
              {Number(fee.discount_amount) > 0 ? `Discount −PKR ${Number(fee.discount_amount).toLocaleString()}` : ''}
            </small>
          )}
        </td>
        <td data-label="Paid via">
          {fee.payment_method ? <span className="glass-chip">{fee.payment_method === 'cash' ? 'Hand cash' : 'Online'}</span> : <span className="fee-period-meta">—</span>}
          {fee.transaction_id ? <small className="fee-period-meta fee-transaction-ref">TX: {fee.transaction_id}</small> : null}
        </td>
        <td data-label="Status">
          <span className={`badge ${String(fee.status).toLowerCase()}`}>
            {(fee.status || 'UNPAID').toUpperCase()}
          </span>
        </td>
        <td data-label="Action">
          <div className="fee-row-action">
            {isApproved ? (
              <button
                type="button"
                className="btn-primary small glass-btn fee-action-button"
                onClick={() => onDownloadReceipt && onDownloadReceipt(fee)}
                disabled={downloadingReceiptId === receiptId}
                title="Download Official PDF Receipt"
              >
                <FaDownload /> {downloadingReceiptId === fee.id ? 'Generating...' : 'Chalan / Receipt'}
              </button>
            ) : isPending ? (
                <span className="fee-pending-note">
                <FaClock /> Verification Pending
              </span>
            ) : (
              <button
                type="button"
                className="btn-secondary small glass-btn fee-action-button"
                onClick={() => onPayFeeClick(fee)}
                disabled={!isPayable}
              >
                {isPayable ? 'Pay Now' : 'Unavailable'}
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }), [fees, onPayFeeClick, onDownloadReceipt, downloadingReceiptId]);

  return (
    <section className="info-card student-fee-section glass-section" aria-labelledby="fee-section-title">
      <div className="glass-section-header">
        <div>
          <p className="glass-kicker">Financial Management</p>
          <h3 id="fee-section-title">
            <FaMoneyBillWave /> Monthly School Fee System
          </h3>
        </div>
        <button
          type="button"
          className="btn-primary glass-btn fee-header-action"
          onClick={() => isCurrentPayable && onPayFeeClick(currentFee)}
          disabled={!isCurrentPayable}
        >
          <FaMoneyBillWave /> Submit Fee Payment
        </button>
      </div>

      <div className={`current-fee-card fee-status-${isCurrentPaid ? 'paid' : isCurrentPending ? 'pending' : 'due'}`}>
        <div className="current-fee-copy">
          <div className="current-fee-label-row">
            <span className="current-fee-status">
              {isCurrentPaid ? 'PAID' : isCurrentPending ? 'PENDING VERIFICATION' : 'UNPAID / DUE'}
            </span>
            <span className="current-fee-label">Current month billing</span>
          </div>

          <h2 className="current-fee-title">
            {currentMonthName} {currentYear} Fee
          </h2>

          <div className="current-fee-amount-row">
            <span className="current-fee-amount">
              {currentAmount == null ? 'Not configured' : `PKR ${currentAmount.toLocaleString()}`}
            </span>
            <span className="current-fee-due">
              {diffDays == null ? 'Due date unavailable' : `Due ${dueDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </span>
          </div>
          {(Number(currentFee?.tax_amount) > 0 || Number(currentFee?.fine_amount) > 0 || Number(currentFee?.discount_amount) > 0) && (
            <p className="fee-breakdown-note">
              {Number(currentFee?.fine_amount) > 0 ? `Fine PKR ${Number(currentFee.fine_amount).toLocaleString()} · ` : ''}
              {Number(currentFee?.tax_amount) > 0 ? `Tax PKR ${Number(currentFee.tax_amount).toLocaleString()} · ` : ''}
              {Number(currentFee?.discount_amount) > 0 ? `Discount −PKR ${Number(currentFee.discount_amount).toLocaleString()}` : ''}
            </p>
          )}
          {currentFee?.payment_method && <p className="fee-breakdown-note">Paid via {currentFee.payment_method === 'cash' ? 'hand cash' : 'online transfer'}{currentFee.transaction_id ? ` · TX: ${currentFee.transaction_id}` : ''}</p>}

          {/* Overdue / Reminder Warning */}
          {isCurrentPayable && diffDays != null && (
            <div className={`fee-due-note ${diffDays < 0 ? 'is-overdue' : ''}`}>
              <FaExclamationCircle />
              {diffDays < 0
                ? `Fee is OVERDUE by ${Math.abs(diffDays)} day(s). Please submit immediately.`
                : `${diffDays === 0 ? 'Today is the last day!' : `${diffDays} day(s) remaining before due date.`}`}
            </div>
          )}

          {isCurrentPaid && (
            <div className="fee-state-note fee-state-note-paid">
              <FaCheckCircle /> Fee verified and paid for this billing cycle. Thank you!
            </div>
          )}

          {isCurrentPending && (
            <div className="fee-state-note fee-state-note-pending">
              <FaClock /> Payment screenshot submitted. Admin verification in progress.
            </div>
          )}
        </div>

        <div className="current-fee-action">
          {isCurrentPayable ? (
            <button
              type="button"
              className="btn-primary glass-btn fee-primary-action"
              onClick={() => onPayFeeClick(currentFee)}
            >
              💳 PAY CURRENT FEE
            </button>
          ) : isCurrentPaid ? (
            <button
              type="button"
              className="btn-primary small glass-btn fee-action-button"
              onClick={() => onDownloadReceipt && onDownloadReceipt(currentFee)}
              disabled={downloadingReceiptId === (currentFee?.payment_request_id || currentFee?.id)}
            >
              <FaDownload /> {downloadingReceiptId === currentFee?.id ? 'Generating...' : 'Download Official Chalan'}
            </button>
          ) : currentStatus === 'unavailable' ? (
            <span className="fee-unavailable-note">
              Fee structure is not configured for this class.
            </span>
          ) : (
            <span className="fee-unavailable-note">
              Pending Admin Review
            </span>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="glass-stat-grid fee-overview-grid">
        <div className="glass-stat-card">
          <h4>Total Paid Records</h4>
          <p>{feeStats.paidCount}</p>
          <span className="glass-muted">PKR {Number(feeStats.paidAmount || 0).toLocaleString()}</span>
        </div>
        <div className="glass-stat-card">
          <h4>Pending / Unpaid Records</h4>
          <p>{feeStats.pendingCount}</p>
          <span className="glass-muted">PKR {Number(feeStats.pendingAmount || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Unpaid Month Reminders */}
      {reminderFees.length > 0 && (
        <div className="ui-card fee-reminder-card">
          <div className="section-header fee-reminder-header">
            <div>
              <h4 className="fee-reminder-title">
                <FaCalendarCheck /> Pending Fee Reminders
              </h4>
              <p className="fee-reminder-copy">
                The following invoices require your attention:
              </p>
            </div>
          </div>
          <div className="lite-progress-list fee-reminder-list">
            {reminderFees.slice(0, 4).map((fee) => (
              <div
                key={fee.id}
                className="fee-reminder-row"
              >
                <div>
                  <strong>{fee.month} {fee.year}</strong>
                  <span className="fee-reminder-amount">
                    PKR {Number(fee.amount).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-primary small glass-btn fee-action-button"
                  onClick={() => onPayFeeClick(fee)}
                  disabled={!fee.selectable || !fee.id || !['unpaid', 'overdue', 'rejected'].includes(String(fee.status).toLowerCase())}
                >
                  {fee.selectable === false ? 'Unavailable' : 'Pay Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fee History Table */}
      <div className="fee-history-heading">
        <h4>Fee Payment History</h4>
        <span>Complete academic ledger</span>
      </div>

      {fees.length > 0 ? (
        <div className="glass-table-shell fee-table-shell table-scroll-x">
          <table className="student-table glass-table">
            <thead>
              <tr>
                <th>Month / Period</th>
                <th>Fee Amount</th>
                <th>Paid via / Transaction</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeRows}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state glass-empty">No fee records found in your student ledger.</p>
      )}
    </section>
  );
});

FeeSection.displayName = 'FeeSection';

export default FeeSection;
