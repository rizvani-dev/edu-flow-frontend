﻿import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import API from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { FaPlus, FaSchool, FaUserShield, FaSignOutAlt, FaBell, FaPause, FaPlay, FaCheck, FaTimes, FaReceipt, FaEdit, FaTrash, FaSearch, FaGlobe, FaCheckCircle, FaExclamationTriangle, FaDownload, FaUpload } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import defaultLogo from '../assets/logo.png'; // Import your default logo asset
import useSocket from '../hooks/useSocket';
import { appendCacheBust, resolveMediaUrl } from '../utils/media';
import { prepareUploadFile } from '../utils/uploadMedia';
import './superAdmin.css';

const SuperAdminDashboard = () => {
  const { logout, user } = useAuth();
  const socket = useSocket(user?.id);
  const fullImportInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const schoolImportInputRef = useRef(null);
  const [schools, setSchools] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [deleteKey, setDeleteKey] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingSchool, setEditingSchool] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [loadingOperation, setLoadingOperation] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [showImportSchoolBackupModal, setShowImportSchoolBackupModal] = useState(false);
  const [importSchoolId, setImportSchoolId] = useState('');
  const [importSchoolFile, setImportSchoolFile] = useState(null);
  const [formData, setFormData] = useState({
    schoolName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    subscription_status: '',
    subscription_expires_at: '',
    logo: null,
  });

  // Define your secret key here
  const MASTER_DELETE_KEY = "ADMIN4578"; 

  const normalizeLogoUrl = (path) => resolveMediaUrl(path);

  const resetSchoolImportState = () => {
    setImportSchoolFile(null);
    if (schoolImportInputRef.current) {
      schoolImportInputRef.current.value = '';
    }
  };

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [schoolsRes, requestsRes] = await Promise.all([
        API.get('/superadmin/schools'),
        API.get('/superadmin/subscription-requests')
      ]);
      setSchools(schoolsRes.data.schools || []);
      setRequests(requestsRes.data.requests || []);
    } catch (err) {
      toast.error('Failed to load system data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchInitialData();
  }, [user?.id, fetchInitialData]);

  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleNewNotification = (notif) => {
      if (!notif) return;

      if (notif.type === 'subscription_request') {
        toast.info(
          <div style={{ minWidth: 280 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>New subscription request</div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>{notif.message}</div>
          </div>,
          { autoClose: false, closeOnClick: true, draggable: true }
        );
        fetchInitialData();
      }

      if (['subscription_approved', 'subscription_rejected', 'subscription_update'].includes(notif.type)) {
        toast.success(notif.message || 'Subscription status changed');
        fetchInitialData();
      }
    };

    socket.on('newNotification', handleNewNotification);
    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingOperation(true);
    const loadingToastId = toast.loading('Registering new school tenant...');
    try {
      await API.post('/superadmin/create-school', formData);
      toast.update(loadingToastId, { render: 'School and Admin successfully created!', type: 'success', isLoading: false, autoClose: 3000 });
      setShowModal(false);
      setFormData({ schoolName: '', adminName: '', adminEmail: '', adminPassword: '' });
      await fetchInitialData();
    } catch (err) {
      toast.update(loadingToastId, { render: err.response?.data?.message || 'Creation failed', type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setLoadingOperation(false);
    }
  };

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    setReviewAction('approved');
    setReviewRemarks('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedRequest) return;
    setLoadingOperation(true);
    try {
      await API.put(`/superadmin/subscription-requests/${selectedRequest.id}/review`, {
        status: reviewAction,
        remarks: reviewRemarks,
      });
      toast.success(`Subscription request ${reviewAction}`);
      setShowReviewModal(false);
      await fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review request');
    } finally {
      setLoadingOperation(false);
    }
  };

  const handleEditClick = (school) => {
    setEditingSchool(school);
    setEditFormData({
      name: school.name || '',
      adminName: school.admin_name || '',
      adminEmail: school.admin_email || '',
      adminPassword: '',
      subscription_status: school.subscription_status || 'inactive',
      subscription_expires_at: school.subscription_expires_at ? school.subscription_expires_at.split('T')[0] : '',
      logo: null,
    });
    setLogoPreview(normalizeLogoUrl(school.logo_url));
    setShowEditModal(true);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const preparedFile = await prepareUploadFile(file, { maxBytes: 5 * 1024 * 1024, maxSizeMB: 1.5 });
      setEditFormData((prev) => ({ ...prev, logo: preparedFile }));
      setLogoPreview(URL.createObjectURL(preparedFile));
    } catch (error) {
      toast.error(error.message || 'Logo must be under 5MB');
      e.target.value = '';
    }
  };

  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    setLoadingOperation(true);
    const loadingToastId = toast.loading('Updating school details...');
    try {
      const data = new FormData();
      Object.keys(editFormData).forEach((key) => {
        if (key === 'logo') {
          if (editFormData.logo) data.append('logo', editFormData.logo);
        } else if (key === 'adminPassword') {
          if (editFormData.adminPassword) data.append('adminPassword', editFormData.adminPassword);
        } else {
          data.append(key, editFormData[key]);
        }
      });

      const response = await API.put(`/superadmin/schools/${editingSchool.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedSchool = response.data.school;
      if (updatedSchool) {
        setSchools((prev) => prev.map((school) => (
          Number(school.id) === Number(editingSchool.id)
            ? { ...school, ...updatedSchool, updated_at: new Date().toISOString() }
            : school
        )));
      }
      toast.update(loadingToastId, { render: 'School updated successfully!', type: 'success', isLoading: false, autoClose: 3000 });
      setShowEditModal(false);
      await fetchInitialData();
    } catch (err) {
      toast.update(loadingToastId, { render: err.response?.data?.message || 'Update failed', type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setLoadingOperation(false);
    }
  };

  const handleDeleteClick = (school) => {
    setSchoolToDelete(school);
    setDeleteKey('');
    setShowDeleteModal(true);
  };

  const confirmDeleteSchool = async () => {
    if (!schoolToDelete) return;
    setLoadingOperation(true);
    try {
      await API.delete(`/superadmin/schools/${schoolToDelete.id}`);
      toast.success(`School "${schoolToDelete.name}" deleted successfully`);
      setShowDeleteModal(false);
      await fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete school - ensure related records are handled');
    } finally {
      setLoadingOperation(false);
    }
  };

  const handleExportFullBackup = async () => {
    setLoadingOperation(true);
    try {
      const response = await API.get('/superadmin/backup/export/full', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Full_System_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Full database backup exported successfully');
    } catch (err) {
      toast.error('Failed to export full backup');
    } finally {
      setLoadingOperation(false);
    }
  };

  const handleExportSchoolBackup = async (schoolId) => {
    setLoadingOperation(true);
    try {
      const response = await API.get(`/superadmin/backup/export/${schoolId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `School_${schoolId}_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Database backup exported successfully');
    } catch (err) {
      toast.error('Failed to export backup');
    } finally {
      setLoadingOperation(false);
    }
  };

  const handleImportFullBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const key = window.prompt("CRITICAL ACTION: Enter MASTER-DELETE-KEY to authorize system restore (overwrites current data):");
    if (key !== MASTER_DELETE_KEY) {
      toast.error("Unauthorized: Invalid Key");
      if (fullImportInputRef.current) fullImportInputRef.current.value = "";
      return;
    }

    if (!window.confirm("DANGER: This will wipe your current database and restore it from the backup file. Continue?")) {
      if (fullImportInputRef.current) fullImportInputRef.current.value = "";
      return;
    }

    setLoadingOperation(true);
    setUploadProgress(0);
    const backupFormData = new FormData();
    backupFormData.append('file', file);
    backupFormData.append('masterKey', key);
    try {
      await API.post('/superadmin/backup/import/full', backupFormData, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      toast.success('Full system restored successfully! Refreshing...');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setLoadingOperation(false);
      setUploadProgress(0);
      if (e.target) e.target.value = ""; // Clear file input
    }
  };

  const handleImportSchoolBackup = async () => {
    const file = importSchoolFile;
    if (!file) return;
    if (!importSchoolId) {
      toast.error("Please enter a school ID");
      return;
    }

    const key = window.prompt("CRITICAL ACTION: Enter MASTER-DELETE-KEY to authorize school restore (overwrites current data):");
    if (key !== MASTER_DELETE_KEY) {
      toast.error("Unauthorized: Invalid Key");
      resetSchoolImportState();
      return;
    }

    if (!window.confirm(`DANGER: This will delete all existing data for school ID ${importSchoolId} and restore it from the backup file. Continue?`)) {
      resetSchoolImportState();
      return;
    }

    setLoadingOperation(true);
    setUploadProgress(0);
    const backupFormData = new FormData();
    backupFormData.append('file', file);
    backupFormData.append('masterKey', key);
    try {
      await API.post(`/superadmin/backup/import/${importSchoolId}`, backupFormData, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      toast.success(`School ${importSchoolId} restored successfully! Refreshing...`);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setLoadingOperation(false);
      setUploadProgress(0);
      resetSchoolImportState();
    }
  };

  const handleUpdateSchoolSubscription = async (school, action) => {
    setLoadingOperation(true);
    try {
      await API.put(`/superadmin/schools/${school.id}/subscription`, { action });
      toast.success(`School ${action === 'pause' ? 'paused' : 'resumed'} successfully`);
      await fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update school subscription');
    } finally {
      setLoadingOperation(false);
    }
  };

  const handleGlobalPauseToggle = async () => {
    setLoadingOperation(true);
    try {
      const paused = schools.length > 0 && schools.every((school) => school.subscription_paused);
      const action = paused ? 'resume' : 'pause';
      await API.put('/superadmin/schools/subscription-all', { action });
      toast.success(`All schools ${action === 'pause' ? 'paused' : 'resumed'} successfully`);
      await fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update all schools');
    } finally {
      setLoadingOperation(false);
    }
  };

  const allPaused = schools.length > 0 && schools.every((school) => school.subscription_paused);

  const pendingRequests = useMemo(() => 
    requests.filter(r => r.status === 'pending' || !r.status), 
  [requests]);

  const stats = useMemo(() => ({
    total: schools.length,
    active: schools.filter(s => s.subscription_status === 'active' && !s.subscription_paused).length,
    pending: pendingRequests.length
  }), [schools, pendingRequests]);

  const filteredSchools = useMemo(() => 
    schools.filter(s => 
      s.name.toLowerCase().includes(schoolSearch.toLowerCase()) || 
      (s.admin_email && s.admin_email.toLowerCase().includes(schoolSearch.toLowerCase())) ||
      String(s.id).includes(schoolSearch)
    ),
  [schools, schoolSearch]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="minimalist-spinner"></div>
        <p>Loading Super Admin Console...</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      {/* Data Operations Loading Overlay */}
      <style>
        {`
          .import-loading-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex; align-items: center; justify-content: center;
            z-index: 10000; color: white;
          }
          .import-loading-content {
            background: #1e293b; padding: 2rem; border-radius: 12px;
            width: 90%; max-width: 450px; text-align: center;
          }
          .loader-progress-container {
            width: 100%; height: 6px; background: #334155;
            border-radius: 10px; margin: 20px 0; overflow: hidden;
            position: relative;
          }
          .loader-progress-bar {
            position: absolute; left: 0; top: 0; height: 100%;
            background: #3b82f6; width: ${uploadProgress > 0 ? uploadProgress + '%' : '25%'};
            ${uploadProgress === 0 ? 'animation: indeterminate-progress 1.5s infinite linear;' : 'transition: width 0.3s ease;'}
          }
          @keyframes indeterminate-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}
      </style>

      {loadingOperation && (
        <div className="import-loading-overlay">
          <div className="import-loading-content">
            <h3>{uploadProgress === 100 ? 'Processing Data...' : uploadProgress > 0 ? `Uploading: ${uploadProgress}%` : 'System Processing'}</h3>
            <div className="loader-progress-container">
              <div className="loader-progress-bar"></div>
            </div>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>Performing critical database operation. Do not close this page.</p>
          </div>
        </div>
      )}

      <nav className="admin-navbar">
        <div className="admin-navbar-content">
          <div>
            <h1 className="admin-title">SUPER ADMIN PANEL</h1>
            <p className="super-subtitle">Review requests, manage tenant subscriptions, and keep schools online.</p>
          </div>
          <button onClick={logout} className="logout-btn"><FaSignOutAlt /> Logout</button>
        </div>
      </nav>

      <main className="admin-main">
        <section className="super-stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon"><FaGlobe /></div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Schools</p>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon"><FaCheckCircle /></div>
            <div className="stat-content">
              <h3>{stats.active}</h3>
              <p>Active Tenants</p>
            </div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon"><FaExclamationTriangle /></div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending Requests</p>
            </div>
          </div>
        </section>

        <section className="hero-panel super-hero-panel">
          <div className="hero-actions super-admin-actions">
            <button className="btn-create-tenant" onClick={() => setShowModal(true)}>
              <FaPlus /> Create New School
            </button>
            <button className="btn-secondary" onClick={handleGlobalPauseToggle} disabled={loadingOperation}>
              {allPaused ? <><FaPlay /> Resume All Schools</> : <><FaPause /> Pause All Schools</>}
            </button>
            <button className="btn-secondary" onClick={handleExportFullBackup} disabled={loadingOperation}>
              <FaDownload /> Export Full Backup
            </button>
            <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaUpload /> Import Full Backup (DANGER)
              <input type="file" ref={fullImportInputRef} hidden accept=".json,application/json" onChange={handleImportFullBackup} />
            </label>
            <button className="btn-secondary" onClick={() => setShowImportSchoolBackupModal(true)} disabled={loadingOperation}>
              <FaUpload /> Import Specific School
            </button>
            <div className="search-box">
              <FaSearch />
              <input 
                placeholder="Search by name, email, or ID..." 
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="request-panel">
          <div className="request-panel-header">
            <div>
              <h3>Subscription Requests</h3>
              <p>Approve or reject requests after verifying payment details and pricing.</p>
            </div>
            <span className="request-badge">{pendingRequests.length} pending</span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="empty-state">No subscription requests at this time.</div>
          ) : (
            <div className="request-grid">
              {pendingRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-card-header">
                    <div>
                      <h4>{request.school_name}</h4>
                      <small>{request.admin_name} • {request.admin_email}</small>
                    </div>
                    <span className={`status-pill ${request.status || 'pending'}`}>{request.status?.toUpperCase() || 'PENDING'}</span>
                  </div>
                  <div className="request-card-body">
                    <p><strong>Duration:</strong> {request.duration}</p>
                    <p><strong>Price:</strong> PKR {request.price}</p>
                    {request.screenshot_url && (
                      <a className="screenshot-link" href={resolveMediaUrl(request.screenshot_url)} target="_blank" rel="noreferrer">View payment screenshot</a>
                    )}
                    <p className="request-meta">Requested at {new Date(request.created_at).toLocaleDateString()} {new Date(request.created_at).toLocaleTimeString()}</p>
                  </div>
                  <div className="request-card-actions">
                    <button className="btn-secondary" onClick={() => openReviewModal(request)}>
                      <FaReceipt /> Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="school-grid-container">
          {filteredSchools.map((school) => (
            <div key={school.id} className="school-card">
              <div className="school-card-main">
                <div className="school-logo-frame">
                  {school.logo_url ? (
                    <img 
                      src={appendCacheBust(normalizeLogoUrl(school.logo_url), school.updated_at || school.id)} 
                      alt="Logo" 
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultLogo;
                      }}
                    />
                  ) : <FaSchool size={30} />}
                </div>
                <div className="school-info">
                  <div className="school-title-row">
                    <h3>{school.name}</h3>
                    <span className="school-id-pill">ID: {school.id}</span>
                  </div>
                  <p className="school-meta">{school.admin_name || 'No Admin'} • {school.admin_email || 'No email'}</p>
                  <div className="school-badges">
                    <span className={`status-pill ${school.subscription_status || 'inactive'}`}>{school.subscription_status?.toUpperCase() || 'INACTIVE'}</span>
                    {school.subscription_paused && <span className="status-pill paused">PAUSED</span>}
                  </div>
                  <p className="school-meta">Expires: {school.subscription_expires_at ? new Date(school.subscription_expires_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="school-actions">
                <button
                  className={`btn-icon ${school.subscription_paused ? 'resume' : 'pause'}`}
                  disabled={loadingOperation}
                  title={school.subscription_paused ? 'Resume' : 'Pause'}
                  onClick={() => handleUpdateSchoolSubscription(school, school.subscription_paused ? 'resume' : 'pause')}
                >
                  {school.subscription_paused ? <FaPlay /> : <FaPause />}
                </button>
                <button className="btn-icon edit" title="Edit School" onClick={() => handleEditClick(school)}>
                  <FaEdit />
                </button>
                <button 
                  className="btn-icon delete" 
                  title="Delete School" 
                  onClick={() => handleDeleteClick(school)}
                >
                  <FaTrash />
                </button>
                <button className="btn-icon" title="Export School Backup" onClick={() => handleExportSchoolBackup(school.id)}>
                  <FaDownload />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Register New School Tenant</h3>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>School Name</label>
                <input
                  placeholder="School Name"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Admin Full Name</label>
                <input
                  placeholder="Admin Full Name"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  placeholder="Admin Email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Admin Password</label>
                <input
                  type="password"
                  placeholder="Admin Password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={loadingOperation}>
                  {loadingOperation ? 'Creating...' : 'Create Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingSchool && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit School: {editingSchool.name}</h3>
            <form onSubmit={handleUpdateSchool} className="form">
              <div className="form-group text-center">
                <div className="edit-logo-preview">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultLogo;
                      }}
                    />
                  ) : <FaSchool size={40} />}
                </div>
                <label className="upload-btn">
                  Change School Logo
                  <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
                </label>
              </div>
              <div className="form-group">
                <label>School Name</label>
                <input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Admin Name</label>
                <input
                  value={editFormData.adminName}
                  onChange={(e) => setEditFormData({ ...editFormData, adminName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  value={editFormData.adminEmail}
                  onChange={(e) => setEditFormData({ ...editFormData, adminEmail: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Update Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editFormData.adminPassword}
                  onChange={(e) => setEditFormData({ ...editFormData, adminPassword: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Subscription Expiry Date</label>
                <input
                  type="date"
                  value={editFormData.subscription_expires_at}
                  onChange={(e) => setEditFormData({ ...editFormData, subscription_expires_at: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Subscription Status</label>
                <select value={editFormData.subscription_status} onChange={(e) => setEditFormData({...editFormData, subscription_status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={loadingOperation}>
                  {loadingOperation ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && schoolToDelete && (
        <div className="modal-overlay">
          <div className="modal-box small text-center">
            <div className="warning-icon" style={{ color: '#ef4444', fontSize: '3rem', marginBottom: '1rem' }}>
              <FaExclamationTriangle />
            </div>
            <h3>Extreme Caution!</h3>
            <p>You are about to delete <strong>{schoolToDelete.name}</strong>.</p>
            <p className="school-meta">This action is irreversible and will purge all users, classes, and records.</p>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Enter Secret Key to Authorize</label>
              <input
                type="password"
                placeholder="Enter MASTER-DELETE-KEY"
                value={deleteKey}
                onChange={(e) => setDeleteKey(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '2px' }}
              />
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ background: '#ef4444' }}
                disabled={deleteKey !== MASTER_DELETE_KEY || loadingOperation}
                onClick={confirmDeleteSchool}
              >
                {loadingOperation ? 'Processing...' : 'Confirm Permanent Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Review Request from {selectedRequest.school_name}</h3>
            <div className="form-group">
              <label>Requested by</label>
              <p>{selectedRequest.admin_name} • {selectedRequest.admin_email}</p>
            </div>
            <div className="form-group">
              <label>Duration</label>
              <p>{selectedRequest.duration}</p>
            </div>
            <div className="form-group">
              <label>Price</label>
              <p>PKR {selectedRequest.price}</p>
            </div>
            {selectedRequest.screenshot_url && (
              <div className="form-group">
                <label>Screenshot</label>
                <a href={resolveMediaUrl(selectedRequest.screenshot_url)} target="_blank" rel="noreferrer" className="screenshot-link">Open screenshot</a>
              </div>
            )}
            <div className="form-group">
              <label>Action</label>
              <select value={reviewAction} onChange={(e) => setReviewAction(e.target.value)}>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </div>
            <div className="form-group">
              <label>Remarks</label>
              <textarea
                rows={4}
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Add optional remarks for the school admin"
              />
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowReviewModal(false)} className="btn-secondary">Cancel</button>
              <button type="button" className="btn-primary" onClick={submitReview} disabled={loadingOperation}>
                {reviewAction === 'approved' ? <><FaCheck /> Approve</> : <><FaTimes /> Reject</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportSchoolBackupModal && (
        <div className="modal-overlay">
          <div className="modal-box small">
            <h3>Import Specific School Backup</h3>
            <p>Select a school ID and upload a backup file to restore its data.</p>
            <div className="form-group">
              <label>School ID</label>
              <input
                type="number"
                placeholder="Enter School ID"
                value={importSchoolId}
                onChange={(e) => setImportSchoolId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Backup File (.json)</label>
              <input
                type="file"
                ref={schoolImportInputRef}
                accept=".json,application/json"
                onChange={(e) => setImportSchoolFile(e.target.files[0])}
                required
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowImportSchoolBackupModal(false);
                  resetSchoolImportState();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleImportSchoolBackup}
                disabled={!importSchoolId || !importSchoolFile || loadingOperation}
              >
                {loadingOperation ? 'Importing...' : 'Import Backup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
