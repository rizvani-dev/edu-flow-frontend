const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toHtml = (text = '') =>
  escapeHtml(text)
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^\- (.*)$/gm, '<li>$1</li>')
    .replace(/\n{2,}/g, '</p><p>');

export const exportAssistantMessageAsPdf = ({
  schoolName = 'EduFlow',
  title = 'AI Report',
  text = '',
}) => {
  const popup = window.open('', '_blank', 'width=900,height=700');
  if (!popup) return false;

  const listWrapped = toHtml(text).replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  const timestamp = new Date().toLocaleString();

  popup.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #0f172a; line-height: 1.6; }
          header { border-bottom: 2px solid #cbd5e1; margin-bottom: 24px; padding-bottom: 12px; }
          h1, h2, h3 { color: #0f3d91; margin: 0 0 12px; }
          p { margin: 0 0 14px; }
          ul { margin: 0 0 14px 22px; }
          .meta { color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <header>
          <h1>${escapeHtml(schoolName)}</h1>
          <h2>${escapeHtml(title)}</h2>
          <p class="meta">Generated from EduFlow AI on ${escapeHtml(timestamp)}</p>
        </header>
        <main><p>${listWrapped}</p></main>
        <div class="footer">
            <p style="margin:8px 0 0;">Powered by <a class="powered-link" href="https://instagram.com/rizvani.dev" target="_blank" rel="noreferrer">EduFlow</a></p>
          </div>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
};
