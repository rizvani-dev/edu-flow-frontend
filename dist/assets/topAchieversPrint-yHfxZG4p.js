import{r as e}from"./rolldown-runtime-S-ySWqyJ.js";import{B as t,Bt as n,E as r,Ft as i,Ht as a,at as o,mt as s,t as c,xt as l}from"./react-vendor-CYN5fPvr.js";import{t as u}from"./axiosInstance-BV7IZC-G.js";import"./SyncQueueManager-Cy0KESMA.js";import{r as d}from"./uploadMedia-CUHF2ZKo.js";/* empty css                 */var f=e(a(),1),p=c(),m=({onSuccess:e})=>{let[t,r]=(0,f.useState)(``),[i,a]=(0,f.useState)(``),[o,s]=(0,f.useState)(!1);return(0,p.jsxs)(`section`,{className:`announcement-form-card glass-section`,children:[(0,p.jsx)(`div`,{className:`glass-section-header`,children:(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`p`,{className:`glass-kicker`,children:`Broadcast Studio`}),(0,p.jsx)(`h3`,{children:`Create New Announcement`}),(0,p.jsx)(`p`,{className:`glass-muted`,children:`Publish premium school-wide updates with cleaner structure and faster readability.`})]})}),(0,p.jsxs)(`form`,{onSubmit:async o=>{if(o.preventDefault(),!t.trim()||!i.trim()){n.error(`Title and description are required`);return}s(!0);try{await u.post(`/announcements`,{title:t.trim(),description:i.trim()}),n.success(`Announcement published successfully!`),r(``),a(``),e&&e()}catch(e){n.error(e.response?.data?.message||`Failed to publish announcement`)}finally{s(!1)}},className:`glass-form-stack`,children:[(0,p.jsx)(`input`,{className:`glass-input`,type:`text`,placeholder:`Announcement Title`,value:t,onChange:e=>r(e.target.value),required:!0}),(0,p.jsx)(`textarea`,{className:`glass-textarea`,placeholder:`Write your announcement here...`,value:i,onChange:e=>a(e.target.value),rows:`5`,required:!0}),(0,p.jsx)(`button`,{type:`submit`,disabled:o,className:`publish-btn glass-btn`,children:o?`Publishing...`:`Publish Announcement`})]})]})},h=({cards:e=[],summary:n,onExport:a,onAiConsult:c})=>(0,p.jsxs)(`section`,{className:`ai-glass-panel ai-achiever-panel`,children:[(0,p.jsxs)(`div`,{className:`ai-panel-header`,children:[(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`p`,{className:`ai-panel-kicker`,children:`AI Recognition Engine`}),(0,p.jsx)(`h3`,{children:`Top Achievers Spotlight`}),(0,p.jsx)(`p`,{className:`ai-panel-subtitle`,children:n||`Real-time performance metrics and AI-driven growth tracking.`})]}),(0,p.jsxs)(`button`,{className:`ai-export-btn`,onClick:()=>a?.(e,n),children:[(0,p.jsx)(t,{}),` Export Report`]})]}),(0,p.jsx)(`div`,{className:`ai-achiever-grid`,children:e.length?e.map((e,t)=>(0,p.jsxs)(`article`,{className:`ai-achiever-card`,children:[(0,p.jsx)(`div`,{className:`ai-achiever-glow`}),(0,p.jsxs)(`header`,{className:`achiever-card-identity`,children:[(0,p.jsxs)(`div`,{className:`achiever-avatar-wrap`,children:[e.profileImage?(0,p.jsx)(`img`,{src:d(e.profileImage),alt:e.title,className:`achiever-img`}):(0,p.jsx)(`div`,{className:`achiever-fallback`,children:e.title?.[0]||`S`}),(0,p.jsxs)(`span`,{className:`achiever-rank-pill`,children:[`#`,e.rank||t+1]})]}),(0,p.jsxs)(`div`,{className:`achiever-meta`,children:[(0,p.jsx)(`h4`,{children:e.title||`Student Achievement`}),(0,p.jsxs)(`span`,{className:`achiever-sub`,children:[`ID: `,e.studentId,` • `,e.className]}),(0,p.jsxs)(`span`,{className:`ai-category-chip`,children:[(0,p.jsx)(l,{}),` `,e.category||`Elite`]})]})]}),(0,p.jsx)(`p`,{className:`achiever-bio`,children:e.bio||e.description||`Consistent excellence detected in this evaluation cycle.`}),(0,p.jsxs)(`div`,{className:`achiever-metrics-grid`,children:[(0,p.jsxs)(`div`,{className:`metric-box`,children:[(0,p.jsxs)(`div`,{className:`metric-header`,children:[(0,p.jsxs)(`span`,{children:[(0,p.jsx)(r,{}),` Result`]}),` `,(0,p.jsxs)(`strong`,{children:[e.resultPercent,`%`]})]}),(0,p.jsx)(`div`,{className:`metric-track`,children:(0,p.jsx)(`span`,{className:`metric-fill result`,style:{width:`${e.resultPercent}%`}})})]}),(0,p.jsxs)(`div`,{className:`metric-box`,children:[(0,p.jsxs)(`div`,{className:`metric-header`,children:[(0,p.jsxs)(`span`,{children:[(0,p.jsx)(i,{}),` Att.`]}),` `,(0,p.jsxs)(`strong`,{children:[e.attendancePercent,`%`]})]}),(0,p.jsx)(`div`,{className:`metric-track`,children:(0,p.jsx)(`span`,{className:`metric-fill attendance`,style:{width:`${e.attendancePercent}%`}})})]}),(0,p.jsxs)(`div`,{className:`metric-box`,children:[(0,p.jsxs)(`div`,{className:`metric-header`,children:[(0,p.jsxs)(`span`,{children:[(0,p.jsx)(o,{}),` Fees`]}),` `,(0,p.jsxs)(`strong`,{children:[e.feePercent,`%`]})]}),(0,p.jsx)(`div`,{className:`metric-track`,children:(0,p.jsx)(`span`,{className:`metric-fill fee`,style:{width:`${e.feePercent}%`}})})]})]}),(0,p.jsxs)(`div`,{className:`achiever-actions`,children:[(0,p.jsxs)(`button`,{className:`btn-ai-consult`,onClick:()=>c?.(e),children:[(0,p.jsx)(s,{}),` Growth Plan`]}),(0,p.jsx)(`div`,{className:`achievement-score`,children:(0,p.jsxs)(`div`,{className:`score-ring`,children:[(0,p.jsxs)(`svg`,{viewBox:`0 0 36 36`,children:[(0,p.jsx)(`path`,{className:`ring-bg`,d:`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`}),(0,p.jsx)(`path`,{className:`ring-fill`,strokeDasharray:`${e.achievementPercent||0}, 100`,d:`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`})]}),(0,p.jsxs)(`span`,{children:[Math.round(e.achievementPercent||0),`%`]})]})})]}),(0,p.jsx)(`footer`,{className:`achiever-footer`,children:(0,p.jsx)(`p`,{children:e.schoolNote||`Momentum is strong. Keep supporting this trajectory.`})})]},`${e.studentId||t}-${e.category}`)):(0,p.jsx)(`div`,{className:`ai-empty-state`,children:`AI achiever cards will appear here after enough academic activity is available.`})})]}),g=({achievers:e,summary:t,schoolName:n,logoUrl:r,preparedBy:i})=>{let a=window.open(``,`_blank`),o=new Date().toLocaleDateString(),s=e.map((e,t)=>`
    <div class="achiever-card">
      <div class="achiever-header">
        <div class="rank">#${e.rank||t+1}</div>
        <div class="identity">
          <h3>${e.title||`Student`}</h3>
          <p>ID: ${e.studentId||`N/A`} | Class: ${e.className||`N/A`}</p>
        </div>
        <div class="category">${e.category||`Academic`}</div>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="label">Attendance</span>
          <div class="bar-bg"><div class="bar-fill" style="width: ${e.attendancePercent||0}%"></div></div>
          <span class="value">${e.attendancePercent||0}%</span>
        </div>
        <div class="stat-item">
          <span class="label">Result Avg</span>
          <div class="bar-bg"><div class="bar-fill result" style="width: ${e.resultPercent||0}%"></div></div>
          <span class="value">${e.resultPercent||0}%</span>
        </div>
        <div class="stat-item">
          <span class="label">Fee Status</span>
          <div class="bar-bg"><div class="bar-fill fee" style="width: ${e.feePercent||0}%"></div></div>
          <span class="value">${e.feePercent||0}%</span>
        </div>
      </div>
      <p class="note"><strong>AI Insight:</strong> ${e.description||`Consistent performance detected.`}</p>
    </div>
  `).join(``);a.document.write(`
    <html>
      <head>
        <title>Top Achievers Report - ${n}</title>
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
            <img src="${r}" class="logo" />
            <div class="report-title">
              <h1>Top Achievers Spotlight</h1>
              <p>${n}</p>
            </div>
          </div>
          <div style="text-align: right">
            <p><strong>Date:</strong> ${o}</p>
            <button class="no-print" onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">Print to PDF</button>
          </div>
        </div>

        <div class="summary-box">
          <strong>Executive Summary:</strong>
          <p>${t||`This report highlights the standout performers based on attendance, academic results, and financial compliance.`}</p>
        </div>

        <div class="achievers-list">
          ${s}
        </div>

        <div class="footer">
          <p>This report was generated automatically by the school recognition engine.</p>
          <p>Prepared by: ${i} | &copy; ${new Date().getFullYear()} ${n}</p>
          <p>Powered by <a href="https://instagram.com/rizvani.dev" target="_blank" rel="noreferrer">EduFlow</a></p>
        </div>
      </body>
    </html>
  `),a.document.close()};export{h as n,m as r,g as t};