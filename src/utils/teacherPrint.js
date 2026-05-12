const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const printHtmlDocument = (title, body) => {
  const printWindow = window.open('', '_blank', 'width=1100,height=900');

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
          .sheet {
            max-width: 960px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
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
            .sheet { box-shadow: none; border-radius: 0; max-width: none; }
          }
        </style>
      </head>
      <body>
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
          window.onload = waitForAssets;
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
}) => {
  const rowMarkup = attendanceRows
    .map(
      (row) => `
        <tr>
          <td>${new Date(row.date).toLocaleDateString()}</td>
          <td><span class="pill ${escapeHtml(row.status)}">${escapeHtml(row.status)}</span></td>
          <td>${escapeHtml(row.remarks || '-')}</td>
        </tr>`
    )
    .join('');

  const body = `
    <div class="sheet">
      <div class="hero">
        <div class="hero-row">
          <div style="display:flex;align-items:center;gap:16px;">
            <img src="${schoolLogo}" alt="School logo" />
            <div>
              <h1 style="margin:0;font-size:30px;">${escapeHtml(student.school_name || 'School Management')}</h1>
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
          <div class="meta-card"><span>Student</span><strong>${escapeHtml(student.name)}</strong></div>
          <div class="meta-card"><span>Student ID</span><strong>#${escapeHtml(student.id)}</strong></div>
          <div class="meta-card"><span>Class</span><strong>${escapeHtml(student.class_name || student.class_id || 'N/A')}</strong></div>
          <div class="meta-card"><span>Report Range</span><strong>${escapeHtml(reportMonthLabel)}</strong></div>
        </div>
        <div class="stats-grid">
          <div class="stat-card"><h4>Attendance Rate</h4><strong>${escapeHtml(stats.percent)}%</strong></div>
          <div class="stat-card"><h4>Present</h4><strong>${escapeHtml(stats.present)}</strong></div>
          <div class="stat-card"><h4>Absent</h4><strong>${escapeHtml(stats.absent)}</strong></div>
          <div class="stat-card"><h4>Total Records</h4><strong>${escapeHtml(stats.total)}</strong></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>${rowMarkup || '<tr><td colspan="3">No attendance records available.</td></tr>'}</tbody>
        </table>
        <div class="footer">
          <div>
            <p style="margin:0;">Certified Attendance Report</p>
            <p style="margin:6px 0 0;">This document was generated from the live teacher dashboard.</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0;">Teacher: ${escapeHtml(teacherName)}</p>
            <p style="margin:6px 0 0;">Student: ${escapeHtml(student.name)}</p>
          </div>
        </div>
      </div>
    </div>`;

  printHtmlDocument(`Attendance Report - ${student.name}`, body);
};
