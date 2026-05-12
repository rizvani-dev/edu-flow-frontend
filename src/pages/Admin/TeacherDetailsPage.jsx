import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBillWave, FaCalendarCheck, FaUpload, FaCheckCircle, FaSearch, FaPlus, FaTimes, FaDownload, FaUserCircle, FaTrash } from 'react-icons/fa';
import API from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { resolveMediaUrl } from '../../utils/media';
import { prepareUploadFile } from '../../utils/uploadMedia';
import './teacherDetails.css';

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

  const [salaryFormData, setSalaryFormData] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    amount: '',
    status: 'pending',
    screenshot: null
  });

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
      toast.error("Failed to load teacher data. Ensure backend endpoints are ready.");
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
    const data = new FormData();
    Object.keys(salaryFormData).forEach(key => {
      if (key === 'screenshot' && salaryFormData[key]) {
        data.append('file', salaryFormData[key]);
      } else {
        data.append(key, salaryFormData[key]);
      }
    });

    try {
      setSendingSalary(true);
      await API.post(`/admin/teacher-salaries/${teacherId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Salary record created");
      setShowSalaryModal(false);
      setSalaryFormData({ month: 'January', year: 2024, amount: '', status: 'pending', screenshot: null });
      setScreenshotPreview(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to add salary record");
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
      toast.success(`Salary marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error("Status update failed");
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
            <button className="btn-add-salary" onClick={() => setShowSalaryModal(true)}>
              <FaPlus /> Manual Salary Send
            </button>
          </div>

          <div className="salary-grid">
            {filteredSalaries.map(salary => (
              <div key={salary.id} className={`salary-card ${salary.status}`}>
                <div className="s-card-head">
                  <h4>{salary.month} {salary.year}</h4>
                  <span className={`status-pill ${salary.status}`}>{salary.status}</span>
                </div>
                <div className="s-amount">PKR {Number(salary.amount).toLocaleString()}</div>
                {salary.payment_screenshot && (
                  <a href={resolveMediaUrl(salary.payment_screenshot)} target="_blank" rel="noreferrer" className="screenshot-link">
                    <FaDownload /> View Receipt
                  </a>
                )}
                <div className="s-actions">
                  {salary.status === 'received' && (
                    <div className="approved-note">Teacher confirmed received. Record is locked.</div>
                  )}
                  {salary.status === 'pending' ? (
                    <button disabled={salary.status === 'received'} onClick={() => updateSalaryStatus(salary.id, 'paid')} className="btn-approve">
                      <FaCheckCircle /> Approve Payment
                    </button>
                  ) : (
                    <button disabled={salary.status === 'received'} onClick={() => updateSalaryStatus(salary.id, 'pending')} className="btn-revert">Revert to Pending</button>
                  )}
                  {salary.status !== 'received' && (
                    <button onClick={() => handleDeleteSalary(salary.id)} className="btn-delete-salary" title="Delete Record">
                      <FaTrash /> Delete Record
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredSalaries.length === 0 && <p className="no-data">No salary records found for this criteria.</p>}
          </div>
        </section>
      </div>

      {showSalaryModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Send Manual Salary</h3>
              <button onClick={() => setShowSalaryModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSalary} className="salary-form">
              <div className="form-row">
                <input type="text" placeholder="Month" value={salaryFormData.month} onChange={e => setSalaryFormData({...salaryFormData, month: e.target.value})} required />
                <input type="number" placeholder="Year" value={salaryFormData.year} onChange={e => setSalaryFormData({...salaryFormData, year: e.target.value})} required />
              </div>
              <input type="number" placeholder="Amount (PKR)" value={salaryFormData.amount} onChange={e => setSalaryFormData({...salaryFormData, amount: e.target.value})} required />
              
              <div className="file-upload-area">
                <label>
                  <FaUpload /> {salaryFormData.screenshot ? salaryFormData.screenshot.name : "Upload Payment Screenshot"}
                  <input type="file" accept="image/*" onChange={handleScreenshotChange} hidden />
                </label>
                {screenshotPreview && <img src={screenshotPreview} alt="Preview" className="upload-preview" />}
              </div>

              <select value={salaryFormData.status} onChange={e => setSalaryFormData({...salaryFormData, status: e.target.value})}>
                <option value="pending">Pending</option>
                <option value="paid">Paid (Approved)</option>
              </select>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowSalaryModal(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-submit" disabled={sendingSalary}>{sendingSalary ? 'Sending...' : 'Confirm & Send'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDetailsPage;
