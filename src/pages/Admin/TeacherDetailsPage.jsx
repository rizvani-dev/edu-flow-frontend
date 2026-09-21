import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaMoneyBillWave, FaCalendarCheck, FaUpload,
  FaCheckCircle, FaSearch, FaPlus, FaTimes, FaDownload,
  FaUserCircle, FaTrash, FaCalculator
} from 'react-icons/fa';
import API from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { resolveMediaUrl } from '../../utils/media';
import { prepareUploadFile } from '../../utils/uploadMedia';
import './teacherDetails.css';

const MONTHS_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TeacherDetailsPage = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  
  const [teacher, setTeacher] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSalary, setSearchSalary] = useState('');
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [sendingSalary, setSendingSalary] = useState(false);
  const [downloadingSlipId, setDownloadingSlipId] = useState(null);

  const [salaryFormData, setSalaryFormData] = useState({
    month: new Date().toLocaleString('en-US', { month: 'long' }),
    year: new Date().getFullYear(),
    basic_salary: '',
    allowances: '',
    bonus: '',
    overtime: '',
    deductions: '',
    advance: '',
    fine: '',
    status: 'pending',
    remarks: '',
    screenshot: null
  });

  // Calculate live net salary in modal
  const computedNetSalary = useMemo(() => {
    const b = Number(salaryFormData.basic_salary || 0);
    const al = Number(salaryFormData.allowances || 0);
    const bo = Number(salaryFormData.bonus || 0);
    const ot = Number(salaryFormData.overtime || 0);
    const de = Number(salaryFormData.deductions || 0);
    const ad = Number(salaryFormData.advance || 0);
    const fi = Number(salaryFormData.fine || 0);
    return Math.max(0, (b + al + bo + ot) - (de + ad + fi));
  }, [salaryFormData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, aRes, sRes] = await Promise.all([
        API.get(`/admin/users/${teacherId}`),
        API.get(`/admin/teacher-attendance/${teacherId}`),
        API.get(`/admin/teacher-salaries/${teacherId}`)
      ]);
      setTeacher(tRes.data.user);
      setAttendance(aRes.data.attendance || []);
      setSalaries(sRes.data.salaries || []);
    } catch (err) {
      toast.error("Failed to load teacher data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  const handleScreenshotChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const preparedFile = await prepareUploadFile(file, { maxBytes: 5 * 1024 * 1024, maxSizeMB: 1.5 });
      setSalaryFormData((prev) => ({ ...prev, screenshot: preparedFile }));
      setScreenshotPreview(URL.createObjectURL(preparedFile));
    } catch (error) {
      toast.error(error.message || "File too large (Max 5MB)");
      e.target.value = '';
    }
  };

  const handleAddSalary = async (e) => {
    e.preventDefault();
    if (!salaryFormData.basic_salary || Number(salaryFormData.basic_salary) <= 0) {
      return toast.error("Basic salary must be greater than 0");
    }

    const data = new FormData();
    Object.keys(salaryFormData).forEach(key => {
      if (key === 'screenshot' && salaryFormData[key]) {
        data.append('file', salaryFormData[key]);
      } else {
        data.append(key, salaryFormData[key] ?? '');
      }
    });

    try {
      setSendingSalary(true);
      await API.post(`/admin/teacher-salaries/${teacherId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Salary record created successfully!");
      setShowSalaryModal(false);
      setSalaryFormData({
        month: new Date().toLocaleString('en-US', { month: 'long' }),
        year: new Date().getFullYear(),
        basic_salary: '',
        allowances: '',
        bonus: '',
        overtime: '',
        deductions: '',
        advance: '',
        fine: '',
        status: 'pending',
        remarks: '',
        screenshot: null
      });
      setScreenshotPreview(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add salary record");
    } finally {
      setSendingSalary(false);
    }
  };

  const handleDeleteSalary = async (salaryId) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) return;
    try {
      await API.delete(`/admin/teacher-salaries/${salaryId}`);
      toast.success("Salary record deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete salary record");
      console.error(err);
    }
  };

  const updateSalaryStatus = async (salaryId, status) => {
    try {
      await API.put(`/admin/teacher-salaries/${salaryId}/status`, { status });
      toast.success(`Salary marked as ${status.toUpperCase()}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    }
  };

  const handleDownloadSalarySlip = async (salary) => {
    setDownloadingSlipId(salary.id);
    try {
      const response = await API.get(`/teacher/salaries/${salary.id}/slip`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Salary-Slip-${teacher?.name || 'Teacher'}-${salary.month}-${salary.year}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Salary slip downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download salary slip');
    } finally {
      setDownloadingSlipId(null);
    }
  };

  const filteredSalaries = useMemo(() => {
    return salaries.filter(s => 
      s.month.toLowerCase().includes(searchSalary.toLowerCase()) || 
      s.year.toString().includes(searchSalary)
    );
  }, [salaries, searchSalary]);

  const attendanceStats = useMemo(() => {
    const total = attendance.length;
    if (total === 0) return { percent: 0, present: 0 };
    const present = attendance.filter(a => a.status === 'present').length;
    return { total, present, percent: Math.round((present / total) * 100) };
  }, [attendance]);

  if (loading) return <div className="p-10 text-center">Loading teacher profile...</div>;

  return (
    <div className="teacher-details-page">
      <header className="details-header">
        <button onClick={() => navigate(-1)} className="back-btn"><FaArrowLeft /> Back to Dashboard</button>
        <div className="profile-hero">
          <div className="hero-avatar">
            {teacher?.profile_image ? <img src={teacher.profile_image} alt="" /> : <FaUserCircle size={80} />}
          </div>
          <div className="hero-meta">
            <h1>{teacher?.name}</h1>
            <p>{teacher?.email} • {teacher?.class_name || 'Unassigned Section'}</p>
          </div>
        </div>
      </header>

      <div className="details-grid">
        <section className="info-section">
          <div className="detail-card stat-card-alt">
            <FaCalendarCheck className="card-icon" />
            <h3>Attendance Summary</h3>
            <div className="stat-big">{attendanceStats.percent}%</div>
            <p>{attendanceStats.present} days present out of {attendanceStats.total}</p>
          </div>

          <div className="salary-controls">
            <div className="search-bar">
              <FaSearch />
              <input 
                type="text" 
                placeholder="Filter salary by month/year..." 
                value={searchSalary}
                onChange={(e) => setSearchSalary(e.target.value)}
              />
            </div>
            <button className="btn-add-salary btn-primary" onClick={() => setShowSalaryModal(true)}>
              <FaPlus /> Issue Monthly Salary
            </button>
          </div>

          <div className="salary-grid">
            {filteredSalaries.map(salary => {
              const canDownloadSlip = ['approved', 'paid', 'received'].includes(String(salary.status).toLowerCase());
              return (
                <div key={salary.id} className={`salary-card ${salary.status}`}>
                  <div className="s-card-head">
                    <div>
                      <h4>{salary.month} {salary.year}</h4>
                      <small style={{ color: '#64748b' }}>
                        Basic: PKR {Number(salary.basic_salary || salary.amount).toLocaleString()}
                        {Number(salary.allowances) > 0 ? ` + Allow: ${Number(salary.allowances).toLocaleString()}` : ''}
                      </small>
                    </div>
                    <span className={`status-pill ${salary.status}`}>
                      {salary.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="s-amount" style={{ marginTop: '8px' }}>
                    Net: PKR {Number(salary.amount).toLocaleString()}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '8px 0' }}>
                    {salary.payment_screenshot && (
                      <a href={resolveMediaUrl(salary.payment_screenshot)} target="_blank" rel="noreferrer" className="screenshot-link">
                        <FaDownload /> Receipt
                      </a>
                    )}
                    {canDownloadSlip && (
                      <button
                        type="button"
                        onClick={() => handleDownloadSalarySlip(salary)}
                        disabled={downloadingSlipId === salary.id}
                        className="screenshot-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f766e', fontWeight: 600 }}
                      >
                        <FaDownload /> {downloadingSlipId === salary.id ? 'Generating...' : 'Salary Slip PDF'}
                      </button>
                    )}
                  </div>

                  {salary.status === 'received' && (
                    <div className="approved-note" style={{ color: '#16a34a', fontSize: '12px', marginTop: 4 }}>
                      ✓ Teacher confirmed receipt. Record locked.
                    </div>
                  )}

                  <div className="s-actions" style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {salary.status === 'draft' && (
                      <button onClick={() => updateSalaryStatus(salary.id, 'pending')} className="btn-approve">
                        Submit for Approval
                      </button>
                    )}
                    {salary.status === 'pending' && (
                      <button onClick={() => updateSalaryStatus(salary.id, 'approved')} className="btn-approve">
                        <FaCheckCircle /> Approve Salary
                      </button>
                    )}
                    {salary.status === 'approved' && (
                      <button onClick={() => updateSalaryStatus(salary.id, 'paid')} className="btn-approve" style={{ background: '#16a34a' }}>
                        <FaCheckCircle /> Mark as PAID
                      </button>
                    )}
                    {salary.status === 'paid' && (
                      <button onClick={() => updateSalaryStatus(salary.id, 'pending')} className="btn-revert">
                        Revert to Pending
                      </button>
                    )}
                    {salary.status !== 'received' && (
                      <button onClick={() => handleDeleteSalary(salary.id)} className="btn-delete-salary" title="Delete Record">
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredSalaries.length === 0 && <p className="no-data">No salary records found for this criteria.</p>}
          </div>
        </section>
      </div>

      {showSalaryModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3><FaCalculator /> Issue Teacher Salary Statement</h3>
              <button onClick={() => setShowSalaryModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSalary} className="salary-form" style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Salary Month *</label>
                  <select
                    value={salaryFormData.month}
                    onChange={e => setSalaryFormData({ ...salaryFormData, month: e.target.value })}
                    className="form-input"
                    required
                  >
                    {MONTHS_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Salary Year *</label>
                  <input
                    type="number"
                    value={salaryFormData.year}
                    onChange={e => setSalaryFormData({ ...salaryFormData, year: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* EARNINGS */}
              <div style={{ background: '#f0fdfa', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#0f766e', fontSize: '13px', fontWeight: 700 }}>+ EARNINGS (PKR)</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Basic Salary *</label>
                    <input
                      type="number"
                      placeholder="e.g. 40000"
                      value={salaryFormData.basic_salary}
                      onChange={e => setSalaryFormData({ ...salaryFormData, basic_salary: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Allowances</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={salaryFormData.allowances}
                      onChange={e => setSalaryFormData({ ...salaryFormData, allowances: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Bonus</label>
                    <input
                      type="number"
                      placeholder="e.g. 2000"
                      value={salaryFormData.bonus}
                      onChange={e => setSalaryFormData({ ...salaryFormData, bonus: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Overtime</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={salaryFormData.overtime}
                      onChange={e => setSalaryFormData({ ...salaryFormData, overtime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* DEDUCTIONS */}
              <div style={{ background: '#fff1f2', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#be123c', fontSize: '13px', fontWeight: 700 }}>- DEDUCTIONS (PKR)</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>General Deductions</label>
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={salaryFormData.deductions}
                      onChange={e => setSalaryFormData({ ...salaryFormData, deductions: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Advance</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={salaryFormData.advance}
                      onChange={e => setSalaryFormData({ ...salaryFormData, advance: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Fine / Penalty</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={salaryFormData.fine}
                      onChange={e => setSalaryFormData({ ...salaryFormData, fine: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* LIVE COMPUTED NET SALARY */}
              <div style={{ background: '#e0f2fe', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: 700 }}>NET PAYABLE SALARY</span>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0284c7' }}>
                    PKR {computedNetSalary.toLocaleString()}
                  </div>
                </div>
                <div>
                  <select
                    value={salaryFormData.status}
                    onChange={e => setSalaryFormData({ ...salaryFormData, status: e.target.value })}
                    style={{ padding: '6px 12px', borderRadius: '6px' }}
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Payment screenshot */}
              <div className="file-upload-area" style={{ marginBottom: '14px' }}>
                <label>
                  <FaUpload /> {salaryFormData.screenshot ? salaryFormData.screenshot.name : "Attach Payment Transfer Receipt (Optional)"}
                  <input type="file" accept="image/*" onChange={handleScreenshotChange} hidden />
                </label>
                {screenshotPreview && <img src={screenshotPreview} alt="Preview" className="upload-preview" />}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowSalaryModal(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-submit btn-primary" disabled={sendingSalary}>
                  {sendingSalary ? 'Calculating & Saving...' : 'Confirm & Save Salary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDetailsPage;
