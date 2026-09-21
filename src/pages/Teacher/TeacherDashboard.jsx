import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import API from "../../api/axiosInstance";
import { toast } from "react-hot-toast";
import { 
  FaUserGraduate, FaPlus, FaSignOutAlt, FaBullhorn, FaCheckDouble, 
  FaCheck,
  FaComments, FaBell, FaPaperclip, FaDownload, FaTimes, FaFileExcel, FaEdit, FaSearch, FaBookOpen,
  FaChartArea, FaTrash, FaPrint, FaFileCsv, FaPaperPlane, FaCalendarCheck, FaCheckSquare, 
  FaEllipsisV, FaChartPie, FaMoneyBillWave, FaSave, FaUserEdit, FaMicrophone, FaStopCircle, FaHeart, FaHome, FaUsersCog, FaTools, FaSpinner, FaCloud, FaCog, FaUser,
  FaRobot} from "react-icons/fa";
import AnnouncementForm from "../../components/Announcements/AnnouncementForm"; // Removed Tooltip import
import AnnouncementList from "../../components/Announcements/AnnouncementList";
import useSocket from "../../hooks/useSocket";
import ChatModal from "../../components/chat/ChatModal";
import DashboardShell from "../../components/layout/DashboardShell";
import AiInsightPanel from "../../components/ai/AiInsightPanel";
import AttendanceSection from "../../components/Attendance/AttendanceSection";
import AiTopAchieversPanel from "../../components/ai/AiTopAchieversPanel";
import "../../components/chat/chatModal.css";
import "./teacherpanel.css";
import schoolLogo from "../../assets/logo.png";
import { DonutSummaryChart } from "../../components/charts/LightweightCharts";
import { openTeacherAttendancePrintWindow, openTeacherReceiptPrintWindow } from "../../utils/teacherPrint";
import { openTopAchieversPrintWindow } from "../../utils/topAchieversPrint";
import { resolveMediaUrl, resolveOptimizedMediaUrl } from "../../utils/media";
import { prepareUploadFile } from "../../utils/uploadMedia";
import { createOptimisticMessage, releaseOptimisticMedia } from "../../utils/chatMessage";
import { getCache, setCache, CACHE_KEYS, getUiState, setUiState } from "../../utils/localStorageCache";
import { addToSyncQueue } from "../../utils/syncManager";
import SyncQueueManager from "../../components/common/SyncQueueManager";
import { getTopAchieversInsight } from "../../ai/aiService";

// New component for Teacher Profile Card
const TeacherProfileCard = ({ user, isEditingBio, tempBio, setTempBio, handleUpdateBio, savingBio, setIsEditingBio }) => (
  <div className="teacher-profile-card">
    <div className="profile-card-inner">
      <div className="profile-main">
        <div className="profile-image-section">
          {user?.profile_image ? (
            <img src={user.profile_image} alt="Teacher" className="profile-avatar-big" />
          ) : (
            <div className="profile-avatar-placeholder"><FaUser /></div>
          )}
        </div>
        <div className="profile-info-section">
          <div className="profile-name-row">
            <h2>{user?.name}</h2>
            <span className="profile-id-tag">ID: #{user?.id}</span>
          </div>
          <p className="profile-email-text">{user?.email}</p>
          <div className="profile-badge">Teacher • {user?.class_name || "N/A"}</div>
        </div>
        <div className="profile-action-section">
          {isEditingBio ? (
            <button className="btn-save-profile" onClick={handleUpdateBio} disabled={savingBio}><FaSave /> {savingBio ? 'Saving...' : 'Save Changes'}</button>
          ) : (
            <button className="btn-edit-profile" onClick={() => setIsEditingBio(true)}><FaUserEdit /> Edit Bio</button>
          )}
        </div>
      </div>
      <div className="profile-details-grid">
         <div className="profile-detail-item">
            <span className="profile-detail-label">Full Name</span>
            <span className="profile-detail-value">{user?.name}</span>
         </div>
         <div className="profile-detail-item">
            <span className="profile-detail-label">Email Address</span>
            <span className="profile-detail-value">{user?.email}</span>
         </div>
         <div className="profile-detail-item">
            <span className="profile-detail-label">Employee ID</span>
            <span className="profile-detail-value">#{user?.id}</span>
         </div>
         <div className="profile-detail-item">
            <span className="profile-detail-label">Assigned Class</span>
            <span className="profile-detail-value">{user?.class_name || "N/A"}</span>
         </div>
      </div>
      <div className="profile-bio-box">
        <h4>Biography</h4>
        {isEditingBio ? (
          <textarea value={tempBio} onChange={(e) => setTempBio(e.target.value)} placeholder="Tell your students about yourself..." className="bio-edit-input" />
        ) : (
          <p className="bio-text-display">{tempBio || "No biography provided yet. Click 'Edit Bio' to add one."}</p>
        )}
      </div>
    </div>
  </div>
);

import '../../styles/modalSystem.css';
import '../../styles/glassSystem.css';
import '../../styles/designTokens.css';

const isImageFile = (url = '') => /\.(jpg|jpeg|png|gif|webp|svg|heic|heif)(?:\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:image/');
const isVideoFile = (url = '') => /\.(mp4|webm|ogg)(?:\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:video/');
const isAudioFile = (url = '') => /\.(mp3|wav|m4a|aac|ogg|webm|opus)(?:\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:audio/');
const isPdfFile = (fileUrl = '') => /\.pdf$/i.test(fileUrl);
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const formatHomeworkDeadline = (homework) => {
  const targetDate = homework?.expires_at || homework?.due_date;
  if (!targetDate) return 'Auto-removes in 7 days';
  const end = new Date(targetDate).getTime();
  const diff = end - Date.now();
  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

  if (days >= 1) return `${days}d ${hours}h left`;
  const minutes = Math.max(1, Math.floor(diff / (1000 * 60)));
  if (hours >= 1) return `${hours}h left`;
  return `${minutes}m left`;
};

const formatHomeworkDuration = (homework) => {
  const value = Number(homework?.duration_value || 7);
  const unit = String(homework?.duration_unit || 'days');
  return `${value} ${value === 1 ? unit.replace(/s$/, '') : unit}`;
};

const AttendanceOperations = ({ navigate, setShowFeeModal }) => (
  <div className="attendance-upload-section">
    <h2 className="section-title"><FaFileExcel /> Attendance Management</h2>
    <button className="btn-primary attendance-btn" onClick={() => navigate('/attendance')}>
      <FaCalendarCheck /> Manage Attendance
    </button>
    <button className="btn-primary fee-btn" onClick={() => setShowFeeModal(true)}>
      <FaMoneyBillWave /> Fee Management
    </button>
  </div>
);

const HomeworkOperations = ({ classHomework, setShowAddHomeworkModal, handleDeleteHomework }) => (
  <div className="homework-management-section">
    <h2 className="section-title"><FaBookOpen /> Homework Diary</h2>
    <button className="btn-primary" onClick={() => setShowAddHomeworkModal(true)}><FaPlus /> Assign Homework</button>
    <div className="homework-grid-teacher">
      {classHomework.length ? classHomework.map((hw) => (
        <article key={hw.id} className="teacher-homework-card">
          <div className="hw-card-header">
            <div>
              <h3 className="announcement-title">{hw.title}</h3>
              <p className="hw-desc">{hw.description || 'No extra instructions were added for this homework.'}</p>
            </div>
            <span className="hw-subject-badge">{hw.subject || 'General'}</span>
          </div>
          <div className="announcement-meta">
            <span className="glass-chip">Duration: {formatHomeworkDuration(hw)}</span>
            <span className="glass-chip">Deadline: {formatHomeworkDeadline(hw)}</span>
          </div>
          <div className="hw-card-footer">
            <div className="announcement-meta">
              <span>{new Date(hw.assigned_date).toLocaleDateString()}</span>
              <span className="glass-chip"><FaHeart /> {Object.values(hw.reactions || {}).flat().length}</span>
            </div>
            <button type="button" className="hw-delete-icon-btn" onClick={() => handleDeleteHomework(hw.id)}>
              <FaTrash />
            </button>
          </div>
        </article>
      )) : (
        <div className="teacher-homework-card">
          <h3 className="announcement-title">No active homework</h3>
          <p className="hw-desc">Create time-bound homework with daily or monthly expiry and it will auto-clean up after the assigned duration.</p>
        </div>
      )}
    </div>
  </div>
);

const ExamOperations = ({ exams, setShowExamModal, navigate, handleDeleteExam }) => (
  <>
    <div className="homework-management-section dashboard-section-spaced">
      <h2 className="section-title"><FaChartPie /> Online AI Exams</h2>
      <button className="btn-primary" onClick={() => setShowExamModal(true)}>
        <FaPlus /> Generate New Exam
      </button>
    </div>
    <div className="exam-grid-teacher">
      {exams.length > 0 ? exams.map(ex => (
        <article key={ex.id} className="teacher-homework-card exam-card">
          <div className="hw-card-header">
            <h3>{ex.title}</h3>
            <span className="hw-subject-badge">{ex.difficulty}</span>
          </div>
          <p className="exam-card-subtitle">{ex.subject} • {ex.total_questions} Questions • {ex.duration_minutes}m</p>
          <div className="hw-card-footer dashboard-card-footer-spaced">
            <div className="dashboard-between-row">
              <button className="btn-details-link btn-primary" onClick={() => navigate(`/teacher/exams/${ex.id}`)}>
                View Results
              </button>
              <button className="hw-delete-icon-btn" onClick={() => handleDeleteExam(ex.id)} title="Delete Exam">
                <FaTrash />
              </button>
            </div>
          </div>
        </article>
      )) : <p className="empty-state">No exams created yet.</p>}
    </div>
  </>
);

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket(user?.id);
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [salaryPopup, setSalaryPopup] = useState({ open: false, salary: null, notifId: null, loading: false });
  const [generatingWithAi, setGeneratingWithAi] = useState(false);
  const [exams, setExams] = useState([]);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({
    title: '', subject: '', difficulty: 'Medium',
    topic: '', chapter: '',
    total_questions: 10, marks: 100, duration_minutes: 30,
    creationMode: 'ai',
    manualQuestions: [{ question: '', options: ['', '', '', ''], answer: 0 }],
    expiry_days: 7
  });
  const [creatingExam, setCreatingExam] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true); // Initial loading state for the dashboard
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Chat States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatHasMore, setChatHasMore] = useState(false);
  const [chatCursor, setChatCursor] = useState(null); // Cursor for chat pagination
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStudentFullDetails, setSelectedStudentFullDetails] = useState(null); // For report modal
  const [selectedMessages, setSelectedMessages] = useState([]); // For bulk delete
  const [selectionMode, setSelectionMode] = useState(false); // New state for selection mode
  const [deleteModal, setDeleteModal] = useState({ show: false, ids: [], canDeleteEveryone: false });

  // Profile States
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(user?.bio || "");

  const [showChatModal, setShowChatModal] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [reactionPicker, setReactionPicker] = useState({ openForId: null });
  const [addingStudent, setAddingStudent] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [savingFeeEdit, setSavingFeeEdit] = useState(false);
  const [aiAchievers, setAiAchievers] = useState({ cards: [], summary: '' });
  const [openingChatId, setOpeningChatId] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Homework States
  const [showAddHomeworkModal, setShowAddHomeworkModal] = useState(false);
  const [homeworkFormData, setHomeworkFormData] = useState({
    title: '',
    description: '',
    subject: '',
    due_date: '',
    duration_value: 7,
    duration_unit: 'days',
  });
  const [classHomework, setClassHomework] = useState([]);
  // Attendance States
  const [allAttendance, setAllAttendance] = useState([]);

  // Fee States
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [classFees, setClassFees] = useState([]);
  const [feeStats, setFeeStats] = useState([]);
  const [feeSearchTerm, setFeeSearchTerm] = useState("");
  const [feeMonthFilter, setFeeMonthFilter] = useState("all");
  const [feeStatusFilter, setFeeStatusFilter] = useState("all");
  const [feePage, setFeePage] = useState(1);
  const [hasMoreFees, setHasMoreFees] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [showFeeReminderModal, setShowFeeReminderModal] = useState(false);
  const [showFeeProposalModal, setShowFeeProposalModal] = useState(false);
  const [feeProposalForm, setFeeProposalForm] = useState({ month: '', year: new Date().getFullYear(), due_date: '', amount: '' });
  const [creatingFeeProposal, setCreatingFeeProposal] = useState(false);

  // Attendance Filter States
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState("all");
  const [activeWorkspace, setActiveWorkspace] = useState(() => getUiState(CACHE_KEYS.DASHBOARD_VIEW('teacher', user?.id || 'anon'), 'overview'));

  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const playSound = useCallback((type = 'chat') => {
    const soundUrl = type === 'chat' 
      ? "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3" 
      : "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3";
    const audio = new Audio(soundUrl);
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Catch browser block if no interaction yet
  }, []);

  // Performance: Optimize auto-scroll to only trigger when necessary
  useEffect(() => {
    const container = chatMessagesRef.current;
    if (!container || !showChatModal || loadingChat) return;
    
    const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 400;
    if (isNearBottom || container.scrollTop === 0) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages.length, showChatModal, loadingChat]);

  // Mark messages as seen when chat modal is open and messages are loaded
  useEffect(() => {
    if (showChatModal && selectedStudent && chatMessages.length > 0) {
      const unreadMessageIds = chatMessages
        .filter(msg => msg.sender_id === selectedStudent.id && msg.status !== 'seen')
        .map(msg => msg.id);

      if (unreadMessageIds.length > 0) {
        socket.emit("markSeen", { senderId: selectedStudent.id, receiverId: user.id, messageIds: unreadMessageIds });
      }
    }
  }, [showChatModal, selectedStudent, chatMessages, user.id]);

  // Socket
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleReceiveMessage = (data) => {
      const senderId = Number(data.sender_id || data.senderId);
      const receiverId = Number(data.receiver_id || data.receiverId);

      if (!selectedStudent?.id) return;

      const isCurrentConversation =
        (senderId === Number(selectedStudent.id) && receiverId === Number(user.id)) ||
        (senderId === Number(user.id) && receiverId === Number(selectedStudent.id));

      if (!isCurrentConversation) return;

      // Play subtle sound for incoming chat messages
      if (senderId !== Number(user.id)) {
        playSound('chat');
      }

      setChatMessages((prev) => {
        if (prev.some((message) => message.id === data.id)) return prev;
        return [...prev, data];
      }); // Add new message to chat

      // Immediately mark as seen if it's the active conversation and modal is open
      if (showChatModal && senderId === Number(selectedStudent.id)) {
        socket.emit("markSeen", { senderId: senderId, receiverId: user.id, messageIds: [data.id] });
      }

      // Update Cache immediately for new messages
      const cacheKey = CACHE_KEYS.CHAT_HISTORY(senderId === Number(user.id) ? receiverId : senderId);
      const cached = getCache(cacheKey);
      const updatedCache = Array.isArray(cached) ? [...cached, data] : [data]; // Add to cache
      setCache(cacheKey, updatedCache, 60); // 1 hour TTL
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, user?.id, selectedStudent?.id]);

  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleNewNotif = (notif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });

      // Play sound for alerts. If it's a chat notification, only play if modal is closed
      if (notif.type !== 'chat' || !showChatModal) {
        playSound('notification');
      }

      if (['fee_payment_request', 'fee_payment_approved', 'fee_payment_rejected'].includes(notif.type)) {
        fetchClassFees(1, true);
        fetchFeeStats();
      }

      if (notif?.type === 'salary') {
        const match = String(notif.message || '').match(/\[salaryId:(\d+)\]/i);
        const salaryId = match ? Number(match[1]) : null;
        if (!salaryId) return toast.error('Salary record not found in notification');

        setSalaryPopup({ open: true, salary: null, notifId: notif.id, loading: true });
        API.get(`/teacher/salaries/${salaryId}`)
          .then((res) => {
            setSalaryPopup({ open: true, salary: res.data.salary, notifId: notif.id, loading: false });
          })
          .catch((e) => {
            setSalaryPopup({ open: false, salary: null, notifId: null, loading: false });
            toast.error(e.response?.data?.message || 'Failed to load salary record');
          });

        toast((t) => (
          <div style={{ minWidth: 280 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{notif.title || 'Salary update'}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{String(notif.message || '').replace(/\[salaryId:\d+\]/i, '').trim()}</div>
          </div>
        ), { duration: 8000, icon: '💵' });
      }
    };

    socket.on('newNotification', handleNewNotif);

    return () => {
      socket.off('newNotification', handleNewNotif);
    };
  }, [socket, user?.id]);

  const approveSalaryFromPopup = async () => {
    const salaryId = salaryPopup.salary?.id;
    if (!salaryId) return;
    setSalaryPopup((p) => ({ ...p, loading: true }));
    try {
      await API.put(`/teacher/salaries/${salaryId}/confirm`);
      toast.success('Approved: salary received');
      if (salaryPopup.notifId) {
        await API.put(`/teacher/notifications/${salaryPopup.notifId}/read`);
        setNotifications((prev) => prev.map((n) => (n.id === salaryPopup.notifId ? { ...n, is_read: true } : n)));
      }
      setSalaryPopup({ open: false, salary: null, notifId: null, loading: false });
    } catch (e) {
      setSalaryPopup((p) => ({ ...p, loading: false }));
      toast.error(e.response?.data?.message || 'Failed to approve salary');
    }
  };

  const rejectSalaryFromPopup = async () => {
    const salaryId = salaryPopup.salary?.id;
    if (!salaryId) return;
    setSalaryPopup((p) => ({ ...p, loading: true }));
    try {
      await API.put(`/teacher/salaries/${salaryId}/reject`, { reason: 'Not received or incorrect amount' });
      toast.error('Salary rejected and sent back to admin');
      if (salaryPopup.notifId) {
        await API.put(`/teacher/notifications/${salaryPopup.notifId}/read`);
        setNotifications((prev) => prev.map((n) => (n.id === salaryPopup.notifId ? { ...n, is_read: true } : n)));
      }
      setSalaryPopup({ open: false, salary: null, notifId: null, loading: false });
    } catch (e) {
      setSalaryPopup((p) => ({ ...p, loading: false }));
      toast.error(e.response?.data?.message || 'Failed to reject salary');
    }
  };

  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleMessagesDeleted = ({ messageIds }) => {
      setChatMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id)
            ? { ...msg, message: "🚫 This message was deleted", file_url: null, deleted: true }
            : msg
        )
      );

      // Sync deleted status to Cache
      const cacheKey = CACHE_KEYS.CHAT_HISTORY(selectedStudent?.id);
      const cached = getCache(cacheKey);
      if (Array.isArray(cached)) {
        const updatedCache = cached.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, message: "🚫 This message was deleted", file_url: null, deleted: true } : msg
        );
        setCache(cacheKey, updatedCache, 60);
      }

      setSelectedMessages([]);
      setSelectionMode(false);
    };

    const handleTyping = ({ senderId }) => {
      if (Number(senderId) !== Number(selectedStudent?.id)) return;
      setIsTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
    };

    const handleUserStatusUpdate = (data) => {
      setStudents((prev) => prev.map((student) => (Number(student.id) === Number(data.userId) ? { ...student, online: data.online, last_seen: data.last_seen } : student)));
      if (Number(data.userId) === Number(selectedStudent?.id)) {
        setSelectedStudent((prev) => (prev ? { ...prev, online: data.online, last_seen: data.last_seen } : prev));
      }
    };

    const handleMessagesSeen = ({ receiverId, messageIds }) => {
      if (Number(receiverId) !== Number(selectedStudent?.id)) return;
      setChatMessages((prev) =>
        prev.map((msg) =>
          (messageIds?.length
            ? messageIds.includes(msg.id)
            : msg.receiver_id === receiverId && msg.sender_id === user.id)
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    };

    const handleMessageReactionUpdated = ({ messageId, reactions }) => {
      setChatMessages((prev) => prev.map((m) => (Number(m.id) === Number(messageId) ? { ...m, reactions } : m))); // Update reactions
    };

    const handleAnnReactionUpdated = ({ announcementId, reactions }) => {
      setAnnouncements((prev) => prev.map((a) => (Number(a.id) === Number(announcementId) ? { ...a, reactions } : a)));
    };

    socket.on("messagesDeleted", handleMessagesDeleted);
    socket.on("typing", handleTyping);
    socket.on("userStatusUpdate", handleUserStatusUpdate);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("messageReactionUpdated", handleMessageReactionUpdated);
    socket.on('announcementReactionUpdated', handleAnnReactionUpdated);
    
    return () => {
      socket.off("messagesDeleted", handleMessagesDeleted);
      socket.off("typing", handleTyping);
      socket.off("userStatusUpdate", handleUserStatusUpdate);
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("messageReactionUpdated", handleMessageReactionUpdated);
      socket.off('announcementReactionUpdated', handleAnnReactionUpdated);
    };
  }, [socket, user?.id, selectedStudent?.id]);

    

  const fetchStudents = useCallback(async (silent = false) => {
    const cacheKey = CACHE_KEYS.TEACHER_STUDENTS(user.id);
    const cached = getCache(cacheKey);
    if (cached && !silent) setStudents(cached);

    try {
      const res = await API.get("/teacher/students");
      const data = res.data.students || [];
      setStudents(data);
      setCache(cacheKey, data, 30);
    } catch (err) {
      if (!silent) toast.error("Failed to load students");
    }
  }, [user.id]);

  const fetchExams = useCallback(async () => {
    try {
      const res = await API.get("/exams/my-exams");
      setExams(res.data.exams || []);
    } catch (err) { console.error(err); }
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setCreatingExam(true);
    try {
      let payload = { 
        ...examForm, 
        class_id: user?.class_id,
        questions: examForm.creationMode === 'manual' ? examForm.manualQuestions : null 
      };

      if (examForm.creationMode === 'manual') {
        const isValid = examForm.manualQuestions.every(q => q.question.trim() && q.options.every(o => o.trim()));
        if (!isValid) {
          setCreatingExam(false);
          return toast.error("Please fill in all questions and options.");
        }
      }

      await API.post("/exams/create", payload);
      toast.success("AI Exam generated and assigned to class!");
      setShowExamModal(false);
      setExamForm({ title: '', subject: '', difficulty: 'Medium', topic: '', chapter: '', total_questions: 10, marks: 100, duration_minutes: 30, creationMode: 'ai', manualQuestions: [{ question: '', options: ['', '', '', ''], answer: 0 }], expiry_days: 7 });
      fetchExams();
    } catch (err) { toast.error("Generation failed"); }
    finally { setCreatingExam(false); }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Delete this exam and all student results?")) return;
    try {
      await API.delete(`/exams/${examId}`);
      toast.success("Exam removed");
      fetchExams();
    } catch (err) {
      toast.error("Failed to delete exam");
    }
  };

  const addManualQuestion = () => {
    setExamForm(prev => ({
      ...prev,
      manualQuestions: [...prev.manualQuestions, { question: '', options: ['', '', '', ''], answer: 0 }]
    }));
  };

  const updateManualQuestion = (idx, field, value) => {
    const updated = [...examForm.manualQuestions];
    updated[idx][field] = value;
    setExamForm(prev => ({ ...prev, manualQuestions: updated }));
  };

  const updateManualOption = (qIdx, optIdx, value) => {
    const updated = [...examForm.manualQuestions];
    updated[qIdx].options[optIdx] = value;
    setExamForm(prev => ({ ...prev, manualQuestions: updated }));
  };

  const handleAiAutoFill = async () => {
    setGeneratingWithAi(true);
    // This simulates calling the quizGenerator AI template
    setTimeout(() => {
      setExamForm(prev => ({ ...prev, title: `AI Quiz: ${prev.subject || 'General'}`, marks: 50, total_questions: 15 }));
      setGeneratingWithAi(false);
      toast("AI suggested an optimized exam structure", { icon: '🤖' });
    }, 1500);
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get("/announcements");
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      toast.error("Failed to load announcements");
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/teacher/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClassHomework = useCallback(async () => {
    try {
      const cacheKey = `teacher:homework:${user.id}`;
      const cached = getCache(cacheKey);
      if (Array.isArray(cached)) setClassHomework(cached);

      const res = await API.get('/homework/teacher');
      const data = res.data.homework || [];
      setClassHomework(data);
      setCache(cacheKey, data, 15);
    } catch (err) {
      console.error("Failed to fetch class homework:", err);
    }
  }, [user.id]);

  const fetchClassFees = useCallback(async (page = 1, silent = false) => {
    try {
      const cacheKey = `teacher:fees:${user.id}:${page}`;
      const cached = getCache(cacheKey);
      if (Array.isArray(cached) && !silent) setClassFees(cached);

      const res = await API.get('/fees/class-fees', { params: { page, limit: 20 } });
      const newFees = res.data.fees || [];
      setClassFees(prev => page === 1 ? newFees : [...prev, ...newFees]);
      setHasMoreFees(res.data.hasMore);
      setFeePage(page);
      setCache(cacheKey, newFees, 15);
    } catch (err) {
      console.error(err);
    }
  }, [user.id]);

  const loadMoreFees = () => {
    if (hasMoreFees) {
      fetchClassFees(feePage + 1);
    }
  };


  const fetchFeeStats = async () => {
    try {
      const res = await API.get('/fees/stats');
      setFeeStats(res.data.stats || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createFeeProposal = async (event) => {
    event.preventDefault();
    if (!feeProposalForm.month || !feeProposalForm.year) {
      toast.error('Select a month and year');
      return;
    }
    try {
      setCreatingFeeProposal(true);
      const response = await API.post('/fees/proposals', feeProposalForm);
      toast.success(response.data.message || 'Fee proposal created');
      setShowFeeProposalModal(false);
      setFeeProposalForm({ month: '', year: new Date().getFullYear(), due_date: '', amount: '' });
      await fetchClassFees();
      await fetchFeeStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create fee proposal');
    } finally {
      setCreatingFeeProposal(false);
    }
  };

  const reviewTeacherFeeRequest = async (requestId, status) => {
    const remarks = status === 'rejected' ? window.prompt('Reason for rejection (optional):') || '' : '';
    try {
      await API.put(`/fees/payment-requests/${requestId}`, { status, remarks });
      toast.success(`Payment ${status}`);
      await fetchClassFees();
      await fetchFeeStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment');
    }
  };

  const handleUpdateFeeStatus = async (feeId, newStatus) => {
    try {
      await API.put(`/fees/update/${feeId}`, { status: newStatus });
      toast.success(`Fee marked as ${newStatus}`);
      await fetchClassFees();
      await fetchFeeStats(); // Update analytics immediately
    } catch (err) {
      toast.error("Failed to update fee status");
    }
  };

  const handleEditFee = async (e) => {
    e.preventDefault();
    try {
      setSavingFeeEdit(true);
      await API.put(`/fees/edit/${editingFee.id}`, editingFee);
      toast.success("Fee record updated");
      setEditingFee(null);
      fetchClassFees();
      fetchFeeStats(); // Update Graph real-time
    } catch (err) { toast.error("Update failed"); }
    finally { setSavingFeeEdit(false); }
  };

  const exportFeesCSV = () => {
    const headers = ["studentName", "Student_id", "Class_id", "Month", "Year", "Total Fees", "Status", "Date", "Remarks"];
    const rows = filteredFees.map(f => [
      f.student_name, f.student_id, f.class_id, f.month, f.year, f.amount, f.status, 
      f.due_date ? new Date(f.due_date).toLocaleDateString() : 'N/A',
      f.remarks || ""
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Class_Fees_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  // Performance: Memoized search/filter logic for Fees
  const filteredFees = useMemo(() => 
    classFees.filter(f => {
      const search = feeSearchTerm.toLowerCase();
      const matchesSearch = f.student_name.toLowerCase().includes(search) || 
                           f.student_email.toLowerCase().includes(search);
      const matchesMonth = feeMonthFilter === "all" || f.month === feeMonthFilter;
      const matchesStatus = feeStatusFilter === "all" || f.status === feeStatusFilter;
      return matchesSearch && matchesMonth && matchesStatus;
    }), [classFees, feeSearchTerm, feeMonthFilter, feeStatusFilter]);

  const handlePrintReceipt = (fee) => {
    try {
      openTeacherReceiptPrintWindow({
        fee: { ...fee, school_name: user?.school_name },
        schoolLogo: teacherBrandLogo,
        teacherName: user?.name || "Teacher",
      });
    } catch (error) {
      toast.error(error.message || "Failed to open receipt preview");
    }
  };

  const fetchChat = useCallback(async (studentId, before = null) => {
    if (!studentId) return;

    if (!before) {
      setChatMessages([]);
      setLoadingChat(true);
    }

    const cacheKey = CACHE_KEYS.CHAT_HISTORY(studentId);
    const cached = getCache(cacheKey);
    if (Array.isArray(cached) && !before) {
      setChatMessages(cached);
    }

    try {
      const params = before ? { before, limit: 25 } : { limit: 25 };
      const res = await API.get(`/teacher/chat/conversation/${studentId}`, { params });
      const history = res.data.messages || [];
      setChatHasMore(res.data.hasMore);
      setChatCursor(res.data.pagination?.nextCursor || null);

      setChatMessages(prev => {
        if (before) {
          const filteredHistory = history.filter(hm => !prev.some(pm => pm.id === hm.id));
          return [...filteredHistory, ...prev];
        } // Prepend older messages
        const updated = history;
        setCache(cacheKey, updated, 1000 * 60 * 30);
        return updated;
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load chat");
    } finally {
      setLoadingChat(false);
    }
  }, [user.id]);

  const openTeacherChat = useCallback(async (student, before = null) => {
    setOpeningChatId(student.id);
    setSelectedStudent(student);

    // Auto-mark notifications as read when opening chat
    try {
      await API.put(`/teacher/notifications/read-type/chat/${student.id}`);
      setNotifications(prev => prev.map(n => 
        (n.type === 'chat' && Number(n.related_user_id) === Number(student.id)) 
        ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark chat notifications as read", err);
    }

    if (!before) {
      setChatMessages([]);
      setLoadingChat(true);
      setShowChatModal(true);
    }
    try {
      await fetchChat(student.id, before);
    } finally { setOpeningChatId(null); }
  }, [fetchChat]);
  
  const handleChatScroll = useCallback((e) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && chatHasMore && !loadingChat && selectedStudent && chatCursor) {
      openTeacherChat(selectedStudent, chatCursor);
    }
  }, [chatHasMore, loadingChat, selectedStudent, chatCursor, openTeacherChat]);

  const fetchAllAttendance = async () => {
    try {
      const cacheKey = `teacher:attendance:${user.id}`;
      const cached = getCache(cacheKey);
      if (Array.isArray(cached)) setAllAttendance(cached);

      const res = await API.get('/attendance');
      const data = res.data.attendance || [];
      setAllAttendance(data);
      setCache(cacheKey, data, 15);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentFullDetails = async (studentId) => {
    try {
      // Assuming you have an endpoint to get a single student's full details
      // For now, we'll just find it in the existing students array
      const student = students.find(s => s.id === studentId);
      setSelectedStudentFullDetails(student);
    } catch (err) {
      console.error("Failed to fetch student full details:", err);
    }
  };
  
 
  // CSV Export Logic
  const exportCSV = (data, fileName) => {
    const headers = ["Student ID", "Student Name", "Date", "Status", "Remarks"];
    const rows = data.map(r => [
      r.student_id,
      r.student_name,
      new Date(r.date).toLocaleDateString(),
      r.status,
      r.remarks || ""
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Performance: Memoized statistics calculator
  const getStudentStats = useCallback((studentId, filterMonth = "all") => {
    let records = allAttendance.filter(a => a.student_id === studentId);
    
    if (filterMonth !== "all") {
      records = records.filter(a => new Date(a.date).getMonth() === parseInt(filterMonth));
    }

    const total = records.length;
    const stats = { percent: 0, present: 0, absent: 0, late: 0, total: 0, level: 'good' };
    if (total === 0) return stats;
    
    const present = records.filter(a => a.status === 'present').length;
    const absent = records.filter(a => a.status === 'absent').length;
    const late = records.filter(a => a.status === 'late').length;
    const percent = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    
    let level = 'good';
    if (percent < 75) level = 'warning';
    if (percent < 50) level = 'danger';

    return { percent, present, absent, late, total, level };
  }, [allAttendance]);

  // Performance: Main Student Grid Filtering
  const filteredStudents = useMemo(() => 
    students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.id.toString().includes(searchTerm)
    ), [students, searchTerm]);

  // Filter Logic for Attendance Modal
  const getReportMonthLabel = () => {
    if (reportMonth === "all") return "Full Academic Year";
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(reportMonth)] || "Custom Range";
  };

  const handlePrintStudentReport = () => {
    const studentInfo = selectedStudentFullDetails || selectedStudent;
    if (!studentInfo) {
      toast("Select a student report first", { icon: '⚠️' });
      return;
    }

    // Filter and calculate fees for this specific student to prevent "length" errors in report generation
    const studentFees = classFees.filter(f => Number(f.student_id) === Number(studentInfo.id));
    const studentFeeStats = studentFees.reduce((acc, fee) => {
      if (fee.status === 'paid') {
        acc.paidCount++;
        acc.paidAmount += Number(fee.amount || 0);
      } else {
        acc.pendingCount++;
        acc.pendingAmount += Number(fee.amount || 0);
      }
      return acc;
    }, { paidCount: 0, pendingCount: 0, paidAmount: 0, pendingAmount: 0 });

    const attendanceRows = allAttendance.filter(
      (attendance) =>
        attendance.student_id === studentInfo.id &&
        (reportMonth === "all" || new Date(attendance.date).getMonth() === parseInt(reportMonth))
    );

    try {
      openTeacherAttendancePrintWindow({
        student: { 
          ...studentInfo, 
          class_name: studentInfo.class_name || studentInfo.class_id || "N/A",
          school_name: user?.school_name 
        },
        studentFees,
        studentFeeStats,
        attendanceRows,
        reportMonthLabel: getReportMonthLabel(),
        stats: getStudentStats(selectedStudent.id, reportMonth),
        schoolLogo: teacherBrandLogo,
        teacherName: user?.name || "Teacher",
      });
    } catch (error) {
      toast.error(error.message || "Failed to open report preview");
    }
  };

  //HandleNotification 
const legacyHandleNotificationClick = async (notif) => {
  console.log("Clicked Notification:", notif);

  setShowNotifications(false);

  try {
    await API.put(`/teacher/notifications/${notif.id}/read`);
    setNotifications(prev =>
      prev.map(n =>
        n.id === notif.id ? { ...n, is_read: true } : n
      )
    );
  } catch (err) {
    console.error("Error marking notification as read:", err);
  }

  if (notif.type === "chat") {
  const studentId = Number(notif.related_user_id);

  let student = students.find(s => Number(s.id) === studentId);

  if (!student) {
    console.warn("⚠ Student not found in state, refetching...");

    try {
      const res = await API.get("/teacher/students");
      const freshStudents = res.data.students || res.data || [];

      student = freshStudents.find(s => Number(s.id) === studentId);

      if (student) {
        setStudents(freshStudents);
      }
    } catch (err) {
      console.error("Failed to refetch students", err);
    }
  }

  if (student) {
    // Use the new openTeacherChat function
    await openTeacherChat(student);
  } else {
    console.error("❌ Student STILL not found");
    toast.error("Student not found");
  }
}
  // ✅ ANNOUNCEMENT REDIRECT
  else if (notif.type === "announcement") {
    const section = document.getElementById("announcements-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn("Announcement section not found");
    }
  }
};

  const handleNotificationClick = async (notif) => {
    setShowNotifications(false);

    try {
      await API.put(`/teacher/notifications/${notif.id}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notif.id ? { ...notification, is_read: true } : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }

    if (notif.type === 'fee_payment_request' || notif.type === 'fee_payment_approved' || notif.type === 'fee_payment_rejected') {
      const requestMatch = String(notif.message || '').match(/\[requestId:(\d+)\]/i);
      if (requestMatch) {
        const requestId = Number(requestMatch[1]);
        if (notif.type === 'fee_payment_request') {
          const requests = await API.get('/fees/payment-requests', { params: { status: 'pending' } });
          const request = (requests.data.requests || []).find((item) => Number(item.id) === requestId);
          if (request) setShowFeeModal(true);
          else toast('This fee payment has already been reviewed.');
        }
      }
      await fetchClassFees(1, true);
      return;
    }

    if (notif.type === "announcement") {
      document.getElementById("announcements-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (notif.type === 'salary') {
      const match = String(notif.message || '').match(/\[salaryId:(\d+)\]/i);
      const salaryId = match ? Number(match[1]) : null;
      if (!salaryId) {
        toast.error('Salary record not found in notification');
        return;
      }
      setSalaryPopup({ open: true, salary: null, notifId: notif.id, loading: true });
      try {
        const res = await API.get(`/teacher/salaries/${salaryId}`);
        setSalaryPopup({ open: true, salary: res.data.salary, notifId: notif.id, loading: false });
      } catch (e) {
        setSalaryPopup({ open: false, salary: null, notifId: null, loading: false });
        toast.error(e.response?.data?.message || 'Failed to load salary record');
      }
      return;
    }

    if (notif.type !== "chat") return;

    const relatedUserId = Number(notif.related_user_id);
    let chatUser = students.find((student) => Number(student.id) === relatedUserId);

    if (!chatUser && notif.title?.toLowerCase().includes("admin")) {
      chatUser = {
        id: relatedUserId,
        name: "School Admin",
        role: "admin",
        class_name: "Administration",
        online: false,
      };
    }

    if (!chatUser) {
      try {
        const res = await API.get("/teacher/students");
        const freshStudents = res.data.students || res.data || [];
        chatUser = freshStudents.find((student) => Number(student.id) === relatedUserId);
        if (chatUser) {
          setStudents(freshStudents);
        }
      } catch (err) {
        console.error("Failed to refetch students", err);
      }
    }

    if (!chatUser) {
      chatUser = {
        id: relatedUserId,
        name: "School Admin",
        role: "admin",
        class_name: "Administration",
        online: false,
      };
    }

    // Use the new openTeacherChat function
    await openTeacherChat(chatUser);
    setSelectedStudentFullDetails(chatUser);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await API.delete(`/announcements/${id}`);
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch (err) {
      toast.error("Failed to delete announcement");
    }
  };

  // Delete Chat Messages
  const openDeleteModal = (ids) => {
    const allSentByUser = ids.every(id => {
      const msg = chatMessages.find(m => m.id === id);
      return msg && msg.sender_id === user.id;
    });
    setDeleteModal({ show: true, ids, canDeleteEveryone: allSentByUser });
  };

  const handleDeleteConfirmed = async (type) => {
    try {
      const { ids } = deleteModal;
      // Using bulk-delete endpoint
      await API.post(`/teacher/chat/bulk-delete`, { messageIds: ids, type });
      
      if (type === 'everyone') {
        socket.emit("deleteMessages", { receiverId: selectedStudent.id, messageIds: ids });
        setChatMessages(prev => {
          const updated = prev.map(msg => 
            ids.includes(msg.id) ? { 
              ...msg, 
              message: "🚫 You deleted this message", 
              file_url: null, 
              deleted: true,
              status: 'deleted' 
            } : msg
          );
          setCache(CACHE_KEYS.CHAT_HISTORY(selectedStudent.id), updated, 60);
          return updated;
        });
      } else {
        setChatMessages(prev => {
          const updated = prev.filter(msg => !ids.includes(msg.id));
          setCache(CACHE_KEYS.CHAT_HISTORY(selectedStudent.id), updated, 60);
          return updated;
        });
      }

      setSelectedMessages([]);
      setDeleteModal({ show: false, ids: [], canDeleteEveryone: false });
      toast.success(type === 'everyone' ? "Deleted for everyone" : "Deleted for me");
    } catch (err) {
      toast.error("Failed to delete messages");
    }
  };

  const toggleMessageSelection = (id) => {
    setSelectedMessages(prev => {
      const isSelected = prev.includes(id);
      let newSelection;
      if (isSelected) {
        newSelection = prev.filter(mid => mid !== id);
      } else {
        newSelection = [...prev, id];
      }

      // Update selection mode based on selection state
      setSelectionMode(newSelection.length > 0);
      return newSelection;
    });
  };

  const selectAllMessages = () => {
    if (selectedMessages.length === chatMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(chatMessages.map(m => m.id));
      setSelectionMode(true); // Ensure selection mode is on
    }
  };

  // Send Message
  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedStudent) return;

    const optimisticMessage = createOptimisticMessage({
      senderId: user.id,
      receiverId: selectedStudent.id,
      message: newMessage,
      file: selectedFile,
      status: 'sending', // Optimistic status
    });
    const formData = new FormData();
    formData.append("message", newMessage.trim() || "");
    if (selectedFile) formData.append("file", selectedFile);

    if (!navigator.onLine) {
      addToSyncQueue({ 
        type: 'chat', 
        method: 'POST', 
        url: `/teacher/chat/conversation/${selectedStudent.id}`, 
        payload: { message: newMessage.trim() } 
      });
      
      setChatMessages(prev => [...prev, optimisticMessage]);
      setNewMessage("");
      toast("Offline: Message will send when connected", { icon: '☁️' });
      return;
    }

    try {
      setSendingMessage(true);
      setChatMessages(prev => [...prev, optimisticMessage]);
      setNewMessage("");
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      const { data } = await API.post(`/teacher/chat/conversation/${selectedStudent.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setChatMessages(prev => prev.map((message) => 
        message.id === optimisticMessage.id ? { ...data.chat, status: 'sent' } : message
      ));
      // Release blob URL after successful upload
      setTimeout(() => releaseOptimisticMedia(optimisticMessage), 2000);

      socket.emit("broadcastMessage", data.chat);

    } catch (err) {
      releaseOptimisticMedia(optimisticMessage);
      setChatMessages(prev => prev.map((message) => 
        message.id === optimisticMessage.id ? { ...message, status: 'failed' } : message
      ));
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const retryUpload = async (messageToRetry) => {
    // Recreate FormData from the original file and message
    const formData = new FormData();
    formData.append("message", messageToRetry.message || "");
    if (messageToRetry.file) formData.append("file", messageToRetry.file);

    // Update the message status to 'sending' again
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageToRetry.id ? { ...msg, status: 'sending' } : msg
    ));

    try {
      const { data } = await API.post(`/teacher/chat/conversation/${selectedStudent.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setChatMessages(prev => prev.map(msg => 
        msg.id === messageToRetry.id ? { ...data.chat, status: 'sent' } : msg
      ));
      if (socket) socket.emit('broadcastMessage', data.chat);
      setTimeout(() => releaseOptimisticMedia(messageToRetry), 2000);
    } catch (err) {
      setChatMessages(prev => prev.map(msg => 
        msg.id === messageToRetry.id ? { ...msg, status: 'failed' } : msg
      ));
      toast.error("Retry failed");
    }
  };

  // Excel Upload logic removed - handled by AttendanceSection.jsx

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const preparedFile = await prepareUploadFile(file, { maxBytes: 10 * 1024 * 1024, maxSizeMB: 2 });
      setSelectedFile(preparedFile);
      setFilePreview(preparedFile.type.startsWith('image/') ? URL.createObjectURL(preparedFile) : null);
    } catch (error) {
      toast.error(error.message || "File must be less than 10MB");
      e.target.value = '';
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedStudent) {
      socket.emit("typing", { senderId: user.id, receiverId: selectedStudent.id });
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

  };

  useEffect(() => {
    if (!user?.id) return;
    setUiState(CACHE_KEYS.DASHBOARD_VIEW('teacher', user.id), activeWorkspace);
  }, [activeWorkspace, user?.id]);

  const feeReminderRows = useMemo(() => {
    const now = new Date();
    return classFees.filter((fee) => {
      const status = String(fee.status || '').toLowerCase();
      if (!['unpaid', 'overdue', 'rejected'].includes(status)) return false;
      if (fee.due_date) {
        const due = new Date(fee.due_date);
        const diff = due.getTime() - now.getTime();
        return diff <= 1000 * 60 * 60 * 24 * 14;
      }
      return true;
    });
  }, [classFees]);

  const startVoiceRecording = async () => {
    try {
      if (isRecording) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const preferredMimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
        .find((item) => window.MediaRecorder?.isTypeSupported?.(item));
      const recorder = new MediaRecorder(stream, preferredMimeType ? { mimeType: preferredMimeType, audioBitsPerSecond: 64000 } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch {
          // ignore
        }
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
        setSelectedFile(file);
        setFilePreview(null);
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      toast.error('Microphone permission denied or not available');
    }
  };

  const stopVoiceRecording = () => {
    try {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecording(false);
    }
  };

  const reactToMessage = (messageId, emoji) => {
    if (!socket || !user?.id || !messageId) return;
    socket.emit('reactMessage', { messageId, userId: user.id, emoji });
  };

  const handleDeleteHomework = async (homeworkId) => {
    if (!window.confirm('Delete this homework assignment?')) return;
    try {
      await API.delete(`/homework/teacher/${homeworkId}`);
      setClassHomework((prev) => prev.filter((item) => Number(item.id) !== Number(homeworkId)));
      toast.success('Homework deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete homework');
    }
  };

  const handleMessageContextMenu = (message, event) => {
    event.preventDefault();
    setReactionPicker({ openForId: message.id });
  };

  const saveFile = async (url, originalName) => {
    try {
      const fullUrl = resolveOptimizedMediaUrl(url);
      if (!fullUrl) throw new Error('Invalid file URL');
      
      const response = await fetch(fullUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = originalName || fullUrl.split('/').pop().split('?')[0];
      link.setAttribute('download', `EduFlow_${fileName}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      const link = document.createElement('a');
      link.href = resolveMediaUrl(url);
      link.setAttribute('target', '_blank');
      link.setAttribute('download', originalName || 'download');
      link.click();
    }
  };

  // Add Student Handlers
  const emptyStudentForm = { name: "", email: "", password: "", bio: "", profile_image: "" };
  const [studentFormData, setStudentFormData] = useState(emptyStudentForm);
  const [studentImagePreview, setStudentImagePreview] = useState(null);

  const handleStudentImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    prepareUploadFile(file, { maxBytes: 2 * 1024 * 1024, maxSizeMB: 1 })
      .then(prepared => {
        setStudentImagePreview(URL.createObjectURL(prepared));
        setStudentFormData(prev => ({ ...prev, profile_image: prepared }));
      })
      .catch(err => toast.error(err.message));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setAddingStudent(true);
      const data = new FormData();
      Object.keys(studentFormData).forEach(key => {
        if (key === 'profile_image' && studentFormData[key] instanceof File) {
          data.append('profile_image', studentFormData[key]);
        } else if (key !== 'profile_image') {
          data.append(key, studentFormData[key] || '');
        }
      });

      await API.post("/teacher/students", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Student created successfully!");
      setShowAddStudentModal(false);
      setStudentFormData(emptyStudentForm);
      setStudentImagePreview(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add student");
    } finally {
      setAddingStudent(false);
    }
  };

  const handleUpdateBio = async () => {
    try {
      setSavingBio(true);
      await API.put('/teacher/profile', { bio: tempBio });
      toast.success("Bio updated successfully");
      setIsEditingBio(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update bio");
    } finally {
      setSavingBio(false);
    }
  };

  const fetchInitialData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const promises = [
        fetchStudents(),
        fetchAnnouncements(),
        fetchNotifications(),
        fetchAllAttendance(),
        fetchClassFees(),
        fetchFeeStats(),
        fetchExams()
      ];

      if (user?.class_id) {
        promises.push(fetchClassHomework());
      }
      
      await Promise.all(promises);
    } catch (err) {
      if (err.response?.status === 403) {
        const msg = err.response?.data?.message || 'Your school access is currently paused.';
        toast.error(msg, { id: 'school-paused-error' });
        setTimeout(() => logout(), 2500);
        return;
      }
      if (!silent) toast.error("Failed to load dashboard data");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [fetchClassHomework]);

  useEffect(() => {
    if (!user) return;
    fetchInitialData();
  }, [user, fetchInitialData]);

  // Real-time Dashboard Updates
  useEffect(() => {
    if (!socket || !user?.id) return;
    socket.on('dashboardDataUpdate', () => {
      fetchInitialData(true);
    });
    return () => {
      socket.off('dashboardDataUpdate');
    };
  }, [socket, user?.id, fetchInitialData]);

  // Fetch full student details when report modal is opened
  useEffect(() => {
    if (showReportModal && selectedStudent?.id) {
      fetchStudentFullDetails(selectedStudent.id);
    }
  }, [showReportModal, selectedStudent, students]); // Add students to dependency array

  useEffect(() => {
    if (!user?.id) return;

    getTopAchieversInsight({ roleScope: `teacher:${user.id}` })
      .then((result) => {
        setAiAchievers({
          cards: result?.cards || [],
          summary: result?.summary || result?.insight || '',
        });
      })
      .catch((error) => {
        console.error('Teacher AI achiever error:', error);
      });
  }, [user?.id]);

const unreadCount = notifications.filter(n => !n.is_read).length;
const teacherBrandLogo = user?.school_logo_url || schoolLogo;

  if (loading) {
    return (
      <div className="loader-container">
        <div className="minimalist-spinner"></div>
        <p>Loading Teacher Dashboard...</p>
      </div>
    );
  }

  return (
    <DashboardShell
      title={user?.school_name || 'Edu Flow'}
      subtitle={`Teacher workspace for ${user?.class_name || 'your class'}`}
      roleLabel="Teacher Portal"
      logoUrl={teacherBrandLogo}
      userName={user?.name}
      userRole="Teacher"
      activeItem={activeWorkspace}
      onNavChange={setActiveWorkspace}
      notificationCount={unreadCount}
      onNotifications={() => setShowNotifications(!showNotifications)}
      onLogout={logout}
      navItems={[
        { id: 'overview', label: 'Overview', icon: FaHome },
        { id: 'students', label: 'Students', icon: FaUsersCog },
        { id: 'operations', label: 'Operations', icon: FaTools, badge: feeReminderRows.length || undefined },
        { id: 'settings', label: 'Settings', icon: FaCog },
      ]}
    >
    <div className="teacher-container dashboard-frame">
        {!isOnline && (
          <div className="offline-status-bar">
            <FaCloud /> Operating in Offline Mode. Updates will sync automatically.
          </div>
        )}

        {showNotifications && (
          <div className="notification-dropdown ">
            <div className="notification-dropdown-head">
              <h4>Notifications</h4>
              <button type="button" className="close-btn notif-close-btn" onClick={() => setShowNotifications(false)} aria-label="Close notifications">
                <FaTimes />
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="no-notif">No new notifications</p>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <strong>{notif.title}</strong>
                  <p>{notif.message}</p>
                  <small>{new Date(notif.created_at).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        )}

        {salaryPopup.open && (
          <div className="modal-overlay" onClick={() => setSalaryPopup({ open: false, salary: null, notifId: null, loading: false })}>
            <div className="modal-box small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-gradient">
                <h3 className="modal-title">💰 Salary Confirmation</h3>
                <button className="close-btn" onClick={() => setSalaryPopup({ open: false, salary: null, notifId: null, loading: false })}>×</button>
              </div>

              {salaryPopup.loading && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#64748b'
                }}>
                  ⏳ Loading salary details...
                </div>
              )}

              {!salaryPopup.loading && salaryPopup.salary && (
                <div className="modal-body">
                  <div className={`glass-badge ${salaryPopup.salary.status}`}>
                    {salaryPopup.salary.status === 'pending' ? '⏳ PENDING' :
                     salaryPopup.salary.status === 'approved' ? '✅ APPROVED' :
                     salaryPopup.salary.status === 'received' ? '💰 RECEIVED' : '❌ REJECTED'}
                  </div>

                  <div className="glass-stat-grid">
                    <div className="glass-stat-card">
                      <h4>📅 Period</h4>
                      <p>
                        {salaryPopup.salary.month} {salaryPopup.salary.year}
                      </p>
                    </div>
                    <div className="glass-stat-card">
                      <h4>💵 Amount</h4>
                      <p style={{ color: 'var(--success)' }}>
                        PKR {salaryPopup.salary.amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Payment Screenshot */}
                  {salaryPopup.salary.payment_screenshot && (
                    <div className="modal-section">
                      <h4>📸 Payment Proof</h4>
                      <div className="modal-media-frame">
                        <img
                          src={resolveMediaUrl(salaryPopup.salary.payment_screenshot)}
                          alt="Payment screenshot"
                          style={{
                            width: '100%',
                            maxHeight: '300px',
                            objectFit: 'contain',
                            cursor: 'pointer',
                            display: 'block'
                          }}
                          onClick={() => window.open(resolveMediaUrl(salaryPopup.salary.payment_screenshot), '_blank')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    paddingTop: '20px',
                    borderTop: '1px solid #e2e8f0',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      className="btn"
                      onClick={() => setSalaryPopup({ open: false, salary: null, notifId: null, loading: false })}
                      style={{
                        padding: '10px 20px',
                        border: '1px solid #d1d5db',
                        background: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Close
                    </button>
                    {salaryPopup.salary.status !== 'received' && (
                      <>
                        <button
                          className="btn btn-danger"
                          disabled={salaryPopup.loading}
                          onClick={rejectSalaryFromPopup}
                          style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: salaryPopup.loading ? 'not-allowed' : 'pointer',
                            opacity: salaryPopup.loading ? 0.6 : 1
                          }}
                        >
                          {salaryPopup.loading ? '⏳ Processing...' : '❌ I Did Not Receive'}
                        </button>
                        <button
                          className="btn btn-success"
                          disabled={salaryPopup.loading}
                          onClick={approveSalaryFromPopup}
                          style={{
                            padding: '10px 24px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: salaryPopup.loading ? 'not-allowed' : 'pointer',
                            opacity: salaryPopup.loading ? 0.6 : 1
                          }}
                        >
                          {salaryPopup.loading ? '⏳ Processing...' : '✅ I Received My Salary'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      
      {activeWorkspace === 'overview' && (
        <div style={{ padding: '0 24px' }}>
        <AiInsightPanel
          title="Instructional AI Assistant"
          subtitle="Behavioral trends, performance recognition, and attendance-driven teaching signals"
          summary={aiAchievers.summary || `AI is currently auditing classroom disengagement risks and identifying top performers for ${user?.class_name}.`}
          progressPercent={students.length ? Math.min(100, Math.round((students.filter((student) => student.online).length / students.length) * 100)) : 0}
          confidencePercent={91}
          sections={[
            {
              title: 'Cohort Engagement',
              items: [
                `${students.length || 0} Active Student Profiles`,
                `${announcements.length || 0} Distributed Communications`,
                `${classHomework.length || 0} Active Assignments`
              ],
            },
            {
              title: 'Administrative Signals',
              items: feeStats.slice(0, 2).map((item) => `${item.status}: ${item.count || 0} Students`),
            },
            {
              title: 'AI Pedagogy Focus',
              items: [
                'Prioritize recognition for high-momentum achievers.',
                'Monitor disengagement triggers in attendance flow.',
                'Deploy AI practice modules for subject remediation.'
              ],
            },
          ]}
        />
        <AiTopAchieversPanel 
          cards={aiAchievers.cards} 
          title="Academic Merit Recognition"
          onExport={(cards, sum) => openTopAchieversPrintWindow({
            achievers: cards,
            summary: sum,
            schoolName: user?.school_name || 'EduFlow',
            logoUrl: teacherBrandLogo,
            preparedBy: `Teacher: ${user?.name}`
          })}
          onAiConsult={(student) => toast(`AI is analyzing growth plan for ${student.title}...`, { icon: '🤖' })}
        />
        </div>
      )}

      <div className="teacher-content dashboard-shell">
        <div className="dashboard-toolbar">
          <div className="dashboard-tabs">
            <button type="button" className={`dashboard-tab ${activeWorkspace === 'overview' ? 'active' : ''}`} onClick={() => setActiveWorkspace('overview')}>Overview</button>
            <button type="button" className={`dashboard-tab ${activeWorkspace === 'students' ? 'active' : ''}`} onClick={() => setActiveWorkspace('students')}>Students</button>
            <button type="button" className={`dashboard-tab ${activeWorkspace === 'operations' ? 'active' : ''}`} onClick={() => setActiveWorkspace('operations')}>Operations</button>
          </div>
          {feeReminderRows.length ? (
            <button type="button" className="btn-ui-secondary" onClick={() => setShowFeeReminderModal(true)}>
              <FaMoneyBillWave /> {feeReminderRows.length} fee reminders
            </button>
          ) : null}
        </div>

        {activeWorkspace === 'overview' ? (
        <>
        <TeacherProfileCard
          user={user}
          isEditingBio={isEditingBio}
          tempBio={tempBio}
          setTempBio={setTempBio}
          handleUpdateBio={handleUpdateBio}
          savingBio={savingBio}
          setIsEditingBio={setIsEditingBio}
        />

        {/* Main Dashboard Content */}
        <div id="announcements-section" className="announcement-section">
          <h2 className="section-title"><FaBullhorn /> Announcements</h2>
          <AnnouncementForm onSuccess={fetchAnnouncements} />
          <AnnouncementList announcements={announcements}  onDelete={handleDeleteAnnouncement} canDelete />
         
        </div>
        </>
        ) : null}

        {/* Attendance Management */}
        {activeWorkspace === 'operations' ? (
          <>
            <AttendanceOperations navigate={navigate} setShowFeeModal={setShowFeeModal} />
            <HomeworkOperations classHomework={classHomework} setShowAddHomeworkModal={setShowAddHomeworkModal} handleDeleteHomework={handleDeleteHomework} />
            <ExamOperations exams={exams} setShowExamModal={setShowExamModal} navigate={navigate} handleDeleteExam={handleDeleteExam} />
          </>
        ) : null}

        {activeWorkspace === 'settings' ? (
          <div style={{ padding: '0 24px' }}>
            <h2 className="section-title"><FaCog /> Account Settings</h2>
            <TeacherProfileCard
              user={user}
              isEditingBio={isEditingBio}
              tempBio={tempBio}
              setTempBio={setTempBio}
              handleUpdateBio={handleUpdateBio}
              savingBio={savingBio}
              setIsEditingBio={setIsEditingBio}
            />
          </div>
        ) : null}
       

        {/* Student Search & Header */}
        {activeWorkspace === 'students' ? (
        <>
        <div className="teacher-header">
          <div className="header-text">
            <h2>Your Students ({filteredStudents.length})</h2>
          </div>
          <div className="search-box">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={() => setShowAddStudentModal(true)}>
            <FaPlus /> Add New Student
          </button>
        </div>

        {/* Students Grid */}
        <div className="student-grid">
          {filteredStudents.map(s => {
            const stats = getStudentStats(s.id);
            return (
              <div key={s.id} className="student-card">
                <div className="student-avatar">
                  {s.profile_image ? <img src={s.profile_image} alt={s.name} /> : <div className="avatar-placeholder">👨‍🎓</div>}
                </div>
                <p className="st-id">ID: {s.id}</p>
                <h3>{s.name}</h3>
                <p className="sub-text">Class: {s.class_name || "Not Assigned"}</p>
                <p>{s.email}</p>
                <div className="student-status">
                  <span className={`status-dot ${s.online ? 'online' : 'offline'}`}></span>
                  <span>{s.online ? 'Online' : 'Offline'}</span>
                </div>
                
                <div className="student-card-stats">
                  <div className="stat-badge percentage"><span>Attendance</span><span className={stats.level}>{stats.percent}%</span></div>
                  <div className="stat-badge percentage"><span>Exam Avg</span><span className="good">{s.avg_marks || 0}%</span></div>
                  <div className="stat-badge"><span>Present</span><span>{stats.present}</span></div>
                  <div className="stat-badge"><span>Absent</span><span>{stats.absent}</span></div>
                </div>

                <button className="chat-btn" disabled={openingChatId === s.id} onClick={() => { openTeacherChat(s); setSelectedStudentFullDetails(s); }}>
                  {openingChatId === s.id ? <FaSpinner className="animate-spin" /> : <FaComments />}
                  {openingChatId === s.id ? 'Opening...' : 'Inbox'}
                </button>
                <button className="btn-secondary" onClick={() => { setSelectedStudent(s); setSelectedStudentFullDetails(s); setShowReportModal(true); }}>
                  <FaChartArea /> Open Student Data
                </button>
              </div>
            );
          })}
        </div>
        </>
        ) : null}
      </div>

      {/* Homework List Section */}
      {/* This section would display the classHomework state, potentially in a new tab or a dedicated card */}
      {/* Fee Management Modal */}
      {showFeeModal && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <div className="modal-header-row">
              <h3>Class Fee Management</h3>
              <div className="modal-header-actions">
                <button onClick={() => setShowFeeProposalModal(true)} className="btn-primary"><FaPlus /> Send Fee Proposal</button>
                <button onClick={() => setShowFeeModal(false)} className="close-btn">×</button>
              </div>
            </div>

            <div className="modal-body fee-modal-body">
            <div className="modal-filters fee-modal-filters">
              <div className="search-input-wrapper">
                <FaSearch className="fee-search-icon" />
                <input 
                  type="text"
                  placeholder="Search student name, ID or email..." 
                  value={feeSearchTerm} 
                  onChange={(e) => setFeeSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
              <select value={feeMonthFilter} onChange={(e) => setFeeMonthFilter(e.target.value)}>
                <option value="all">All Months</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={feeStatusFilter} onChange={(e) => setFeeStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
              <button onClick={exportFeesCSV} className="btn-secondary"><FaFileCsv /> Export Template</button>
            </div>
  <div className="fee-ledger-heading">
    <div>
      <h4>Fee Ledger</h4>
      <p>{filteredFees.length ? `${filteredFees.length} records shown` : 'No fee records match the selected filters'}</p>
    </div>
  </div>
            <div className="fee-management-table-shell table-scroll-x">
              <table className="attendance-edit-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee.id}>
                      <td><span className="glass-chip">FEE-{fee.id}</span></td>
                      <td><strong>{fee.student_name}</strong></td>
                      <td>{fee.student_email}</td>
                      <td>{fee.month} {fee.year}</td>
                      <td>PKR {fee.amount}</td>
                      <td>
                        <span className={`badge ${fee.payment_request_status === 'pending' ? 'pending' : fee.status}`}>
                          {(fee.payment_request_status === 'pending' ? 'PENDING VERIFICATION' : fee.status).toUpperCase()}
                        </span>
                      </td>
                      <td className="action-cell">
                        {fee.payment_request_status === 'pending' ? (
                          <>
                            {fee.screenshot_url && <button onClick={() => window.open(resolveMediaUrl(fee.screenshot_url), '_blank')} className="print-btn" title="View payment screenshot"><FaDownload /></button>}
                            <button onClick={() => reviewTeacherFeeRequest(fee.payment_request_id, 'approved')} className="print-btn" title="Approve payment"><FaCheck /></button>
                            <button onClick={() => reviewTeacherFeeRequest(fee.payment_request_id, 'rejected')} className="print-btn" title="Reject payment"><FaTimes /></button>
                          </>
                        ) : (
                          <button onClick={() => handlePrintReceipt(fee)} className="print-btn" title="Print Receipt"><FaPrint /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredFees.length && <p className="fee-ledger-empty">No fee records found. Adjust the search or filters.</p>}
              {hasMoreFees && (
                <div className="pagination-row">
                  <button className="view-more-btn" onClick={loadMoreFees}>Load More Fees</button>
                </div>
              )}
            </div>
            <div className="fee-stats-visualization fee-modal-stats">
              <DonutSummaryChart
                title="Collection Overview"
                subtitle="Current paid and pending students"
                totalLabel="students"
                data={feeStats.map((entry) => ({
                  name: entry.status,
                  value: Number(entry.count || 0),
                  color: entry.status === 'paid' ? '#10b981' : '#ef4444',
                }))}
              />

              <div className="fee-summary-cards">
                <div className="summary-card paid">
                  <h5>Total Paid</h5>
                  <p className="stat-value">
                    {feeStats.find(s => s.status === 'paid')?.count || 0} Students
                  </p>
                </div>
                <div className="summary-card pending">
                  <h5>Total Pending</h5>
                  <p className="stat-value">
                    {feeStats.find(s => s.status === 'pending')?.count || 0} Students
                  </p>
                </div>
              </div>
              
            </div>

          
            </div>
          </div>
        </div>
      )}

      {showFeeProposalModal && (
        <div className="modal-overlay" onClick={() => setShowFeeProposalModal(false)}>
          <div className="modal-box small" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Send Monthly Fee Proposal</h3>
              <button onClick={() => setShowFeeProposalModal(false)} className="close-btn">×</button>
            </div>
            <form className="modal-body" onSubmit={createFeeProposal}>
              <p className="sub-text">Configured class pricing is used automatically. Enter an amount only when no class fee structure has been configured.</p>
              <div className="form-group">
                <label>Month</label>
                <select className="ui-select" value={feeProposalForm.month} onChange={(event) => setFeeProposalForm((value) => ({ ...value, month: event.target.value }))} required>
                  <option value="">Select month</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => <option key={month} value={month}>{month}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <input className="ui-field" type="number" min="2020" max="2100" value={feeProposalForm.year} onChange={(event) => setFeeProposalForm((value) => ({ ...value, year: Number(event.target.value) }))} required />
              </div>
              <div className="form-group">
                <label>Monthly amount (PKR)</label>
                <input className="ui-field" type="number" min="0.01" step="0.01" value={feeProposalForm.amount} onChange={(event) => setFeeProposalForm((value) => ({ ...value, amount: event.target.value }))} placeholder="Required if no class structure exists" />
              </div>
              <div className="form-group">
                <label>Due date</label>
                <input className="ui-field" type="date" value={feeProposalForm.due_date} onChange={(event) => setFeeProposalForm((value) => ({ ...value, due_date: event.target.value }))} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowFeeProposalModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creatingFeeProposal}>{creatingFeeProposal ? 'Sending...' : 'Send Proposal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fee Modal */}
      {editingFee && (
        <div className="modal-overlay">
          <div className="modal-box small fee-action-modal">
            <h3>Update Fee Status</h3>
            <p className="sub-text fee-edit-summary">Student: <strong>{editingFee.student_name}</strong> (ID: #{editingFee.student_id})</p>
            
            <div className="fee-form-group">
              <label>Payment Status</label>
              <div className="status-options">
                <button 
                  className={`status-opt pending ${editingFee.status === 'pending' ? 'active' : ''}`}
                  onClick={() => setEditingFee({...editingFee, status: 'pending'})}
                >Pending</button>
                <button 
                  className={`status-opt paid ${editingFee.status === 'paid' ? 'active' : ''}`}
                  onClick={() => setEditingFee({...editingFee, status: 'paid'})}
                >Paid</button>
              </div>
            </div>

            <div className="fee-form-group">
              <label>Amount Due (PKR)</label>
              <input type="number" value={editingFee.amount} onChange={e => setEditingFee({...editingFee, amount: e.target.value})} />
            </div>

            <div className="fee-form-group">
              <label>Remarks</label>
              <textarea 
                placeholder="Add payment notes..." 
                value={editingFee.remarks || ""} 
                onChange={e => setEditingFee({...editingFee, remarks: e.target.value})}
              />
            </div>

            <div className="form-actions">
              <button onClick={() => setEditingFee(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleEditFee} className="btn-primary" disabled={savingFeeEdit}>{savingFeeEdit ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header--accent">
              <div className="modal-header-copy">
                <h3><FaUserGraduate /> Add New Student</h3>
                <p className="modal-subtitle">Create a new student profile for your class.</p>
              </div>
              <button className="close-btn" onClick={() => setShowAddStudentModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddStudent}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="ui-field" placeholder="Student's Name" value={studentFormData.name} onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="ui-field" placeholder="Email for login" value={studentFormData.email} onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="ui-field" placeholder="Initial password" value={studentFormData.password} onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Notes / Bio</label>
                  <textarea className="ui-textarea" placeholder="Optional background info..." value={studentFormData.bio} onChange={(e) => setStudentFormData({ ...studentFormData, bio: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Profile Image</label>
                  <input type="file" accept="image/*" onChange={handleStudentImageChange} className="ui-field" />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddStudentModal(false)} className="btn-ui-secondary">Cancel</button>
                  <button type="submit" className="btn-ui" disabled={addingStudent}>{addingStudent ? 'Creating...' : 'Create Student'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Assign Homework Modal */}
      {showAddHomeworkModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header--accent">
              <div className="modal-header-copy">
                <h3><FaBookOpen /> Assign Homework</h3>
                <p className="modal-subtitle">Create a time-bound academic assignment.</p>
              </div>
              <button className="close-btn" onClick={() => setShowAddHomeworkModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await API.post('/homework/teacher', { ...homeworkFormData, class_id: user.class_id });
                  toast.success('Homework assigned successfully!');
                  setShowAddHomeworkModal(false);
                  setHomeworkFormData({ title: '', description: '', subject: '', due_date: '', duration_value: 7, duration_unit: 'days' });
                  fetchClassHomework();
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Failed to assign homework.');
                }
              }}>
                <div className="form-group">
                  <label>Homework Title</label>
                  <input className="ui-field" placeholder="e.g. Chapter 4 Equations" value={homeworkFormData.title} onChange={(e) => setHomeworkFormData({ ...homeworkFormData, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input className="ui-field" placeholder="e.g. Mathematics" value={homeworkFormData.subject} onChange={(e) => setHomeworkFormData({ ...homeworkFormData, subject: e.target.value })} />
                </div>
                <div className="ui-grid two">
                   <div className="form-group">
                     <label>Duration</label>
                     <input type="number" className="ui-field" value={homeworkFormData.duration_value} onChange={(e) => setHomeworkFormData({ ...homeworkFormData, duration_value: e.target.value })} />
                   </div>
                   <div className="form-group">
                     <label>Unit</label>
                     <select className="ui-select" value={homeworkFormData.duration_unit} onChange={(e) => setHomeworkFormData({ ...homeworkFormData, duration_unit: e.target.value })}>
                       <option value="days">Days</option>
                       <option value="months">Months</option>
                     </select>
                   </div>
                </div>
                <div className="form-group">
                  <label>Instructions</label>
                  <textarea className="ui-textarea" placeholder="Detailed instructions for students..." value={homeworkFormData.description} onChange={(e) => setHomeworkFormData({ ...homeworkFormData, description: e.target.value })} />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddHomeworkModal(false)} className="btn-ui-secondary">Cancel</button>
                  <button type="submit" className="btn-ui">Publish Assignment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showFeeReminderModal && (
        <div className="modal-overlay" onClick={() => setShowFeeReminderModal(false)}>
          <div className="modal-box large" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-copy">
                <h3>Monthly fee reminders</h3>
                <p>Students with pending or near-due class fees.</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowFeeReminderModal(false)}>×</button>
            </div>
            <div className="modal-body mobile-sheet">
              <table className="attendance-edit-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feeReminderRows.map((fee) => (
                    <tr key={fee.id}>
                      <td>{fee.student_name}</td>
                      <td>{fee.student_email}</td>
                      <td>{fee.month} {fee.year}</td>
                      <td>PKR {fee.amount}</td>
                      <td>{fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'Pending'}</td>
                      <td><span className={`badge ${fee.status}`}>{fee.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ChatModal
        isOpen={showChatModal}
        contact={selectedStudent}
        currentUserId={user.id}
        messages={chatMessages}
        loading={loadingChat}
        hasMore={chatHasMore}
        isTyping={isTyping}
        typingLabel={`${selectedStudent?.name || 'Contact'} is typing...`}
        bannerText="Real-time messages, media, and seen status stay synced across devices."
        emptyStateText="No messages yet. Start the conversation."
        onClose={() => {
          setShowChatModal(false);
          setSelectedStudent(null);
          setIsTyping(false);
          setSelectedMessages([]);
          setSelectionMode(false);
          setReactionPicker({ openForId: null });
        }}
        onScroll={handleChatScroll}
        onQuickSelectLast={() => {
          const lastId = chatMessages[chatMessages.length - 1]?.id;
          if (!lastId) return;
          setSelectedMessages([lastId]);
          setSelectionMode(true);
        }}
        onSelectAll={selectAllMessages}
        onOpenDelete={() => openDeleteModal(selectedMessages)}
        selectedMessages={selectedMessages}
        selectionMode={selectionMode}
        onToggleMessageSelection={toggleMessageSelection}
        messageValue={newMessage}
        onMessageChange={handleTyping}
        onSend={sendMessage}
        sendingMessage={sendingMessage}
        selectedFile={selectedFile}
        filePreview={filePreview}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeSelectedFile}
        fileInputRef={fileInputRef}
        attachAccept="image/*,application/pdf,video/*,audio/*"
        isRecording={isRecording}
        onToggleRecording={() => (isRecording ? stopVoiceRecording() : startVoiceRecording())}
        saveFile={saveFile}
        retryUpload={retryUpload} // Pass retryUpload function
        reactToMessage={reactToMessage} // Pass reactToMessage function
        inputPlaceholder="Type a message..."
        statusText={selectedStudent?.role === "admin" ? 'Administration' : selectedStudent?.online ? 'Online' : 'Offline'}
        metaText={selectedStudent?.class_name || selectedStudent?.role || "Conversation"}
        avatarFallback="S"
        onMessageContextMenu={(message, event) => {
          if (message.deleted) return;
          event.preventDefault();
          handleMessageContextMenu(message, event);
        }}
      /> {/* End of ChatModal component */}

      {/* WhatsApp Style Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay delete-modal-overlay">
          <div className="delete-modal">
            <h4 className="delete-modal-title">Delete Message?</h4>
            <div className="delete-modal-options">
              {deleteModal.canDeleteEveryone && (
                <button className="delete-option delete-everyone" onClick={() => handleDeleteConfirmed('everyone')}>
                  Delete for everyone
                </button>
              )}
              <button className="delete-option delete-for-me" onClick={() => handleDeleteConfirmed('me')}>
                Delete for me
              </button>
              <button
                className="delete-option cancel-option"
                onClick={() => setDeleteModal({ show: false, ids: [], canDeleteEveryone: false })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Exam Creation Modal */}
      {showExamModal && (
        <div className="modal-overlay">
          <div className="modal-box small">
            <div className="modal-header">
              <h3 className="modal-title">Generate New AI Exam</h3>
              <button className="close-btn" onClick={() => setShowExamModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateExam}>
                <div className="form-group">
                  <label className="form-label">Exam Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Mid-term Assessment"
                    className="ai-enhanced-input"
                    value={examForm.title}
                    onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    className="ui-field"
                    placeholder="e.g. Computer Science"
                    value={examForm.subject}
                    onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="glass-form-grid">
                  <div className="form-group">
                    <label className="form-label">Topic</label>
                    <input
                      type="text"
                      className="ui-field"
                      placeholder="e.g. Data Structures"
                      value={examForm.topic}
                      onChange={(e) => setExamForm({ ...examForm, topic: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chapter</label>
                    <input
                      type="text"
                      className="ui-field"
                      placeholder="e.g. Chapter 4"
                      value={examForm.chapter}
                      onChange={(e) => setExamForm({ ...examForm, chapter: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Questions Source</label>
                  <select 
                    className="ui-select"
                    value={examForm.creationMode} 
                    onChange={(e) => setExamForm({...examForm, creationMode: e.target.value})}
                  >
                    <option value="ai">Auto-Generate with AI</option>
                    <option value="manual">Manual Entry (Custom Questions)</option>
                  </select>
                </div>

                {examForm.creationMode === 'manual' ? (
                  <div className="manual-questions-builder dashboard-section-spaced">
                    <div className="dashboard-between-row question-builder-heading">
                      <label className="form-label m-0">Question List</label>
                      <button type="button" onClick={addManualQuestion} className="btn-primary small"><FaPlus /> Add Question</button>
                    </div>
                    <div className="question-list-scroll">
                      {examForm.manualQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="glass-card question-card">
                          <div className="dashboard-between-row question-card-heading">
                            <span className="question-number">Q#{qIdx + 1}</span>
                            <button type="button" onClick={() => setExamForm(p => ({...p, manualQuestions: p.manualQuestions.filter((_, i) => i !== qIdx)}))} className="question-remove-button"><FaTrash size={12} /></button>
                          </div>
                          <input 
                            type="text" placeholder="Type question..." value={q.question} 
                            onChange={(e) => updateManualQuestion(qIdx, 'question', e.target.value)}
                            className="ui-field question-input" required
                          />
                          <div className="question-options-grid">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="question-option-row">
                                <input 
                                  type="radio" name={`correct-${qIdx}`} checked={q.answer === oIdx} 
                                  onChange={() => updateManualQuestion(qIdx, 'answer', oIdx)}
                                />
                                <input 
                                  type="text" placeholder={`Option ${oIdx+1}`} value={opt} 
                                  onChange={(e) => updateManualOption(qIdx, oIdx, e.target.value)}
                                  className="ui-field question-option-input" required
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={handleAiAutoFill} disabled={generatingWithAi} className="btn-ai-consult ai-autofill-button">
                    <FaRobot /> {generatingWithAi ? 'AI Analyzing...' : 'Smart Auto-Fill Settings'}
                  </button>
                )}

                <div className="glass-form-grid">
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select
                      className="ui-select"
                      value={examForm.difficulty}
                      onChange={(e) => setExamForm({ ...examForm, difficulty: e.target.value })}
                      required
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Questions</label>
                    <input
                      type="number"
                      className="ui-field"
                      min="1"
                      max="50"
                      value={examForm.total_questions}
                      onChange={(e) => setExamForm({ ...examForm, total_questions: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="glass-form-grid">
                  <div className="form-group">
                    <label className="form-label">Total Marks</label>
                    <input
                      type="number"
                      className="ui-field"
                      min="1"
                      max="500"
                      value={examForm.marks}
                      onChange={(e) => setExamForm({ ...examForm, marks: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (mins)</label>
                    <input
                      type="number"
                      className="ui-field"
                      min="5"
                      max="180"
                      value={examForm.duration_minutes}
                      onChange={(e) => setExamForm({ ...examForm, duration_minutes: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Auto-Delete After (Days)</label>
                  <input
                    type="number"
                    className="ui-field"
                    min="1"
                    max="30"
                    value={examForm.expiry_days}
                    onChange={(e) => setExamForm({ ...examForm, expiry_days: Number(e.target.value) })}
                    required
                  />
                </div>
              </form>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowExamModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" onClick={handleCreateExam} disabled={creatingExam}>
                {creatingExam ? 'Generating...' : 'Generate Exam'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Data / Attendance Report Modal */}
      {showReportModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-box large report-modal">
            <div className="modal-header-gradient">
              <div className="dashboard-inline-actions report-title-row">
                <div className="report-logo-wrap">
                  <img src={teacherBrandLogo} alt="School Logo" crossOrigin="anonymous" className="school-logo-report-mini" />
                </div>
                <h3 className="modal-title">Student Performance Profile</h3>
              </div>
              <button className="close-btn" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="report-meta">
                <div className="student-info-mini">
                  <div className="student-report-avatar">
                    {selectedStudentFullDetails?.profile_image ? (
                      <img src={selectedStudentFullDetails.profile_image} alt="Student" />
                    ) : (
                      <div className="avatar-placeholder">👨‍🎓</div>
                    )}
                  </div>
                  <h3>{selectedStudentFullDetails?.name}</h3>
                  <p>Student ID: #{selectedStudentFullDetails?.id} • {selectedStudentFullDetails?.email}</p>
                </div>
                
                <div className="report-stats-grid">
                  {(() => {
                    const stats = getStudentStats(selectedStudent.id, reportMonth);
                    const studentFees = classFees.filter(f => Number(f.student_id) === Number(selectedStudent.id));
                    const feeStats = studentFees.reduce((acc, fee) => {
                      if (fee.status === 'paid') {
                        acc.paidAmount += Number(fee.amount || 0);
                      } else {
                        acc.pendingAmount += Number(fee.amount || 0);
                      }
                      return acc;
                    }, { paidAmount: 0, pendingAmount: 0 });

                    return (
                      <>
                        <div className="report-stat-box"><h4>Attendance Rate</h4><div className={`value ${stats.level}`}>{stats.percent}%</div></div>
                        <div className="report-stat-box"><h4>Days Present</h4><div className="value">{stats.present}</div></div>
                        <div className="report-stat-box"><h4>Days Absent</h4><div className="value">{stats.absent}</div></div>
                        <div className="report-stat-box"><h4>Exam Avg</h4><div className="value">{selectedStudentFullDetails?.avg_marks || 0}%</div></div>
                        <div className="report-stat-box"><h4>Fees Paid</h4><div className="value text-success">PKR {feeStats.paidAmount}</div></div>
                        <div className="report-stat-box"><h4>Fees Pending</h4><div className="value text-danger">PKR {feeStats.pendingAmount}</div></div>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="dashboard-section-spaced">
                <h4 className="section-title"><FaCalendarCheck /> Comprehensive Attendance History</h4>
                <AttendanceSection 
                  student={{ ...selectedStudentFullDetails, school_name: user?.school_name }} 
                  teacher={user} 
                  attendance={allAttendance.filter(a => Number(a.student_id) === Number(selectedStudent.id))} 
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-ui-secondary" onClick={() => setShowReportModal(false)}>Close Overview</button>
              <button className="btn-ui" onClick={handlePrintStudentReport}><FaPrint /> Generate PDF Transcript</button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Queue Manager */}
      <SyncQueueManager isOnline={isOnline} onSyncComplete={() => fetchInitialData(true)} />
    </div>
    </DashboardShell>
  );

};
export default TeacherDashboard;
