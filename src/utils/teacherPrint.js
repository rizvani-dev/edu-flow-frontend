const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const printHtmlDocument = (title, body, { autoPrint = true, fullScreen = false } = {}) => {
  const windowFeatures = fullScreen ? undefined : 'width=1100,height=900';
  const printWindow = window.open('', '_blank', windowFeatures);

  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups to export the document.');
  }

  const html = `<!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 28px;
            font-family: Arial, Helvetica, sans-serif;
            color: #172033;
            background: #eef4ff;
          }
          body.full-screen-report {
            padding: 0;
            background: #f1f5f9;
          }
          .print-toolbar {
            position: sticky;
            top: 0;
            z-index: 1;
            display: flex;
            justify-content: flex-end;
            padding: 12px 20px;
            background: rgba(255,255,255,.96);
            border-bottom: 1px solid #dbe2ea;
          }
          .print-toolbar button {
            border: 0;
            border-radius: 10px;
            padding: 11px 16px;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            font: inherit;
            font-weight: 700;
            cursor: pointer;
          }
          .sheet {
            max-width: 960px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
          }
          body.full-screen-report .sheet {
            width: 100%;
            max-width: none;
            min-height: calc(100vh - 57px);
            border-radius: 0;
            box-shadow: none;
          }
          .hero {
            padding: 28px 32px;
            background: linear-gradient(135deg, #1d4ed8, #0f172a);
            color: white;
          }
          .hero-row {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            align-items: center;
          }
          .hero img {
            width: 74px;
            height: 74px;
            object-fit: contain;
            border-radius: 18px;
            padding: 10px;
            background: rgba(255,255,255,0.12);
          }
          .content {
            padding: 28px 32px 32px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 24px;
          }
          .meta-card {
            border: 1px solid #dbe2ea;
            border-radius: 18px;
            padding: 16px;
            background: #f8fafc;
          }
          .meta-card span {
            display: block;
            color: #5b6475;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .05em;
            margin-bottom: 6px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin: 24px 0;
          }
          .analytics-chart { margin: 18px 0 24px; padding: 16px; border: 1px solid #dbe2ea; border-radius: 16px; background: #f8fafc; }
          .analytics-chart h4 { margin: 0 0 10px; font-size: 13px; color: #5b6475; }
          .analytics-bar { height: 12px; overflow: hidden; border-radius: 999px; background: #e2e8f0; }
          .analytics-bar span { display: block; width: ${Math.max(0, Math.min(100, Number(stats.percent || 0)))}%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #10b981, #2563eb); }
          .analytics-legend { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 9px; color: #5b6475; font-size: 12px; }
          .stat-card {
            border: 1px solid #dbe2ea;
            border-radius: 18px;
            padding: 16px;
            background: #f8fafc;
          }
          .stat-card h4 {
            margin: 0 0 8px;
            color: #5b6475;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .04em;
          }
          .stat-card strong {
            font-size: 28px;
            color: #111827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 18px;
          }
          th, td {
            border-bottom: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            vertical-align: top;
          }
          th {
            background: #eff6ff;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .05em;
          }
          .footer {
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            color: #5b6475;
            font-size: 12px;
          }
          .powered-link {
            color: #2563eb;
            text-decoration: none;
            font-weight: 700;
          }
          .pill {
            display: inline-block;
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 700;
          }
          .pill.paid, .pill.present { background: #dcfce7; color: #166534; }
          .pill.pending, .pill.absent { background: #fee2e2; color: #991b1b; }
          .pill.late { background: #fef3c7; color: #92400e; }
          @media print {
            body { padding: 0; background: white; }
            .print-toolbar { display: none; }
            .sheet { box-shadow: none; border-radius: 0; max-width: none; }
          }
          @media (max-width: 640px) {
            body.full-screen-report .content { padding: 20px 16px; }
            body.full-screen-report .hero { padding: 22px 16px; }
            body.full-screen-report .hero-row { align-items: flex-start; }
            body.full-screen-report .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            body.full-screen-report .meta-grid { grid-template-columns: minmax(0, 1fr); }
          }
        </style>
      </head>
      <body class="${fullScreen ? 'full-screen-report' : ''}">
        ${fullScreen ? '<div class="print-toolbar"><button type="button" onclick="window.print()">Save as PDF / Print Report</button></div>' : ''}
        ${body}
        <script>
          const waitForAssets = async () => {
            const images = Array.from(document.images || []);
            await Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
              image.onload = resolve;
              image.onerror = resolve;
            })));
            if (document.fonts && document.fonts.ready) {
              await document.fonts.ready;
            }
            setTimeout(() => window.print(), 250);
          };
          window.onload = ${autoPrint ? 'waitForAssets' : 'null'};
        </script>
      </body>
    </html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};

export const openTeacherReceiptPrintWindow = ({ fee, schoolLogo, teacherName }) => {
  const title = `Fee Receipt - ${fee.student_name}`;
  const body = `
    <div class="sheet">
      <div class="hero">
        <div class="hero-row">
          <div style="display:flex;align-items:center;gap:16px;">
            <img src="${schoolLogo}" alt="School logo" />
            <div>
              <h1 style="margin:0;font-size:30px;">${escapeHtml(fee.school_name || 'School Management')}</h1>
              <p style="margin:6px 0 0;opacity:.86;">Fee Payment Receipt</p>
            </div>
          </div>
          <div style="text-align:right;">
            <p style="margin:0 0 8px;">Generated: ${new Date().toLocaleString()}</p>
            <p style="margin:0;">Handled By: ${escapeHtml(teacherName)}</p>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="meta-grid">
          <div class="meta-card"><span>Student</span><strong>${escapeHtml(fee.student_name)}</strong></div>
          <div class="meta-card"><span>Student ID</span><strong>#${escapeHtml(fee.student_id)}</strong></div>
          <div class="meta-card"><span>Billing Month</span><strong>${escapeHtml(fee.month)} ${escapeHtml(fee.year)}</strong></div>
          <div class="meta-card"><span>Status</span><strong><span class="pill ${escapeHtml(fee.status)}">${escapeHtml(String(fee.status).toUpperCase())}</span></strong></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Class</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PKR ${escapeHtml(fee.amount)}</td>
              <td>${fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'N/A'}</td>
              <td>${escapeHtml(fee.class_name || 'N/A')}</td>
              <td>${escapeHtml(fee.remarks || 'No additional remarks')}</td>
            </tr>
          </tbody>
        </table>
        <div class="footer">
          <div>
            <p style="margin:0 0 6px;">Parent Signature</p>
            <div style="width:220px;border-top:1px solid #94a3b8;"></div>
          </div>
          <div style="text-align:right;">
            <p style="margin:0 0 6px;">Teacher Signature</p>
            <div style="width:220px;border-top:1px solid #94a3b8;"></div>
            <p style="margin:12px 0 0;">Powered by <a class="powered-link" href="https://instagram.com/rizvani.dev" target="_blank" rel="noreferrer">EduFlow</a></p>
          </div>
        </div>
      </div>
    </div>`;

  printHtmlDocument(title, body);
};

export const openTeacherAttendancePrintWindow = ({
  student,
  attendanceRows,
  reportMonthLabel,
  stats,
  schoolLogo,
  teacherName,
  includeStudentColumn = false,
  autoPrint = true,
  fullScreen = false,
  studentFees = [],
  studentFeeStats = { paidCount: 0, pendingCount: 0, paidAmount: 0, pendingAmount: 0 },
}) => {
  const hasFeeOverview = studentFees.length > 0
    || Object.values(studentFeeStats).some((value) => Number(value) !== 0);

  const rowMarkup = attendanceRows
    .map(
      (row) => `
        <tr>
          ${includeStudentColumn ? `<td>${escapeHtml(row.student_name || `Student #${row.student_id || row.studentId || 'N/A'}`)}</td>` : ''}
          <td>${new Date(row.date).toLocaleDateString()}</td>
          <td><span class="pill ${escapeHtml(row.status)}">${escapeHtml(row.status)}</span></td>
          <td>${escapeHtml(row.remarks || '-')}</td>
        </tr>`
    )
    .join('');

  const feeRowsMarkup = studentFees.length > 0 ? studentFees.map(fee => `
    <tr>
      <td>${escapeHtml(fee.month)} ${escapeHtml(fee.year)}</td>
      <td>PKR ${escapeHtml(fee.amount)}</td>
      <td><span class="pill ${escapeHtml(fee.status)}">${escapeHtml(String(fee.status).toUpperCase())}</span></td>
      <td>${fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'N/A'}</td>
    </tr>
  `).join('') : '<tr><td colspan="4">No fee records available.</td></tr>';

  const body = `
    <div class="sheet">
      <div class="hero">
        <div class="hero-row">
          <div style="display:flex;align-items:center;gap:16px;">
            <img src="${escapeHtml(schoolLogo)}" alt="School logo" />
            <div>
              <h1 style="margin:0;font-size:30px;">${escapeHtml(student?.school_name || 'School Management')}</h1>
              <p style="margin:6px 0 0;opacity:.86;">Official Attendance Report</p>
            </div>
          </div>
          <div style="text-align:right;">
            <p style="margin:0 0 8px;">Generated: ${new Date().toLocaleString()}</p>
            <p style="margin:0;">Prepared By: ${escapeHtml(teacherName)}</p>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="meta-grid">
          <div class="meta-card"><span>${includeStudentColumn ? 'Class' : 'Student'}</span><strong>${escapeHtml(includeStudentColumn ? student?.class_name || 'Class Roster' : student?.name || 'N/A')}</strong></div>
          ${!includeStudentColumn ? `<div class="meta-card"><span>Student ID</span><strong>#${escapeHtml(student?.id || 'N/A')}</strong></div>` : ''}
          ${!includeStudentColumn ? `<div class="meta-card"><span>Class</span><strong>${escapeHtml(student?.class_name || student?.class_id || 'N/A')}</strong></div>` : ''}
          <div class="meta-card"><span>Report Range</span><strong>${escapeHtml(reportMonthLabel)}</strong></div>
        </div>
        <div class="stats-grid">
          <div class="stat-card"><h4>Attendance Rate</h4><strong>${escapeHtml(stats.percent)}%</strong></div>
          <div class="stat-card"><h4>Present</h4><strong>${escapeHtml(stats.present)}</strong></div>
          <div class="stat-card"><h4>Absent</h4><strong>${escapeHtml(stats.absent)}</strong></div>
          <div class="stat-card"><h4>Total Records</h4><strong>${escapeHtml(stats.total)}</strong></div>
        </div>
        <div class="analytics-chart"><h4>Attendance trend for this report scope: ${escapeHtml(stats.percent)}%</h4><div class="analytics-bar"><span></span></div><div class="analytics-legend"><span>Present: ${escapeHtml(stats.present)}</span><span>Late: ${escapeHtml(stats.late || 0)}</span><span>Absent: ${escapeHtml(stats.absent)}</span></div></div>

        ${hasFeeOverview ? `
          <h3 style="margin-top: 30px; margin-bottom: 15px; color: #172033;">Financial Overview</h3>
          <div class="meta-grid">
            <div class="meta-card"><span>Total Fees Paid</span><strong>PKR ${escapeHtml(studentFeeStats.paidAmount.toLocaleString())}</strong></div>
            <div class="meta-card"><span>Total Fees Pending</span><strong>PKR ${escapeHtml(studentFeeStats.pendingAmount.toLocaleString())}</strong></div>
            <div class="meta-card"><span>Paid Records</span><strong>${escapeHtml(studentFeeStats.paidCount)}</strong></div>
            <div class="meta-card"><span>Pending Records</span><strong>${escapeHtml(studentFeeStats.pendingCount)}</strong></div>
          </div>

          <h4 style="margin-top: 20px; margin-bottom: 10px; color: #172033;">Fee Details</h4>
          <table>
            <thead><tr><th>Period</th><th>Amount</th><th>Status</th><th>Due Date</th></tr></thead>
            <tbody>${feeRowsMarkup}</tbody>
          </table>
        ` : ''}

        <table>
          <thead>
            <tr>
              ${includeStudentColumn ? '<th>Student</th>' : ''}
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>${rowMarkup || `<tr><td colspan="${includeStudentColumn ? 4 : 3}">No attendance records available.</td></tr>`}</tbody>
        </table>
        <div class="footer">
          <div>
            <p style="margin:0;">Certified Attendance Report</p>
            <p style="margin:6px 0 0;">This document was generated from the live teacher dashboard.</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0;">Teacher: ${escapeHtml(teacherName)}</p>
              ${!includeStudentColumn ? `<p style="margin:6px 0 0;">Student: ${escapeHtml(student?.name || 'N/A')}</p>` : ''}
            <p style="margin:10px 0 0;">Powered by <a class="powered-link" href="https://eduflow.example.com" target="_blank" rel="noreferrer">EduFlow</a></p>
          </div>
        </div>
      </div>
    </div>`;

  printHtmlDocument(
    `Attendance Report - ${student?.name || student?.class_name || 'Class Roster'}`,
    body,
    { autoPrint, fullScreen }
  );
};
