import React, { useMemo, useState, memo } from 'react';
import {
  FaCheck,
  FaCheckDouble,
  FaCheckSquare,
  FaComments,
  FaDownload,
  FaEllipsisV,
  FaMicrophone,
  FaPaperPlane,
  FaPaperclip,
  FaStopCircle,
  FaTimes,
  FaTrash,
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
  imagePattern.test(String(message?.file_url || ''));

const isVideoFile = (message) =>
  message?.message_type === 'video' ||
  String(message?.file_mime || '').startsWith('video/') ||
  videoPattern.test(String(message?.file_url || ''));

const isAudioFile = (message) =>
  message?.message_type === 'audio' ||
  String(message?.file_mime || '').startsWith('audio/') ||
  audioPattern.test(String(message?.file_url || ''));

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

const MessageRow = memo(({ message, isMine, selectionMode, isSelected, onToggle, onContext, saveFile }) => {
  const fileUrl = message.file_url
    ? isImageFile(message)
      ? resolveOptimizedMediaUrl(message.file_url, { width: 960, fit: 'cover' })
      : resolveMediaUrl(message.file_url)
    : null;

  return (
    <div className={`chat-shell-message-row ${isMine ? 'sent' : 'received'}`}>
      <div
        className={`chat-shell-message ${isMine ? 'sent' : 'received'} ${selectionMode ? 'selectable' : ''} ${
          isSelected ? 'selected' : ''
        } ${message.deleted ? 'deleted' : ''}`}
        onDoubleClick={() => !message.deleted && onToggle?.(message.id)}
        onClick={() => !message.deleted && selectionMode ? onToggle?.(message.id) : null}
        onContextMenu={(event) => onContext?.(message, event)}
      >
        {/* ... media and text logic ... */}
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
  inputPlaceholder = 'Type a message...',
  statusText,
  metaText,
  avatarFallback,
  renderMessageExtras,
  onMessageContextMenu,
}) => {
  const [lightbox, setLightbox] = useState(null);

  const visibleSelectionCount = selectedMessages?.length || 0;
  const canSelectLast = useMemo(() => messages?.length > 0, [messages]);

  if (!isOpen || !contact) return null;

  return (
    <>
      <div className="chat-shell-overlay">
        <div className="chat-shell-modal">
          <div className="chat-shell-header">
            <div className="chat-shell-contact">
              <div className="chat-shell-avatar">
                {contact.profile_image ? (
                  <img
                    src={resolveOptimizedMediaUrl(contact.profile_image, { width: 160, height: 160, fit: 'cover' })}
                    alt={contact.name}
                    loading="lazy"
                    onError={(event) => fallbackToOriginalSource(event, contact.profile_image)}
                  />
                ) : (
                  <div className="chat-shell-avatar-fallback">{avatarFallback || String(contact.name || '?').charAt(0)}</div>
                )}
              </div>

              <div className="chat-shell-contact-copy">
                <h3>{contact.name}</h3>
                <div className="chat-shell-status">
                  <span className={`chat-shell-status-dot ${contact.online ? 'online' : ''}`} />
                  <span>{statusText}</span>
                </div>
                {metaText ? <p className="chat-shell-meta">{metaText}</p> : null}
              </div>
            </div>

            <div className="chat-shell-actions">
              {visibleSelectionCount > 0 ? (
                <>
                  <span className="chat-shell-pill">{visibleSelectionCount} selected</span>
                  <button type="button" className="chat-shell-icon-btn" onClick={onSelectAll} title="Select all">
                    <FaCheckSquare />
                  </button>
                  <button type="button" className="chat-shell-icon-btn" onClick={onOpenDelete} title="Delete selected">
                    <FaTrash />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="chat-shell-icon-btn"
                  onClick={onQuickSelectLast}
                  title="Select latest message"
                  disabled={!canSelectLast}
                >
                  <FaEllipsisV />
                </button>
              )}

              <button type="button" className="chat-shell-close-btn" onClick={onClose} title="Close chat">
                <FaTimes />
              </button>
            </div>
          </div>

          {bannerText ? (
            <div className="chat-shell-banner">
              <FaComments />
              <span>{bannerText}</span>
            </div>
          ) : null}

          <div className="chat-shell-thread" onScroll={onScroll}>
            {loading ? <div className="chat-shell-thread-state">Loading messages...</div> : null}
            {hasMore && !loading ? <div className="chat-shell-thread-state">Scroll up to load older messages</div> : null}

            {messages?.length ? (
              messages.map((message) => {
                const fileUrl = message.file_url
                  ? isImageFile(message)
                    ? resolveOptimizedMediaUrl(message.file_url, { width: 960, fit: 'cover' })
                    : resolveMediaUrl(message.file_url)
                  : null;
                const isMine = Number(message.sender_id) === Number(currentUserId);

                return (
                  <div key={message.id} className={`chat-shell-message-row ${isMine ? 'sent' : 'received'}`}>
                    <div
                      className={`chat-shell-message ${isMine ? 'sent' : 'received'} ${selectionMode ? 'selectable' : ''} ${
                        selectedMessages?.includes(message.id) ? 'selected' : ''
                      } ${message.deleted ? 'deleted' : ''}`}
                      onDoubleClick={() => !message.deleted && onToggleMessageSelection?.(message.id)}
                      onClick={() => !message.deleted && selectionMode ? onToggleMessageSelection?.(message.id) : null}
                      onContextMenu={(event) => onMessageContextMenu?.(message, event)}
                    >
                      {!message.deleted && fileUrl ? (
                        <div className="chat-shell-media">
                          {isImageFile(message) ? (
                            <>
                              <img
                                src={fileUrl}
                                alt={message.file_name || 'Image'}
                                loading="lazy"
                                onError={(event) => fallbackToOriginalSource(event, message.file_url)}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setLightbox({ url: resolveMediaUrl(message.file_url), name: message.file_name });
                                }}
                              />
                              <button
                                type="button"
                                className="chat-shell-download-btn"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  saveFile(message.file_url, message.file_name);
                                }}
                              >
                                <FaDownload /> Save
                              </button>
                            </>
                          ) : isVideoFile(message) ? (
                            <>
                              <video controls preload="metadata">
                                <source src={fileUrl} />
                              </video>
                              <button
                                type="button"
                                className="chat-shell-download-btn"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  saveFile(message.file_url, message.file_name);
                                }}
                              >
                                <FaDownload /> Save
                              </button>
                            </>
                          ) : isAudioFile(message) ? (
                            <div className="chat-shell-file">
                              <audio controls preload="metadata">
                                <source src={fileUrl} />
                              </audio>
                              <button type="button" className="chat-shell-download-btn" onClick={() => saveFile(message.file_url, message.file_name)}>
                                <FaDownload /> Save
                              </button>
                            </div>
                          ) : (
                            <div className="chat-shell-file">
                              <span>{isPdfFile(message) ? message.file_name || 'PDF document' : message.file_name || 'Attachment'}</span>
                              <button type="button" className="chat-shell-download-btn" onClick={() => saveFile(message.file_url, message.file_name)}>
                                <FaDownload /> Save
                              </button>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {message.message ? <p className="chat-shell-message-text">{message.message}</p> : null}

                      {renderMessageExtras ? <div className="chat-shell-extra">{renderMessageExtras(message)}</div> : null}

                      <div className="chat-shell-message-footer">
                        <small>
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </small>
                        {isMine ? (
                          message.status === 'seen' ? (
                            <FaCheckDouble />
                          ) : (
                            <FaCheck />
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : !loading ? (
              <div className="chat-shell-empty">{emptyStateText}</div>
            ) : null}

            {isTyping ? <div className="chat-shell-typing">{typingLabel}</div> : null}
          </div>

          <div className="chat-shell-composer">
            {selectedFile ? (
              <div className="chat-shell-selected-file">
                <div className="chat-shell-selected-file-copy">
                  {filePreview ? <img className="chat-shell-selected-thumb" src={filePreview} alt="Preview" /> : null}
                  <span>{selectedFile.name}</span>
                </div>
                <button type="button" className="chat-shell-icon-btn" onClick={onRemoveFile} title="Remove attachment">
                  <FaTimes />
                </button>
              </div>
            ) : null}

            <div className="chat-shell-input-row">
              <label className="chat-shell-attach-btn">
                <FaPaperclip />
                <input
                  ref={fileInputRef}
                  className="chat-shell-hidden-input"
                  type="file"
                  accept={attachAccept}
                  onChange={onFileSelect}
                />
              </label>

              <button
                type="button"
                className="chat-shell-attach-btn"
                onClick={onToggleRecording}
                title={isRecording ? 'Stop recording' : 'Record voice message'}
              >
                {isRecording ? <FaStopCircle /> : <FaMicrophone />}
              </button>

              <input
                className="chat-shell-input"
                value={messageValue}
                onChange={onMessageChange}
                placeholder={inputPlaceholder}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    onSend(event);
                  }
                }}
              />

              <button type="button" className="chat-shell-send-btn" onClick={onSend} disabled={sendingMessage}>
                {sendingMessage ? 'Sending...' : <><FaPaperPlane /> Send</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {lightbox ? (
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
      ) : null}
    </>
  );
};

export default ChatModal;
