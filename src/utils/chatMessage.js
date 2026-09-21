const imagePattern = /^image\//i;
const videoPattern = /^video\//i;
const audioPattern = /^audio\//i;

export const detectMessageTypeFromFile = (file) => {
  const mime = String(file?.type || '').toLowerCase();
  const name = String(file?.name || '').toLowerCase();

  if (imagePattern.test(mime)) return 'image';
  if (videoPattern.test(mime)) return 'video';
  if (audioPattern.test(mime)) return 'audio';
  if (name.endsWith('.webm') || name.endsWith('.ogg') || name.endsWith('.wav') || name.endsWith('.m4a')) {
    return 'audio';
  }
  return file ? 'file' : 'text';
};

export const createOptimisticMessage = ({
  senderId,
  receiverId,
  message,
  file,
}) => {
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return {
    id: tempId,
    sender_id: senderId,
    receiver_id: receiverId,
    message: message?.trim() || '',
    file_url: previewUrl,
    file_name: file?.name || null,
    file_mime: file?.type || null,
    file_size: file?.size || null,
    message_type: detectMessageTypeFromFile(file),
    status: 'sending',
    created_at: new Date().toISOString(),
    optimistic: true,
  };
};

export const releaseOptimisticMedia = (message) => {
  const value = message?.file_url;
  if (typeof value === 'string' && value.startsWith('blob:')) {
    URL.revokeObjectURL(value);
  }
};
