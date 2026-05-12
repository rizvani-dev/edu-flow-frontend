const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const openAdminReportPrintWindow = ({ analytics, template, logoUrl }) => {
  const printWindow = window.open('', '_blank', 'width=1100,height=900');

  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups to export the report.');
  }

  const attendanceRows = analytics.attendanceByClass
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.class_name)}</td>
          <td>${row.present_count ?? 0}</td>
          <td>${row.absent_count ?? 0}</td>
          <td>${row.late_count ?? 0}</td>
          <td>${Number(row.attendance_percentage || 0).toFixed(1)}%</td>
        </tr>`
    )
    .join('');

  const resultRows = analytics.resultsByClass
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.class_name)}</td>
          <td>${Number(row.average_marks || 0).toFixed(1)}%</td>
          <td>${row.students_evaluated ?? 0}</td>
          <td>${row.total_results ?? 0}</td>
        </tr>`
    )
    .join('');

  const feeRows = analytics.feeByClass
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.class_name)}</td>
          <td>${currency(row.total_fees)}</td>
          <td>${currency(row.paid_fees)}</td>
          <td>${currency(row.pending_fees)}</td>
        </tr>`
    )
    .join('');

  const normalizeLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${window.location.origin}${url}`;
    return `${window.location.origin}/${url}`;
  };

  const normalizedLogoUrl = normalizeLogoUrl(logoUrl);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(template.schoolName)} Report</title>
        <style>
          :root {
            --accent: ${template.accentColor};
            --soft: #f8fafc;
            --ink: #172033;
            --muted: #5b6475;
            --line: #dbe2ea;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 28px;
            font-family: Arial, Helvetica, sans-serif;
            color: var(--ink);
            background: white;
          }
          .sheet {
            border: 1px solid var(--line);
            border-radius: 24px;
            overflow: hidden;
          }
          .hero {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            padding: 28px;
            background: linear-gradient(135deg, var(--accent), #0f172a);
            color: white;
          }
          .hero img {
            width: 72px;
            height: 72px;
            object-fit: contain;
            background: rgba(255,255,255,0.12);
            border-radius: 18px;
            padding: 10px;
          }
          .muted { color: var(--muted); }
          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            padding: 24px 28px 4px;
          }
          .summary-card {
            background: var(--soft);
            border: 1px solid var(--line);
            border-radius: 18px;
            padding: 16px;
          }
          .summary-card h4 {
            margin: 0 0 6px;
            font-size: 13px;
            color: var(--muted);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .04em;
          }
          .summary-card strong {
            font-size: 28px;
          }
          .section {
            padding: 20px 28px 0;
          }
          .section h3 {
            margin: 0 0 12px;
            font-size: 18px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid var(--line);
            border-radius: 16px;
            overflow: hidden;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--line);
            font-size: 13px;
          }
          th {
            background: var(--soft);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .04em;
          }
          .footer {
            padding: 24px 28px 28px;
            color: var(--muted);
            font-size: 12px;
          }
          @media print {
            body { padding: 0; }
            .sheet { border: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="hero">
            <div>
              <div style="display:flex;align-items:center;gap:16px;">
                <img src="${normalizedLogoUrl}" alt="School logo" />
                <div>
                  <h1 style="margin:0;font-size:30px;">${escapeHtml(template.schoolName)}</h1>
                  <p style="margin:6px 0 0;opacity:.86;">${escapeHtml(template.reportTitle)}</p>
                </div>
              </div>
            </div>
            <div style="text-align:right;">
              <p style="margin:0 0 8px;">Generated: ${new Date(analytics.generatedAt).toLocaleString()}</p>
              <p style="margin:0 0 8px;">Prepared By: ${escapeHtml(template.preparedBy)}</p>
              <p style="margin:0;">Principal: ${escapeHtml(template.principalName)}</p>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card"><h4>Total Students</h4><strong>${analytics.summary.totalStudents}</strong></div>
            <div class="summary-card"><h4>Total Teachers</h4><strong>${analytics.summary.totalTeachers}</strong></div>
            <div class="summary-card"><h4>Total Classes</h4><strong>${analytics.summary.totalClasses}</strong></div>
            <div class="summary-card"><h4>Announcements</h4><strong>${analytics.summary.totalAnnouncements}</strong></div>
          </div>

          <div class="section">
            <h3>Attendance Analytics</h3>
            <table>
              <thead>
                <tr><th>Class</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance %</th></tr>
              </thead>
              <tbody>${attendanceRows || '<tr><td colspan="5">No attendance data available.</td></tr>'}</tbody>
            </table>
          </div>

          <div class="section">
            <h3>Result Analytics</h3>
            <table>
              <thead>
                <tr><th>Class</th><th>Average Result</th><th>Students Evaluated</th><th>Total Entries</th></tr>
              </thead>
              <tbody>${resultRows || '<tr><td colspan="4">No result data available.</td></tr>'}</tbody>
            </table>
          </div>

          <div class="section">
            <h3>Fee Analytics</h3>
            <table>
              <thead>
                <tr><th>Class</th><th>Total Fees</th><th>Collected</th><th>Pending</th></tr>
              </thead>
              <tbody>${feeRows || '<tr><td colspan="4">No fee data available.</td></tr>'}</tbody>
            </table>
          </div>

          <div class="footer">
            <p style="margin:0 0 8px;">${escapeHtml(template.footerNote)}</p>
            <p style="margin:0;">Template color: ${escapeHtml(template.accentColor)}</p>
          </div>
        </div>
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
            setTimeout(() => {
              window.print();
            }, 250);
          };
          window.onload = waitForAssets;
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
