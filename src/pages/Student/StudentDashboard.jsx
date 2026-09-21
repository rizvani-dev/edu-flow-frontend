import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import API from "../../api/axiosInstance";
import { toast } from "react-hot-toast";
import {
  FaBullhorn, FaUser, FaComments, FaBell, FaCalendarCheck, FaMoneyBillWave,
  FaBookOpen, FaChartLine, FaTimes, FaDownload, FaChevronLeft, FaChevronRight,
  FaChartArea, FaChartBar, FaCheck, FaHome, FaCloud
} from "react-icons/fa";
import useSocket from "../../hooks/useSocket";
import ChatModal from "../../components/chat/ChatModal";
import DashboardShell from "../../components/layout/DashboardShell";
import AiInsightPanel from "../../components/ai/AiInsightPanel";
import AnnouncementList from "../../components/Announcements/AnnouncementList";
import { resolveMediaUrl } from "../../utils/media";
import { getCache, setCache, CACHE_KEYS, getUiState, setUiState } from "../../utils/localStorageCache";
import { createOptimisticMessage, releaseOptimisticMedia } from "../../utils/chatMessage";
import { addToSyncQueue } from "../../utils/syncManager";
import SyncQueueManager from "../../components/common/SyncQueueManager";
import { prepareUploadFile } from "../../utils/uploadMedia";
import FeeSection from '../../components/Student/FeeSection';
import TeacherCard from '../../components/Student/TeacherCard';
import AttendanceSection from '../../components/Attendance/AttendanceSection';
import { openWeeklyHomeworkPrintWindow } from "../../utils/homeworkPrint";
import schoolLogo from "../../assets/logo.png";

import "./studentPanel.css"; // Ensure this CSS file exists or use teacherpanel.css variables
import "../../styles/modalSystem.css";
import "../../styles/glassSystem.css";
import "../../styles/designTokens.css";

const ATTENDANCE_LIMIT = 10;

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket(user?.id);
  
  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attendancePage, setAttendancePage] = useState(0);

  // UI States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(() => getUiState(CACHE_KEYS.DASHBOARD_VIEW('student', user?.id || 'anon'), 'overview'));

  // Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [activeChatContact, setActiveChatContact] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatHasMore, setChatHasMore] = useState(false);
  const [chatCursor, setChatCursor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, ids: [], canDeleteEveryone: false });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Fee Payment Modal States
  const [feePaymentModal, setFeePaymentModal] = useState({ open: false });
  const [feePaymentTxId, setFeePaymentTxId] = useState('');
  const [feePaymentScreenshot, setFeePaymentScreenshot] = useState(null);
  const [feePaymentFeeId, setFeePaymentFeeId] = useState('');
  const [feePaymentSubmitting, setFeePaymentSubmitting] = useState(false);
  const [currentFee, setCurrentFee] = useState(null);
  const [eligibleMonths, setEligibleMonths] = useState([]);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
  const [openingChatId, setOpeningChatId] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const playSound = useCallback((type = 'chat') => {
    const soundUrl = type === 'chat' 
      ? "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3" 
      : "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3";
    const audio = new Audio(soundUrl);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus); window.addEventListener('offline', handleStatus);
    return () => { window.removeEventListener('online', handleStatus); window.removeEventListener('offline', handleStatus); };
  }, []);

  const teacherContact = useMemo(() => {
    const teacher = dashboardData?.teacher;
    if (!teacher?.id) return null;

    return {
      id: teacher.id,
      name: teacher.name,
      role: 'teacher',
      class_name: teacher.class_name,
      profile_image: teacher.profile_image,
      online: teacher.online,
      bio: teacher.bio,
    };
  }, [dashboardData?.teacher]);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const feeStats = useMemo(() => {
    const paid = fees.filter((f) => String(f.status).toLowerCase() === 'paid');
    const pending = fees.filter((f) => String(f.status).toLowerCase() !== 'paid');
    const sum = (arr) => arr.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    return {
      paidCount: paid.length,
      pendingCount: pending.length,
      paidAmount: sum(paid),
      pendingAmount: sum(pending),
    };
  }, [fees]);

  const feeReminders = useMemo(() => fees.filter((fee) => {
    const status = String(fee.status || '').toLowerCase();
    return ['unpaid', 'overdue', 'rejected'].includes(status) && fee.selectable !== false;
  }), [fees]);

  const attendanceRate = useMemo(() => {
    if (!dashboardData?.student) return 0;
    return dashboardData.student.performance || 0;
  }, [dashboardData?.student]);

  // Filter homework for the current week
  const weeklyHomework = useMemo(() => {
    if (!dashboardData?.homework) return [];
    const now = new Date();
    // Start of current week (Sunday)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    
    return dashboardData.homework.filter(hw => new Date(hw.assigned_date) >= startOfWeek);
  }, [dashboardData?.homework]);

  useEffect(() => {
    if (!user?.id) return;
    setUiState(CACHE_KEYS.DASHBOARD_VIEW('student', user.id), activeWorkspace);
  }, [activeWorkspace, user?.id]);

  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleReceiveMessage = (message) => {
      const senderId = Number(message.sender_id || message.senderId);
      const receiverId = Number(message.receiver_id || message.receiverId);

      if (!activeChatContact?.id) return;

      const isCurrentConversation =
        (senderId === Number(activeChatContact.id) && receiverId === Number(user.id)) ||
        (senderId === Number(user.id) && receiverId === Number(activeChatContact.id));

      if (!isCurrentConversation) return; // Removed unnecessary variable assignment

      if (senderId !== Number(user.id)) {
        playSound('chat');
      }

      setChatMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));

      // If the chat is open and we are receiving a message, mark as seen
      if (showChatModal && senderId === Number(activeChatContact.id)) {
        socket.emit('markSeen', { senderId, receiverId: user.id, messageIds: [message.id] });
      }
    };

    const handleTyping = ({ senderId }) => {
      if (Number(senderId) !== Number(activeChatContact?.id)) return; // Removed unnecessary variable assignment
      setIsTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1800);
    };

    const handleMessagesSeen = ({ receiverId, messageIds }) => {
      if (Number(receiverId) !== Number(activeChatContact?.id)) return;
      setChatMessages((prev) => // Removed unnecessary variable assignment
        prev.map((message) =>
          (messageIds?.length
            ? messageIds.includes(message.id)
            : message.receiver_id === receiverId && message.sender_id === user.id)
            ? { ...message, status: 'seen' }
            : message
        )
      );
    };

    const handleMessagesDeleted = ({ messageIds }) => {
      setChatMessages((prev) => // Removed unnecessary variable assignment
        prev.map((message) =>
          messageIds.includes(message.id)
            ? { ...message, message: '🚫 This message was deleted', file_url: null, deleted: true }
            : message
        )
      );
      setSelectedMessages([]);
      setSelectionMode(false);
    };

    const handleUserStatusUpdate = ({ userId: statusUserId, online, last_seen }) => {
      if (Number(statusUserId) === Number(teacherContact?.id)) { // Removed unnecessary variable assignment
        setDashboardData((prev) => ({
          ...prev,
          teacher: prev?.teacher ? { ...prev.teacher, online, last_seen } : prev?.teacher,
        }));
      }

      if (Number(statusUserId) === Number(activeChatContact?.id)) {
        setActiveChatContact((prev) => (prev ? { ...prev, online, last_seen } : prev)); // Removed unnecessary variable assignment
      }
    };

    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        if (prev.some((item) => item.id === notification.id)) return prev;
        return [notification, ...prev];
      });

      // Play sound for alerts
      if (notification.type !== 'chat' || !showChatModal) {
        playSound('notification');
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('messagesSeen', handleMessagesSeen);
    socket.on('messagesDeleted', handleMessagesDeleted);
    socket.on('userStatusUpdate', handleUserStatusUpdate);
    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('messagesSeen', handleMessagesSeen);
      socket.off('messagesDeleted', handleMessagesDeleted);
      socket.off('userStatusUpdate', handleUserStatusUpdate);
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, activeChatContact?.id, teacherContact?.id, user?.id]);

  // Handle real-time data updates (e.g., fee approval from Admin)
  useEffect(() => {
    if (!socket || !user?.id) return;
    
    const handleDataUpdate = () => {
      fetchDashboard(true); // Silent refresh
    };

    socket.on('dashboardDataUpdate', handleDataUpdate);
    return () => socket.off('dashboardDataUpdate', handleDataUpdate);
  }, [socket, user?.id]);

  useEffect(() => { // Removed unnecessary variable assignment
    if (!showChatModal || !activeChatContact?.id || !chatMessages.length) return;

    const unreadMessageIds = chatMessages
      .filter((message) => Number(message.sender_id) === Number(activeChatContact.id) && message.status !== 'seen')
      .map((message) => message.id);

    if (unreadMessageIds.length > 0) {
      socket.emit('markSeen', {
        senderId: activeChatContact.id,
        receiverId: user.id,
        messageIds: unreadMessageIds,
      });
    }
  }, [activeChatContact?.id, chatMessages, showChatModal, user?.id]);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!user?.id) return;
    const cacheKey = CACHE_KEYS.STUDENT_DASHBOARD(user.id);
    
    // 1. Try Loading from Cache
    const cached = getCache(cacheKey);
    if (cached && !silent) {
      setDashboardData(cached.dashboard);
      setAnnouncements(cached.announcements || []);
      setFees(cached.fees || []);
      setNotifications(cached.notifications || []);
      setLoading(false);
    }

    try {
      setLoadError(false);
      if (!silent && !cached) setLoading(true);
      // Only the dashboard itself is required to open the workspace. Supporting
      // panels can retain cached data when a secondary request is unavailable.
      const [dashboardResult, feesResult, notificationsResult, currentFeeResult, eligibleResult] = await Promise.allSettled([
        API.get('/student/dashboard'),
        API.get('/fees/my-fees'),
        API.get('/student/notifications'),
        API.get('/fees/current'),
        API.get('/fees/eligible-months'),
      ]);

      if (dashboardResult.status !== 'fulfilled') throw dashboardResult.reason;

      const freshData = { 
        dashboard: dashboardResult.value.data.dashboard,
        announcements: dashboardResult.value.data.dashboard?.announcements || cached?.announcements || [],
        fees: feesResult.status === 'fulfilled' ? feesResult.value.data.fees || [] : cached?.fees || [],
        notifications: notificationsResult.status === 'fulfilled' ? notificationsResult.value.data.notifications || [] : cached?.notifications || [],
        currentFee: currentFeeResult.status === 'fulfilled' ? currentFeeResult.value.data.currentFee : null,
        eligibleMonths: eligibleResult.status === 'fulfilled' ? eligibleResult.value.data.eligibleMonths || [] : [],
      };
      setDashboardData(freshData.dashboard);
      setAnnouncements(freshData.announcements || []);
      setFees(freshData.fees || []);
      setNotifications(freshData.notifications || []);
      setCurrentFee(freshData.currentFee);
      setEligibleMonths(freshData.eligibleMonths || []);
      
      // 2. Update Cache
      setCache(cacheKey, freshData);
    } catch (error) {
      if (error.response?.status === 403) {
        const msg = error.response?.data?.message || 'Your school access is currently paused.';
        toast.error(msg, { id: 'school-paused-error' });
        setTimeout(() => logout(), 2500);
        return;
      }
      console.error("Failed to load dashboard data:", error);
      setLoadError(!cached);
      if (!cached) toast.error('Unable to load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [logout, user?.id]);

  const resetComposer = () => {
    setNewMessage('');
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openChatWithContact = useCallback(async (contact, before = null) => { // Removed unnecessary variable assignment
    if (!contact?.id) {
      toast('No chat contact is available right now', { icon: '⚠️' });
      return;
    }
    setOpeningChatId(contact.id);

    const cacheKey = CACHE_KEYS.CHAT_HISTORY(contact.id);

    if (!before) {
      setChatMessages([]);
      
      // 1. Instant load from Chat Cache
      const cachedChat = getCache(cacheKey);
      if (Array.isArray(cachedChat)) {
        setChatMessages(cachedChat);
      } else {
        setLoadingChat(true);
      }
      setShowChatModal(true);
    }

    setActiveChatContact(contact);
    setSelectedMessages([]);
    setSelectionMode(false);
    
    try {
      const params = before ? { before, limit: 25 } : { limit: 25 };
      const res = await API.get(`/student/chat/conversation/${contact.id}`, { params });
      const serverHistory = res.data.messages || [];
      
      setChatHasMore(res.data.hasMore);
      setChatCursor(res.data.pagination?.nextCursor || null);

      setChatMessages(prev => {
        const combined = before ? [...serverHistory, ...prev] : serverHistory;
        
        // 2. Update Chat Cache
        if (!before) setCache(cacheKey, combined, 60);
        return combined;
      });
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setLoadingChat(false);
      setOpeningChatId(null);
    }
  }, [user.id]);

  const handleChatScroll = useCallback((e) => { // Removed unnecessary variable assignment
    if (e.currentTarget.scrollTop === 0 && chatHasMore && !loadingChat && chatCursor) {
      openChatWithContact(activeChatContact, chatCursor);
    }
  }, [chatHasMore, loadingChat, activeChatContact, chatCursor, openChatWithContact]);

  const sendMessage = async () => {
    if (!activeChatContact?.id) {
      toast('Open a conversation first', { icon: '💬' });
      return;
    }

    if (!newMessage.trim() && !selectedFile) { // Removed unnecessary variable assignment
      toast('Please type a message or select a file', { icon: '⚠️' });
      return;
    }

    if (!navigator.onLine) {
      addToSyncQueue({ 
        type: 'chat', 
        method: 'POST', 
        url: `/student/chat/conversation/${activeChatContact.id}`, 
        payload: { message: newMessage.trim() } 
      });
      toast("Offline: Message queued for sync", { icon: '☁️' });
      setNewMessage("");
      return;
    }

    setSendingMessage(true);
    const optimisticMessage = createOptimisticMessage({
      senderId: user.id,
      receiverId: activeChatContact.id,
      message: newMessage,
      file: selectedFile,
    });
    const formData = new FormData();
    formData.append('message', newMessage.trim() || '');
    if (selectedFile) formData.append('file', selectedFile);

    try {
      setChatMessages((prev) => [...prev, optimisticMessage]);
      resetComposer();
      const { data } = await API.post(`/student/chat/conversation/${activeChatContact.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setChatMessages((prev) => prev.map((message) => message.id === optimisticMessage.id ? data.chat : message));
      setTimeout(() => releaseOptimisticMedia(optimisticMessage), 2000);
      socket.emit('broadcastMessage', data.chat);
    } catch (error) {
      releaseOptimisticMedia(optimisticMessage);
      setChatMessages((prev) => prev.filter((message) => message.id !== optimisticMessage.id));
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const openDeleteModal = (ids) => { // Removed unnecessary variable assignment
    const allSentByUser = ids.every((id) => {
      const message = chatMessages.find((item) => item.id === id);
      return message && message.sender_id === user.id;
    });

    setDeleteModal({ show: true, ids, canDeleteEveryone: allSentByUser });
  };

  const handleDeleteConfirmed = async (type) => { // Removed unnecessary variable assignment
    try {
      const { ids } = deleteModal;
      await API.post('/student/chat/bulk-delete', { messageIds: ids, type });

      if (type === 'everyone') {
        socket.emit('deleteMessages', { receiverId: activeChatContact.id, messageIds: ids });
        setChatMessages((prev) =>
          prev.map((message) =>
            ids.includes(message.id)
              ? {
                  ...message,
                  message: 'You deleted this message',
                  file_url: null,
                  deleted: true,
                  status: 'deleted',
                }
              : message
          )
        );
      } else {
        setChatMessages((prev) => prev.filter((message) => !ids.includes(message.id)));
      }

      setSelectedMessages([]);
      setSelectionMode(false);
      setDeleteModal({ show: false, ids: [], canDeleteEveryone: false });
      toast.success(type === 'everyone' ? 'Deleted for everyone' : 'Deleted for me');
    } catch {
      toast.error('Deletion failed');
    }
  };

  const toggleMessageSelection = (id) => { // Removed unnecessary variable assignment
    setSelectedMessages((prev) => {
      const nextSelection = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      setSelectionMode(nextSelection.length > 0);
      return nextSelection;
    });
  };

  const selectAllMessages = () => { // Removed unnecessary variable assignment
    if (selectedMessages.length === chatMessages.length) {
      setSelectedMessages([]);
      setSelectionMode(false);
      return;
    }

    setSelectedMessages(chatMessages.map((message) => message.id));
    setSelectionMode(true);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const preparedFile = await prepareUploadFile(file, { maxBytes: 10 * 1024 * 1024, maxSizeMB: 2 });
      setSelectedFile(preparedFile);
      setFilePreview(preparedFile.type.startsWith('image/') ? URL.createObjectURL(preparedFile) : null);
    } catch (error) {
      toast.error(error.message || 'File must be less than 10MB');
      event.target.value = '';
    }
  };

  const handleFeePaymentScreenshotChange = async (event) => { // Removed unnecessary variable assignment
    const file = event.target.files?.[0] || null;
    if (!file) return;

    try {
      const preparedFile = await prepareUploadFile(file, { maxBytes: 5 * 1024 * 1024, maxSizeMB: 1.5 });
      setFeePaymentScreenshot(preparedFile);
    } catch (error) {
      toast.error(error.message || 'Screenshot must be under 5MB');
      event.target.value = '';
    }
  };

  const removeSelectedFile = () => { // Removed unnecessary variable assignment
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startVoiceRecording = async () => {
    try { // Removed unnecessary variable assignment
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

  const stopVoiceRecording = () => { // Removed unnecessary variable assignment
    try {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecording(false);
    }
  };

  const handleTyping = (event) => { // Removed unnecessary variable assignment
    setNewMessage(event.target.value);
    if (activeChatContact?.id) {
      socket.emit('typing', { senderId: user.id, receiverId: activeChatContact.id });
    }
  };

  const saveFile = async (url, originalName) => {
    try { // Removed unnecessary variable assignment
      const fullUrl = resolveMediaUrl(url);
      if (!fullUrl) throw new Error('Invalid file URL');
      
      // Use the URL as is since backend now provides absolute URLs
      const response = await fetch(fullUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = originalName || fullUrl.split('/').pop().split('?')[0];
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Blob download failed, falling back to direct link:", err);
      // Fallback for CORS or fetch issues
      const link = document.createElement('a');
      link.href = resolveMediaUrl(url);
      link.target = '_blank';
      link.download = originalName || 'download';
      link.click();
    }
  };

  const handleDownloadReceipt = async (fee) => {
    const requestId = fee?.payment_request_id;
    if (!requestId) return toast.error('Receipt is available after an approved payment request');
    setDownloadingReceiptId(requestId);
    try {
      const response = await API.get(`/fees/payment-requests/${requestId}/receipt`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EduFlow-Fee-Receipt-${fee.month || 'Fee'}-${fee.year || ''}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Fee receipt downloaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not download receipt. Ensure payment is approved.');
    } finally { setDownloadingReceiptId(null); }
  };

  const submitFeePaymentRequest = async () => {
    if (!feePaymentFeeId) return toast.error('Select an eligible monthly fee');
    if (!feePaymentTxId.trim()) return toast.error('Transaction ID is required');
    if (!feePaymentScreenshot) return toast.error('Payment screenshot is required');
    try {
      setFeePaymentSubmitting(true);
      const form = new FormData();
      form.append('transaction_id', feePaymentTxId.trim());
      if (feePaymentFeeId) form.append('fee_id', feePaymentFeeId);
      form.append('screenshot', feePaymentScreenshot);
      await API.post('/fees/payment-requests', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Payment request submitted successfully! Admin will review shortly.');
      setFeePaymentModal({ open: false });
      setFeePaymentTxId('');
      setFeePaymentScreenshot(null);
      setFeePaymentFeeId('');
      await fetchDashboard(true);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit request');
    } finally {
      setFeePaymentSubmitting(false);
    }
  };

  const handleDownloadWeeklyDiary = () => { // Removed unnecessary variable assignment
    if (!weeklyHomework.length) {
      return toast("No homework assigned for this week yet.", { icon: '📚' });
    }
    
    openWeeklyHomeworkPrintWindow({
      student: dashboardData?.student,
      homework: weeklyHomework,
      schoolLogo: dashboardData?.student?.school_logo_url || user?.school_logo_url || schoolLogo,
      schoolName: dashboardData?.student?.school_name || user?.school_name || "School Learning Management",
      generatedAt: new Date().toLocaleDateString()
    });
  };

  const markAsRead = async (notificationId) => { // Removed unnecessary variable assignment
    try {
      await API.put(`/student/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = async (notification) => { // Removed unnecessary variable assignment
    await markAsRead(notification.id);
    setShowNotifications(false);

    if (notification.type === 'announcement') {
      document.getElementById('announcements-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (['fee_payment_approved', 'fee_payment_rejected', 'fee_payment_request'].includes(notification.type)) {
      setActiveWorkspace('fees');
      await fetchDashboard(true);
      return;
    }

    if (notification.type !== 'chat') return;

    const relatedId = Number(notification.related_user_id);
    const contact =
      teacherContact && Number(teacherContact.id) === relatedId
        ? teacherContact
        : {
            id: relatedId,
            name: 'School Admin',
            role: 'admin',
            class_name: dashboardData?.student?.class_name || 'School Support',
            online: false,
          };

    await openChatWithContact(contact);
  };

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    setAttendancePage(0);
  }, [dashboardData?.attendance?.length]);

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="minimalist-spinner"></div>
        <p>Loading Student Dashboard...</p>
      </div>
    );
  }

  if (loadError && !dashboardData) {
    return (
      <div className="loader-container" role="alert">
        <h2>We couldn’t load your dashboard</h2>
        <p>Please check your connection and try again.</p>
        <button type="button" className="btn-primary glass-btn" onClick={() => void fetchDashboard()}>
          Try again
        </button>
      </div>
    );
  }


  const { student, results, teacher, homework, exams } = dashboardData || {}; // Removed unnecessary variable assignment
  const schoolBrandLogo = student?.school_logo_url || user?.school_logo_url || schoolLogo;

  return (
    <DashboardShell
      title={student?.school_name || user?.school_name || 'Edu Flow'}
      subtitle={`Welcome back, ${student?.name || user?.name || 'student'}`}
      roleLabel="Student Portal"
      logoUrl={schoolBrandLogo}
      userName={student?.name || user?.name}
      userRole={student?.class_name || 'Student'}
      activeItem={activeWorkspace}
      onNavChange={setActiveWorkspace}
      notificationCount={unreadCount}
      onNotifications={() => setShowNotifications((prev) => !prev)}
      onLogout={logout}
      navItems={[
        { id: 'overview', label: 'My Profile', icon: FaHome },
        { id: 'academics', label: 'Academics', icon: FaChartBar },
        { id: 'attendance', label: 'Attendance', icon: FaCalendarCheck },
        { id: 'fees', label: 'Fees', icon: FaMoneyBillWave, badge: feeReminders.length || undefined },
        { id: 'teacher', label: 'My Teacher', icon: FaUser },
        { id: 'communication', label: 'Communication', icon: FaComments, badge: unreadCount || undefined },
      ]}
    >
    <div className="student-container dashboard-frame">
        {!isOnline && (
          <div className="offline-status-bar">
             <FaCloud /> Offline Mode: Features limited until reconnected.
          </div>
        )}

        {showNotifications ? (
          <div className="notification-dropdown admin-notif student-notif-dropdown">
            <div className="notification-dropdown-head">
              <header>
                <h4>Student Updates</h4>
                <p>School notices, messages, and fee updates</p>
              </header>
              <aside className="notification-head-actions">
                <span className="notification-summary">{unreadCount} unread</span>
                <button type="button" className="close-btn notif-close-btn" onClick={() => setShowNotifications(false)} aria-label="Close notifications"><FaTimes /></button>
              </aside>
            </div>
            {notifications.length === 0 ? (
              <p className="no-notif">No new notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <small>{new Date(notification.created_at).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        ) : null}

      <div className="student-main">
        {['overview', 'teacher', 'fees', 'attendance'].includes(activeWorkspace) ? (
        <>
        {activeWorkspace === 'overview' ? (
        <div className="student-welcome-card student-hero-card">
          <div className="student-avatar-large">
            {student?.profile_image ? (
              <img src={student.profile_image} alt={student.name} />
            ) : (
              <div className="avatar-placeholder-large">S</div>
            )}
          </div>
          <div className="student-hero-copy">
            <h2 className="welcome-text">Hello, {student?.name}</h2>
            <p className="class-info">
              Class: <strong>{student?.class_name || 'Not Assigned'}</strong>
            </p>
          <div className="student-hero-stats" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <div className="hero-stat-pill">
                <FaBell />
                <span>{unreadCount} unread notifications</span>
              </div>
              <div className="hero-stat-pill">
                <FaCheck />
                <span>Attendance: <strong>{attendanceRate || 0}%</strong></span>
              </div>
              <div className="hero-stat-pill">
                <FaChartArea />
                <span>Avg Score: <strong>{student?.avg_marks || 0}/100</strong></span>
              </div>
              <div className="hero-stat-pill">
                <FaMoneyBillWave />
                <span>Pending Fees: <strong>PKR {feeStats.pendingAmount}</strong></span>
              </div>
            </div>
          </div>
        </div>
        ) : null}

        {activeWorkspace === 'overview' ? (
        <>
        <AiInsightPanel 
          title="AI Learning Companion"
          subtitle="Personalized insights based on your attendance and performance"
          summary={`You have an attendance rate of ${attendanceRate}%. ${attendanceRate > 80 ? 'Excellent consistency!' : 'Try to improve your attendance to stay on track.'}`}
          progressPercent={attendanceRate}
          confidencePercent={92}
          sections={[
            {
              title: "Academic Standing",
              items: [
                `${homework?.length || 0} Active Homework assignments`,
                `${exams?.filter(e => !e.completed_at).length || 0} Pending AI Exams`,
                `Fee Status: ${fees[0]?.status || 'N/A'}`
              ]
            }
          ]}
        />

        <div className="info-card">
          <h3>
            <FaUser className="dashboard-inline-icon" /> Your Profile
          </h3>
          <div className="profile-grid">
            <div>
              <p className="label">Email</p>
              <p className="value">{student?.email}</p>
            </div>
            <div>
              <p className="label">Student ID</p>
              <p className="value">#{student?.id}</p>
            </div>
            <div>
              <p className="label">Class</p>
              <p className="value">{student?.class_name || 'Not Assigned'}</p>
            </div> {/* Removed unnecessary variable assignment */}
          </div>
          {student?.bio ? (
            <div className="bio-section">
              <p className="label">Bio</p>
              <p className="bio-text">{student.bio}</p>
            </div>
          ) : null}
        </div>

        </>
        ) : null}

        {activeWorkspace === 'fees' ? (
        <FeeSection
          fees={fees}
          feeStats={feeStats}
          currentFee={currentFee}
          reminderFees={feeReminders}
          onPayFeeClick={(fee) => {
            const status = String(fee?.status || '').toLowerCase();
            if (!fee?.id || fee.selectable === false || !['unpaid', 'overdue', 'rejected'].includes(status)) {
              return toast.error('This month is not eligible for payment');
            }
            setFeePaymentFeeId(String(fee.id));
            setFeePaymentModal({ open: true });
          }}
          onDownloadReceipt={handleDownloadReceipt}
          downloadingReceiptId={downloadingReceiptId}
        />
        ) : null}

        {activeWorkspace === 'teacher' ? (
        <TeacherCard // Removed unnecessary variable assignment
          teacher={teacher}
          onMessageClick={() => openChatWithContact(teacherContact)}
          isOpening={openingChatId === teacherContact?.id}
        />
        ) : null}

        {activeWorkspace === 'attendance' ? (
        <div className="info-card">
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>
              <FaChartArea /> Recent Attendance {/* Removed unnecessary variable assignment */}
            </h3>
            {dashboardData?.attendance?.length > ATTENDANCE_LIMIT && (
              <div className="pagination-controls">
                <button 
                  className="pagi-icon-btn glass-btn" 
                  onClick={() => setAttendancePage(p => Math.max(0, p - 1))}
                  disabled={attendancePage === 0}
                >
                  <FaChevronLeft />
                </button>
                <span className="sub-text">Page {attendancePage + 1}</span>
                <button 
                  className="pagi-icon-btn glass-btn" 
                  onClick={() => setAttendancePage(p => p + 1)}
                  disabled={(attendancePage + 1) * ATTENDANCE_LIMIT >= (dashboardData?.attendance?.length || 0)}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
          <AttendanceSection 
            student={student} // Removed unnecessary variable assignment
            teacher={null}
            attendance={dashboardData?.attendance}
            page={attendancePage}
            limit={ATTENDANCE_LIMIT}
          />
        </div>
        ) : null}
        </>
        ) : null}

        {activeWorkspace === 'academics' ? (
        <>
        <div className="info-card">
          <h3>
            <FaChartBar /> Your Results {/* Removed unnecessary variable assignment */}
          </h3>
          {results?.length ? (
            <table className="student-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.subject}</td>
                    <td>
                      <strong>{result.marks}</strong>/100
                    </td>
                    <td>{new Date(result.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">No results available yet.</p>
          )}
        </div>
        </>
        ) : null}

        {activeWorkspace === 'communication' ? (
        <>
        <div className="communication-grid dashboard-section-spaced">
          {/* Announcements */}
          <div className="admin-card communication-card">
            <div className="section-head">
              <h3><FaBullhorn /> School Notices</h3>
            </div>
            <AnnouncementList announcements={announcements} />
          </div>

          {/* Exams Section */}
          <div className="admin-card communication-card">
            <div className="section-head">
              <h3><FaChartLine /> My Exams</h3>
            </div>
            <div className="homework-grid-teacher">
              {exams?.length > 0 ? exams.map(exam => (
                <div key={exam.id} className="teacher-homework-card exam-card">
                  <div className="hw-card-header">
                    <h3>{exam.title}</h3>
                    <span className="hw-subject-badge">{exam.subject}</span>
                  </div>
                  <p className="sub-text">{exam.total_questions} Questions • {exam.duration_minutes}m</p>
                  <div className="hw-card-footer dashboard-card-footer-spaced">
                    {exam.completed_at ? (
                      <span className="glass-chip success">Score: {exam.score}%</span>
                    ) : (
                      <button 
                        className="btn-primary small glass-btn btn-exam-action" 
                        onClick={() => {
                          if (exam.id) {
                            navigate(`/student/exams/${exam.id}`);
                          } else {
                            toast.error("Invalid Exam ID");
                          }
                        }}>
                        Start Exam
                      </button>
                    )}
                  </div>
                </div>
              )) : <p className="empty-state">No exams assigned.</p>}
            </div>
          </div>
        </div>

        <div className="admin-card communication-card dashboard-section-spaced">
          <div className="section-head section-head-responsive">
            <h3><FaBookOpen /> Homework Diary</h3>
            <button className="btn-primary glass-btn btn-homework-action" onClick={handleDownloadWeeklyDiary} disabled={!weeklyHomework.length}>
              <FaDownload /> Download Weekly Diary
            </button>
          </div>
          <div className="homework-grid-teacher">
            {homework?.length > 0 ? (
              homework.map((hw) => (
                <div key={hw.id} className="teacher-homework-card">
                  <div className="hw-card-header">
                    <h3 className="announcement-title">{hw.title}</h3>
                    <span className="hw-subject-badge">{hw.subject || 'General'}</span>
                  </div>
                  <p className="hw-desc">{hw.description || 'No additional instructions provided.'}</p>
                  <div className="hw-card-footer">
                    <span className="glass-chip">Due: {hw.expires_at ? new Date(hw.expires_at).toLocaleDateString() : 'N/A'}</span>
                    <span className="glass-chip"><FaCalendarCheck /> Assigned: {new Date(hw.assigned_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="teacher-homework-card empty-hw-card">
                <div className="empty-state-icon"><FaBookOpen /></div>
                <h3>No Homework Assigned</h3>
                <p className="hw-desc">You are all caught up! Your teacher hasn't posted any new homework for your class yet.</p>
              </div>
            )}
          </div>
        </div>
        </>
        ) : null}

        {/* <div id="announcements-section" className="info-card">
          <h3>
            <FaBullhorn className="dashboard-inline-icon" /> Announcements
          </h3>
          {announcements.length > 0 ? (
            <div className="announcements-list">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-card">
                  <div className="announcement-heading-row">
                    <h4 className="announcement-title">{announcement.title}</h4>
                    <span className={`announcement-badge ${announcement.target_role}`}>
                      {announcement.target_role === 'all' ? 'School-wide' : 'Class Only'}
                    </span>
                  </div>
                  <p className="announcement-description">{announcement.description}</p>
                  <div className="announcement-meta">
                    <span>
                      By: <strong>{announcement.created_by_name || 'Admin'}</strong>
                    </span>
                    <span className="announcement-date">
                      {new Date(announcement.date).toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No announcements at the moment.</p>
          )}
        </div> */}
      </div>

    

      <ChatModal
        isOpen={showChatModal}
        contact={activeChatContact}
        currentUserId={user.id} // Removed unnecessary variable assignment
        messages={chatMessages}
        loading={loadingChat}
        hasMore={chatHasMore}
        isTyping={isTyping}
        typingLabel={`${activeChatContact?.name || 'Contact'} is typing...`}
        bannerText={activeChatContact?.role === 'admin'
          ? 'Broadcasts and direct admin replies appear here.'
          : 'Messages, files, and seen status stay synced in real time.'}
        emptyStateText="No messages yet. Start the conversation."
        onClose={() => {
          setShowChatModal(false);
          setSelectedMessages([]);
          setSelectionMode(false);
          setIsTyping(false);
          resetComposer();
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
        selectionMode={selectionMode} // Removed unnecessary variable assignment
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
        attachAccept="image/*,video/*,audio/*,.pdf"
        isRecording={isRecording}
        onToggleRecording={() => (isRecording ? stopVoiceRecording() : startVoiceRecording())} // Removed unnecessary variable assignment
        saveFile={saveFile}
        inputPlaceholder={`Message ${activeChatContact?.name || 'contact'}...`}
        statusText={activeChatContact?.role === 'admin' ? 'Administration' : activeChatContact?.online ? 'Online' : 'Offline'}
        metaText={activeChatContact?.class_name || 'School communication'}
        avatarFallback={activeChatContact?.role === 'admin' ? 'A' : 'T'}
      />

      {feePaymentModal.open ? (
        <div className="modal-overlay">
          <div className="modal-box small">
            <div className="modal-header-gradient">
              <h3 className="modal-title">💳 Manual Fee Payment</h3>
              <button className="close-btn" onClick={() => setFeePaymentModal({ open: false })}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-subtitle">📋 Payment Request Process</div>
                <div className="modal-text">
                  Submit your payment details and screenshot. Admin will review and approve your payment manually.
                  You'll receive a notification once approved.
                </div>
              </div>
              <div className="glass-form-stack">
                <label className="glass-kicker">Select Fee Billing Month *</label>
                <select
                  value={feePaymentFeeId}
                  onChange={(e) => setFeePaymentFeeId(e.target.value)}
                  className="glass-select"
                  required
                >
                  <option value="">-- Choose billing month to pay --</option>
                  {(eligibleMonths.length > 0 ? eligibleMonths : fees).map((fee) => {
                    const status = String(fee.status || '').toLowerCase();
                    const isSelectable = fee.selectable !== false && ['unpaid', 'overdue', 'rejected'].includes(status);
                    return (
                      <option
                        key={fee.id}
                        value={fee.id}
                        disabled={!isSelectable}
                        style={{ color: isSelectable ? '#0f172a' : '#94a3b8' }}
                      >
                        {fee.month} {fee.year} — PKR {Number(fee.amount).toLocaleString()} [{String(fee.status).toUpperCase()}]
                        {!isSelectable ? ` (${fee.disabledReason || 'Unavailable'})` : ''}
                      </option>
                    );
                  })}
                </select>
                <label className="glass-kicker">Transaction ID *</label>
                <input
                  value={feePaymentTxId}
                  onChange={(e) => setFeePaymentTxId(e.target.value)}
                  className="glass-input"
                  placeholder="e.g. TXN1234567890"
                />
                <label className="glass-kicker">Payment Screenshot *</label>
                <input type="file" accept="image/*" onChange={handleFeePaymentScreenshotChange} className="glass-input" />
                <p className="glass-muted">Upload a clear screenshot (Max 5MB)</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="glass-btn-secondary" onClick={() => setFeePaymentModal({ open: false })}>Cancel</button>
              <button className="glass-btn" onClick={submitFeePaymentRequest} disabled={feePaymentSubmitting || !feePaymentTxId.trim() || !feePaymentScreenshot}>
                {feePaymentSubmitting ? '🚀 Submitting...' : '📤 Submit Request'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteModal.show ? (
        <div className="modal-overlay delete-modal-overlay">
          <div className="delete-modal">
            <h4 className="delete-modal-title">Delete Message?</h4>
            <div className="delete-modal-options">
              {deleteModal.canDeleteEveryone ? (
                <button className="delete-option delete-everyone" onClick={() => handleDeleteConfirmed('everyone')}>
                  Delete for everyone
                </button>
              ) : null}
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
      ) : null}

      {/* Sync Queue Manager */}
      <SyncQueueManager isOnline={isOnline} onSyncComplete={() => fetchDashboard(true)} />
    
    </div>
    </DashboardShell>
  );
};

export default StudentDashboard;
