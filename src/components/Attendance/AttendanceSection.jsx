import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import API from "../../api/axiosInstance";
import schoolLogo from "../../assets/logo.png";
import { FaDownload, FaFilter, FaSync, FaPrint, FaTimes, FaFileCsv, FaFilePdf, FaChartPie, FaPlus, FaFileExcel, FaSave, FaCheckCircle, FaEdit, FaTrash, FaSpinner, FaCloud } from "react-icons/fa";
import "./attendance.css";
import { API_BASE_URL } from "../../config/env";
import { DonutSummaryChart, ProgressListChart } from "../charts/LightweightCharts";
import { toast } from "react-hot-toast";
import { openTeacherAttendancePrintWindow } from "../../utils/teacherPrint";
import { addToSyncQueue } from "../../utils/syncManager";

const AttendanceSection = ({ student, teacher, attendance: dashboardAttendance, page, limit }) => {
  const [attendance, setAttendance] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState("all");
  const [reportStudentId, setReportStudentId] = useState(student ? student.id : "all");
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageMode, setManageMode] = useState("manual"); // 'manual' or 'upload'
  const [students, setStudents] = useState([]);
  const [manualRows, setManualRows] = useState([]);
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [excelFile, setExcelFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const excelInputRef = useRef(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) fetchAttendance();
    };
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const [filters, setFilters] = useState({
    status: "all",
    fromDate: "",
    toDate: "",
    month: "all",
    year: new Date().getFullYear().toString(),
  });

  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()), []);

  // ================= FETCH DATA =================
  const fetchAttendance = useCallback(async (search = attendanceSearch) => {
    try {
      const res = await API.get("/attendance", {
        params: { page: 1, limit: 100, search: search.trim() || undefined },
      });
      const data = res.data.attendance || [];
      setAttendance(data);
      localStorage.setItem('cached_attendance', JSON.stringify(data));
    } catch (err) {
      const cached = localStorage.getItem('cached_attendance');
      if (cached) setAttendance(JSON.parse(cached));
    }
  }, [attendanceSearch]);

  const calculateSummary = (data) => {
    const summaryData = {
      present: 0,
      absent: 0,
      late: 0,
      holiday: 0,
      total: data.length,
    };

    data.forEach((item) => {
      const statusKey = String(item.status).toLowerCase();
      if (Object.prototype.hasOwnProperty.call(summaryData, statusKey)) {
        summaryData[statusKey]++;
      }
    });

    return summaryData;
  };

  const fetchRoster = useCallback(async () => {
    if (!teacher) return;
    try {
      const res = await API.get("/teacher/students");
      const data = res.data.students || [];
      setStudents(data);
      setManualRows(data.map(s => ({
        student_id: s.id,
        name: s.name,
        email: s.email,
        status: 'present',
        remarks: ''
      })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load student roster");
    }
  }, [teacher]);

  useEffect(() => {
    if (showManageModal && manageMode === "manual" && students.length === 0) {
      fetchRoster();
    }
  }, [showManageModal, manageMode, students.length, fetchRoster]);

  useEffect(() => {
    if (showReportModal && teacher && !student && students.length === 0) {
      fetchRoster();
    }
  }, [showReportModal, teacher, student, students.length, fetchRoster]);

  const handleManualRowChange = (id, key, val) => {
    setManualRows(prev => prev.map(r => Number(r.student_id) === Number(id) ? { ...r, [key]: val } : r));
  };

  const markAllManualStatus = (status) => {
    setManualRows(prev => prev.map(r => ({ ...r, status })));
  };

  useEffect(() => {
    if (!dashboardAttendance) {
      void fetchAttendance();
    }
  }, [fetchAttendance, dashboardAttendance]);

  const sourceAttendance = useMemo(
    () => (Array.isArray(dashboardAttendance) ? dashboardAttendance : attendance),
    [attendance, dashboardAttendance]
  );

  const filteredData = useMemo(() => {
    let filtered = [...sourceAttendance];

    if (attendanceSearch.trim()) {
      const query = attendanceSearch.trim().toLowerCase();
      filtered = filtered.filter((record) => [
        record.student_id,
        record.student_name,
        record.student_email,
      ].some((value) => String(value || '').toLowerCase().includes(query)));
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((a) => String(a.status).toLowerCase() === filters.status);
    }

    if (filters.month !== "all") {
      filtered = filtered.filter((a) => new Date(a.date).getMonth() === Number(filters.month));
    }

    if (filters.year !== "all") {
      filtered = filtered.filter((a) => new Date(a.date).getFullYear() === Number(filters.year));
    }

    if (filters.fromDate) {
      filtered = filtered.filter(
        (a) => new Date(a.date) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      const endDate = new Date(`${filters.toDate}T23:59:59`);
      filtered = filtered.filter((a) => new Date(a.date) <= endDate);
    }

    return filtered;
  }, [attendanceSearch, filters, sourceAttendance]);

  useEffect(() => {
    setVisibleCount(10);
  }, [attendanceSearch, filters]);

  const summary = useMemo(() => calculateSummary(filteredData), [filteredData]);

  // ================= EXPORT =================
  const exportFilteredCSV = () => {
    const total = filteredData.length;
    const p = filteredData.filter(a => a.status === 'present').length || 0;
    const a = filteredData.filter(a => a.status === 'absent').length || 0;
    const l = filteredData.filter(a => a.status === 'late').length || 0;
    const percent = total > 0 ? Math.round(((p + l) / total) * 100) : 0;

    const targetName = student ? student.name : "Class Roster";
    const targetId = student ? student.id : "Multiple";

    const summaryHeader = [
      ["EDU FLOW - ATTENDANCE PERFORMANCE TRANSCRIPT"],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Identity: ${targetName}`, `ID: #${targetId}`],
      [`Class: ${student?.class_name || teacher?.class_name || "N/A"}`],
      [`Performance Percentage: ${percent}%`],
      [`Total Records: ${total}`, `Present: ${p}`, `Absent: ${a}`, `Late: ${l}`],
      [""]
    ];

    // Conditional Headers
    const headers = student 
      ? ["Date", "Status", "Remarks"] 
      : ["Student Name", "Student ID", "Email", "Date", "Status", "Remarks"];

    const escapeCsvValue = (value) => {
      const text = String(value ?? '');
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const rows = filteredData.map(r => (student ? [
      new Date(r.date).toLocaleDateString(),
      String(r.status || '').toUpperCase(),
      r.remarks || ""
    ] : [
      r.student_name,
      `#${r.student_id}`,
      r.student_email || "N/A",
      new Date(r.date).toLocaleDateString(),
      String(r.status || '').toUpperCase(),
      r.remarks || ""
    ]));

    const csvContent = [...summaryHeader, headers, ...rows]
      .map(row => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${student?.school_name || 'School'}_Attendance_Filtered.csv`;
    link.click();
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this specific attendance record?")) return;
    try {
      await API.delete(`/attendance/${id}`);
      toast.success("Record deleted");
      fetchAttendance();
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  const handleUpdateRecord = async () => {
    try {
      setIsSaving(true);
      await API.put(`/attendance/${editingRecord.id}`, {
        status: editingRecord.status,
        remarks: editingRecord.remarks
      });
      toast.success("Attendance updated");
      setEditingRecord(null);
      fetchAttendance();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };


const exportAttendance = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/attendance/export`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    a.download = `${student?.school_name || 'School'}_Attendance_All.xlsx`;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  }
};

const submitManualAttendance = async () => {
  try {
    setIsSaving(true);
    const payload = {
      date: manualDate,
      entries: manualRows.map(r => ({
        student_id: r.student_id,
        status: r.status,
        remarks: r.remarks
      }))
    };

    if (!navigator.onLine) {
      addToSyncQueue({ 
        type: 'attendance', 
        method: 'POST', 
        url: '/attendance/manual', 
        payload 
      });
      toast("Working offline. Attendance queued.", { icon: '☁️' });
      setShowManageModal(false);
      return;
    }

    await API.post('/attendance/manual', payload);
    toast.success("Attendance saved successfully");
    setShowManageModal(false);
    fetchAttendance();
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to save attendance");
  } finally {
    setIsSaving(false);
  }
};

const handleExcelUpload = async () => {
  if (!excelFile) return toast.error("Select a file first");
  const formData = new FormData();
  formData.append('file', excelFile);
  try {
    setIsSaving(true);
    await API.post('/attendance/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    toast.success("Excel uploaded successfully");
    setShowManageModal(false);
    setExcelFile(null);
    fetchAttendance();
  } catch (err) {
    toast.error(err.response?.data?.message || "Upload failed");
  } finally {
    setIsSaving(false);
  }
};


  // ================= CHART DATA =================
  const chartData = [
    { name: "Present", value: summary.present, color: '#10b981' },
    { name: "Absent", value: summary.absent, color: '#ef4444' },
    { name: "Late", value: summary.late, color: '#f59e0b' },
  ];

  const getStatsForMonth = useCallback((month, targetStudentId) => {
    let records = [...sourceAttendance];

    if (student) {
      records = records.filter(a => Number(a.student_id) === Number(student.id));
    } else if (targetStudentId !== "all") {
      records = records.filter(a => Number(a.student_id) === Number(targetStudentId));
    }

    if (month !== "all") {
      records = records.filter(a => new Date(a.date).getMonth() === Number(month));
    }

    const total = records.length;
    if (total === 0) return { percent: 0, present: 0, absent: 0, total: 0, level: 'good' };
    
    const present = records.filter(a => a.status === 'present').length;
    const percent = Math.round((present / total) * 100);
    
    let level = 'good';
    if (percent < 75) level = 'warning';
    if (percent < 50) level = 'danger';

    return { percent, present, absent: total - present, total, level };
  }, [sourceAttendance, student]);

  const reportStats = useMemo(() => {
    return getStatsForMonth(reportMonth, reportStudentId);
  }, [getStatsForMonth, reportMonth, reportStudentId]);

  // ================= PREMIUM PRINT LOGIC (Spotlight Logic) =================
  const handlePrintPDF = () => {
    const source = sourceAttendance || [];
    if (source.length === 0) {
      return toast.error("No attendance data available to print.");
    }

    // Optimized filtering for PDF content
    const reportRows = source.filter(a => {
      const dateObj = new Date(a.date);
      const matchesMonth = reportMonth === "all" || dateObj.getMonth() === parseInt(reportMonth);
      const targetId = Number(student?.id || reportStudentId);
      const matchesStudent = (reportStudentId === "all" && !student) 
        || Number(a.student_id || a.studentId) === targetId;
      return matchesMonth && matchesStudent;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const monthLabel = reportMonth === "all" ? "Full Academic Year" : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(reportMonth)];
    
    const studentInfo = student || (students && students.find(s => Number(s.id) === Number(reportStudentId)));

    try {
      openTeacherAttendancePrintWindow({
        student: { 
          ...studentInfo, 
          class_name: studentInfo?.class_name || student?.class_name || teacher?.class_name || "N/A",
          school_name: studentInfo?.school_name || teacher?.school_name || "EduFlow",
          school_address: studentInfo?.school_address || teacher?.school_address || "Institutional Main Campus, City, Country"
        },
        attendanceRows: reportRows,
        reportMonthLabel: monthLabel,
        stats: reportStats,
        schoolLogo: student?.school_logo_url || teacher?.school_logo_url || schoolLogo,
        teacherName: teacher?.name || student?.teacher_name || "Class Teacher",
      });
    } catch (error) {
      toast.error("Pop-up Blocked! Please click the 'Always Allow' icon in your browser address bar to view the PDF.");
    }
  };

  const isMini = !!dashboardAttendance;
  const tableData = useMemo(() => {
    let baseData = dashboardAttendance || filteredData;
    if (isMini) {
      if (typeof page === 'number' && typeof limit === 'number') {
        return baseData.slice(page * limit, (page + 1) * limit);
      }
      return baseData;
    }
    return filteredData.slice(0, visibleCount);
  }, [dashboardAttendance, filteredData, visibleCount, page, limit]);

  return (
    <div className={`attendance-section ${isMini ? 'mini-view' : ''}`}>
      {!isOnline && (
        <div className="offline-banner">
          <FaCloud /> You are currently offline. Changes will sync automatically.
        </div>
      )}

      {/* ================= HEADER ================= */}
      {!isMini && (
        <div className="attendance-header">
          <div className="header-info">
            <p className="glass-kicker">Attendance Intelligence</p>
            <h3 className="section-title"><FaChartPie /> Attendance Analytics</h3>
            <p className="glass-muted">Review real-time attendance trends and generate academic reports.</p>
          </div>

          <div className="attendance-actions">
            {teacher && (
              <div className="action-group">
                <button className="btn-ui" onClick={() => { setManageMode('manual'); setShowManageModal(true); }}>
                  <FaPlus /> New Entry
                </button>
                <button className="btn-ui-secondary" onClick={() => { setManageMode('upload'); setShowManageModal(true); }}>
                  <FaFileExcel /> Bulk Upload
                </button>
              </div>
            )}
            
            <div className="action-group">
              <button className="glass-icon-btn" onClick={fetchAttendance} title="Refresh Data">
                <FaSync />
              </button>
              <button onClick={exportFilteredCSV} className="btn-ui-secondary btn-csv">
                <FaFileCsv /> Export
              </button>
            </div>

            <button className="btn-ui-secondary" onClick={exportAttendance}>
              <FaDownload /> Save All
            </button>

            <button onClick={() => setShowReportModal(true)} className="btn-report">
              <FaFilePdf /> Generate Report
            </button>
          </div>
        </div>
      )}
   


      {/* ================= SUMMARY CARDS ================= */}
      {!isMini && (
        <div className="glass-stat-grid">
        <div className="glass-stat-card">
          <h4><div className="status-dot online" /> Present</h4>
          <p>{summary.present}</p>
        </div>

        <div className="glass-stat-card">
          <h4><div className="status-dot offline" /> Absent</h4>
          <p>{summary.absent}</p>
        </div>

        <div className="glass-stat-card">
          <h4><div className="status-dot" style={{ background: 'var(--warning)' }} /> Late</h4>
          <p>{summary.late}</p>
        </div>

        <div className="glass-stat-card">
          <h4>📊 Accuracy</h4>
          <p>{summary.total > 0 ? Math.round(((summary.present + summary.late) / summary.total) * 100) : 0}%</p>
        </div>
      </div>
      )}

      {/* ================= FILTERS ================= */}
      {!isMini && (
        <div className="filters">
        <FaFilter className="glass-muted" />

        <input
          type="search"
          className="ui-field attendance-search-input"
          value={attendanceSearch}
          onChange={(event) => setAttendanceSearch(event.target.value)}
          placeholder="Search student ID, name, or email"
          aria-label="Search attendance by student ID, name, or email"
        />

        <select
          value={filters.status}
          className="ui-select"
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="all">All</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>

        <select
          value={filters.month}
          className="ui-select"
          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
        >
          <option value="all">All Months</option>
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>

        <select
          value={filters.year}
          className="ui-select"
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <input
          type="date"
          className="ui-field"
          onChange={(e) =>
            setFilters({ ...filters, fromDate: e.target.value })
          }
        />

        <input
          type="date"
          className="ui-field"
          onChange={(e) =>
            setFilters({ ...filters, toDate: e.target.value })
          }
        />
      </div>
      )}

      {/* ================= CHARTS ================= */}
      {!isMini && (
        <div className="charts-container">
          <DonutSummaryChart
            title="Attendance Ratio"
            subtitle="Lightweight summary by status"
            data={chartData}
            totalLabel="records"
          />
          <ProgressListChart
            title="Performance Overview"
            subtitle="Quick breakdown of attendance counts"
            data={chartData.map((item) => ({ name: item.name, value: summary.total ? (item.value / summary.total) * 100 : 0 }))}
          />
        </div>
      )}

      {/* ================= RECORDS TABLE ================= */}
      <div className="glass-table-shell table-scroll-x">
        {!isMini && <div className="glass-section-header"><h4>Detailed Logs</h4></div>}
        {isMini && (
          <div className="attendance-mini-actions">
            <button onClick={() => setShowReportModal(true)} className="btn-report small glass-btn attendance-mini-report-button">
              <FaFilePdf /> PDF Report
            </button>
          </div>
        )}

        <table className="glass-table attendance-data-table">
          <thead>
            <tr>
              {teacher && <th>Student</th>}
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
              {teacher && <th className="attendance-actions-heading">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {tableData.map((item) => (
              <tr key={item.id}>
                {teacher && (
                  <td data-label="Student">
                    <strong>{item.student_name}</strong><br/>
                    <small className="glass-muted">ID: #{item.student_id}</small>
                  </td>
                )}
                <td data-label="Date"><strong>{new Date(item.date).toLocaleDateString()}</strong></td>
                <td data-label="Status"><span className={`badge ${item.status}`}>{item.status}</span></td>
                <td data-label="Remarks">{item.remarks || "-"}</td>
                {teacher && (
                  <td data-label="Actions" className="attendance-actions-cell">
                    <div className="attendance-row-actions">
                      <button className="glass-icon-btn small" onClick={() => setEditingRecord(item)} title="Edit"><FaEdit /></button>
                      <button className="glass-icon-btn small danger" onClick={() => handleDeleteRecord(item.id)} title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {tableData.length === 0 && (
          <p className="glass-empty">No attendance records matching current filters.</p>
        )}


        {!isMini && visibleCount < filteredData.length && (
          <div className="view-more-container">
            <button className="view-more-btn" onClick={() => setVisibleCount(prev => prev + 10)}>
              View More Records
            </button>
          </div>
        )}
      </div>

      {/* Beautiful PDF Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-content large report-modal">
            <div className="report-header">
              <div className="school-branding">
                <div className="report-logo-wrap"> <img src={student?.school_logo_url || teacher?.school_logo_url || schoolLogo} alt="School Logo" crossOrigin="anonymous" /> </div>
                <div className="school-name">
                  <h2>{student?.school_name || teacher?.school_name || 'School Management'}</h2>
                  <p className="school-address-text" style={{ fontSize: '12px', opacity: 0.8, margin: '2px 0' }}>{student?.school_address || teacher?.school_address || 'Institutional Main Campus, City, Country'}</p>
                  <p className="glass-kicker">{student ? "Academic Compliance & Attendance Transcript" : "Departmental Attendance Performance Analytics"}</p>
                </div>
              </div>
              <button onClick={() => setShowReportModal(false)} className="close-btn"><FaTimes/></button>
            </div>
            <div className="modal-body">
            <div className="report-meta">
              <div className="student-info-mini">
                {student ? (
                  <>
                    <div className="student-report-avatar">
                      {student?.profile_image ? <img src={student.profile_image} alt={student.name} /> : <div className="avatar-placeholder">👨‍🎓</div>}
                    </div>
                    <h3>{student?.name}</h3>
                    <p>Student ID: #{student?.id}</p>
                    <p>Class: {student?.class_name || "Assigned Class"}</p>
                  </>
                ) : (
                  <>
                    <h3>Class: {teacher?.class_name || "General"}</h3>
                    <p>Generated for full roster</p>
                  </>
                )}
              </div>
              {student?.bio && <p className="student-report-bio">{student.bio}</p>}
              
              <div className="report-stats-grid">
                <div className="report-stat-box"><h4>Attendance Rate</h4><div className={`value ${reportStats.level}`}>{reportStats.percent || 0}%</div></div>
                <div className="report-stat-box"><h4>Days Present</h4><div className="value">{reportStats.present}</div></div>
                <div className="report-stat-box"><h4>Days Absent</h4><div className="value">{reportStats.absent}</div></div>
                <div className="report-stat-box"><h4>Total Days</h4><div className="value">{reportStats.total}</div></div>
              </div>
            </div>

            <div className="dashboard-toolbar no-print">
              <select className="ui-select" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)}>
                <option value="all">Full Academic Year</option>
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              {teacher && !student && (
                <select className="ui-select" value={reportStudentId} onChange={(e) => setReportStudentId(e.target.value)}>
                  <option value="all">Report: All Students</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="attendance-report-wrapper">
              <table className="glass-table">
                <thead>
                  <tr>
                    {(!student && reportStudentId === "all") && <th>Student Identity</th>}
                    <th>Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceAttendance
                    .filter(a => {
                      const dateObj = new Date(a.date);
                      const matchesMonth = reportMonth === "all" || dateObj.getMonth() === parseInt(reportMonth);
                      const targetId = Number(student?.id || reportStudentId);
                      const matchesStudent = (reportStudentId === "all" && !student) 
                        || Number(a.student_id || a.studentId) === targetId;
                      return matchesMonth && matchesStudent;
                    })
                    .map(att => (
                      <tr key={att.id}>
                        {(!student && reportStudentId === "all") && (
                          <td><strong>{att.student_name}</strong><br/><small>ID: #{att.student_id}</small></td>
                        )}
                        <td>{new Date(att.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td><span className={`badge ${att.status}`}>{att.status}</span></td>
                        <td>{att.remarks || "-"}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div></div>

            <div className="report-footer-print">
              <div className="footer-branding">
                <div className="report-logo-wrap"><img src={student?.school_logo_url || teacher?.school_logo_url || schoolLogo} alt="School logo" /></div>
                <div className="school-name">
                  <h3>{student?.school_name || teacher?.school_name || 'School Management'}</h3>
                  <p><a href="https://instagram.com/rizvani.dev/" target="_blank" rel="noreferrer">Powered by EduFlow</a></p>
                </div>
              </div>
              <div className="report-signature-block">
                <div className="official-stamp-area" style={{ width: '100px', height: '100px', border: '1px dashed #cbd5e1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8', margin: '0 auto 10px', textAlign: 'center' }}>
                  OFFICIAL<br/>STAMP
                </div>
                <div className="signature-info">
                  <p><strong>Prepared By:</strong> {teacher?.name || 'Class Teacher'}</p>
                  <p><strong>Date Generated:</strong> {new Date().toLocaleString()}</p>
                </div>
                <div className="signature-line-wrap">
                  <div className="signature-line"></div>
                  <span>Authorized Signature</span>
                </div>
              </div>
            </div>

            <div className="modal-actions no-print">
               <button onClick={handlePrintPDF} className="print-btn">
                <FaPrint /> Save as PDF / Print Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Management Modal (Manual/Excel) */}
      {showManageModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header--accent">
              <div className="modal-header-copy">
                <h3><FaSave /> Attendance Entry System</h3>
                <p className="modal-subtitle">Submit manual records or process bulk data uploads.</p>
              </div>
              <button onClick={() => setShowManageModal(false)} className="close-btn"><FaTimes /></button>
            </div>

            <div className="dashboard-toolbar" style={{ padding: '16px 24px' }}>
              <div className="dashboard-tabs">
                <button className={`dashboard-tab ${manageMode === 'manual' ? 'active' : ''}`} onClick={() => setManageMode('manual')}>Standard Manual Entry</button>
                <button className={`dashboard-tab ${manageMode === 'upload' ? 'active' : ''}`} onClick={() => setManageMode('upload')}>SaaS Excel Integration</button>
              </div>
              {manageMode === 'manual' && (
                <div className="action-group">
                   <button className="btn-ui-secondary" onClick={() => markAllManualStatus('present')}><FaCheckCircle /> Mark All Present</button>
                </div>
              )}
            </div>

            <div className="modal-body">
              {manageMode === 'manual' ? (
                <div className="manual-entry-container">
                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label>Attendance Date:</label>
                    <input type="date" className="ui-field" value={manualDate} onChange={e => setManualDate(e.target.value)} />
                  </div>

                  <div className="table-responsive">
                    <table className="attendance-edit-table">
                      <thead>
                        <tr>
                          <th>Identity</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manualRows.map(row => (
                          <tr key={row.student_id}>
                            <td>#{row.student_id}</td>
                            <td style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{row.name}</td>
                            <td><small>{row.email}</small></td>
                            <td>
                              <select 
                                className="ui-select" 
                                value={row.status} 
                                onChange={e => handleManualRowChange(row.student_id, 'status', e.target.value)}
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                              </select>
                            </td>
                            <td>
                              <input 
                                type="text" 
                                className="ui-field" 
                                placeholder="Optional remarks" 
                                value={row.remarks} 
                                onChange={e => handleManualRowChange(row.student_id, 'remarks', e.target.value)} 
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="upload-container" style={{ padding: '40px 0', textAlign: 'center' }}>
                  <FaFileExcel size={50} color="#10b981" style={{ marginBottom: 20 }} />
                  <h4>Upload Attendance Excel Sheet</h4>
                  <p className="sub-text">File must contain headers: <strong>Student_id, Date, Status</strong></p>
                  <input type="file" accept=".xlsx,.xls,.csv" ref={excelInputRef} onChange={e => setExcelFile(e.target.files[0])} style={{ marginTop: 20 }} />
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-ui-secondary" onClick={() => setShowManageModal(false)}>Cancel</button>
              <button className="btn-ui" disabled={isSaving} onClick={manageMode === 'manual' ? submitManualAttendance : handleExcelUpload}>
                <FaSave /> {isSaving ? 'Processing...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Record Edit Modal */}
      {editingRecord && (
        <div className="modal-overlay">
          <div className="modal-content mini">
            <div className="modal-header--accent">
              <h3>Edit Attendance Record</h3>
              <button onClick={() => setEditingRecord(null)} className="close-btn"><FaTimes /></button>
            </div>
            <div className="modal-body">
              <p className="sub-text">Record for <strong>{editingRecord.student_name}</strong> on {new Date(editingRecord.date).toLocaleDateString()}</p>
              <div className="form-group attendance-edit-field">
                <label>Status</label>
                <select className="ui-select" value={editingRecord.status} onChange={e => setEditingRecord({...editingRecord, status: e.target.value})}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <input className="ui-field" value={editingRecord.remarks || ""} onChange={e => setEditingRecord({...editingRecord, remarks: e.target.value})} placeholder="Notes..." />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-ui-secondary" onClick={() => setEditingRecord(null)}>Cancel</button>
              <button className="btn-ui" disabled={isSaving} onClick={handleUpdateRecord}>{isSaving ? "Updating..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendanceSection;
