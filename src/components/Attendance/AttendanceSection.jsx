import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from "../../api/axiosInstance";
import schoolLogo from "../../assets/logo.png";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaDownload, FaFilter, FaSync, FaPrint, FaTimes, FaFileCsv, FaFilePdf } from "react-icons/fa";
import "./attendance.css";
import { API_BASE_URL } from "../../config/env";

const AttendanceSection = ({ student, teacher }) => {
  const [attendance, setAttendance] = useState([]);
  const [visibleCount, setVisibleCount] = useState(15);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState("all");

  const [filters, setFilters] = useState({
    status: "all",
    fromDate: "",
    toDate: "",
  });

  // ================= FETCH DATA =================
  const fetchAttendance = useCallback(async () => {
    try {
      const res = await API.get("/attendance");
      const data = res.data.attendance || [];

      setAttendance(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

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

  useEffect(() => {
    void fetchAttendance();
  }, [fetchAttendance]);

  const filteredData = useMemo(() => {
    let filtered = [...attendance];

    if (filters.status !== "all") {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    if (filters.fromDate) {
      filtered = filtered.filter(
        (a) => new Date(a.date) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      filtered = filtered.filter(
        (a) => new Date(a.date) <= new Date(filters.toDate)
      );
    }

    return filtered;
  }, [filters, attendance]);

  const summary = useMemo(() => calculateSummary(filteredData), [filteredData]);

  // ================= EXPORT =================
const exportFilteredCSV = () => {
  const total = filteredData.length;
  const p = filteredData.filter(a => a.status === 'present').length || 0;
  const a = filteredData.filter(a => a.status === 'absent').length || 0;
  const l = filteredData.filter(a => a.status === 'late').length || 0;
  const percent = total > 0 ? Math.round((p / total) * 100) : 0;

  const summaryHeader = [
    ["EDU FLOW - PERSONAL ATTENDANCE ANALYTICS (REAL-TIME)"],
    [`Generated on: ${new Date().toLocaleString()}`],
    [`Student Name: ${student?.name}`, `Student ID: #${student?.id}`],
    [`Class: ${student?.class_name || "N/A"}`, `Teacher: ${teacher?.name || "N/A"}`],
    [`Real-time Percentage: ${percent}%`],
    [`Total Records: ${total}`, `Present: ${p}`, `Absent: ${a}`, `Late: ${l}`],
    [""]
  ];
  const headers = ["Date", "Status", "Remarks"];
  const rows = filteredData.map(r => [
    new Date(r.date).toLocaleDateString(),
    r.status,
    r.remarks || ""
  ]);
  const csvContent = [...summaryHeader, headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `EduFlow_Attendance_Filtered.csv`;
  link.click();
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

    a.download = "EduFlow_Attendance_All.xlsx";
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  }
};



  // ================= CHART DATA =================
  const chartData = [
    { name: "Present", value: summary.present },
    { name: "Absent", value: summary.absent },
    { name: "Late", value: summary.late },
  ];

  const getStatsForMonth = (month) => {
    let records = attendance;
    if (month !== "all") {
      records = attendance.filter(a => new Date(a.date).getMonth() === parseInt(month));
    }

    const total = records.length;
    if (total === 0) return { percent: 0, present: 0, absent: 0, total: 0, level: 'good' };
    
    const present = records.filter(a => a.status === 'present').length;
    const percent = Math.round((present / total) * 100);
    
    let level = 'good';
    if (percent < 75) level = 'warning';
    if (percent < 50) level = 'danger';

    return { percent, present, absent: total - present, total, level };
  };



  return (
    <div className="attendance-section">

      {/* ================= HEADER ================= */}
      <div className="attendance-header">
        <h3>📊 Attendance Analytics</h3>

        <div className="attendance-actions">
          <button onClick={fetchAttendance}>
            <FaSync /> Refresh
          </button>

          
          <button onClick={exportFilteredCSV} className="btn-csv">
            <FaFileCsv /> Save Filtered
          </button>

          <button onClick={exportAttendance}>
            <FaDownload /> Save All
          </button>

          <button onClick={() => setShowReportModal(true)} className="btn-report">
            <FaFilePdf /> Generate Report
          </button>
        </div>
      </div>


      {/* ================= SUMMARY CARDS ================= */}
      <div className="attendance-cards">
        <div className="card present">
          <h4>Present</h4>
          <p>{summary.present}</p>
        </div>

        <div className="card absent">
          <h4>Absent</h4>
          <p>{summary.absent}</p>
        </div>

        <div className="card late">
          <h4>Late</h4>
          <p>{summary.late}</p>
        </div>

        <div className="card total">
          <h4>Total</h4>
          <p>{summary.total}</p>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="filters">
        <FaFilter />

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="all">All</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>

        <input
          type="date"
          onChange={(e) =>
            setFilters({ ...filters, fromDate: e.target.value })
          }
        />

        <input
          type="date"
          onChange={(e) =>
            setFilters({ ...filters, toDate: e.target.value })
          }
        />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="charts-container">

        {/* PIE CHART */}
        <div className="chart-box">
          <h4>Attendance Ratio</h4>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={90}
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="chart-box">
          <h4>Performance Overview</h4>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="attendance-table">
        <h4>Attendance Records</h4>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.slice(0, visibleCount).map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td className={item.status}>{item.status}</td>
                <td>{item.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <p className="no-data">No attendance found</p>
        )}


        {visibleCount < filteredData.length && (
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
          <div className="modal-box large report-modal">
            <div className="report-header">
              <div className="school-branding">
                <div className="school-logo-placeholder"> <img src={schoolLogo} alt="EduFlow Logo" /> </div>
                <div className="school-name">
                  <h2>EDU FLOW</h2>
                  <p>Personal Attendance Performance Report</p>
                </div>
              </div>
              <button onClick={() => setShowReportModal(false)} className="close-btn"><FaTimes/></button>
            </div>

            <div className="report-meta">
              <div className="student-info-mini">
                <div className="student-report-avatar">
                  {student?.profile_image ? <img src={student.profile_image} alt={student.name} /> : <div className="avatar-placeholder">👨‍🎓</div>}
                </div>
                <h3 style={{ fontSize: '24px', color: '#1e3a8a' }}>{student?.name}</h3>
                <p>Student ID: #{student?.id}</p>
                <p>Class: {student?.class_name || "Assigned Class"}</p>
                {student?.bio && <p className="student-report-bio">{student.bio}</p>}
              </div>

              <div className="report-stats-grid">
                {(() => {
                  const s = getStatsForMonth(reportMonth);
                  return (
                    <>
                      <div className="report-stat-box"><h4>Attendance Rate</h4><div className={`value ${s.level}`}>{s.percent}%</div></div>
                      <div className="report-stat-box"><h4>Days Present</h4><div className="value">{s.present}</div></div>
                      <div className="report-stat-box"><h4>Days Absent</h4><div className="value">{s.absent}</div></div>
                      <div className="report-stat-box"><h4>Total Days</h4><div className="value">{s.total}</div></div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="modal-filters no-print" style={{ marginBottom: '20px' }}>
              <select value={reportMonth} onChange={(e) => setReportMonth(e.target.value)}>
                <option value="all">Full Academic Year</option>
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
            </div>

            <table className="attendance-report-table">
              <thead>
                <tr><th>Date</th><th>Status</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                {attendance
                  .filter(a => reportMonth === "all" || new Date(a.date).getMonth() === parseInt(reportMonth))
                  .map(att => (
                    <tr key={att.id}>
                      <td>{new Date(att.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td><span className={`badge ${att.status}`}>{att.status}</span></td>
                      <td>{att.remarks || "-"}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>

            <div className="report-footer-print">
              <div className="footer-branding">
                <div className="school-logo-placeholder"><img src={schoolLogo} alt="EduFlow" /></div>
                <div className="school-name">
                  <h3>EDU FLOW</h3>
                  <p>Digital Learning Ecosystem</p>
                </div>
              </div>
              <div className="report-signature-info">
                <p><strong>Generated By:</strong> {student?.name}</p>
                <p><strong>Class Teacher:</strong> {teacher?.name || 'N/A'}</p>
                <p><strong>Date Generated:</strong> {new Date().toLocaleString()}</p>
              </div>
            </div>

            <div className="modal-actions no-print">
               <button onClick={() => window.print()} className="print-btn">
                <FaPrint /> Save as PDF / Print Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendanceSection;
