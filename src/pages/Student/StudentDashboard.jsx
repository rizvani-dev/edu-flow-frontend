import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import { toast } from 'react-toastify';
import API from '../../api/axiosInstance';
import FeeSection from '../../components/Student/FeeSection';
import TeacherCard from '../../components/Student/TeacherCard';
import ChatModal from '../../components/chat/ChatModal';
import {
  FaBell,
  FaBullhorn,
  FaChartArea,
  FaChartBar,
  FaCheck,
  FaCheckDouble,
  FaCheckSquare,
  FaComments,
  FaDownload,
  FaEllipsisV,
  FaMoneyBillWave,
  FaPaperPlane,
  FaPaperclip,
  FaSignOutAlt,
  FaMicrophone,
  FaStopCircle,
  FaSmile,
  FaTimes,
  FaTrash,
  FaUser,
} from 'react-icons/fa';
import useSocket from '../../hooks/useSocket';
import './studentPanel.css';
import AttendanceSection from '../../components/Attendance/AttendanceSection';
import { resolveMediaUrl } from '../../utils/media';
import { prepareUploadFile } from '../../utils/uploadMedia';
import { createOptimisticMessage, releaseOptimisticMedia } from '../../utils/chatMessage';
import { getCache, setCache, CACHE_KEYS } from '../../utils/localStorageCache';

const isImageFile = (url = '') => /\.(jpg|jpeg|png|gif|webp|svg|heic|heif)(?:\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:image/');
const isVideoFile = (url = '') => /\.(mp4|webm|ogg)(?:\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:video/');
const isAudioFile = (url = '') => /\.(mp3|wav|m4a|aac|ogg|webm|opus)(?:\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:audio/');
const isPdfFile = (fileUrl = '') => /\.pdf$/i.test(fileUrl);

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket(user?.id);

  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeChatContact, setActiveChatContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatHasMore, setChatHasMore] = useState(false);
  const [chatCursor, setChatCursor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, ids: [], canDeleteEveryone: false });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [fees, setFees] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [feePaymentModal, setFeePaymentModal] = useState({ open: false });
  const [feePaymentTxId, setFeePaymentTxId] = useState('');
  const [feePaymentScreenshot, setFeePaymentScreenshot] = useState(null);
  const [feePaymentFeeId, setFeePaymentFeeId] = useState('');
  const [feePaymentSubmitting, setFeePaymentSubmitting] = useState(false); // Corrected typo

  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

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
  }, [chatMessages.length, showChatModal, isTyping, activeChatContact?.id, loadingChat]);

  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleReceiveMessage = (message) => {
      const senderId = Number(message.sender_id || message.senderId);
      const receiverId = Number(message.receiver_id || message.receiverId);

      if (!activeChatContact?.id) return;

      const isCurrentConversation =
        (senderId === Number(activeChatContact.id) && receiverId === Number(user.id)) ||
        (senderId === Number(user.id) && receiverId === Number(activeChatContact.id));

      if (!isCurrentConversation) return;

      setChatMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));

      // If the chat is open and we are receiving a message, mark as seen
      if (showChatModal && senderId === Number(activeChatContact.id)) {
        socket.emit('markSeen', { senderId, receiverId: user.id, messageIds: [message.id] });
      }
    };

    const handleTyping = ({ senderId }) => {
      if (Number(senderId) !== Number(activeChatContact?.id)) return;
      setIsTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1800);
    };

    const handleMessagesSeen = ({ receiverId, messageIds }) => {
      if (Number(receiverId) !== Number(activeChatContact?.id)) return;
      setChatMessages((prev) =>
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
      setChatMessages((prev) =>
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
      if (Number(statusUserId) === Number(teacherContact?.id)) {
        setDashboardData((prev) => ({
          ...prev,
          teacher: prev?.teacher ? { ...prev.teacher, online, last_seen } : prev?.teacher,
        }));
      }

      if (Number(statusUserId) === Number(activeChatContact?.id)) {
        setActiveChatContact((prev) => (prev ? { ...prev, online, last_seen } : prev));
      }
    };

    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        if (prev.some((item) => item.id === notification.id)) return prev;
        return [notification, ...prev];
      });
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

  useEffect(() => {
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

  const fetchDashboard = async (silent = false) => {
    const cacheKey = CACHE_KEYS.STUDENT_DASHBOARD(user.id);
    
    // 1. Try Loading from Cache
    const cached = getCache(cacheKey);
    if (cached && !silent) {
      setDashboardData(cached.dashboard);
      setAnnouncements(cached.announcements || []);
      setLoading(false);
    }

    try {
      if (!silent && !cached) setLoading(true);
      const [dashboardRes, announcementsRes] = await Promise.all([
        API.get('/student/dashboard'),
        API.get('/announcements'),
      ]);

      const freshData = { dashboard: dashboardRes.data.dashboard, announcements: announcementsRes.data.announcements };
      setDashboardData(freshData.dashboard);
      setAnnouncements(freshData.announcements || []);
      
      // 2. Update Cache
      setCache(cacheKey, freshData);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async () => {
    try {
      const res = await API.get('/fees/my-fees');
      setFees(res.data.fees || []);
    } catch (error) {
      console.error('Failed to fetch fees', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/student/notifications');
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConversation = async (contact) => {
    if (!contact?.id) return;

    try {
      const res = await API.get(`/student/chat/conversation/${contact.id}`);
      setChatMessages(res.data.messages || []);
      if (res.data.contact) {
        setActiveChatContact((prev) => ({ ...prev, ...res.data.contact, ...contact }));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to load chat');
    }
  };

  const resetComposer = () => {
    setNewMessage('');
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openChatWithContact = async (contact, before = null) => {
    if (!contact?.id) {
      toast.warning('No chat contact is available right now');
      return;
    }

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
    }
  };

  const handleChatScroll = useCallback((e) => {
    if (e.currentTarget.scrollTop === 0 && chatHasMore && !loadingChat && chatCursor) {
      openChatWithContact(activeChatContact, chatCursor);
    }
  }, [chatHasMore, loadingChat, activeChatContact, chatCursor]);

  const sendMessage = async () => {
    if (!activeChatContact?.id) {
      toast.warning('Open a conversation first');
      return;
    }

    if (!newMessage.trim() && !selectedFile) {
      toast.warning('Please type a message or select a file');
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

  const openDeleteModal = (ids) => {
    const allSentByUser = ids.every((id) => {
      const message = chatMessages.find((item) => item.id === id);
      return message && message.sender_id === user.id;
    });

    setDeleteModal({ show: true, ids, canDeleteEveryone: allSentByUser });
  };

  const handleDeleteConfirmed = async (type) => {
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

  const toggleMessageSelection = (id) => {
    setSelectedMessages((prev) => {
      const nextSelection = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      setSelectionMode(nextSelection.length > 0);
      return nextSelection;
    });
  };

  const selectAllMessages = () => {
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

  const handleFeePaymentScreenshotChange = async (event) => {
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
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecording(false);
    }
  };

  const handleTyping = (event) => {
    setNewMessage(event.target.value);
    if (activeChatContact?.id) {
      socket.emit('typing', { senderId: user.id, receiverId: activeChatContact.id });
    }
  };

  const saveFile = async (url, originalName) => {
    try {
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

  const submitFeePaymentRequest = async () => {
    if (!feePaymentTxId.trim()) return toast.error('Transaction ID is required');
    if (!feePaymentScreenshot) return toast.error('Screenshot is required');
    try {
      setFeePaymentSubmitting(true);
      const form = new FormData();
      form.append('transaction_id', feePaymentTxId.trim());
      if (feePaymentFeeId) form.append('fee_id', feePaymentFeeId);
      form.append('screenshot', feePaymentScreenshot);
      await API.post('/fees/payment-requests', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Payment request submitted');
      setFeePaymentModal({ open: false });
      setFeePaymentTxId('');
      setFeePaymentScreenshot(null);
      setFeePaymentFeeId('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit request');
    } finally {
      setFeePaymentSubmitting(false);
    }
  };

  const markAsRead = async (notificationId) => {
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

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);
    setShowNotifications(false);

    if (notification.type === 'announcement') {
      document.getElementById('announcements-section')?.scrollIntoView({ behavior: 'smooth' });
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
    fetchDashboard();
    fetchNotifications();
    fetchFees();
  }, []);

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





  const { student, results, teacher } = dashboardData || {};

  return (
    <div className="student-container">
      <nav className="student-navbar">
        <div className="student-navbar-content">
          <div className="brand-block">
            <div className="student-avatar">
              {student?.profile_image ? (
                <img src={student.profile_image} alt={student.name} />
              ) : (
                <div className="avatar-placeholder">S</div>
              )}
            </div>
            <div className="brand-copy">
              <p className="eyebrow">Student Portal</p>
              <h1 className="student-title">Welcome back, {student?.name}</h1>
            </div>
          </div>

          <div className="student-right">
            <div className="notification-bell" onClick={() => setShowNotifications((prev) => !prev)}>
              <FaBell />
              {unreadCount > 0 ? <span className="notification-dot">{unreadCount}</span> : null}
            </div>
            <button onClick={logout} className="logout-btn">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {showNotifications ? (
          <div className="notification-dropdown student-notif-dropdown">
            <div className="notification-dropdown-head">
              <div>
                <h4>Notifications</h4>
                <p>{unreadCount ? `${unreadCount} unread updates` : 'All caught up'}</p>
              </div>
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
      </nav>

      <div className="student-main">
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
                <span>Attendance: <strong>{student?.performance || 0}%</strong></span>
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

        <div className="info-card">
          <h3>
            <FaUser className="inline mr-2" /> Your Profile
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
            </div>
          </div>
          {student?.bio ? (
            <div className="bio-section">
              <p className="label">Bio</p>
              <p className="bio-text">{student.bio}</p>
            </div>
          ) : null}
        </div>

        <FeeSection
          fees={fees}
          feeStats={feeStats}
          onPayFeeClick={() => setFeePaymentModal({ open: true })}
        />

        <TeacherCard
          teacher={teacher}
          onMessageClick={() => openChatWithContact(teacherContact)}
        />

        <div className="info-card">
          <h3>
            <FaChartArea /> Recent Attendance
          </h3>
          <AttendanceSection student={student} teacher={teacher} />
        </div>

        <div className="info-card">
          <h3>
            <FaChartBar /> Your Results
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
                {results.map((result, index) => (
                  <tr key={index}>
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

        <div id="announcements-section" className="info-card">
          <h3>
            <FaBullhorn className="inline mr-2" /> Announcements
          </h3>
          {announcements.length > 0 ? (
            <div className="announcements-list">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-card">
                  <div className="flex justify-between items-start mb-2">
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
        </div>
      </div>

      <ChatModal
        isOpen={showChatModal}
        contact={activeChatContact}
        currentUserId={user.id}
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
        attachAccept="image/*,video/*,audio/*,.pdf"
        isRecording={isRecording}
        onToggleRecording={() => (isRecording ? stopVoiceRecording() : startVoiceRecording())}
        saveFile={saveFile}
        inputPlaceholder={`Message ${activeChatContact?.name || 'contact'}...`}
        statusText={activeChatContact?.role === 'admin' ? 'Administration' : activeChatContact?.online ? 'Online' : 'Offline'}
        metaText={activeChatContact?.class_name || 'School communication'}
        avatarFallback={activeChatContact?.role === 'admin' ? 'A' : 'T'}
      />

      {false && showChatModal && activeChatContact ? (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="chat-modal chat-modal-elevated">
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {activeChatContact.profile_image ? (
                    <img src={activeChatContact.profile_image} alt={activeChatContact.name} />
                  ) : (
                    <div className="avatar-placeholder">{activeChatContact.role === 'admin' ? 'A' : 'T'}</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="chat-header-name">{activeChatContact.name}</h3>
                  <div className="status-info">
                    <span className={`status-dot ${activeChatContact?.online ? 'online' : 'offline'}`} />
                    <span className="text-xs">
                      {activeChatContact.role === 'admin'
                        ? 'Administration'
                        : activeChatContact?.online
                          ? 'Online'
                          : 'Offline'}
                    </span>
                  </div>
                  <p className="chat-contact-meta">{activeChatContact.class_name || 'School communication'}</p>
                </div>
              </div>

              <div className="chat-header-actions">
                {selectedMessages.length > 0 ? (
                  <>
                    <span className="selection-count">{selectedMessages.length} selected</span>
                    <button className="header-action-btn" onClick={selectAllMessages} title="Select all">
                      <FaCheckSquare />
                    </button>
                    <button
                      className="header-action-btn delete-action"
                      onClick={() => openDeleteModal(selectedMessages)}
                      title="Delete selected"
                    >
                      <FaTrash />
                    </button>
                  </>
                ) : (
                  <button
                    className="header-action-btn"
                    onClick={() => {
                      const lastId = chatMessages[chatMessages.length - 1]?.id;
                      if (!lastId) return;
                      setSelectedMessages([lastId]);
                      setSelectionMode(true);
                    }}
                    title="Select last message"
                  >
                    <FaEllipsisV />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedMessages([]);
                    setSelectionMode(false);
                    setIsTyping(false);
                    resetComposer();
                  }}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="chat-thread-banner">
              <FaComments />
              <span>
                {activeChatContact.role === 'admin'
                  ? 'Broadcasts and direct admin replies appear here.'
                  : 'Messages, files, and seen status stay synced in real time.'}
              </span>
            </div>

            <div 
              className={`chat-messages ${loadingChat ? 'chat-loading-mask' : ''}`} 
              ref={chatMessagesRef} 
              onScroll={handleChatScroll}
            >
              {loadingChat && <div className="chat-mini-loader">Fetching history...</div>}
              {chatHasMore && !loadingChat && <div className="load-more-hint">Scroll up for older messages</div>}
              
              {chatMessages.length > 0 ? (
                chatMessages.map((message) => {
                  const fileUrl = message.file_url ? resolveMediaUrl(message.file_url) : null;
                  const mType = message.message_type || (message.file_url ? 'file' : 'text');

                  return (
                    <div
                      key={message.id || i}
                      className={`message ${message.sender_id === user.id ? 'sent' : 'received'} ${
                        selectedMessages.includes(message.id) ? 'selected' : ''
                      } ${message.deleted ? 'deleted-msg' : ''} ${selectionMode ? 'in-selection-mode' : ''}`}
                      onDoubleClick={() => !message.deleted && toggleMessageSelection(message.id)}
                      onClick={() => !message.deleted && selectionMode && toggleMessageSelection(message.id)}
                    >
                      {!message.deleted && message.file_url ? (
                        <div className="file-message">
                          {(mType === 'image' || (message.file_url && isImageFile(message.file_url))) ? (
                            <img
                              src={fileUrl}
                              alt={message.file_name || 'Image'}
                              className="chat-image"
                              onClick={(event) => {
                                event.stopPropagation();
                                openLightbox(fileUrl);
                              }}
                              style={{ cursor: 'pointer', height: 'auto', display: 'block' }}
                              onError={(e) => { e.target.src = 'https://placehold.co/200?text=Error+Loading+Image'; }}
                            />
                          ) : isVideoFile(message.file_url) ? (
                            <video controls className="chat-video">
                              <source src={fileUrl} />
                            </video>
                          ) : isAudioFile(message.file_url) ? (
                            <audio controls className="chat-audio">
                              <source src={fileUrl} />
                            </audio>
                          ) : isPdfFile(message.file_url) ? (
                            <a className="file-attachment" href={fileUrl} target="_blank" rel="noreferrer">
                              {message.file_name || 'PDF'}
                            </a>
                          ) : (
                            <div className="file-attachment">{message.file_name || 'Attachment'}</div>
                          )}

                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              saveFile(message.file_url, message.file_name);
                            }}
                            className="download-btn"
                            style={{ border: 'none', cursor: 'pointer' }}
                          >
                            <FaDownload /> Save
                          </button>
                        </div>
                      ) : null}

                      {message.message ? <p>{message.message}</p> : null}

                      <div className="message-footer">
                        <small className="message-timestamp">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </small>
                        {message.sender_id === user.id ? (
                          message.status === 'seen' ? (
                            <FaCheckDouble className="seen-icon" />
                          ) : (
                            <FaCheck className="sent-icon" />
                          )
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-chat-text">No messages yet. Start the conversation.</div>
              )}

              {isTyping ? <div className="typing-indicator">{activeChatContact.name} is typing...</div> : null}
            </div>

            <div className="chat-input-area">
              {selectedFile ? (
                <div className="selected-file-info">
                  <div className="selected-file-copy">
                    <span>{selectedFile.name}</span>
                    {filePreview ? <img src={filePreview} alt="Preview" className="selected-file-thumb" /> : null}
                  </div>
                  <button onClick={removeSelectedFile} className="remove-file-btn" type="button">
                    <FaTimes />
                  </button>
                </div>
              ) : null}

              <label className="attach-btn">
                <FaPaperclip />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept="image/*,video/*,audio/*,.pdf"
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
                placeholder={`Message ${activeChatContact.name}...`}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <button type="button" onClick={sendMessage} className="send-btn" disabled={sendingMessage}>
                {sendingMessage ? <small>Sending...</small> : <FaPaperPlane />}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {feePaymentModal.open ? (
        <div className="modal-overlay">
          <div className="modal-content" style={{
            maxWidth: 580,
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: 'none',
            background: 'white',
            overflowX: 'hidden',
            overflowY: 'auto',
          }}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px 24px',
              borderBottom: 'none'
            }}>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                💳 Manual Fee Payment
              </h3>
              <button
                className="close-btn"
                onClick={() => setFeePaymentModal({ open: false })}
                style={{
                  background: 'rgba(255, 255, 255, 0.49)',
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
            <div style={{ padding: '24px' }}>
              <div style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  📋 Payment Request Process
                </div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  Submit your payment details and screenshot. Admin will review and approve your payment manually.
                  You'll receive a notification once approved.
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>
                  Link to Fee (Optional)
                </label>
                <select
                  value={feePaymentFeeId}
                  onChange={(e) => setFeePaymentFeeId(e.target.value)}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Not linked to specific fee</option>
                  {fees.map((fee) => (
                    <option key={fee.id} value={fee.id}>
                      {fee.month} {fee.year} - PKR {fee.amount} ({fee.status})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>
                  Transaction ID *
                </label>
                <input
                  value={feePaymentTxId}
                  onChange={(e) => setFeePaymentTxId(e.target.value)}
                  className="input-field"
                  placeholder="e.g. TXN1234567890"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>
                  Payment Screenshot *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeePaymentScreenshotChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Upload a clear screenshot of your payment confirmation (Max 5MB)
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  className="btn"
                  type="button"
                  onClick={() => setFeePaymentModal({ open: false })}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  type="button"
                  onClick={submitFeePaymentRequest}
                  disabled={feePaymentSubmitting || !feePaymentTxId.trim() || !feePaymentScreenshot}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: feePaymentSubmitting || !feePaymentTxId.trim() || !feePaymentScreenshot ? 'not-allowed' : 'pointer',
                    opacity: feePaymentSubmitting || !feePaymentTxId.trim() || !feePaymentScreenshot ? 0.6 : 1
                  }}
                >
                  {feePaymentSubmitting ? '🚀 Submitting...' : '📤 Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteModal.show ? (
        <div className="modal-overlay delete-modal-overlay" style={{ zIndex: 3000 }}>
          <div className="delete-modal" style={{ zIndex: 3001 }}>
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

      {false && lightboxImage ? (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <FaTimes />
            </button>
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
      ) : null}
    </div>
  );
};

export default StudentDashboard;
