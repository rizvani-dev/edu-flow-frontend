import{r as e}from"./rolldown-runtime-S-ySWqyJ.js";import{B as t,D as n,Et as r,F as i,J as a,K as o,V as s,Vt as c,Wt as l,Y as u,dt as d,ht as f,k as p,kt as m,q as h,t as g,ut as ee,wt as te}from"./react-vendor-D72TnJY7.js";import{n as ne,t as _}from"./axiosInstance-BV7IZC-G.js";import"./logo-Cf960Oaq.js";import{t as re}from"./syncManager-D0oq6_rL.js";import{n as ie,t as ae}from"./LightweightCharts-CGE_ksfY.js";var v=e(l(),1),y=(e=``)=>String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`),b=(e,t,{autoPrint:n=!0,fullScreen:r=!1}={})=>{let i=r?void 0:`width=1100,height=900`,a=window.open(``,`_blank`,i);if(!a)throw Error(`Popup blocked. Please allow popups to export the document.`);let o=`<!DOCTYPE html>
    <html>
      <head>
        <title>${y(e)}</title>
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
          .analytics-bar span { display: block; width: ${Math.max(0,Math.min(100,Number(stats.percent||0)))}%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #10b981, #2563eb); }
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
      <body class="${r?`full-screen-report`:``}">
        ${r?`<div class="print-toolbar"><button type="button" onclick="window.print()">Save as PDF / Print Report</button></div>`:``}
        ${t}
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
          window.onload = ${n?`waitForAssets`:`null`};
        <\/script>
      </body>
    </html>`;a.document.open(),a.document.write(o),a.document.close()},x=({fee:e,schoolLogo:t,teacherName:n})=>{b(`Fee Receipt - ${e.student_name}`,`
    <div class="sheet">
      <div class="hero">
        <div class="hero-row">
          <div style="display:flex;align-items:center;gap:16px;">
            <img src="${t}" alt="School logo" />
            <div>
              <h1 style="margin:0;font-size:30px;">${y(e.school_name||`School Management`)}</h1>
              <p style="margin:6px 0 0;opacity:.86;">Fee Payment Receipt</p>
            </div>
          </div>
          <div style="text-align:right;">
            <p style="margin:0 0 8px;">Generated: ${new Date().toLocaleString()}</p>
            <p style="margin:0;">Handled By: ${y(n)}</p>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="meta-grid">
          <div class="meta-card"><span>Student</span><strong>${y(e.student_name)}</strong></div>
          <div class="meta-card"><span>Student ID</span><strong>#${y(e.student_id)}</strong></div>
          <div class="meta-card"><span>Billing Month</span><strong>${y(e.month)} ${y(e.year)}</strong></div>
          <div class="meta-card"><span>Status</span><strong><span class="pill ${y(e.status)}">${y(String(e.status).toUpperCase())}</span></strong></div>
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
              <td>PKR ${y(e.amount)}</td>
              <td>${e.due_date?new Date(e.due_date).toLocaleDateString():`N/A`}</td>
              <td>${y(e.class_name||`N/A`)}</td>
              <td>${y(e.remarks||`No additional remarks`)}</td>
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
    </div>`)},S=({student:e,attendanceRows:t,reportMonthLabel:n,stats:r,schoolLogo:i,teacherName:a,includeStudentColumn:o=!1,autoPrint:s=!0,fullScreen:c=!1,studentFees:l=[],studentFeeStats:u={paidCount:0,pendingCount:0,paidAmount:0,pendingAmount:0}})=>{let d=l.length>0||Object.values(u).some(e=>Number(e)!==0),f=t.map(e=>`
        <tr>
          ${o?`<td>${y(e.student_name||`Student #${e.student_id||e.studentId||`N/A`}`)}</td>`:``}
          <td>${new Date(e.date).toLocaleDateString()}</td>
          <td><span class="pill ${y(e.status)}">${y(e.status)}</span></td>
          <td>${y(e.remarks||`-`)}</td>
        </tr>`).join(``),p=l.length>0?l.map(e=>`
    <tr>
      <td>${y(e.month)} ${y(e.year)}</td>
      <td>PKR ${y(e.amount)}</td>
      <td><span class="pill ${y(e.status)}">${y(String(e.status).toUpperCase())}</span></td>
      <td>${e.due_date?new Date(e.due_date).toLocaleDateString():`N/A`}</td>
    </tr>
  `).join(``):`<tr><td colspan="4">No fee records available.</td></tr>`,m=`
    <div class="sheet">
      <div class="hero">
        <div class="hero-row">
          <div style="display:flex;align-items:center;gap:16px;">
            <img src="${y(i)}" alt="School logo" />
            <div>
              <h1 style="margin:0;font-size:30px;">${y(e?.school_name||`School Management`)}</h1>
              <p style="margin:6px 0 0;opacity:.86;">Official Attendance Report</p>
            </div>
          </div>
          <div style="text-align:right;">
            <p style="margin:0 0 8px;">Generated: ${new Date().toLocaleString()}</p>
            <p style="margin:0;">Prepared By: ${y(a)}</p>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="meta-grid">
          <div class="meta-card"><span>${o?`Class`:`Student`}</span><strong>${y(o?e?.class_name||`Class Roster`:e?.name||`N/A`)}</strong></div>
          ${o?``:`<div class="meta-card"><span>Student ID</span><strong>#${y(e?.id||`N/A`)}</strong></div>`}
          ${o?``:`<div class="meta-card"><span>Class</span><strong>${y(e?.class_name||e?.class_id||`N/A`)}</strong></div>`}
          <div class="meta-card"><span>Report Range</span><strong>${y(n)}</strong></div>
        </div>
        <div class="stats-grid">
          <div class="stat-card"><h4>Attendance Rate</h4><strong>${y(r.percent)}%</strong></div>
          <div class="stat-card"><h4>Present</h4><strong>${y(r.present)}</strong></div>
          <div class="stat-card"><h4>Absent</h4><strong>${y(r.absent)}</strong></div>
          <div class="stat-card"><h4>Total Records</h4><strong>${y(r.total)}</strong></div>
        </div>
        <div class="analytics-chart"><h4>Attendance trend for this report scope: ${y(r.percent)}%</h4><div class="analytics-bar"><span></span></div><div class="analytics-legend"><span>Present: ${y(r.present)}</span><span>Late: ${y(r.late||0)}</span><span>Absent: ${y(r.absent)}</span></div></div>

        ${d?`
          <h3 style="margin-top: 30px; margin-bottom: 15px; color: #172033;">Financial Overview</h3>
          <div class="meta-grid">
            <div class="meta-card"><span>Total Fees Paid</span><strong>PKR ${y(u.paidAmount.toLocaleString())}</strong></div>
            <div class="meta-card"><span>Total Fees Pending</span><strong>PKR ${y(u.pendingAmount.toLocaleString())}</strong></div>
            <div class="meta-card"><span>Paid Records</span><strong>${y(u.paidCount)}</strong></div>
            <div class="meta-card"><span>Pending Records</span><strong>${y(u.pendingCount)}</strong></div>
          </div>

          <h4 style="margin-top: 20px; margin-bottom: 10px; color: #172033;">Fee Details</h4>
          <table>
            <thead><tr><th>Period</th><th>Amount</th><th>Status</th><th>Due Date</th></tr></thead>
            <tbody>${p}</tbody>
          </table>
        `:``}

        <table>
          <thead>
            <tr>
              ${o?`<th>Student</th>`:``}
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>${f||`<tr><td colspan="${o?4:3}">No attendance records available.</td></tr>`}</tbody>
        </table>
        <div class="footer">
          <div>
            <p style="margin:0;">Certified Attendance Report</p>
            <p style="margin:6px 0 0;">This document was generated from the live teacher dashboard.</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0;">Teacher: ${y(a)}</p>
              ${o?``:`<p style="margin:6px 0 0;">Student: ${y(e?.name||`N/A`)}</p>`}
            <p style="margin:10px 0 0;">Powered by <a class="powered-link" href="https://eduflow.example.com" target="_blank" rel="noreferrer">EduFlow</a></p>
          </div>
        </div>
      </div>
    </div>`;b(`Attendance Report - ${e?.name||e?.class_name||`Class Roster`}`,m,{autoPrint:s,fullScreen:c})},C=g(),w=({student:e,teacher:l,attendance:g,page:y,limit:b})=>{let[x,w]=(0,v.useState)([]),[T,oe]=(0,v.useState)(10),[E,se]=(0,v.useState)(``),[D,O]=(0,v.useState)(!1),[k,ce]=(0,v.useState)(`all`),[A,le]=(0,v.useState)(`all`),[j,ue]=(0,v.useState)(e?e.id:`all`),[M,N]=(0,v.useState)(!1),[P,F]=(0,v.useState)(`manual`),[I,de]=(0,v.useState)([]),[L,R]=(0,v.useState)([]),[z,fe]=(0,v.useState)(()=>new Date().toISOString().slice(0,10)),[B,pe]=(0,v.useState)(null),[V,H]=(0,v.useState)(!1),[U,W]=(0,v.useState)(null),me=(0,v.useRef)(null),[he,ge]=(0,v.useState)(navigator.onLine);(0,v.useEffect)(()=>{let e=()=>{ge(navigator.onLine),navigator.onLine&&q()};return window.addEventListener(`online`,e),window.addEventListener(`offline`,e),()=>{window.removeEventListener(`online`,e),window.removeEventListener(`offline`,e)}},[]);let[G,K]=(0,v.useState)({status:`all`,fromDate:``,toDate:``,month:`all`,year:new Date().getFullYear().toString()}),_e=(0,v.useMemo)(()=>Array.from({length:5},(e,t)=>(new Date().getFullYear()-t).toString()),[]),q=(0,v.useCallback)(async(e=E)=>{try{let t=(await _.get(`/attendance`,{params:{page:1,limit:100,search:e.trim()||void 0}})).data.attendance||[];w(t),localStorage.setItem(`cached_attendance`,JSON.stringify(t))}catch{let e=localStorage.getItem(`cached_attendance`);e&&w(JSON.parse(e))}},[E]),ve=e=>{let t={present:0,absent:0,late:0,holiday:0,total:e.length};return e.forEach(e=>{let n=String(e.status).toLowerCase();Object.prototype.hasOwnProperty.call(t,n)&&t[n]++}),t},J=(0,v.useCallback)(async()=>{if(l)try{let e=(await _.get(`/teacher/students`)).data.students||[];de(e),R(e.map(e=>({student_id:e.id,name:e.name,email:e.email,status:`present`,remarks:``})))}catch(e){console.error(e),c.error(`Failed to load student roster`)}},[l]);(0,v.useEffect)(()=>{M&&P===`manual`&&I.length===0&&J()},[M,P,I.length,J]),(0,v.useEffect)(()=>{D&&l&&!e&&I.length===0&&J()},[D,l,e,I.length,J]);let ye=(e,t,n)=>{R(r=>r.map(r=>Number(r.student_id)===Number(e)?{...r,[t]:n}:r))},be=e=>{R(t=>t.map(t=>({...t,status:e})))};(0,v.useEffect)(()=>{g||q()},[q,g]);let Y=(0,v.useMemo)(()=>Array.isArray(g)?g:x,[x,g]),X=(0,v.useMemo)(()=>{let e=[...Y];if(E.trim()){let t=E.trim().toLowerCase();e=e.filter(e=>[e.student_id,e.student_name,e.student_email].some(e=>String(e||``).toLowerCase().includes(t)))}if(G.status!==`all`&&(e=e.filter(e=>String(e.status).toLowerCase()===G.status)),G.month!==`all`&&(e=e.filter(e=>new Date(e.date).getMonth()===Number(G.month))),G.year!==`all`&&(e=e.filter(e=>new Date(e.date).getFullYear()===Number(G.year))),G.fromDate&&(e=e.filter(e=>new Date(e.date)>=new Date(G.fromDate))),G.toDate){let t=new Date(`${G.toDate}T23:59:59`);e=e.filter(e=>new Date(e.date)<=t)}return e},[E,G,Y]);(0,v.useEffect)(()=>{oe(10)},[E,G]);let Z=(0,v.useMemo)(()=>ve(X),[X]),xe=()=>{let t=X.length,n=X.filter(e=>e.status===`present`).length||0,r=X.filter(e=>e.status===`absent`).length||0,i=X.filter(e=>e.status===`late`).length||0,a=t>0?Math.round((n+i)/t*100):0,o=e?e.name:`Class Roster`,s=e?e.id:`Multiple`,c=[[`EDU FLOW - ATTENDANCE PERFORMANCE TRANSCRIPT`],[`Generated on: ${new Date().toLocaleString()}`],[`Identity: ${o}`,`ID: #${s}`],[`Class: ${e?.class_name||l?.class_name||`N/A`}`],[`Performance Percentage: ${a}%`],[`Total Records: ${t}`,`Present: ${n}`,`Absent: ${r}`,`Late: ${i}`],[``]],u=e?[`Date`,`Status`,`Remarks`]:[`Student Name`,`Student ID`,`Email`,`Date`,`Status`,`Remarks`],d=e=>{let t=String(e??``);return/[",\n]/.test(t)?`"${t.replace(/"/g,`""`)}"`:t},f=X.map(t=>e?[new Date(t.date).toLocaleDateString(),String(t.status||``).toUpperCase(),t.remarks||``]:[t.student_name,`#${t.student_id}`,t.student_email||`N/A`,new Date(t.date).toLocaleDateString(),String(t.status||``).toUpperCase(),t.remarks||``]),p=[...c,u,...f].map(e=>e.map(d).join(`,`)).join(`
`),m=new Blob([p],{type:`text/csv;charset=utf-8;`}),h=URL.createObjectURL(m),g=document.createElement(`a`);g.href=h,g.download=`${e?.school_name||`School`}_Attendance_Filtered.csv`,g.click()},Se=async e=>{if(window.confirm(`Are you sure you want to delete this specific attendance record?`))try{await _.delete(`/attendance/${e}`),c.success(`Record deleted`),q()}catch{c.error(`Failed to delete record`)}},Ce=async()=>{try{H(!0),await _.put(`/attendance/${U.id}`,{status:U.status,remarks:U.remarks}),c.success(`Attendance updated`),W(null),q()}catch{c.error(`Update failed`)}finally{H(!1)}},we=async()=>{try{let t=localStorage.getItem(`token`),n=await(await fetch(`${ne}/attendance/export`,{method:`GET`,headers:{Authorization:`Bearer ${t}`}})).blob(),r=window.URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`${e?.school_name||`School`}_Attendance_All.xlsx`,i.click(),window.URL.revokeObjectURL(r)}catch(e){console.error(e)}},Te=async()=>{try{H(!0);let e={date:z,entries:L.map(e=>({student_id:e.student_id,status:e.status,remarks:e.remarks}))};if(!navigator.onLine){re({type:`attendance`,method:`POST`,url:`/attendance/manual`,payload:e}),c(`Working offline. Attendance queued.`,{icon:`☁️`}),N(!1);return}await _.post(`/attendance/manual`,e),c.success(`Attendance saved successfully`),N(!1),q()}catch(e){c.error(e.response?.data?.message||`Failed to save attendance`)}finally{H(!1)}},Ee=async()=>{if(!B)return c.error(`Select a file first`);let e=new FormData;e.append(`file`,B);try{H(!0),await _.post(`/attendance/upload`,e,{headers:{"Content-Type":`multipart/form-data`}}),c.success(`Excel uploaded successfully`),N(!1),pe(null),q()}catch(e){c.error(e.response?.data?.message||`Upload failed`)}finally{H(!1)}},De=[{name:`Present`,value:Z.present,color:`#10b981`},{name:`Absent`,value:Z.absent,color:`#ef4444`},{name:`Late`,value:Z.late,color:`#f59e0b`}],Oe=(0,v.useCallback)((t,n,r)=>{let i=[...Y];e?i=i.filter(t=>Number(t.student_id)===Number(e.id)):n!==`all`&&(i=i.filter(e=>Number(e.student_id)===Number(n))),t!==`all`&&(i=i.filter(e=>new Date(e.date).getMonth()===Number(t))),r!==`all`&&(i=i.filter(e=>new Date(e.date).getFullYear()===Number(r))),i=i.filter(e=>String(e.status).toLowerCase()!==`holiday`);let a=i.length;if(a===0)return{percent:0,present:0,late:0,absent:0,total:0,level:`good`};let o=i.filter(e=>e.status===`present`).length,s=i.filter(e=>e.status===`late`).length,c=i.filter(e=>e.status===`absent`).length,l=Math.round((o+s)/a*100),u=`good`;return l<75&&(u=`warning`),l<50&&(u=`danger`),{percent:l,present:o,late:s,absent:c,total:a,level:u}},[Y,e]),Q=(0,v.useMemo)(()=>Oe(k,j,A),[Oe,k,j,A]),ke=()=>{let t=Y||[];if(t.length===0)return c.error(`No attendance data available to print.`);let n=t.filter(t=>{let n=new Date(t.date),r=(k===`all`||n.getMonth()===parseInt(k))&&(A===`all`||n.getFullYear()===Number(A)),i=Number(e?.id||j),a=j===`all`&&!e||Number(t.student_id||t.studentId)===i;return r&&a}).sort((e,t)=>new Date(t.date)-new Date(e.date)),r=`${k===`all`?`All months`:[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`][parseInt(k)]}${A===`all`?``:` ${A}`}`,i=e||I&&I.find(e=>Number(e.id)===Number(j));try{S({student:{...i,class_name:i?.class_name||e?.class_name||l?.class_name||`N/A`,school_name:i?.school_name||l?.school_name||`EduFlow`,school_address:i?.school_address||l?.school_address||`Institutional Main Campus, City, Country`},attendanceRows:n,reportMonthLabel:r,stats:Q,schoolLogo:e?.school_logo_url||l?.school_logo_url||`/assets/logo-DuW62jy3.png`,teacherName:l?.name||e?.teacher_name||`Class Teacher`})}catch{c.error(`Pop-up Blocked! Please click the 'Always Allow' icon in your browser address bar to view the PDF.`)}},$=!!g,Ae=(0,v.useMemo)(()=>{let e=g||X;return $?typeof y==`number`&&typeof b==`number`?e.slice(y*b,(y+1)*b):e:X.slice(0,T)},[g,X,T,y,b]);return(0,C.jsxs)(`div`,{className:`attendance-section ${$?`mini-view`:``}`,children:[!he&&(0,C.jsxs)(`div`,{className:`offline-banner`,children:[(0,C.jsx)(i,{}),` You are currently offline. Changes will sync automatically.`]}),!$&&(0,C.jsxs)(`div`,{className:`attendance-header`,children:[(0,C.jsxs)(`div`,{className:`header-info`,children:[(0,C.jsx)(`p`,{className:`glass-kicker`,children:`Attendance Intelligence`}),(0,C.jsxs)(`h3`,{className:`section-title`,children:[(0,C.jsx)(n,{}),` Attendance Analytics`]}),(0,C.jsx)(`p`,{className:`glass-muted`,children:`Review real-time attendance trends and generate academic reports.`})]}),(0,C.jsxs)(`div`,{className:`attendance-actions`,children:[l&&(0,C.jsxs)(`div`,{className:`action-group`,children:[(0,C.jsxs)(`button`,{className:`btn-ui`,onClick:()=>{F(`manual`),N(!0)},children:[(0,C.jsx)(ee,{}),` New Entry`]}),(0,C.jsxs)(`button`,{className:`btn-ui-secondary`,onClick:()=>{F(`upload`),N(!0)},children:[(0,C.jsx)(h,{}),` Bulk Upload`]})]}),(0,C.jsxs)(`div`,{className:`action-group`,children:[(0,C.jsx)(`button`,{className:`glass-icon-btn`,onClick:q,title:`Refresh Data`,children:(0,C.jsx)(te,{})}),(0,C.jsxs)(`button`,{onClick:xe,className:`btn-ui-secondary btn-csv`,children:[(0,C.jsx)(o,{}),` Export`]})]}),(0,C.jsxs)(`button`,{className:`btn-ui-secondary`,onClick:we,children:[(0,C.jsx)(t,{}),` Save All`]}),(0,C.jsxs)(`button`,{onClick:()=>O(!0),className:`btn-report`,children:[(0,C.jsx)(a,{}),` Generate Report`]})]})]}),!$&&(0,C.jsxs)(`div`,{className:`glass-stat-grid`,children:[(0,C.jsxs)(`div`,{className:`glass-stat-card`,children:[(0,C.jsxs)(`h4`,{children:[(0,C.jsx)(`div`,{className:`status-dot online`}),` Present`]}),(0,C.jsx)(`p`,{children:Z.present})]}),(0,C.jsxs)(`div`,{className:`glass-stat-card`,children:[(0,C.jsxs)(`h4`,{children:[(0,C.jsx)(`div`,{className:`status-dot offline`}),` Absent`]}),(0,C.jsx)(`p`,{children:Z.absent})]}),(0,C.jsxs)(`div`,{className:`glass-stat-card`,children:[(0,C.jsxs)(`h4`,{children:[(0,C.jsx)(`div`,{className:`status-dot`,style:{background:`var(--warning)`}}),` Late`]}),(0,C.jsx)(`p`,{children:Z.late})]}),(0,C.jsxs)(`div`,{className:`glass-stat-card`,children:[(0,C.jsx)(`h4`,{children:`📊 Accuracy`}),(0,C.jsxs)(`p`,{children:[Z.total>0?Math.round((Z.present+Z.late)/Z.total*100):0,`%`]})]})]}),!$&&(0,C.jsxs)(`div`,{className:`filters`,children:[(0,C.jsx)(u,{className:`glass-muted`}),(0,C.jsx)(`input`,{type:`search`,className:`ui-field attendance-search-input`,value:E,onChange:e=>se(e.target.value),placeholder:`Search student ID, name, or email`,"aria-label":`Search attendance by student ID, name, or email`}),(0,C.jsxs)(`select`,{value:G.status,className:`ui-select`,onChange:e=>K({...G,status:e.target.value}),children:[(0,C.jsx)(`option`,{value:`all`,children:`All`}),(0,C.jsx)(`option`,{value:`present`,children:`Present`}),(0,C.jsx)(`option`,{value:`absent`,children:`Absent`}),(0,C.jsx)(`option`,{value:`late`,children:`Late`})]}),(0,C.jsxs)(`select`,{value:G.month,className:`ui-select`,onChange:e=>K({...G,month:e.target.value}),children:[(0,C.jsx)(`option`,{value:`all`,children:`All Months`}),[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`].map((e,t)=>(0,C.jsx)(`option`,{value:t,children:e},t))]}),(0,C.jsx)(`select`,{value:G.year,className:`ui-select`,onChange:e=>K({...G,year:e.target.value}),children:_e.map(e=>(0,C.jsx)(`option`,{value:e,children:e},e))}),(0,C.jsx)(`input`,{type:`date`,className:`ui-field`,onChange:e=>K({...G,fromDate:e.target.value})}),(0,C.jsx)(`input`,{type:`date`,className:`ui-field`,onChange:e=>K({...G,toDate:e.target.value})})]}),!$&&(0,C.jsxs)(`div`,{className:`charts-container`,children:[(0,C.jsx)(ae,{title:`Attendance Ratio`,subtitle:`Lightweight summary by status`,data:De,totalLabel:`records`}),(0,C.jsx)(ie,{title:`Performance Overview`,subtitle:`Quick breakdown of attendance counts`,data:De.map(e=>({name:e.name,value:Z.total?e.value/Z.total*100:0}))})]}),(0,C.jsxs)(`div`,{className:`glass-table-shell table-scroll-x`,children:[!$&&(0,C.jsx)(`div`,{className:`glass-section-header`,children:(0,C.jsx)(`h4`,{children:`Detailed Logs`})}),$&&(0,C.jsx)(`div`,{className:`attendance-mini-actions`,children:(0,C.jsxs)(`button`,{onClick:()=>O(!0),className:`btn-report small glass-btn attendance-mini-report-button`,children:[(0,C.jsx)(a,{}),` PDF Report`]})}),(0,C.jsxs)(`table`,{className:`glass-table attendance-data-table`,children:[(0,C.jsx)(`thead`,{children:(0,C.jsxs)(`tr`,{children:[l&&(0,C.jsx)(`th`,{children:`Student`}),(0,C.jsx)(`th`,{children:`Date`}),(0,C.jsx)(`th`,{children:`Status`}),(0,C.jsx)(`th`,{children:`Remarks`}),l&&(0,C.jsx)(`th`,{className:`attendance-actions-heading`,children:`Actions`})]})}),(0,C.jsx)(`tbody`,{children:Ae.map(e=>(0,C.jsxs)(`tr`,{children:[l&&(0,C.jsxs)(`td`,{"data-label":`Student`,children:[(0,C.jsx)(`strong`,{children:e.student_name}),(0,C.jsx)(`br`,{}),(0,C.jsxs)(`small`,{className:`glass-muted`,children:[`ID: #`,e.student_id]})]}),(0,C.jsx)(`td`,{"data-label":`Date`,children:(0,C.jsx)(`strong`,{children:new Date(e.date).toLocaleDateString()})}),(0,C.jsx)(`td`,{"data-label":`Status`,children:(0,C.jsx)(`span`,{className:`badge ${e.status}`,children:e.status})}),(0,C.jsx)(`td`,{"data-label":`Remarks`,children:e.remarks||`-`}),l&&(0,C.jsx)(`td`,{"data-label":`Actions`,className:`attendance-actions-cell`,children:(0,C.jsxs)(`div`,{className:`attendance-row-actions`,children:[(0,C.jsx)(`button`,{className:`glass-icon-btn small`,onClick:()=>W(e),title:`Edit`,children:(0,C.jsx)(s,{})}),(0,C.jsx)(`button`,{className:`glass-icon-btn small danger`,onClick:()=>Se(e.id),title:`Delete`,children:(0,C.jsx)(m,{})})]})})]},e.id))})]}),Ae.length===0&&(0,C.jsx)(`p`,{className:`glass-empty`,children:`No attendance records matching current filters.`}),!$&&T<X.length&&(0,C.jsx)(`div`,{className:`view-more-container`,children:(0,C.jsx)(`button`,{className:`view-more-btn`,onClick:()=>oe(e=>e+10),children:`View More Records`})})]}),D&&(0,C.jsx)(`div`,{className:`modal-overlay`,children:(0,C.jsxs)(`div`,{className:`modal-content large report-modal`,children:[(0,C.jsxs)(`div`,{className:`report-header`,children:[(0,C.jsxs)(`div`,{className:`school-branding`,children:[(0,C.jsxs)(`div`,{className:`report-logo-wrap`,children:[` `,(0,C.jsx)(`img`,{src:e?.school_logo_url||l?.school_logo_url||`/assets/logo-DuW62jy3.png`,alt:`School Logo`,crossOrigin:`anonymous`}),` `]}),(0,C.jsxs)(`div`,{className:`school-name`,children:[(0,C.jsx)(`h2`,{children:e?.school_name||l?.school_name||`School Management`}),(0,C.jsx)(`p`,{className:`school-address-text`,style:{fontSize:`12px`,opacity:.8,margin:`2px 0`},children:e?.school_address||l?.school_address||`Institutional Main Campus, City, Country`}),(0,C.jsx)(`p`,{className:`glass-kicker`,children:e?`Academic Compliance & Attendance Transcript`:`Departmental Attendance Performance Analytics`})]})]}),(0,C.jsx)(`button`,{onClick:()=>O(!1),className:`close-btn`,children:(0,C.jsx)(r,{})})]}),(0,C.jsxs)(`div`,{className:`modal-body`,children:[(0,C.jsxs)(`div`,{className:`report-meta`,children:[(0,C.jsx)(`div`,{className:`student-info-mini`,children:e?(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(`div`,{className:`student-report-avatar`,children:e?.profile_image?(0,C.jsx)(`img`,{src:e.profile_image,alt:e.name}):(0,C.jsx)(`div`,{className:`avatar-placeholder`,children:`👨‍🎓`})}),(0,C.jsx)(`h3`,{children:e?.name}),(0,C.jsxs)(`p`,{children:[`Student ID: #`,e?.id]}),(0,C.jsxs)(`p`,{children:[`Class: `,e?.class_name||`Assigned Class`]})]}):(0,C.jsxs)(C.Fragment,{children:[(0,C.jsxs)(`h3`,{children:[`Class: `,l?.class_name||`General`]}),(0,C.jsx)(`p`,{children:`Generated for full roster`})]})}),e?.bio&&(0,C.jsx)(`p`,{className:`student-report-bio`,children:e.bio}),(0,C.jsxs)(`div`,{className:`report-stats-grid`,children:[(0,C.jsxs)(`div`,{className:`report-stat-box`,children:[(0,C.jsx)(`h4`,{children:`Attendance Rate`}),(0,C.jsxs)(`div`,{className:`value ${Q.level}`,children:[Q.percent||0,`%`]})]}),(0,C.jsxs)(`div`,{className:`report-stat-box`,children:[(0,C.jsx)(`h4`,{children:`Days Present`}),(0,C.jsx)(`div`,{className:`value`,children:Q.present})]}),(0,C.jsxs)(`div`,{className:`report-stat-box`,children:[(0,C.jsx)(`h4`,{children:`Days Absent`}),(0,C.jsx)(`div`,{className:`value`,children:Q.absent})]}),(0,C.jsxs)(`div`,{className:`report-stat-box`,children:[(0,C.jsx)(`h4`,{children:`Total Days`}),(0,C.jsx)(`div`,{className:`value`,children:Q.total})]})]})]}),(0,C.jsxs)(`div`,{className:`dashboard-toolbar no-print`,children:[(0,C.jsxs)(`select`,{className:`ui-select`,value:k,onChange:e=>ce(e.target.value),children:[(0,C.jsx)(`option`,{value:`all`,children:`Full Academic Year`}),[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`].map((e,t)=>(0,C.jsx)(`option`,{value:t,children:e},t))]}),(0,C.jsxs)(`select`,{className:`ui-select`,value:A,onChange:e=>le(e.target.value),"aria-label":`Report year`,children:[(0,C.jsx)(`option`,{value:`all`,children:`All years`}),_e.map(e=>(0,C.jsx)(`option`,{value:e,children:e},e))]}),l&&!e&&(0,C.jsxs)(`select`,{className:`ui-select`,value:j,onChange:e=>ue(e.target.value),children:[(0,C.jsx)(`option`,{value:`all`,children:`Report: All Students`}),I.map(e=>(0,C.jsxs)(`option`,{value:e.id,children:[e.name,` (#`,e.id,`)`]},e.id))]})]}),(0,C.jsx)(`div`,{className:`attendance-report-wrapper`,children:(0,C.jsxs)(`table`,{className:`glass-table`,children:[(0,C.jsx)(`thead`,{children:(0,C.jsxs)(`tr`,{children:[!e&&j===`all`&&(0,C.jsx)(`th`,{children:`Student Identity`}),(0,C.jsx)(`th`,{children:`Date`}),(0,C.jsx)(`th`,{children:`Status`}),(0,C.jsx)(`th`,{children:`Remarks`})]})}),(0,C.jsx)(`tbody`,{children:Y.filter(t=>{let n=new Date(t.date),r=(k===`all`||n.getMonth()===parseInt(k))&&(A===`all`||n.getFullYear()===Number(A)),i=Number(e?.id||j),a=j===`all`&&!e||Number(t.student_id||t.studentId)===i;return r&&a}).sort((e,t)=>new Date(t.date)-new Date(e.date)).map(t=>(0,C.jsxs)(`tr`,{children:[!e&&j===`all`&&(0,C.jsxs)(`td`,{children:[(0,C.jsx)(`strong`,{children:t.student_name}),(0,C.jsx)(`br`,{}),(0,C.jsxs)(`small`,{children:[`ID: #`,t.student_id]})]}),(0,C.jsx)(`td`,{children:new Date(t.date).toLocaleDateString(`en-US`,{year:`numeric`,month:`short`,day:`numeric`})}),(0,C.jsx)(`td`,{children:(0,C.jsx)(`span`,{className:`badge ${t.status}`,children:t.status})}),(0,C.jsx)(`td`,{children:t.remarks||`-`})]},t.id))})]})})]}),(0,C.jsxs)(`div`,{className:`report-footer-print`,children:[(0,C.jsxs)(`div`,{className:`footer-branding`,children:[(0,C.jsx)(`div`,{className:`report-logo-wrap`,children:(0,C.jsx)(`img`,{src:e?.school_logo_url||l?.school_logo_url||`/assets/logo-DuW62jy3.png`,alt:`School logo`})}),(0,C.jsxs)(`div`,{className:`school-name`,children:[(0,C.jsx)(`h3`,{children:e?.school_name||l?.school_name||`School Management`}),(0,C.jsx)(`p`,{children:(0,C.jsx)(`a`,{href:`https://instagram.com/rizvani.dev/`,target:`_blank`,rel:`noreferrer`,children:`Powered by EduFlow`})})]})]}),(0,C.jsxs)(`div`,{className:`report-signature-block`,children:[(0,C.jsxs)(`div`,{className:`official-stamp-area`,style:{width:`100px`,height:`100px`,border:`1px dashed #cbd5e1`,borderRadius:`50%`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:`10px`,color:`#94a3b8`,margin:`0 auto 10px`,textAlign:`center`},children:[`OFFICIAL`,(0,C.jsx)(`br`,{}),`STAMP`]}),(0,C.jsxs)(`div`,{className:`signature-info`,children:[(0,C.jsxs)(`p`,{children:[(0,C.jsx)(`strong`,{children:`Prepared By:`}),` `,l?.name||`Class Teacher`]}),(0,C.jsxs)(`p`,{children:[(0,C.jsx)(`strong`,{children:`Date Generated:`}),` `,new Date().toLocaleString()]})]}),(0,C.jsxs)(`div`,{className:`signature-line-wrap`,children:[(0,C.jsx)(`div`,{className:`signature-line`}),(0,C.jsx)(`span`,{children:`Authorized Signature`})]})]})]}),(0,C.jsx)(`div`,{className:`modal-actions no-print`,children:(0,C.jsxs)(`button`,{onClick:ke,className:`print-btn`,children:[(0,C.jsx)(d,{}),` Save as PDF / Print Report`]})})]})}),M&&(0,C.jsx)(`div`,{className:`modal-overlay`,children:(0,C.jsxs)(`div`,{className:`modal-content large`,children:[(0,C.jsxs)(`div`,{className:`modal-header--accent`,children:[(0,C.jsxs)(`div`,{className:`modal-header-copy`,children:[(0,C.jsxs)(`h3`,{children:[(0,C.jsx)(f,{}),` Attendance Entry System`]}),(0,C.jsx)(`p`,{className:`modal-subtitle`,children:`Submit manual records or process bulk data uploads.`})]}),(0,C.jsx)(`button`,{onClick:()=>N(!1),className:`close-btn`,children:(0,C.jsx)(r,{})})]}),(0,C.jsxs)(`div`,{className:`dashboard-toolbar`,style:{padding:`16px 24px`},children:[(0,C.jsxs)(`div`,{className:`dashboard-tabs`,children:[(0,C.jsx)(`button`,{className:`dashboard-tab ${P===`manual`?`active`:``}`,onClick:()=>F(`manual`),children:`Standard Manual Entry`}),(0,C.jsx)(`button`,{className:`dashboard-tab ${P===`upload`?`active`:``}`,onClick:()=>F(`upload`),children:`SaaS Excel Integration`})]}),P===`manual`&&(0,C.jsx)(`div`,{className:`action-group`,children:(0,C.jsxs)(`button`,{className:`btn-ui-secondary`,onClick:()=>be(`present`),children:[(0,C.jsx)(p,{}),` Mark All Present`]})})]}),(0,C.jsx)(`div`,{className:`modal-body`,children:P===`manual`?(0,C.jsxs)(`div`,{className:`manual-entry-container`,children:[(0,C.jsxs)(`div`,{className:`form-group`,style:{marginBottom:24},children:[(0,C.jsx)(`label`,{children:`Attendance Date:`}),(0,C.jsx)(`input`,{type:`date`,className:`ui-field`,value:z,onChange:e=>fe(e.target.value)})]}),(0,C.jsx)(`div`,{className:`table-responsive`,children:(0,C.jsxs)(`table`,{className:`attendance-edit-table`,children:[(0,C.jsx)(`thead`,{children:(0,C.jsxs)(`tr`,{children:[(0,C.jsx)(`th`,{children:`Identity`}),(0,C.jsx)(`th`,{children:`Name`}),(0,C.jsx)(`th`,{children:`Email`}),(0,C.jsx)(`th`,{children:`Status`}),(0,C.jsx)(`th`,{children:`Remarks`})]})}),(0,C.jsx)(`tbody`,{children:L.map(e=>(0,C.jsxs)(`tr`,{children:[(0,C.jsxs)(`td`,{children:[`#`,e.student_id]}),(0,C.jsx)(`td`,{style:{color:`var(--text-primary)`,fontWeight:700},children:e.name}),(0,C.jsx)(`td`,{children:(0,C.jsx)(`small`,{children:e.email})}),(0,C.jsx)(`td`,{children:(0,C.jsxs)(`select`,{className:`ui-select`,value:e.status,onChange:t=>ye(e.student_id,`status`,t.target.value),children:[(0,C.jsx)(`option`,{value:`present`,children:`Present`}),(0,C.jsx)(`option`,{value:`absent`,children:`Absent`}),(0,C.jsx)(`option`,{value:`late`,children:`Late`})]})}),(0,C.jsx)(`td`,{children:(0,C.jsx)(`input`,{type:`text`,className:`ui-field`,placeholder:`Optional remarks`,value:e.remarks,onChange:t=>ye(e.student_id,`remarks`,t.target.value)})})]},e.student_id))})]})})]}):(0,C.jsxs)(`div`,{className:`upload-container`,style:{padding:`40px 0`,textAlign:`center`},children:[(0,C.jsx)(h,{size:50,color:`#10b981`,style:{marginBottom:20}}),(0,C.jsx)(`h4`,{children:`Upload Attendance Excel Sheet`}),(0,C.jsxs)(`p`,{className:`sub-text`,children:[`File must contain headers: `,(0,C.jsx)(`strong`,{children:`Student_id, Date, Status`})]}),(0,C.jsx)(`input`,{type:`file`,accept:`.xlsx,.xls,.csv`,ref:me,onChange:e=>pe(e.target.files[0]),style:{marginTop:20}})]})}),(0,C.jsxs)(`div`,{className:`modal-actions`,children:[(0,C.jsx)(`button`,{className:`btn-ui-secondary`,onClick:()=>N(!1),children:`Cancel`}),(0,C.jsxs)(`button`,{className:`btn-ui`,disabled:V,onClick:P===`manual`?Te:Ee,children:[(0,C.jsx)(f,{}),` `,V?`Processing...`:`Save Attendance`]})]})]})}),U&&(0,C.jsx)(`div`,{className:`modal-overlay`,children:(0,C.jsxs)(`div`,{className:`modal-content mini`,children:[(0,C.jsxs)(`div`,{className:`modal-header--accent`,children:[(0,C.jsx)(`h3`,{children:`Edit Attendance Record`}),(0,C.jsx)(`button`,{onClick:()=>W(null),className:`close-btn`,children:(0,C.jsx)(r,{})})]}),(0,C.jsxs)(`div`,{className:`modal-body`,children:[(0,C.jsxs)(`p`,{className:`sub-text`,children:[`Record for `,(0,C.jsx)(`strong`,{children:U.student_name}),` on `,new Date(U.date).toLocaleDateString()]}),(0,C.jsxs)(`div`,{className:`form-group attendance-edit-field`,children:[(0,C.jsx)(`label`,{children:`Status`}),(0,C.jsxs)(`select`,{className:`ui-select`,value:U.status,onChange:e=>W({...U,status:e.target.value}),children:[(0,C.jsx)(`option`,{value:`present`,children:`Present`}),(0,C.jsx)(`option`,{value:`absent`,children:`Absent`}),(0,C.jsx)(`option`,{value:`late`,children:`Late`})]})]}),(0,C.jsxs)(`div`,{className:`form-group`,children:[(0,C.jsx)(`label`,{children:`Remarks`}),(0,C.jsx)(`input`,{className:`ui-field`,value:U.remarks||``,onChange:e=>W({...U,remarks:e.target.value}),placeholder:`Notes...`})]})]}),(0,C.jsxs)(`div`,{className:`modal-actions`,children:[(0,C.jsx)(`button`,{className:`btn-ui-secondary`,onClick:()=>W(null),children:`Cancel`}),(0,C.jsx)(`button`,{className:`btn-ui`,disabled:V,onClick:Ce,children:V?`Updating...`:`Save Changes`})]})]})})]})};export{S as n,x as r,w as t};