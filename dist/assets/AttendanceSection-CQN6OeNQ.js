import{r as e}from"./rolldown-runtime-S-ySWqyJ.js";import{B as t,Bt as n,D as r,Et as i,F as a,Ht as o,J as s,K as c,V as l,Y as u,dt as d,ht as f,k as p,kt as ee,q as m,t as h,ut as te,wt as ne}from"./react-vendor-CYN5fPvr.js";import{n as re,t as g}from"./axiosInstance-BV7IZC-G.js";import"./logo-Cf960Oaq.js";import{t as ie}from"./syncManager-D0oq6_rL.js";import{n as ae,t as oe}from"./LightweightCharts-_o8y1z1X.js";var _=e(o(),1),v=(e=``)=>String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`),y=(e,t)=>{let n=window.open(``,`_blank`,`width=1100,height=900`);if(!n)throw Error(`Popup blocked. Please allow popups to export the document.`);let r=`<!DOCTYPE html>
    <html>
      <head>
        <title>${v(e)}</title>
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
            .sheet { box-shadow: none; border-radius: 0; max-width: none; }
          }
        </style>
      </head>
      <body>
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
          window.onload = waitForAssets;
        <\/script>
      </body>
    </html>`;n.document.open(),n.document.write(r),n.document.close()},b=({fee:e,schoolLogo:t,teacherName:n})=>{y(`Fee Receipt - ${e.student_name}`,`
    <div class="sheet">
      <div class="hero">
        <div class="hero-row">
          <div style="display:flex;align-items:center;gap:16px;">
            <img src="${t}" alt="School logo" />
            <div>
              <h1 style="margin:0;font-size:30px;">${v(e.school_name||`School Management`)}</h1>
              <p style="margin:6px 0 0;opacity:.86;">Fee Payment Receipt</p>
            </div>
          </div>
          <div style="text-align:right;">
            <p style="margin:0 0 8px;">Generated: ${new Date().toLocaleString()}</p>
            <p style="margin:0;">Handled By: ${v(n)}</p>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="meta-grid">
          <div class="meta-card"><span>Student</span><strong>${v(e.student_name)}</strong></div>
          <div class="meta-card"><span>Student ID</span><strong>#${v(e.student_id)}</strong></div>
          <div class="meta-card"><span>Billing Month</span><strong>${v(e.month)} ${v(e.year)}</strong></div>
          <div class="meta-card"><span>Status</span><strong><span class="pill ${v(e.status)}">${v(String(e.status).toUpperCase())}</span></strong></div>
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
              <td>PKR ${v(e.amount)}</td>
              <td>${e.due_date?new Date(e.due_date).toLocaleDateString():`N/A`}</td>
              <td>${v(e.class_name||`N/A`)}</td>
              <td>${v(e.remarks||`No additional remarks`)}</td>
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
    </div>`)},se=({student:e,attendanceRows:t,reportMonthLabel:n,stats:r,schoolLogo:i,teacherName:a,studentFees:o=[],studentFeeStats:s={paidCount:0,pendingCount:0,paidAmount:0,pendingAmount:0}})=>{let c=t.map(e=>`
        <tr>
          <td>${new Date(e.date).toLocaleDateString()}</td>
          <td><span class="pill ${v(e.status)}">${v(e.status)}</span></td>
          <td>${v(e.remarks||`-`)}</td>
        </tr>`).join(``),l=o.length>0?o.map(e=>`
    <tr>
      <td>${v(e.month)} ${v(e.year)}</td>
      <td>PKR ${v(e.amount)}</td>
      <td><span class="pill ${v(e.status)}">${v(String(e.status).toUpperCase())}</span></td>
      <td>${e.due_date?new Date(e.due_date).toLocaleDateString():`N/A`}</td>
    </tr>
  `).join(``):`<tr><td colspan="4">No fee records available.</td></tr>`,u=`
    <div class="sheet">
      <div class="hero">
        <div class="hero-row">
          <div style="display:flex;align-items:center;gap:16px;">
            <img src="${i}" alt="School logo" />
            <div>
              <h1 style="margin:0;font-size:30px;">${v(e.school_name||`School Management`)}</h1>
              <p style="margin:6px 0 0;opacity:.86;">Official Attendance Report</p>
            </div>
          </div>
          <div style="text-align:right;">
            <p style="margin:0 0 8px;">Generated: ${new Date().toLocaleString()}</p>
            <p style="margin:0;">Prepared By: ${v(a)}</p>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="meta-grid">
          <div class="meta-card"><span>Student</span><strong>${v(e.name)}</strong></div>
          <div class="meta-card"><span>Student ID</span><strong>#${v(e.id)}</strong></div>
          <div class="meta-card"><span>Class</span><strong>${v(e.class_name||e.class_id||`N/A`)}</strong></div>
          <div class="meta-card"><span>Report Range</span><strong>${v(n)}</strong></div>
        </div>
        <div class="stats-grid">
          <div class="stat-card"><h4>Attendance Rate</h4><strong>${v(r.percent)}%</strong></div>
          <div class="stat-card"><h4>Present</h4><strong>${v(r.present)}</strong></div>
          <div class="stat-card"><h4>Absent</h4><strong>${v(r.absent)}</strong></div>
          <div class="stat-card"><h4>Total Records</h4><strong>${v(r.total)}</strong></div>
        </div>

        <h3 style="margin-top: 30px; margin-bottom: 15px; color: #172033;">Financial Overview</h3>
        <div class="meta-grid">
          <div class="meta-card"><span>Total Fees Paid</span><strong>PKR ${v(s.paidAmount.toLocaleString())}</strong></div>
          <div class="meta-card"><span>Total Fees Pending</span><strong>PKR ${v(s.pendingAmount.toLocaleString())}</strong></div>
          <div class="meta-card"><span>Paid Records</span><strong>${v(s.paidCount)}</strong></div>
          <div class="meta-card"><span>Pending Records</span><strong>${v(s.pendingCount)}</strong></div>
        </div>

        <h4 style="margin-top: 20px; margin-bottom: 10px; color: #172033;">Fee Details</h4>
        <table>
          <thead><tr><th>Period</th><th>Amount</th><th>Status</th><th>Due Date</th></tr></thead>
          <tbody>${l}</tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>${c||`<tr><td colspan="3">No attendance records available.</td></tr>`}</tbody>
        </table>
        <div class="footer">
          <div>
            <p style="margin:0;">Certified Attendance Report</p>
            <p style="margin:6px 0 0;">This document was generated from the live teacher dashboard.</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0;">Teacher: ${v(a)}</p>
            <p style="margin:6px 0 0;">Student: ${v(e.name)}</p>
            <p style="margin:10px 0 0;">Powered by <a class="powered-link" href="https://eduflow.example.com" target="_blank" rel="noreferrer">EduFlow</a></p>
          </div>
        </div>
      </div>
    </div>`;y(`Attendance Report - ${e.name}`,u)},x=h(),S=({student:e,teacher:o,attendance:h,page:v,limit:y})=>{let[b,S]=(0,_.useState)([]),[C,w]=(0,_.useState)(10),[T,ce]=(0,_.useState)(``),[E,D]=(0,_.useState)(!1),[O,le]=(0,_.useState)(`all`),[k,ue]=(0,_.useState)(e?e.id:`all`),[A,j]=(0,_.useState)(!1),[M,N]=(0,_.useState)(`manual`),[P,de]=(0,_.useState)([]),[fe,F]=(0,_.useState)([]),[I,pe]=(0,_.useState)(()=>new Date().toISOString().slice(0,10)),[L,R]=(0,_.useState)(null),[z,B]=(0,_.useState)(!1),[V,H]=(0,_.useState)(null),me=(0,_.useRef)(null),[he,ge]=(0,_.useState)(navigator.onLine);(0,_.useEffect)(()=>{let e=()=>{ge(navigator.onLine),navigator.onLine&&G()};return window.addEventListener(`online`,e),window.addEventListener(`offline`,e),()=>{window.removeEventListener(`online`,e),window.removeEventListener(`offline`,e)}},[]);let[U,W]=(0,_.useState)({status:`all`,fromDate:``,toDate:``,month:`all`,year:new Date().getFullYear().toString()}),_e=(0,_.useMemo)(()=>Array.from({length:5},(e,t)=>(new Date().getFullYear()-t).toString()),[]),G=(0,_.useCallback)(async(e=T)=>{try{let t=(await g.get(`/attendance`,{params:{page:1,limit:100,search:e.trim()||void 0}})).data.attendance||[];S(t),localStorage.setItem(`cached_attendance`,JSON.stringify(t))}catch{let e=localStorage.getItem(`cached_attendance`);e&&S(JSON.parse(e))}},[T]),ve=e=>{let t={present:0,absent:0,late:0,holiday:0,total:e.length};return e.forEach(e=>{let n=String(e.status).toLowerCase();Object.prototype.hasOwnProperty.call(t,n)&&t[n]++}),t},K=(0,_.useCallback)(async()=>{if(o)try{let e=(await g.get(`/teacher/students`)).data.students||[];de(e),F(e.map(e=>({student_id:e.id,name:e.name,email:e.email,status:`present`,remarks:``})))}catch(e){console.error(e),n.error(`Failed to load student roster`)}},[o]);(0,_.useEffect)(()=>{A&&M===`manual`&&P.length===0&&K()},[A,M,P.length,K]),(0,_.useEffect)(()=>{E&&o&&!e&&P.length===0&&K()},[E,o,e,P.length,K]);let q=(e,t,n)=>{F(r=>r.map(r=>Number(r.student_id)===Number(e)?{...r,[t]:n}:r))},ye=e=>{F(t=>t.map(t=>({...t,status:e})))};(0,_.useEffect)(()=>{h||G()},[G,h]);let J=(0,_.useMemo)(()=>Array.isArray(h)?h:b,[b,h]),Y=(0,_.useMemo)(()=>{let e=[...J];if(T.trim()){let t=T.trim().toLowerCase();e=e.filter(e=>[e.student_id,e.student_name,e.student_email].some(e=>String(e||``).toLowerCase().includes(t)))}if(U.status!==`all`&&(e=e.filter(e=>String(e.status).toLowerCase()===U.status)),U.month!==`all`&&(e=e.filter(e=>new Date(e.date).getMonth()===Number(U.month))),U.year!==`all`&&(e=e.filter(e=>new Date(e.date).getFullYear()===Number(U.year))),U.fromDate&&(e=e.filter(e=>new Date(e.date)>=new Date(U.fromDate))),U.toDate){let t=new Date(`${U.toDate}T23:59:59`);e=e.filter(e=>new Date(e.date)<=t)}return e},[T,U,J]);(0,_.useEffect)(()=>{w(10)},[T,U]);let X=(0,_.useMemo)(()=>ve(Y),[Y]),be=()=>{let t=Y.length,n=Y.filter(e=>e.status===`present`).length||0,r=Y.filter(e=>e.status===`absent`).length||0,i=Y.filter(e=>e.status===`late`).length||0,a=t>0?Math.round((n+i)/t*100):0,s=e?e.name:`Class Roster`,c=e?e.id:`Multiple`,l=[[`EDU FLOW - ATTENDANCE PERFORMANCE TRANSCRIPT`],[`Generated on: ${new Date().toLocaleString()}`],[`Identity: ${s}`,`ID: #${c}`],[`Class: ${e?.class_name||o?.class_name||`N/A`}`],[`Performance Percentage: ${a}%`],[`Total Records: ${t}`,`Present: ${n}`,`Absent: ${r}`,`Late: ${i}`],[``]],u=e?[`Date`,`Status`,`Remarks`]:[`Student Name`,`Student ID`,`Email`,`Date`,`Status`,`Remarks`],d=e=>{let t=String(e??``);return/[",\n]/.test(t)?`"${t.replace(/"/g,`""`)}"`:t},f=Y.map(t=>e?[new Date(t.date).toLocaleDateString(),String(t.status||``).toUpperCase(),t.remarks||``]:[t.student_name,`#${t.student_id}`,t.student_email||`N/A`,new Date(t.date).toLocaleDateString(),String(t.status||``).toUpperCase(),t.remarks||``]),p=[...l,u,...f].map(e=>e.map(d).join(`,`)).join(`
`),ee=new Blob([p],{type:`text/csv;charset=utf-8;`}),m=URL.createObjectURL(ee),h=document.createElement(`a`);h.href=m,h.download=`${e?.school_name||`School`}_Attendance_Filtered.csv`,h.click()},xe=async e=>{if(window.confirm(`Are you sure you want to delete this specific attendance record?`))try{await g.delete(`/attendance/${e}`),n.success(`Record deleted`),G()}catch{n.error(`Failed to delete record`)}},Se=async()=>{try{B(!0),await g.put(`/attendance/${V.id}`,{status:V.status,remarks:V.remarks}),n.success(`Attendance updated`),H(null),G()}catch{n.error(`Update failed`)}finally{B(!1)}},Ce=async()=>{try{let t=localStorage.getItem(`token`),n=await(await fetch(`${re}/attendance/export`,{method:`GET`,headers:{Authorization:`Bearer ${t}`}})).blob(),r=window.URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`${e?.school_name||`School`}_Attendance_All.xlsx`,i.click(),window.URL.revokeObjectURL(r)}catch(e){console.error(e)}},we=async()=>{try{B(!0);let e={date:I,entries:fe.map(e=>({student_id:e.student_id,status:e.status,remarks:e.remarks}))};if(!navigator.onLine){ie({type:`attendance`,method:`POST`,url:`/attendance/manual`,payload:e}),n(`Working offline. Attendance queued.`,{icon:`☁️`}),j(!1);return}await g.post(`/attendance/manual`,e),n.success(`Attendance saved successfully`),j(!1),G()}catch(e){n.error(e.response?.data?.message||`Failed to save attendance`)}finally{B(!1)}},Te=async()=>{if(!L)return n.error(`Select a file first`);let e=new FormData;e.append(`file`,L);try{B(!0),await g.post(`/attendance/upload`,e,{headers:{"Content-Type":`multipart/form-data`}}),n.success(`Excel uploaded successfully`),j(!1),R(null),G()}catch(e){n.error(e.response?.data?.message||`Upload failed`)}finally{B(!1)}},Z=[{name:`Present`,value:X.present,color:`#10b981`},{name:`Absent`,value:X.absent,color:`#ef4444`},{name:`Late`,value:X.late,color:`#f59e0b`}],Ee=(0,_.useCallback)((t,n)=>{let r=[...J];e?r=r.filter(t=>Number(t.student_id)===Number(e.id)):n!==`all`&&(r=r.filter(e=>Number(e.student_id)===Number(n))),t!==`all`&&(r=r.filter(e=>new Date(e.date).getMonth()===Number(t)));let i=r.length;if(i===0)return{percent:0,present:0,absent:0,total:0,level:`good`};let a=r.filter(e=>e.status===`present`).length,o=Math.round(a/i*100),s=`good`;return o<75&&(s=`warning`),o<50&&(s=`danger`),{percent:o,present:a,absent:i-a,total:i,level:s}},[J,e]),Q=(0,_.useMemo)(()=>Ee(O,k),[Ee,O,k]),De=()=>{let t=J||[];if(t.length===0)return n.error(`No attendance data available to print.`);let r=t.filter(t=>{let n=new Date(t.date),r=O===`all`||n.getMonth()===parseInt(O),i=Number(e?.id||k),a=k===`all`&&!e||Number(t.student_id||t.studentId)===i;return r&&a}).sort((e,t)=>new Date(t.date)-new Date(e.date)),i=O===`all`?`Full Academic Year`:[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`][parseInt(O)],a=e||P&&P.find(e=>Number(e.id)===Number(k));try{se({student:{...a,class_name:a?.class_name||e?.class_name||o?.class_name||`N/A`,school_name:a?.school_name||o?.school_name||`EduFlow`,school_address:a?.school_address||o?.school_address||`Institutional Main Campus, City, Country`},attendanceRows:r,reportMonthLabel:i,stats:Q,schoolLogo:e?.school_logo_url||o?.school_logo_url||`/assets/logo-DuW62jy3.png`,teacherName:o?.name||e?.teacher_name||`Class Teacher`})}catch{n.error(`Pop-up Blocked! Please click the 'Always Allow' icon in your browser address bar to view the PDF.`)}},$=!!h,Oe=(0,_.useMemo)(()=>{let e=h||Y;return $?typeof v==`number`&&typeof y==`number`?e.slice(v*y,(v+1)*y):e:Y.slice(0,C)},[h,Y,C,v,y]);return(0,x.jsxs)(`div`,{className:`attendance-section ${$?`mini-view`:``}`,children:[!he&&(0,x.jsxs)(`div`,{className:`offline-banner`,children:[(0,x.jsx)(a,{}),` You are currently offline. Changes will sync automatically.`]}),!$&&(0,x.jsxs)(`div`,{className:`attendance-header`,children:[(0,x.jsxs)(`div`,{className:`header-info`,children:[(0,x.jsx)(`p`,{className:`glass-kicker`,children:`Attendance Intelligence`}),(0,x.jsxs)(`h3`,{className:`section-title`,children:[(0,x.jsx)(r,{}),` Attendance Analytics`]}),(0,x.jsx)(`p`,{className:`glass-muted`,children:`Review real-time attendance trends and generate academic reports.`})]}),(0,x.jsxs)(`div`,{className:`attendance-actions`,children:[o&&(0,x.jsxs)(`div`,{className:`action-group`,children:[(0,x.jsxs)(`button`,{className:`btn-ui`,onClick:()=>{N(`manual`),j(!0)},children:[(0,x.jsx)(te,{}),` New Entry`]}),(0,x.jsxs)(`button`,{className:`btn-ui-secondary`,onClick:()=>{N(`upload`),j(!0)},children:[(0,x.jsx)(m,{}),` Bulk Upload`]})]}),(0,x.jsxs)(`div`,{className:`action-group`,children:[(0,x.jsx)(`button`,{className:`glass-icon-btn`,onClick:G,title:`Refresh Data`,children:(0,x.jsx)(ne,{})}),(0,x.jsxs)(`button`,{onClick:be,className:`btn-ui-secondary btn-csv`,children:[(0,x.jsx)(c,{}),` Export`]})]}),(0,x.jsxs)(`button`,{className:`btn-ui-secondary`,onClick:Ce,children:[(0,x.jsx)(t,{}),` Save All`]}),(0,x.jsxs)(`button`,{onClick:()=>D(!0),className:`btn-report`,children:[(0,x.jsx)(s,{}),` Generate Report`]})]})]}),!$&&(0,x.jsxs)(`div`,{className:`glass-stat-grid`,children:[(0,x.jsxs)(`div`,{className:`glass-stat-card`,children:[(0,x.jsxs)(`h4`,{children:[(0,x.jsx)(`div`,{className:`status-dot online`}),` Present`]}),(0,x.jsx)(`p`,{children:X.present})]}),(0,x.jsxs)(`div`,{className:`glass-stat-card`,children:[(0,x.jsxs)(`h4`,{children:[(0,x.jsx)(`div`,{className:`status-dot offline`}),` Absent`]}),(0,x.jsx)(`p`,{children:X.absent})]}),(0,x.jsxs)(`div`,{className:`glass-stat-card`,children:[(0,x.jsxs)(`h4`,{children:[(0,x.jsx)(`div`,{className:`status-dot`,style:{background:`var(--warning)`}}),` Late`]}),(0,x.jsx)(`p`,{children:X.late})]}),(0,x.jsxs)(`div`,{className:`glass-stat-card`,children:[(0,x.jsx)(`h4`,{children:`📊 Accuracy`}),(0,x.jsxs)(`p`,{children:[X.total>0?Math.round((X.present+X.late)/X.total*100):0,`%`]})]})]}),!$&&(0,x.jsxs)(`div`,{className:`filters`,children:[(0,x.jsx)(u,{className:`glass-muted`}),(0,x.jsx)(`input`,{type:`search`,className:`ui-field attendance-search-input`,value:T,onChange:e=>ce(e.target.value),placeholder:`Search student ID, name, or email`,"aria-label":`Search attendance by student ID, name, or email`}),(0,x.jsxs)(`select`,{value:U.status,className:`ui-select`,onChange:e=>W({...U,status:e.target.value}),children:[(0,x.jsx)(`option`,{value:`all`,children:`All`}),(0,x.jsx)(`option`,{value:`present`,children:`Present`}),(0,x.jsx)(`option`,{value:`absent`,children:`Absent`}),(0,x.jsx)(`option`,{value:`late`,children:`Late`})]}),(0,x.jsxs)(`select`,{value:U.month,className:`ui-select`,onChange:e=>W({...U,month:e.target.value}),children:[(0,x.jsx)(`option`,{value:`all`,children:`All Months`}),[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`].map((e,t)=>(0,x.jsx)(`option`,{value:t,children:e},t))]}),(0,x.jsx)(`select`,{value:U.year,className:`ui-select`,onChange:e=>W({...U,year:e.target.value}),children:_e.map(e=>(0,x.jsx)(`option`,{value:e,children:e},e))}),(0,x.jsx)(`input`,{type:`date`,className:`ui-field`,onChange:e=>W({...U,fromDate:e.target.value})}),(0,x.jsx)(`input`,{type:`date`,className:`ui-field`,onChange:e=>W({...U,toDate:e.target.value})})]}),!$&&(0,x.jsxs)(`div`,{className:`charts-container`,children:[(0,x.jsx)(oe,{title:`Attendance Ratio`,subtitle:`Lightweight summary by status`,data:Z,totalLabel:`records`}),(0,x.jsx)(ae,{title:`Performance Overview`,subtitle:`Quick breakdown of attendance counts`,data:Z.map(e=>({name:e.name,value:X.total?e.value/X.total*100:0}))})]}),(0,x.jsxs)(`div`,{className:`glass-table-shell table-scroll-x`,children:[!$&&(0,x.jsx)(`div`,{className:`glass-section-header`,children:(0,x.jsx)(`h4`,{children:`Detailed Logs`})}),$&&(0,x.jsx)(`div`,{className:`attendance-mini-actions`,children:(0,x.jsxs)(`button`,{onClick:()=>D(!0),className:`btn-report small glass-btn attendance-mini-report-button`,children:[(0,x.jsx)(s,{}),` PDF Report`]})}),(0,x.jsxs)(`table`,{className:`glass-table attendance-data-table`,children:[(0,x.jsx)(`thead`,{children:(0,x.jsxs)(`tr`,{children:[o&&(0,x.jsx)(`th`,{children:`Student`}),(0,x.jsx)(`th`,{children:`Date`}),(0,x.jsx)(`th`,{children:`Status`}),(0,x.jsx)(`th`,{children:`Remarks`}),o&&(0,x.jsx)(`th`,{className:`attendance-actions-heading`,children:`Actions`})]})}),(0,x.jsx)(`tbody`,{children:Oe.map(e=>(0,x.jsxs)(`tr`,{children:[o&&(0,x.jsxs)(`td`,{"data-label":`Student`,children:[(0,x.jsx)(`strong`,{children:e.student_name}),(0,x.jsx)(`br`,{}),(0,x.jsxs)(`small`,{className:`glass-muted`,children:[`ID: #`,e.student_id]})]}),(0,x.jsx)(`td`,{"data-label":`Date`,children:(0,x.jsx)(`strong`,{children:new Date(e.date).toLocaleDateString()})}),(0,x.jsx)(`td`,{"data-label":`Status`,children:(0,x.jsx)(`span`,{className:`badge ${e.status}`,children:e.status})}),(0,x.jsx)(`td`,{"data-label":`Remarks`,children:e.remarks||`-`}),o&&(0,x.jsx)(`td`,{"data-label":`Actions`,className:`attendance-actions-cell`,children:(0,x.jsxs)(`div`,{className:`attendance-row-actions`,children:[(0,x.jsx)(`button`,{className:`glass-icon-btn small`,onClick:()=>H(e),title:`Edit`,children:(0,x.jsx)(l,{})}),(0,x.jsx)(`button`,{className:`glass-icon-btn small danger`,onClick:()=>xe(e.id),title:`Delete`,children:(0,x.jsx)(ee,{})})]})})]},e.id))})]}),Oe.length===0&&(0,x.jsx)(`p`,{className:`glass-empty`,children:`No attendance records matching current filters.`}),!$&&C<Y.length&&(0,x.jsx)(`div`,{className:`view-more-container`,children:(0,x.jsx)(`button`,{className:`view-more-btn`,onClick:()=>w(e=>e+10),children:`View More Records`})})]}),E&&(0,x.jsx)(`div`,{className:`modal-overlay`,children:(0,x.jsxs)(`div`,{className:`modal-content large report-modal`,children:[(0,x.jsxs)(`div`,{className:`report-header`,children:[(0,x.jsxs)(`div`,{className:`school-branding`,children:[(0,x.jsxs)(`div`,{className:`report-logo-wrap`,children:[` `,(0,x.jsx)(`img`,{src:e?.school_logo_url||o?.school_logo_url||`/assets/logo-DuW62jy3.png`,alt:`School Logo`,crossOrigin:`anonymous`}),` `]}),(0,x.jsxs)(`div`,{className:`school-name`,children:[(0,x.jsx)(`h2`,{children:e?.school_name||o?.school_name||`School Management`}),(0,x.jsx)(`p`,{className:`school-address-text`,style:{fontSize:`12px`,opacity:.8,margin:`2px 0`},children:e?.school_address||o?.school_address||`Institutional Main Campus, City, Country`}),(0,x.jsx)(`p`,{className:`glass-kicker`,children:e?`Academic Compliance & Attendance Transcript`:`Departmental Attendance Performance Analytics`})]})]}),(0,x.jsx)(`button`,{onClick:()=>D(!1),className:`close-btn`,children:(0,x.jsx)(i,{})})]}),(0,x.jsxs)(`div`,{className:`modal-body`,children:[(0,x.jsxs)(`div`,{className:`report-meta`,children:[(0,x.jsx)(`div`,{className:`student-info-mini`,children:e?(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(`div`,{className:`student-report-avatar`,children:e?.profile_image?(0,x.jsx)(`img`,{src:e.profile_image,alt:e.name}):(0,x.jsx)(`div`,{className:`avatar-placeholder`,children:`👨‍🎓`})}),(0,x.jsx)(`h3`,{children:e?.name}),(0,x.jsxs)(`p`,{children:[`Student ID: #`,e?.id]}),(0,x.jsxs)(`p`,{children:[`Class: `,e?.class_name||`Assigned Class`]})]}):(0,x.jsxs)(x.Fragment,{children:[(0,x.jsxs)(`h3`,{children:[`Class: `,o?.class_name||`General`]}),(0,x.jsx)(`p`,{children:`Generated for full roster`})]})}),e?.bio&&(0,x.jsx)(`p`,{className:`student-report-bio`,children:e.bio}),(0,x.jsxs)(`div`,{className:`report-stats-grid`,children:[(0,x.jsxs)(`div`,{className:`report-stat-box`,children:[(0,x.jsx)(`h4`,{children:`Attendance Rate`}),(0,x.jsxs)(`div`,{className:`value ${Q.level}`,children:[Q.percent||0,`%`]})]}),(0,x.jsxs)(`div`,{className:`report-stat-box`,children:[(0,x.jsx)(`h4`,{children:`Days Present`}),(0,x.jsx)(`div`,{className:`value`,children:Q.present})]}),(0,x.jsxs)(`div`,{className:`report-stat-box`,children:[(0,x.jsx)(`h4`,{children:`Days Absent`}),(0,x.jsx)(`div`,{className:`value`,children:Q.absent})]}),(0,x.jsxs)(`div`,{className:`report-stat-box`,children:[(0,x.jsx)(`h4`,{children:`Total Days`}),(0,x.jsx)(`div`,{className:`value`,children:Q.total})]})]})]}),(0,x.jsxs)(`div`,{className:`dashboard-toolbar no-print`,children:[(0,x.jsxs)(`select`,{className:`ui-select`,value:O,onChange:e=>le(e.target.value),children:[(0,x.jsx)(`option`,{value:`all`,children:`Full Academic Year`}),[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`].map((e,t)=>(0,x.jsx)(`option`,{value:t,children:e},t))]}),o&&!e&&(0,x.jsxs)(`select`,{className:`ui-select`,value:k,onChange:e=>ue(e.target.value),children:[(0,x.jsx)(`option`,{value:`all`,children:`Report: All Students`}),P.map(e=>(0,x.jsxs)(`option`,{value:e.id,children:[e.name,` (#`,e.id,`)`]},e.id))]})]}),(0,x.jsx)(`div`,{className:`attendance-report-wrapper`,children:(0,x.jsxs)(`table`,{className:`glass-table`,children:[(0,x.jsx)(`thead`,{children:(0,x.jsxs)(`tr`,{children:[!e&&k===`all`&&(0,x.jsx)(`th`,{children:`Student Identity`}),(0,x.jsx)(`th`,{children:`Date`}),(0,x.jsx)(`th`,{children:`Status`}),(0,x.jsx)(`th`,{children:`Remarks`})]})}),(0,x.jsx)(`tbody`,{children:J.filter(t=>{let n=new Date(t.date),r=O===`all`||n.getMonth()===parseInt(O),i=Number(e?.id||k),a=k===`all`&&!e||Number(t.student_id||t.studentId)===i;return r&&a}).map(t=>(0,x.jsxs)(`tr`,{children:[!e&&k===`all`&&(0,x.jsxs)(`td`,{children:[(0,x.jsx)(`strong`,{children:t.student_name}),(0,x.jsx)(`br`,{}),(0,x.jsxs)(`small`,{children:[`ID: #`,t.student_id]})]}),(0,x.jsx)(`td`,{children:new Date(t.date).toLocaleDateString(`en-US`,{year:`numeric`,month:`short`,day:`numeric`})}),(0,x.jsx)(`td`,{children:(0,x.jsx)(`span`,{className:`badge ${t.status}`,children:t.status})}),(0,x.jsx)(`td`,{children:t.remarks||`-`})]},t.id))})]})})]}),(0,x.jsxs)(`div`,{className:`report-footer-print`,children:[(0,x.jsxs)(`div`,{className:`footer-branding`,children:[(0,x.jsx)(`div`,{className:`report-logo-wrap`,children:(0,x.jsx)(`img`,{src:e?.school_logo_url||o?.school_logo_url||`/assets/logo-DuW62jy3.png`,alt:`School logo`})}),(0,x.jsxs)(`div`,{className:`school-name`,children:[(0,x.jsx)(`h3`,{children:e?.school_name||o?.school_name||`School Management`}),(0,x.jsx)(`p`,{children:(0,x.jsx)(`a`,{href:`https://instagram.com/rizvani.dev/`,target:`_blank`,rel:`noreferrer`,children:`Powered by EduFlow`})})]})]}),(0,x.jsxs)(`div`,{className:`report-signature-block`,children:[(0,x.jsxs)(`div`,{className:`official-stamp-area`,style:{width:`100px`,height:`100px`,border:`1px dashed #cbd5e1`,borderRadius:`50%`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:`10px`,color:`#94a3b8`,margin:`0 auto 10px`,textAlign:`center`},children:[`OFFICIAL`,(0,x.jsx)(`br`,{}),`STAMP`]}),(0,x.jsxs)(`div`,{className:`signature-info`,children:[(0,x.jsxs)(`p`,{children:[(0,x.jsx)(`strong`,{children:`Prepared By:`}),` `,o?.name||`Class Teacher`]}),(0,x.jsxs)(`p`,{children:[(0,x.jsx)(`strong`,{children:`Date Generated:`}),` `,new Date().toLocaleString()]})]}),(0,x.jsxs)(`div`,{className:`signature-line-wrap`,children:[(0,x.jsx)(`div`,{className:`signature-line`}),(0,x.jsx)(`span`,{children:`Authorized Signature`})]})]})]}),(0,x.jsx)(`div`,{className:`modal-actions no-print`,children:(0,x.jsxs)(`button`,{onClick:De,className:`print-btn`,children:[(0,x.jsx)(d,{}),` Save as PDF / Print Report`]})})]})}),A&&(0,x.jsx)(`div`,{className:`modal-overlay`,children:(0,x.jsxs)(`div`,{className:`modal-content large`,children:[(0,x.jsxs)(`div`,{className:`modal-header--accent`,children:[(0,x.jsxs)(`div`,{className:`modal-header-copy`,children:[(0,x.jsxs)(`h3`,{children:[(0,x.jsx)(f,{}),` Attendance Entry System`]}),(0,x.jsx)(`p`,{className:`modal-subtitle`,children:`Submit manual records or process bulk data uploads.`})]}),(0,x.jsx)(`button`,{onClick:()=>j(!1),className:`close-btn`,children:(0,x.jsx)(i,{})})]}),(0,x.jsxs)(`div`,{className:`dashboard-toolbar`,style:{padding:`16px 24px`},children:[(0,x.jsxs)(`div`,{className:`dashboard-tabs`,children:[(0,x.jsx)(`button`,{className:`dashboard-tab ${M===`manual`?`active`:``}`,onClick:()=>N(`manual`),children:`Standard Manual Entry`}),(0,x.jsx)(`button`,{className:`dashboard-tab ${M===`upload`?`active`:``}`,onClick:()=>N(`upload`),children:`SaaS Excel Integration`})]}),M===`manual`&&(0,x.jsx)(`div`,{className:`action-group`,children:(0,x.jsxs)(`button`,{className:`btn-ui-secondary`,onClick:()=>ye(`present`),children:[(0,x.jsx)(p,{}),` Mark All Present`]})})]}),(0,x.jsx)(`div`,{className:`modal-body`,children:M===`manual`?(0,x.jsxs)(`div`,{className:`manual-entry-container`,children:[(0,x.jsxs)(`div`,{className:`form-group`,style:{marginBottom:24},children:[(0,x.jsx)(`label`,{children:`Attendance Date:`}),(0,x.jsx)(`input`,{type:`date`,className:`ui-field`,value:I,onChange:e=>pe(e.target.value)})]}),(0,x.jsx)(`div`,{className:`table-responsive`,children:(0,x.jsxs)(`table`,{className:`attendance-edit-table`,children:[(0,x.jsx)(`thead`,{children:(0,x.jsxs)(`tr`,{children:[(0,x.jsx)(`th`,{children:`Identity`}),(0,x.jsx)(`th`,{children:`Name`}),(0,x.jsx)(`th`,{children:`Email`}),(0,x.jsx)(`th`,{children:`Status`}),(0,x.jsx)(`th`,{children:`Remarks`})]})}),(0,x.jsx)(`tbody`,{children:fe.map(e=>(0,x.jsxs)(`tr`,{children:[(0,x.jsxs)(`td`,{children:[`#`,e.student_id]}),(0,x.jsx)(`td`,{style:{color:`var(--text-primary)`,fontWeight:700},children:e.name}),(0,x.jsx)(`td`,{children:(0,x.jsx)(`small`,{children:e.email})}),(0,x.jsx)(`td`,{children:(0,x.jsxs)(`select`,{className:`ui-select`,value:e.status,onChange:t=>q(e.student_id,`status`,t.target.value),children:[(0,x.jsx)(`option`,{value:`present`,children:`Present`}),(0,x.jsx)(`option`,{value:`absent`,children:`Absent`}),(0,x.jsx)(`option`,{value:`late`,children:`Late`})]})}),(0,x.jsx)(`td`,{children:(0,x.jsx)(`input`,{type:`text`,className:`ui-field`,placeholder:`Optional remarks`,value:e.remarks,onChange:t=>q(e.student_id,`remarks`,t.target.value)})})]},e.student_id))})]})})]}):(0,x.jsxs)(`div`,{className:`upload-container`,style:{padding:`40px 0`,textAlign:`center`},children:[(0,x.jsx)(m,{size:50,color:`#10b981`,style:{marginBottom:20}}),(0,x.jsx)(`h4`,{children:`Upload Attendance Excel Sheet`}),(0,x.jsxs)(`p`,{className:`sub-text`,children:[`File must contain headers: `,(0,x.jsx)(`strong`,{children:`Student_id, Date, Status`})]}),(0,x.jsx)(`input`,{type:`file`,accept:`.xlsx,.xls,.csv`,ref:me,onChange:e=>R(e.target.files[0]),style:{marginTop:20}})]})}),(0,x.jsxs)(`div`,{className:`modal-actions`,children:[(0,x.jsx)(`button`,{className:`btn-ui-secondary`,onClick:()=>j(!1),children:`Cancel`}),(0,x.jsxs)(`button`,{className:`btn-ui`,disabled:z,onClick:M===`manual`?we:Te,children:[(0,x.jsx)(f,{}),` `,z?`Processing...`:`Save Attendance`]})]})]})}),V&&(0,x.jsx)(`div`,{className:`modal-overlay`,children:(0,x.jsxs)(`div`,{className:`modal-content mini`,children:[(0,x.jsxs)(`div`,{className:`modal-header--accent`,children:[(0,x.jsx)(`h3`,{children:`Edit Attendance Record`}),(0,x.jsx)(`button`,{onClick:()=>H(null),className:`close-btn`,children:(0,x.jsx)(i,{})})]}),(0,x.jsxs)(`div`,{className:`modal-body`,children:[(0,x.jsxs)(`p`,{className:`sub-text`,children:[`Record for `,(0,x.jsx)(`strong`,{children:V.student_name}),` on `,new Date(V.date).toLocaleDateString()]}),(0,x.jsxs)(`div`,{className:`form-group attendance-edit-field`,children:[(0,x.jsx)(`label`,{children:`Status`}),(0,x.jsxs)(`select`,{className:`ui-select`,value:V.status,onChange:e=>H({...V,status:e.target.value}),children:[(0,x.jsx)(`option`,{value:`present`,children:`Present`}),(0,x.jsx)(`option`,{value:`absent`,children:`Absent`}),(0,x.jsx)(`option`,{value:`late`,children:`Late`})]})]}),(0,x.jsxs)(`div`,{className:`form-group`,children:[(0,x.jsx)(`label`,{children:`Remarks`}),(0,x.jsx)(`input`,{className:`ui-field`,value:V.remarks||``,onChange:e=>H({...V,remarks:e.target.value}),placeholder:`Notes...`})]})]}),(0,x.jsxs)(`div`,{className:`modal-actions`,children:[(0,x.jsx)(`button`,{className:`btn-ui-secondary`,onClick:()=>H(null),children:`Cancel`}),(0,x.jsx)(`button`,{className:`btn-ui`,disabled:z,onClick:Se,children:z?`Updating...`:`Save Changes`})]})]})})]})};export{se as n,b as r,S as t};