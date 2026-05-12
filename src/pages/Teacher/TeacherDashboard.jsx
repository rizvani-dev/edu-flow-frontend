import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import API from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { 
  FaUserGraduate, FaPlus, FaSignOutAlt, FaBullhorn, FaUser, FaCheckDouble, 
  FaCheck,
  FaComments, FaBell, FaPaperclip, FaDownload, FaTimes, FaFileExcel, FaEdit, FaSearch, 
  FaChartArea, FaTrash, FaPrint, FaFileCsv, FaPaperPlane, FaCalendarCheck, FaCheckSquare, 
  FaEllipsisV, FaChartPie, FaMoneyBillWave, FaSave, FaUserEdit, FaMicrophone, FaStopCircle } from "react-icons/fa";
import AnnouncementForm from "../../components/Announcements/AnnouncementForm";
import AnnouncementList from "../../components/Announcements/AnnouncementList";
import useSocket from "../../hooks/useSocket";
import ChatModal from "../../components/chat/ChatModal";
import "./teacherpanel.css";
import schoolLogo from "../../assets/logo.png";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { openTeacherAttendancePrintWindow, openTeacherReceiptPrintWindow } from "../../utils/teacherPrint";
import { resolveMediaUrl, resolveOptimizedMediaUrl } from "../../utils/media";
import { prepareUploadFile } from "../../utils/uploadMedia";
import { createOptimisticMessage, releaseOptimisticMedia } from "../../utils/chatMessage";
import { getCache, setCache, CACHE_KEYS } from "../../utils/localStorageCache";

const isImageFile = (url = '') => /\.(jpg|jpeg|png|gif|webp|svg|heic|heif)(?:\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:image/');
const isVideoFile = (url = '') => /\.(mp4|webm|ogg)(?:\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:video/');
const isAudioFile = (url = '') => /\.(mp3|wav|m4a|aac|ogg|webm|opus)(?:\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:audio/');
const isPdfFile = (fileUrl = '') => /\.pdf$/i.test(fileUrl);

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket(user?.id);

  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [salaryPopup, setSalaryPopup] = useState({ open: false, salary: null, notifId: null, loading: false });
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Chat States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatHasMore, setChatHasMore] = useState(false);
  const [chatCursor, setChatCursor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStudentFullDetails, setSelectedStudentFullDetails] = useState(null); // For report modal
  const [selectedMessages, setSelectedMessages] = useState([]); // For bulk delete
  const [selectionMode, setSelectionMode] = useState(false); // New state for selection mode
  const [deleteModal, setDeleteModal] = useState({ show: false, ids: [], canDeleteEveryone: false });

  // Profile States
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(user?.bio || "");
  const [allClasses, setAllClasses] = useState([]); // New state for all classes

  const [showChatModal, setShowChatModal] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [reactionPicker, setReactionPicker] = useState({ openForId: null });
  const [addingStudent, setAddingStudent] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingAttendance, setUploadingAttendance] = useState(false);
  const [uploadingFees, setUploadingFees] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [savingFeeEdit, setSavingFeeEdit] = useState(false);

  // Attendance States
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [attendancePage, setAttendancePage] = useState(1);
  const [hasMoreAttendance, setHasMoreAttendance] = useState(false);
  const [allAttendance, setAllAttendance] = useState([]);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editRemarks, setEditRemarks] = useState('');

  // Fee States
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [classFees, setClassFees] = useState([]);
  const [feeStats, setFeeStats] = useState([]);
  const [feeSearchTerm, setFeeSearchTerm] = useState("");
  const [feeMonthFilter, setFeeMonthFilter] = useState("all");
  const [feeStatusFilter, setFeeStatusFilter] = useState("all");
  const [feePage, setFeePage] = useState(1);
  const [hasMoreFees, setHasMoreFees] = useState(false);
  const [feeExcelFile, setFeeExcelFile] = useState(null);
  const [editingFee, setEditingFee] = useState(null);

  // Attendance Filter States
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState("all");

  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    const container = chatMessagesRef.current;
    if (!container || !showChatModal || loadingChat) return;

    const timeoutId = setTimeout(() => {
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 400;
      if (isNearBottom || container.scrollTop === 0) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [chatMessages.length, showChatModal, isTyping, loadingChat]);

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

      setChatMessages((prev) => {
        if (prev.some((message) => message.id === data.id)) return prev;
        return [...prev, data];
      });

      // Immediately mark as seen if it's the active conversation and modal is open
      if (showChatModal && senderId === Number(selectedStudent.id)) {
        socket.emit("markSeen", { senderId: senderId, receiverId: user.id, messageIds: [data.id] });
      }
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

        toast.info(
          <div style={{ minWidth: 280 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{notif.title || 'Salary update'}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{String(notif.message || '').replace(/\[salaryId:\d+\]/i, '').trim()}</div>
          </div>,
          { autoClose: 8000, closeOnClick: true, draggable: true }
        );
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
      setChatMessages((prev) => prev.map((m) => (Number(m.id) === Number(messageId) ? { ...m, reactions } : m)));
    };

    socket.on("messagesDeleted", handleMessagesDeleted);
    socket.on("typing", handleTyping);
    socket.on("userStatusUpdate", handleUserStatusUpdate);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("messageReactionUpdated", handleMessageReactionUpdated);

    return () => {
      socket.off("messagesDeleted", handleMessagesDeleted);
      socket.off("typing", handleTyping);
      socket.off("userStatusUpdate", handleUserStatusUpdate);
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("messageReactionUpdated", handleMessageReactionUpdated);
    };
  }, [socket, user?.id, selectedStudent?.id]);

    

  const fetchStudents = async () => {
    try {
      const cacheKey = CACHE_KEYS.TEACHER_STUDENTS(user.id);
      const cached = getCache(cacheKey);
      if (Array.isArray(cached)) setStudents(cached);

      const res = await API.get("/teacher/students");
      const data = res.data.students || res.data || [];
      setStudents(data);
      setCache(cacheKey, data);
    } catch (err) {
      toast.error("Failed to load students");
    }
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

  const handleFeeExcelUpload = async () => {
    if (!feeExcelFile) return toast.warning("Please select a file first");
    
    // Basic file type validation
    const fileName = feeExcelFile.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
      return toast.error("Invalid file format. Please upload an Excel or CSV file.");
    }

    const formData = new FormData();
    formData.append('file', feeExcelFile);
    
    try {
      toast.info(`Processing fee sheet for ${user?.class_name || 'your section'}...`);
      await API.post('/fees/upload', formData);
      toast.success("Fee sheet uploaded successfully for your class section.");
      setFeeExcelFile(null);
      // Refresh data
      await fetchClassFees();
      await fetchFeeStats();
    } catch (err) { 
      toast.error(err.response?.data?.message || "Upload failed. Please ensure the sheet contains required entries (Student_id, Month, Year, Total Fees)."); 
    }
  };

  const fetchClassFees = async (page = 1, silent = false) => {
    try {
      const res = await API.get('/fees/class-fees', { params: { page, limit: 20 } });
      const newFees = res.data.fees || [];
      setClassFees(prev => page === 1 ? newFees : [...prev, ...newFees]);
      setHasMoreFees(res.data.hasMore);
      setFeePage(page);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMoreFees = () => {
    if (hasMoreFees) {
      fetchClassFees(feePage + 1);
    }
  };


  const loadMoreAttendance = () => {
    if (hasMoreAttendance) {
      setAttendancePage(prev => prev + 1);
      // Note: Backend pagination needs to be implemented for this to fully work
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

  const filteredFees = useMemo(() => 
    classFees.filter(f => {
      const matchesSearch = f.student_name.toLowerCase().includes(feeSearchTerm.toLowerCase()) || 
                           f.student_email.toLowerCase().includes(feeSearchTerm.toLowerCase());
      const matchesMonth = feeMonthFilter === "all" || f.month === feeMonthFilter;
      const matchesStatus = feeStatusFilter === "all" || f.status === feeStatusFilter;
      return matchesSearch && matchesMonth && matchesStatus;
    }),
  [classFees, feeSearchTerm, feeMonthFilter, feeStatusFilter]);

  const handlePrintReceipt = (fee) => {
    try {
      openTeacherReceiptPrintWindow({
        fee: { ...fee, school_name: user?.school_name },
        schoolLogo,
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
        }
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
    setSelectedStudent(student);
    if (!before) {
      setChatMessages([]);
      setLoadingChat(true);
      setShowChatModal(true);
    }
    await fetchChat(student.id, before);
  }, [fetchChat]);
  
  const handleChatScroll = useCallback((e) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && chatHasMore && !loadingChat && selectedStudent && chatCursor) {
      openTeacherChat(selectedStudent, chatCursor);
    }
  }, [chatHasMore, loadingChat, selectedStudent, chatCursor, openTeacherChat]);

  const fetchAllAttendance = async () => {
    try {
      const res = await API.get('/attendance');
      setAllAttendance(res.data.attendance || []);
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

  // Helper for per-student statistics
  const getStudentStats = (studentId, filterMonth = "all") => {
    let records = allAttendance.filter(a => a.student_id === studentId);
    
    if (filterMonth !== "all") {
      records = records.filter(a => new Date(a.date).getMonth() === parseInt(filterMonth));
    }

    const total = records.length;
    if (total === 0) return { percent: 0, present: 0, absent: 0, late: 0, total: 0, level: 'good' };
    
    const present = records.filter(a => a.status === 'present').length;
    const absent = records.filter(a => a.status === 'absent').length;
    const late = records.filter(a => a.status === 'late').length;
    // Inclusion of late students in positive attendance rate
    const percent = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    
    let level = 'good';
    if (percent < 75) level = 'warning';
    if (percent < 50) level = 'danger';

    return {
      percent,
      present,
      absent,
      late,
      total,
      level
    };
  };

  // Filter Logic for Main Grid
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toString().includes(searchTerm)
  );

  // Filter Logic for Attendance Modal
  const filteredAttendance = allAttendance.filter(a => {
    const matchesSearch = a.student_name.toLowerCase().includes(attendanceSearch.toLowerCase()) || 
                         a.student_id.toString().includes(attendanceSearch);
    const date = new Date(a.date);
    const matchesMonth = monthFilter === "all" || date.getMonth() === parseInt(monthFilter);
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesMonth && matchesStatus;
  });

  const modalSummary = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(a => a.status === 'present').length,
    absent: filteredAttendance.filter(a => a.status === 'absent').length,
    late: filteredAttendance.filter(a => a.status === 'late').length,
  };

  const getReportMonthLabel = () => {
    if (reportMonth === "all") return "Full Academic Year";
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(reportMonth)] || "Custom Range";
  };

  const handlePrintStudentReport = () => {
    const studentInfo = selectedStudentFullDetails || selectedStudent;
    if (!studentInfo) {
      toast.warning("Select a student report first");
      return;
    }

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
        attendanceRows,
        reportMonthLabel: getReportMonthLabel(),
        stats: getStudentStats(selectedStudent.id, reportMonth),
        schoolLogo,
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
  };

  // Edit Attendance
  const handleEditAttendance = async () => {
    if (!editingAttendance) return;

    try {
      setSavingAttendance(true);
      await API.put(`/attendance/${editingAttendance.id}`, {
        status: editStatus,
        remarks: editRemarks
      });
      toast.success("Attendance updated successfully");
      setEditingAttendance(null);
      fetchAllAttendance();
    } catch (err) {
      toast.error("Failed to update attendance");
    } finally {
      setSavingAttendance(false);
    }
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

  const handleDeleteAttendance = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return;
    
    try {
      await API.delete(`/attendance/${id}`);
      toast.success("Record deleted");
      fetchAllAttendance();
    } catch (err) {
      toast.error("Failed to delete record");
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
        setChatMessages(prev => prev.map(msg => 
          ids.includes(msg.id) ? { 
            ...msg, 
            message: "🚫 You deleted this message", 
            file_url: null, 
            deleted: true,
            status: 'deleted' 
          } : msg
        ));
      } else {
        setChatMessages(prev => prev.filter(msg => !ids.includes(msg.id)));
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
    });
    const formData = new FormData();
    formData.append("message", newMessage.trim() || "");
    if (selectedFile) formData.append("file", selectedFile);

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

      setChatMessages(prev => prev.map((message) => message.id === optimisticMessage.id ? data.chat : message));
      setTimeout(() => releaseOptimisticMedia(optimisticMessage), 2000);

      socket.emit("broadcastMessage", data.chat);

    } catch (err) {
      releaseOptimisticMedia(optimisticMessage);
      setChatMessages(prev => prev.filter((message) => message.id !== optimisticMessage.id));
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Excel Upload
  const handleExcelUpload = async () => {
    if (!excelFile) {
      toast.error("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      setUploadingAttendance(true);
      const res = await API.post('/attendance/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Attendance uploaded successfully for your class section.");
      setShowAttendanceModal(false);
      setExcelFile(null);
      if (excelInputRef.current) excelInputRef.current.value = '';
      fetchAllAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload attendance");
    } finally {
      setUploadingAttendance(false);
    }
  };

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
      await Promise.all([
        fetchStudents(),
        fetchAnnouncements(),
        fetchNotifications(),
        fetchAllAttendance(),
        fetchClassFees(),
        fetchFeeStats()
      ]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchInitialData();
  }, [user]);

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

const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="loader-container">
        <div className="minimalist-spinner"></div>
        <p>Loading Teacher Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="teacher-container">
      {/* Navbar */}
      <div className="teacher-navbar">
        <div className="teacher-navbar-content">
          <div className="brand-block">
            <FaUserGraduate className="teacher-logo" />
            <div className="brand-copy">
              <p className="eyebrow">Teacher Workspace</p>
              <h1 className="teacher-title">Teacher Dashboard</h1>
            </div>
          </div>

          <div className="teacher-user">
            {user?.profile_image ? (
              <img src={user.profile_image} alt="Teacher" className="teacher-profile-img" />
            ) : (
              <div className="teacher-avatar-placeholder"><FaUser /></div>
            )}
            <span className="teacher-username">{user?.name}</span>

            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell />
              {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
            </div>
            <button onClick={logout} className="logout-btn">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

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
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 600,
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                background: 'white',
                overflowY: 'auto',
                maxHeight: '90vh',
                scrollbarWidth:'none',
                
                }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                padding: '20px 24px',
                borderBottom: 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                    💰 Salary Confirmation
                  </h3>
                  <button
                    className="close-btn"
                    onClick={() => setSalaryPopup({ open: false, salary: null, notifId: null, loading: false })}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      color: 'white',
                      fontSize: '18px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
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
                <div style={{ padding: '24px' }}>
                  {/* Status Badge */}
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    background: salaryPopup.salary.status === 'pending' ? '#fef3c7' :
                               salaryPopup.salary.status === 'approved' ? '#d1fae5' :
                               salaryPopup.salary.status === 'received' ? '#dbeafe' : '#fee2e2',
                    color: salaryPopup.salary.status === 'pending' ? '#92400e' :
                           salaryPopup.salary.status === 'approved' ? '#065f46' :
                           salaryPopup.salary.status === 'received' ? '#1e40af' : '#991b1b',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '20px'
                  }}>
                    {salaryPopup.salary.status === 'pending' ? '⏳ PENDING' :
                     salaryPopup.salary.status === 'approved' ? '✅ APPROVED' :
                     salaryPopup.salary.status === 'received' ? '💰 RECEIVED' : '❌ REJECTED'}
                  </div>

                  {/* Salary Details Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        📅 Period
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                        {salaryPopup.salary.month} {salaryPopup.salary.year}
                      </div>
                    </div>
                    <div style={{
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        💵 Amount
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>
                        PKR {salaryPopup.salary.amount?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Payment Screenshot */}
                  {salaryPopup.salary.payment_screenshot && (
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '12px'
                      }}>
                        📸 Payment Proof
                      </div>
                      <div style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#f8fafc'
                      }}>
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
      </div>

      <div className="teacher-content">
        {/* Teacher Profile Card */}
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

        {/* Main Dashboard Content */}
        <div id="announcements-section" className="announcement-section">
          <h2 className="section-title"><FaBullhorn /> Announcements</h2>
          <AnnouncementForm onSuccess={fetchAnnouncements} />
          <AnnouncementList 
            announcements={announcements.map(ann => ({ ...ann, isOwn: ann.created_by === user.id }))} 
            canDelete={true} 
            onDelete={handleDeleteAnnouncement}
          />
        </div>

        {/* Attendance Management */}
        <div className="attendance-upload-section">
          <h2 className="section-title"><FaFileExcel /> Attendance Management</h2>
          <button className="btn-primary attendance-btn" onClick={() => setShowAttendanceModal(true)}>
            <FaCalendarCheck /> Manage Attendance
          </button>
          <button className="btn-primary fee-btn" onClick={() => setShowFeeModal(true)}>
            <FaMoneyBillWave /> Fee Management
          </button>
        </div>

        {/* Student Search & Header */}
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
                  <div className="stat-badge"><span>Present</span><span>{stats.present}</span></div>
                  <div className="stat-badge"><span>Absent</span><span>{stats.absent}</span></div>
                </div>

                <button className="chat-btn" onClick={() => { openTeacherChat(s); setSelectedStudentFullDetails(s); }}>
                  <FaComments /> Inbox
                </button>
                <button className="btn-secondary" onClick={() => { setSelectedStudent(s); setShowReportModal(true); }}>
                  <FaChartArea /> Open Student Data
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Add New Student</h3>
            <form onSubmit={handleAddStudent} className="form">
              <div className="image-upload-area">
                <div className="preview-container">
                  {studentImagePreview ? <img src={studentImagePreview} alt="Preview" className="preview-image" /> : <div className="no-image"><FaUser size={40} /><p>Upload Photo</p></div>}
                </div>
                <label className="upload-label">
                  Choose Profile Image (Max 2MB)
                  <input type="file" accept="image/*" onChange={handleStudentImageChange} className="hidden" />
                </label>
              </div>

              <input placeholder="Full Name *" value={studentFormData.name} onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })} required />
              <input type="email" placeholder="Email Address *" value={studentFormData.email} onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })} required />
              <input type="password" placeholder="Password *" value={studentFormData.password} onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })} required />
              <input placeholder="Bio / Notes (Optional)" value={studentFormData.bio} onChange={(e) => setStudentFormData({ ...studentFormData, bio: e.target.value })} />
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddStudentModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={addingStudent}>{addingStudent ? 'Creating...' : 'Create Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showAttendanceModal && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <div className="modal-header-row">
              <h3>Attendance Management</h3>
              <button onClick={() => setShowAttendanceModal(false)} className="close-btn">×</button>
            </div>

            <div className="bulk-upload-container">
              <h4>Upload Excel Sheet</h4>
              <div className="upload-controls">
                <input type="file" ref={excelInputRef} accept=".xlsx,.xls,.csv" onChange={(e) => setExcelFile(e.target.files[0])} />
                <button onClick={handleExcelUpload} className="btn-primary" disabled={!excelFile || uploadingAttendance}>
                  <FaFileExcel /> {uploadingAttendance ? 'Uploading...' : 'Upload Excel'}
                </button>
              </div>
            </div>

            <div className="export-tools">
               <button onClick={() => exportCSV(allAttendance, 'FullAttendance')} className="btn-secondary">
                 <FaFileCsv /> Export Full CSV
               </button>
               <button onClick={() => exportCSV(filteredAttendance, 'FilteredAttendance')} className="btn-primary">
                 <FaFileCsv /> Export Filtered CSV
               </button>
            </div>

            {/* Filters */}
            <div className="modal-filters">
              <input 
                type="text" 
                placeholder="Search by Name/ID..." 
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
              />
              <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                <option value="all">All Months</option>
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>

            {/* Summary */}
            <div className="modal-summary-grid">
              <div className="summary-card"><h5>Records</h5><p>{modalSummary.total}</p></div>
              <div className="summary-card"><h5>Present</h5><p>{modalSummary.present}</p></div>
              <div className="summary-card"><h5>Absent</h5><p>{modalSummary.absent}</p></div>
              <div className="summary-card"><h5>Late</h5><p>{modalSummary.late}</p></div>
            </div>

            {/* List */}
            <div className="edit-section overflow-x-auto">
              <h4>Records ({filteredAttendance.length})</h4>
              <div className="max-h-64 overflow-y-auto">
                <table className="attendance-edit-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Remarks</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((att) => (
                      <tr key={att.id}>
                        <td>{att.student_name} <br/><small className="sub-text">ID: {att.student_id}</small></td>
                        <td>{new Date(att.date).toLocaleDateString()}</td>
                        <td><span className={`badge ${att.status}`}>{att.status}</span></td>
                        <td>{att.remarks || '-'}</td>
                        <td className="action-cell">
                            <button onClick={() => {
                              setEditingAttendance(att);
                              setEditStatus(att.status);
                              setEditRemarks(att.remarks || '');
                            }} className="edit-btn"><FaEdit /></button>
                            <button onClick={() => handleDeleteAttendance(att.id)} className="delete-btn"><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {hasMoreAttendance && (
                   <div className="pagination-row">
                     <button type="button" className="view-more-btn" onClick={loadMoreAttendance}>Load More Records</button>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fee Management Modal */}
      {showFeeModal && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <div className="modal-header-row">
              <h3>Class Fee Management</h3>
              <button onClick={() => setShowFeeModal(false)} className="close-btn">×</button>
            </div>

            <div className="modal-filters">
              <div className="search-input-wrapper">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
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

            <div className="bulk-fee-upload">
              <div className="upload-info">
                <h5>Bulk Upload Fee Sheet</h5>
                <input type="file" accept=".xlsx,.xls" onChange={(e) => setFeeExcelFile(e.target.files[0])} />
              </div>
              <button onClick={handleFeeExcelUpload} className="btn-primary" disabled={!feeExcelFile || uploadingFees}>{uploadingFees ? 'Uploading...' : 'Upload Excel'}</button>
            </div>

            <div className="fee-stats-visualization">
              <div className="chart-container">
                <h4 className="text-center mb-4">Collection Overview</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={feeStats}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {feeStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.status === 'paid' ? '#10B981' : '#EF4444'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

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

            {/* Fee Table */}
            <div className="overflow-x-auto">
              <table className="attendance-edit-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Month</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee.id}>
                      <td><small className="sub-text">#{fee.student_id}</small></td>
                      <td>{fee.student_name} <br/><small className="sub-text">{fee.student_email}</small></td>
                      <td>{fee.month} {fee.year}</td>
                      <td>${fee.amount}</td>
                      <td><span className={`badge ${fee.status}`}>{fee.status.toUpperCase()}</span></td>
                      <td className="action-cell">
                        <button onClick={() => setEditingFee(fee)} className="edit-btn" title="Manage Record"><FaEdit /></button>
                        <button onClick={() => handlePrintReceipt(fee)} className="print-btn" title="Print Receipt"><FaPrint /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hasMoreFees && (
                <div className="pagination-row">
                  <button className="view-more-btn" onClick={loadMoreFees}>Load More Fees</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Fee Modal */}
      {editingFee && (
        <div className="modal-overlay">
          <div className="modal-box small fee-action-modal">
            <h3>Update Fee Status</h3>
            <p className="sub-text mb-4">Student: <strong>{editingFee.student_name}</strong> (ID: #{editingFee.student_id})</p>
            
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
              <label>Amount Due ($)</label>
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

      {/* Student Attendance Report Modal (still opened from student card) */}
      {showReportModal && selectedStudent && selectedStudentFullDetails && (
        <div className="modal-overlay">
          <div className="modal-box large report-modal">
            <div className="report-header">
              <div className="school-branding">
                <img src={schoolLogo} alt="School Logo" className="receipt-logo-img" />
                <div className="school-name">
                  <h2>{user?.school_name || 'School Management'}</h2>
                  <p>Official Attendance Report</p>
                </div>
              </div>
              <button onClick={() => setShowReportModal(false)} className="close-btn"><FaTimes/></button>
            </div>

            <div className="report-meta">
              <div className="student-info-mini">
                <div className="student-report-avatar">
                  {selectedStudentFullDetails.profile_image ? <img src={selectedStudentFullDetails.profile_image} alt={selectedStudentFullDetails.name} /> : <div className="avatar-placeholder">👨‍🎓</div>}
                </div>
                <h3>{selectedStudentFullDetails.name}</h3>
                <p>Student ID: #{selectedStudentFullDetails.id}</p>
                <p>Class: {selectedStudentFullDetails.class_name|| "Not Assigned"}</p>
                {selectedStudentFullDetails.bio && <p className="student-report-bio">{selectedStudentFullDetails.bio}</p>}
              </div>

              <div className="report-stats-grid">
                {(() => {
                  const s = getStudentStats(selectedStudent.id, reportMonth);
                  return (
                    <>
                      <div className="report-stat-box"><h4>Attendance Rate</h4><div className={`value ${s.level}`}>{s.percent}%</div></div>
                      <div className="report-stat-box"><h4>Days Present</h4><div className="value">{s.present}</div></div>
                      <div className="report-stat-box"><h4>Days Absent</h4><div className="value">{s.absent}</div></div>
                      <div className="report-stat-box"><h4>Total Records</h4><div className="value">{s.total}</div></div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="modal-filters">
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
                {allAttendance
                  .filter(a => a.student_id === selectedStudent.id && (reportMonth === "all" || new Date(a.date).getMonth() === parseInt(reportMonth)))
                  .map(att => {
                    const attendanceDate = new Date(att.date);
                    const formattedDate = attendanceDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    const formattedTime = attendanceDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    return (
                    <tr key={att.id}>
                      <td>{formattedDate} <br/> <small className="text-gray-500">{formattedTime}</small></td>
                      <td>{att.status}</td>
                      <td>{att.remarks || "-"}</td>
                    </tr>
                  )})
                }
              </tbody>
            </table>

            <div className="report-footer-print">
              <div className="footer-branding">
                <div className="school-logo-placeholder"><img src={schoolLogo} alt="school-logo" /></div>
                <div className="school-name">
                  <h3>{user?.school_name || 'School Management'}</h3>
                  <p>Certified Attendance Report</p>
                </div>
              </div>
              <div className="report-signature-info">
                <p><strong>Generated By:</strong> {user.name} (Teacher)</p>
                <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              </div>
            </div>

            <button onClick={handlePrintStudentReport} className="print-btn">
              <FaPrint /> Print Report (Save as PDF)
            </button>
          </div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {editingAttendance && (
        <div className="modal-overlay">
          <div className="modal-box small"> {/* Added small class for better sizing */}
            <h3>Edit Attendance</h3>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
            <input placeholder="Remarks (Optional)" value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)} />
            <div className="form-actions">
              <button onClick={() => setEditingAttendance(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleEditAttendance} className="btn-primary" disabled={savingAttendance}>{savingAttendance ? 'Saving...' : 'Save Changes'}</button>
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
        inputPlaceholder="Type a message..."
        statusText={selectedStudent?.role === "admin" ? 'Administration' : selectedStudent?.online ? 'Online' : 'Offline'}
        metaText={selectedStudent?.class_name || selectedStudent?.role || "Conversation"}
        avatarFallback="S"
        onMessageContextMenu={(message, event) => {
          if (message.deleted) return;
          event.preventDefault();
          setReactionPicker({ openForId: message.id });
        }}
        renderMessageExtras={(message) => {
          const reactions = message.reactions || {};
          const reactionEntries = Object.entries(reactions).filter(([, ids]) => Array.isArray(ids) && ids.length > 0);

          return (
            <>
              {reactionEntries.length ? (
                <div className="chat-reaction-stack">
                  {reactionEntries.map(([emoji, ids]) => (
                    <button
                      key={emoji}
                      type="button"
                      className="chat-reaction-chip"
                      onClick={(event) => {
                        event.stopPropagation();
                        reactToMessage(message.id, emoji);
                      }}
                    >
                      {emoji} {ids.length}
                    </button>
                  ))}
                </div>
              ) : null}

              {reactionPicker.openForId === message.id ? (
                <div
                  className="chat-reaction-picker"
                  onClick={(event) => event.stopPropagation()}
                  onMouseLeave={() => setReactionPicker({ openForId: null })}
                >
                  {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="chat-reaction-btn"
                      onClick={() => {
                        reactToMessage(message.id, emoji);
                        setReactionPicker({ openForId: null });
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          );
        }}
      />
      {false && (
      <>
      <div className="modal-overlay chat-modal-overlay" style={{ zIndex: 2000 }}>
        <div className="chat-modal">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-avatar">
            {selectedStudent.profile_image ? (
              <img src={selectedStudent.profile_image} alt={selectedStudent.name} />
            ) : (
              <div className="avatar-placeholder">👨‍🎓</div>
            )}
          </div>
          <div>
            <h3 className="chat-user-name">{selectedStudent.name}</h3>
            <div className="status-info">
              <span className={`status-dot ${selectedStudent.online ? 'online' : 'offline'}`}></span>
              <span>{selectedStudent.role === "admin" ? 'Administration' : selectedStudent.online ? 'Online' : 'Offline'}</span>
            </div>
            <p className="chat-contact-role">{selectedStudent.class_name || selectedStudent.role || "Conversation"}</p>
          </div>
        </div>

        <div className="chat-header-actions">
          {selectedMessages.length > 0 ? (
            <>
              <span className="selection-count">{selectedMessages.length} selected</span>
              <button 
                className="header-action-btn" 
                onClick={selectAllMessages} 
                title="Select All"
              >
                <FaCheckSquare />
              </button>
              <button 
                className="header-action-btn delete-action" 
                onClick={() => openDeleteModal(selectedMessages)}
                title="Delete Selected"
              >
                <FaTrash />
              </button>
            </>
          ) : (
            <button 
              className="header-action-btn" 
              onClick={() => {
                const lastId = chatMessages[chatMessages.length - 1]?.id;
                if (lastId) {
                  setSelectedMessages([lastId]);
                  setSelectionMode(true);
                }
              }}
            >
              <FaEllipsisV />
            </button>
          )}
          <button 
            onClick={() => {
              setShowChatModal(false);
              setSelectedStudent(null);
              setIsTyping(false);
              setSelectedMessages([]);
            }} 
            className="close-btn"
            title="Close Chat"
          >
            ×
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="chat-messages" ref={chatMessagesRef} onScroll={handleChatScroll}>
        {loadingChat && <div className="text-center p-2 text-sm text-gray-500">Messages loading...</div>}
        {chatHasMore && !loadingChat && <div className="text-center p-1 text-xs text-blue-500">Scroll up to load more</div>}
        {chatMessages.map((msg) => {
          const reactions = msg.reactions || {};
          const reactionEntries = Object.entries(reactions).filter(([, ids]) => Array.isArray(ids) && ids.length > 0);
          const fileUrl = msg.file_url ? resolveMediaUrl(msg.file_url) : null;
          const mType = msg.message_type || (msg.file_url ? 'file' : 'text');
          return (
          <div 
            key={msg.id} 
            className={`message ${msg.sender_id === user.id ? 'sent' : 'received'} 
              ${selectedMessages.includes(msg.id) ? 'selected' : ''}
              ${selectionMode ? 'in-selection-mode' : ''} 
              ${msg.deleted ? 'deleted-msg' : ''}`}
            onDoubleClick={() => !msg.deleted && toggleMessageSelection(msg.id)}
            onClick={() => !msg.deleted && selectionMode ? toggleMessageSelection(msg.id) : null}
            onContextMenu={(event) => {
              if (msg.deleted) return;
              event.preventDefault();
              setReactionPicker({ openForId: msg.id });
            }}
          >
            {!msg.deleted && msg.file_url && fileUrl && (
              <div className="file-message">
                {(mType === 'image' || isImageFile(msg.file_url)) ? (
                  <img 
                    src={fileUrl} 
                    alt={msg.file_name || "Image"} 
                    className="chat-image"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Error+Loading+Image'; }}
                    onClick={(e) => { e.stopPropagation(); openLightbox(fileUrl); }}
                  />
                ) : isVideoFile(msg.file_url) ? (
                  <video controls className="chat-video">
                    <source src={fileUrl} />
                  </video>
                ) : isAudioFile(msg.file_url) ? (
                  <audio controls className="chat-audio">
                    <source src={fileUrl} />
                  </audio>
                ) : msg.file_url.match(/\.pdf$/i) ? (
                  <a className="file-attachment" href={fileUrl} target="_blank" rel="noreferrer">
                    📄 {msg.file_name || "PDF"}
                  </a>
                ) : (
                  <div className="file-attachment">
                    📎 {msg.file_name || "File"}
                  </div>
                )}
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); saveFile(msg.file_url, msg.file_name); }}
                  className="download-btn"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <FaDownload /> Save
                </button>
              </div>
            )}

            {msg.message && <p className="message-text">{msg.message}</p>}

            {reactionEntries.length ? (
              <div className="message-reactions">
                {reactionEntries.map(([emoji, ids]) => (
                  <button
                    key={emoji}
                    type="button"
                    className="reaction-chip"
                    onClick={(event) => {
                      event.stopPropagation();
                      reactToMessage(msg.id, emoji);
                    }}
                    title="Toggle reaction"
                  >
                    {emoji} {ids.length}
                  </button>
                ))}
              </div>
            ) : null}

            {reactionPicker.openForId === msg.id ? (
              <div
                className="reaction-picker"
                onClick={(event) => event.stopPropagation()}
                onMouseLeave={() => setReactionPicker({ openForId: null })}
              >
                {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="reaction-btn"
                    onClick={() => {
                      reactToMessage(msg.id, emoji);
                      setReactionPicker({ openForId: null });
                    }}
                  >
                    {emoji}
                  </button>
                ))}
                <button type="button" className="reaction-btn" onClick={() => setReactionPicker({ openForId: null })}>
                  <FaSmile />
                </button>
              </div>
            ) : null}

            <div className="message-footer">
              <small className="message-timestamp">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </small>
              {msg.sender_id === user.id ? (
                msg.status === 'seen' ? (
                  <FaCheckDouble className="seen-icon" />
                ) : (
                  <FaCheck className="sent-icon" />
                )
              ) : null}
            </div>
          </div>
        )})}

        {isTyping && (
          <div className="typing-indicator">
            <span>{selectedStudent.name} is typing</span>
            <span className="typing-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        )}
      </div>

      {/* Chat Input Area */}
      <div className="chat-input-area">
        {selectedFile && (
          <div className="selected-file-info">
            <span>📎 {selectedFile.name}</span>
            <button onClick={removeSelectedFile} className="remove-file-btn" title="Remove file">
              <FaTimes />
            </button>
          </div>
        )}

        <div className="input-wrapper">
          <label className="attach-btn">
            <FaPaperclip />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*,application/pdf,video/*,audio/*" 
            />
          </label>

          <button
            type="button"
            className={`attach-btn ${isRecording ? 'recording' : ''}`}
            onClick={() => (isRecording ? stopVoiceRecording() : startVoiceRecording())}
            title={isRecording ? 'Stop recording' : 'Record voice message'}
          >
            {isRecording ? <FaStopCircle /> : <FaMicrophone />}
          </button>

          <input 
            value={newMessage} 
            onChange={handleTyping} 
            placeholder="Type a message..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

            <button type="button" onClick={sendMessage} className="send-btn text-send-btn" title="Send message" disabled={sendingMessage}>
              {sendingMessage ? <small>Sending...</small> : <FaPaperPlane />}
          </button>
        </div>
      </div>
    </div>
  </div>
      </>
      )}

      {/* WhatsApp Style Delete Confirmation Modal */}
{deleteModal.show && (
  <div className="modal-overlay delete-modal-overlay" style={{ zIndex: 3000 }}>
    <div className="delete-modal" style={{ zIndex: 3001 }}>
      <h4 className="delete-modal-title">Delete Message?</h4>
      
      <div className="delete-modal-options">
        {deleteModal.canDeleteEveryone && (
          <button 
            className="delete-option delete-everyone"
            onClick={() => handleDeleteConfirmed('everyone')}
          >
            Delete for everyone
          </button>
        )}
        
        <button 
          className="delete-option delete-for-me"
          onClick={() => handleDeleteConfirmed('me')}
        >
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

      {/* Lightbox */}
      {false && lightboxImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}><FaTimes /></button>
            <img src={lightboxImage} alt="Preview" className="lightbox-image" />
            <button 
              onClick={() => saveFile(lightboxImage)}
              className="lightbox-download-btn"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              <FaDownload /> Save Image
            </button>
          </div>
        </div>
      )}
    </div>
  );

};
export default TeacherDashboard;
