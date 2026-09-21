import React, { useMemo, useState, memo, useRef, useEffect } from 'react';
import {
  FaCheck,
  FaCheckSquare,
  FaComments,
  FaDownload,
  FaMicrophone,
  FaPaperPlane,
  FaPaperclip,
  FaSpinner,
  FaStopCircle,
  FaPlay,
  FaPause,
  FaRedo,
  FaTimes,
  FaTrash,
  FaEllipsisV,
} from 'react-icons/fa';
import { resolveMediaUrl, resolveOptimizedMediaUrl } from '../../utils/media';
import './chatModal.css';

const imagePattern = /\.(jpg|jpeg|png|gif|webp|svg|heic|heif)(?:\?.*)?$/i;
const videoPattern = /\.(mp4|webm|ogg|mov|mkv)(?:\?.*)?$/i;
const audioPattern = /\.(mp3|wav|m4a|aac|ogg|webm|opus)(?:\?.*)?$/i;
const pdfPattern = /\.pdf(?:\?.*)?$/i;

const isImageFile = (message) =>
  message?.message_type === 'image' ||
  String(message?.file_mime || '').startsWith('image/') ||
  imagePattern.test(String(message?.file_url || '')) ||
  String(message?.file_url || '').startsWith('blob:') ||
  String(message?.file_url || '').startsWith('data:image/');

const isVideoFile = (message) =>
  message?.message_type === 'video' ||
  String(message?.file_mime || '').startsWith('video/') ||
  videoPattern.test(String(message?.file_url || '')) ||
  String(message?.file_url || '').startsWith('blob:') ||
  String(message?.file_url || '').startsWith('data:video/');

const isAudioFile = (message) =>
  message?.message_type === 'audio' ||
  String(message?.file_mime || '').startsWith('audio/') ||
  audioPattern.test(String(message?.file_url || '')) ||
  String(message?.file_url || '').startsWith('blob:') ||
  String(message?.file_url || '').startsWith('data:audio/');

const isPdfFile = (message) =>
  String(message?.file_mime || '').includes('pdf') ||
  pdfPattern.test(String(message?.file_url || ''));

const fallbackToOriginalSource = (event, originalUrl) => {
  const fallbackUrl = resolveMediaUrl(originalUrl);
  if (!fallbackUrl || event.currentTarget.dataset.fallbackApplied === 'true') {
    return;
  }

  event.currentTarget.dataset.fallbackApplied = 'true';
  event.currentTarget.src = fallbackUrl;
};

/**
 * WhatsApp-style Voice Message Player
 */
const VoiceMessage = memo(({ url, fileName, onSave }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const barRef = useRef(null);
  const handleSeek = (e) => {
    e.stopPropagation();
    if (!audioRef.current || !barRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickPercent = Math.max(0, Math.min(1, x / rect.width));
    audioRef.current.currentTime = clickPercent * duration;
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    onSave(url, fileName);
  };

  const progress = (currentTime / duration) * 100 || 0;

  return (
    <div className="chat-modal__voice-player" onClick={(event) => event.stopPropagation()}>
      <button type="button" className="voice-play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      <div className="chat-modal__voice-progress" onClick={(e) => e.stopPropagation()}>
        <div className="voice-progress-bar" ref={barRef} onClick={handleSeek}>
          <div className="voice-progress-fill" style={{ width: `${progress}%` }} />
          <div className="voice-progress-knob" style={{ left: `${progress}%` }} />
        </div>
        <div className="voice-meta">
          <span>{isPlaying ? formatTime(currentTime) : formatTime(duration)}</span>
          <button type="button" className="voice-save-btn" onClick={handleDownload} title="Download voice note" aria-label="Download voice note">
            <FaDownload />
          </button>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
});

/**
 * Individual Message Item component for performance optimization
 */
const MessageItem = memo(({ 
  message, 
  isMine, 
  selectionMode, 
  isSelected, 
  onToggleSelection, 
  saveFile,
  retryUpload,
  setLightbox
}) => {
  const fileUrl = useMemo(() => {
    if (!message.file_url) return null;
    return isImageFile(message)
      ? resolveOptimizedMediaUrl(message.file_url, { width: 960, fit: 'cover' })
      : resolveMediaUrl(message.file_url);
  }, [message.file_url, message.message_type]);

  const renderMedia = () => {
    if (message.deleted || !fileUrl) return null;

    if (isImageFile(message)) {
      return (
        <div className="chat-modal__media image-wrapper">
          <img
            src={fileUrl}
            className="chat-image"
            alt={message.file_name || 'Image'}
            loading="lazy"
            onError={(event) => fallbackToOriginalSource(event, message.file_url)}
            onClick={(e) => {
              e.stopPropagation();
              setLightbox({ url: resolveMediaUrl(message.file_url), name: message.file_name });
            }}
          />
          <button type="button" className="chat-shell-download-btn" onClick={(e) => { e.stopPropagation(); saveFile(message.file_url, message.file_name); }} aria-label="Download image">
            <FaDownload />
          </button>
        </div>
      );
    }

    if (isVideoFile(message)) {
      return (
        <div className="chat-shell-media video-wrapper">
          <video controls preload="metadata">
            <source src={fileUrl} />
          </video>
          <button type="button" className="chat-shell-download-btn" onClick={(e) => { e.stopPropagation(); saveFile(message.file_url, message.file_name); }} aria-label="Download video">
            <FaDownload />
          </button>
        </div>
      );
    }

    if (isAudioFile(message)) {
      return <VoiceMessage url={fileUrl} fileName={message.file_name} onSave={saveFile} />;
    }

    return (
      <div className="chat-shell-file">
        <span>{isPdfFile(message) ? message.file_name || 'PDF' : message.file_name || 'File'}</span>
        <button type="button" className="chat-shell-download-btn" onClick={(e) => { e.stopPropagation(); saveFile(message.file_url, message.file_name); }} aria-label="Download attachment">
          <FaDownload />
        </button>
      </div>
    );
  };

  return (
    <div className={`chat-modal__message-row ${isMine ? 'chat-modal__message-row--sent' : 'chat-modal__message-row--received'}`}>
      <div
        className={`chat-modal__message ${isMine ? 'chat-modal__message--sent' : 'chat-modal__message--received'} ${selectionMode ? 'selectable' : ''} ${
          isSelected ? 'selected' : ''
        } ${message.deleted ? 'deleted' : ''}`}
        onDoubleClick={() => !message.deleted && onToggleSelection(message.id)}
        onClick={() => !message.deleted && selectionMode ? onToggleSelection(message.id) : null}
      >
        {renderMedia()}

        {message.message && <p className="chat-modal__message-text">{message.message}</p>}

        {message.status === 'sending' && (
          <div className="chat-modal__message-status chat-modal__message-status--sending">
            <FaPaperPlane className="spinner" /> Sending...
          </div>
        )}
        {message.status === 'failed' && (
          <div className="chat-modal__message-status chat-modal__message-status--failed">
            <FaTimes /> Failed.
            <button type="button" onClick={() => retryUpload?.(message)} className="chat-modal__retry-btn">
              <FaRedo /> Retry
            </button>
          </div>
        )}

        <div className="chat-modal__message-footer">
          <small>
            {message.created_at 
              ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Pending'}
          </small>
          {isMine && <FaCheck className={message.status === 'seen' ? 'seen-dots' : ''} />}
        </div>
      </div>
    </div>
  );
});

const ChatModal = ({
  isOpen,
  contact,
  currentUserId,
  messages,
  loading,
  hasMore,
  isTyping,
  typingLabel,
  bannerText,
  emptyStateText = 'No messages yet.',
  onClose,
  onScroll,
  onQuickSelectLast,
  onSelectAll,
  onOpenDelete,
  selectedMessages,
  selectionMode,
  onToggleMessageSelection,
  messageValue,
  onMessageChange,
  onSend,
  sendingMessage,
  selectedFile,
  filePreview,
  onFileSelect,
  onRemoveFile,
  fileInputRef,
  attachAccept = 'image/*,video/*,audio/*,.pdf',
  isRecording,
  onToggleRecording,
  saveFile,
  retryUpload,
  inputPlaceholder = 'Type a message...',
  statusText,
  metaText,
  avatarFallback,
}) => {
  const [lightbox, setLightbox] = useState(null); // {url, name}
  const threadRef = useRef(null);

  // Internal Auto-Scroll Logic
  useEffect(() => {
    if (isOpen && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [isOpen, messages?.length, isTyping]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSend = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    onSend?.();
  };

  const visibleSelectionCount = selectedMessages?.length || 0;
  const canSelectLast = useMemo(() => messages?.length > 0, [messages]);

  // Memoize the message list to prevent parent re-renders from affecting the whole list
  const memoizedMessages = useMemo(() => messages || [], [messages]);
  const selectedIds = useMemo(() => new Set(selectedMessages || []), [selectedMessages]);

  if (!isOpen || !contact) return null;

  return (
    <>
      <div className="chat-modal-overlay" onClick={onClose} role="presentation">
        <section
          className="chat-modal__window"
          role="dialog"
          aria-modal="true"
          aria-label={`Conversation with ${contact.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="chat-modal__header">
            <div className="chat-modal__contact">
              <div className="chat-modal__avatar">
                {contact.profile_image ? (
                  <img
                    src={resolveOptimizedMediaUrl(contact.profile_image, { width: 160, height: 160, fit: 'cover' })}
                    alt={contact.name}
                    loading="lazy"
                    onError={(event) => fallbackToOriginalSource(event, contact.profile_image)}
                  />
                ) : (
                  <div className="chat-modal__avatar-fallback">{avatarFallback || String(contact.name || '?').charAt(0)}</div>
                )}
              </div>

              <div className="chat-modal__contact-info">
                <h3 className="chat-modal__name">{contact.name}</h3>
                <div className="chat-modal__status">
                  <span className={`chat-modal__status-dot ${contact.online ? 'online' : 'offline'}`} />
                  <span>{statusText}</span>
                </div>
                {metaText ? <p className="chat-modal__meta">{metaText}</p> : null}
              </div>
            </div>

            <div className="chat-modal__actions">
              {visibleSelectionCount > 0 ? (
                <>
                  <span className="chat-modal__selection-count">{visibleSelectionCount} selected</span>
                  <button type="button" className="chat-modal__icon-btn" onClick={onSelectAll} title="Select all" aria-label="Select all messages">
                    <FaCheckSquare />
                  </button>
                  <button type="button" className="chat-modal__icon-btn" onClick={onOpenDelete} title="Delete selected" aria-label="Delete selected messages">
                    <FaTrash />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="chat-modal__icon-btn"
                  onClick={onQuickSelectLast}
                  title="Select latest message"
                  aria-label="Select latest message"
                  disabled={!canSelectLast}
                >
                  <FaEllipsisV />
                </button>
              )}

              <button type="button" className="chat-modal__close-btn" onClick={onClose} title="Close chat" aria-label="Close chat">
                <FaTimes />
              </button>
            </div>
          </div>

          {bannerText ? (
            <div className="chat-modal__banner">
              <FaComments />
              <span>{bannerText}</span>
            </div>
          ) : null}

          <div className="chat-modal__body" onScroll={onScroll} ref={threadRef}>
            {loading ? <div className="chat-modal__state">Loading messages...</div> : null}
            {hasMore && !loading ? <div className="chat-modal__state">Scroll up to load older messages</div> : null}

            {memoizedMessages.length ? (
              memoizedMessages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isMine={Number(message.sender_id) === Number(currentUserId)}
                  selectionMode={selectionMode}
                  isSelected={selectedIds.has(message.id)}
                  onToggleSelection={onToggleMessageSelection}
                  saveFile={saveFile}
                  retryUpload={retryUpload}
                  setLightbox={setLightbox}
                />
              ))
            ) : !loading ? (
              <div className="chat-modal__empty">{emptyStateText}</div>
            ) : null}

            {isTyping ? <div className="chat-modal__typing">{typingLabel}</div> : null}
          </div>

          <div className="chat-modal__footer">
            {selectedFile ? (
              <div className="chat-modal__selected-file">
                <div className="chat-modal__selected-file-info">
                  {filePreview ? <img className="chat-modal__selected-thumb" src={filePreview} alt="Preview" /> : null}
                  <span>{selectedFile.name}</span>
                </div>
                <button type="button" className="chat-modal__icon-btn" onClick={onRemoveFile} title="Remove attachment">
                  <FaTimes />
                </button>
              </div>
            ) : null}

            <div className="chat-modal__input-row">
              <label className="chat-modal__attach-btn">
                <FaPaperclip />
                <input
                  ref={fileInputRef}
                  className="chat-modal__hidden-input"
                  type="file"
                  accept={attachAccept}
                  onChange={onFileSelect}
                />
              </label>

              <button
                type="button"
                className={`chat-modal__attach-btn ${isRecording ? 'is-recording' : ''}`}
                onClick={onToggleRecording}
                title={isRecording ? 'Stop recording' : 'Record voice message'}
              >
                {isRecording ? <FaStopCircle /> : <FaMicrophone />}
              </button>

              <textarea
                rows="1"
                className="chat-modal__input"
                value={messageValue}
                onChange={onMessageChange}
                placeholder={inputPlaceholder}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (!sendingMessage && (messageValue.trim() || selectedFile)) handleSend(event);
                  }
                }}
              />

              <button type="button" className="chat-modal__send-btn" onClick={handleSend} disabled={sendingMessage || (!messageValue.trim() && !selectedFile)}>
                {sendingMessage ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
              </button>
            </div>
          </div>
        </section>
      </div>

      {lightbox && (
        <div className="chat-lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="chat-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <div className="chat-lightbox-actions">
              <button type="button" className="chat-lightbox-btn" onClick={() => saveFile(lightbox.url, lightbox.name)}>
                <FaDownload /> Save image
              </button>
              <button type="button" className="chat-lightbox-btn" onClick={() => setLightbox(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="chat-lightbox-frame">
              <img className="chat-lightbox-image" src={lightbox.url} alt={lightbox.name || 'Preview'} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatModal;
