
import { resolveMediaUrl } from './media'; 


export const openTopAchieversPrintWindow = ({ achievers, summary, schoolName, logoUrl, preparedBy }) => {
  const printWindow = window.open('', '_blank');
  const date = new Date().toLocaleDateString();

  const achieverRows = achievers.map((card, index) => `
    <div class="achiever-card">
      <div class="achiever-header">
        <div class="rank">#${card.rank || index + 1}</div>
        <div class="identity">
          <h3>${card.title || 'Student'}</h3>
          <p>ID: ${card.studentId || 'N/A'} | Class: ${card.className || 'N/A'}</p>
        </div>
        <div class="category">${card.category || 'Academic'}</div>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="label">Attendance</span>
          <div class="bar-bg"><div class="bar-fill" style="width: ${card.attendancePercent || 0}%"></div></div>
          <span class="value">${card.attendancePercent || 0}%</span>
        </div>
        <div class="stat-item">
          <span class="label">Result Avg</span>
          <div class="bar-bg"><div class="bar-fill result" style="width: ${card.resultPercent || 0}%"></div></div>
          <span class="value">${card.resultPercent || 0}%</span>
        </div>
        <div class="stat-item">
          <span class="label">Fee Status</span>
          <div class="bar-bg"><div class="bar-fill fee" style="width: ${card.feePercent || 0}%"></div></div>
          <span class="value">${card.feePercent || 0}%</span>
        </div>
      </div>
      <p class="note"><strong>AI Insight:</strong> ${card.description || 'Consistent performance detected.'}</p>
    </div>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Top Achievers Report - ${schoolName}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { display: flex; align-items: center; gap: 15px; }
          .logo { width: 60px; height: 60px; object-fit: contain; }
          .report-title h1 { margin: 0; font-size: 24px; color: #2563eb; }
          .summary-box { background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #2563eb; }
          .achiever-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
          .achiever-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
          .rank { background: #2563eb; color: white; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; }
          .identity h3 { margin: 0; font-size: 18px; }
          .identity p { margin: 2px 0 0; font-size: 13px; color: #64748b; }
          .category { margin-left: auto; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 15px 0; }
          .stat-item { display: flex; flex-direction: column; gap: 5px; }
          .stat-item .label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; }
          .stat-item .value { font-size: 14px; font-weight: 700; }
          .bar-bg { background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden; }
          .bar-fill { background: #10b981; height: 100%; }
          .bar-fill.result { background: #3b82f6; }
          .bar-fill.fee { background: #f59e0b; }
          .note { font-size: 13px; background: #f1f5f9; padding: 10px; border-radius: 8px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .footer a { color: #2563eb; text-decoration: none; font-weight: 700; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <img src="${logoUrl}" class="logo" />
            <div class="report-title">
              <h1>Top Achievers Spotlight</h1>
              <p>${schoolName}</p>
            </div>
          </div>
          <div style="text-align: right">
            <p><strong>Date:</strong> ${date}</p>
            <button class="no-print" onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">Print to PDF</button>
          </div>
        </div>

        <div class="summary-box">
          <strong>Executive Summary:</strong>
          <p>${summary || 'This report highlights the standout performers based on attendance, academic results, and financial compliance.'}</p>
        </div>

        <div class="achievers-list">
          ${achieverRows}
        </div>

        <div class="footer">
          <p>This report was generated automatically by the school recognition engine.</p>
          <p>Prepared by: ${preparedBy} | &copy; ${new Date().getFullYear()} ${schoolName}</p>
          <p>Powered by <a href="https://instagram.com/rizvani.dev" target="_blank" rel="noreferrer">EduFlow</a></p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
};
