const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const openWeeklyHomeworkPrintWindow = ({
  student,
  homework,
  schoolLogo,
  schoolName,
  generatedAt,
}) => {
  const printWindow = window.open('', '_blank', 'width=1100,height=900');

  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups to export the weekly diary.');
  }

  const homeworkRows = homework
    .map(
      (hw) => `
      <div class="hw-item">
        <div class="hw-meta">
          <span class="subject-badge">${escapeHtml(hw.subject || 'General')}</span>
          <span class="date-badge">Assigned: ${new Date(hw.assigned_date).toLocaleDateString()}</span>
          <span class="due-badge">Due: ${hw.expires_at ? new Date(hw.expires_at).toLocaleDateString() : 'N/A'}</span>
        </div>
        <h3 class="hw-title">${escapeHtml(hw.title)}</h3>
        <p class="hw-desc">${escapeHtml(hw.description || 'No additional instructions provided.')}</p>
        <div class="hw-footer">
          <span>Teacher: <strong>${escapeHtml(hw.teacher_name || 'Class Teacher')}</strong></span>
        </div>
      </div>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Weekly Homework Diary - ${escapeHtml(student?.name || 'Student')}</title>
        <style>
          :root {
            --accent: #4f46e5;
            --bg-soft: #f8fafc;
            --border: #e2e8f0;
            --text-main: #1e293b;
            --text-muted: #64748b;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 40px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: var(--text-main);
            background: white;
            line-height: 1.5;
          }
          .sheet {
            max-width: 900px;
            margin: 0 auto;
            border: 1px solid var(--border);
            border-radius: 16px;
            overflow: hidden;
            padding-bottom: 40px;
          }
          .header {
            background: linear-gradient(135deg, var(--accent), #312e81);
            color: white;
            padding: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header img {
            width: 70px;
            height: 70px;
            object-fit: contain;
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
            padding: 8px;
          }
          .header-info h1 { margin: 0; font-size: 24px; }
          .header-info p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
          
          .student-bar {
            background: var(--bg-soft);
            padding: 20px 30px;
            border-bottom: 1px solid var(--border);
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .student-bar div span {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: var(--text-muted);
            margin-bottom: 4px;
          }
          .student-bar div strong { font-size: 15px; }

          .content { padding: 30px; }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--accent);
            display: inline-block;
          }

          .hw-item {
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          .hw-meta {
            display: flex;
            gap: 10px;
            margin-bottom: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          .subject-badge { background: #e0e7ff; color: #4338ca; padding: 3px 10px; border-radius: 20px; }
          .date-badge { color: var(--text-muted); }
          .due-badge { color: #b91c1c; }
          .hw-title { margin: 0 0 10px; font-size: 17px; color: var(--accent); }
          .hw-desc { margin: 0 0 15px; font-size: 14px; color: #475569; white-space: pre-wrap; }
          .hw-footer { border-top: 1px dashed var(--border); padding-top: 10px; font-size: 12px; color: var(--text-muted); }

          .print-footer {
            margin-top: 50px;
            padding: 0 30px;
            display: flex;
            justify-content: space-between;
          }
          .powered-link {
            color: var(--accent);
            text-decoration: none;
            font-weight: 700;
          }
          .sig-box { width: 200px; text-align: center; }
          .sig-line { border-top: 1px solid var(--text-main); margin-bottom: 8px; }
          .sig-box p { margin: 0; font-size: 12px; font-weight: 600; }

          @media print {
            body { padding: 0; }
            .sheet { border: none; border-radius: 0; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="header-info">
              <h1>${escapeHtml(schoolName)}</h1>
              <p>Weekly Homework Diary • Generated on ${escapeHtml(generatedAt)}</p>
            </div>
            <img src="${schoolLogo}" alt="Logo" />
          </div>
          <div class="student-bar">
            <div><span>Student Name</span><strong>${escapeHtml(student?.name || 'N/A')}</strong></div>
            <div><span>Class Section</span><strong>${escapeHtml(student?.class_name || 'N/A')}</strong></div>
            <div><span>Student ID</span><strong>#${escapeHtml(student?.id || 'N/A')}</strong></div>
          </div>
          <div class="content">
            <h2 class="section-title">Assignments for the Week</h2>
            ${homeworkRows || '<p style="text-align:center; padding: 40px; color: #64748b;">No homework assignments found for this week.</p>'}
          </div>
          <div class="print-footer">
            <div class="sig-box"><div class="sig-line"></div><p>Class Teacher Signature</p></div>
            <div class="sig-box"><div class="sig-line"></div><p>Parent/Guardian Signature</p><p style="margin-top:10px;">Powered by <a class="powered-link" href="https://instagram.com/rizvani.dev" target="_blank" rel="noreferrer">EduFlow</a></p></div>
          </div>
        </div>
        <script>window.onload = () => { setTimeout(() => window.print(), 500); };</script>
      </body>
    </html>`;

  printWindow.document.write(html);
  printWindow.document.close();
};
