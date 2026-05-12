import imageCompression from 'browser-image-compression';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const isCompressibleImage = (file) =>
  Boolean(file?.type?.startsWith('image/')) &&
  !['image/gif', 'image/svg+xml'].includes(file.type);

const toWebpFileName = (name = 'upload') => {
  const base = name.replace(/\.[^.]+$/, '') || 'upload';
  return `${base}.webp`;
};

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const prepareUploadFile = async (
  file,
  {
    maxBytes = MAX_UPLOAD_BYTES,
    maxSizeMB = 2,
    maxWidthOrHeight = 1600,
  } = {}
) => {
  if (!file) return null;

  let nextFile = file;

  if (isCompressibleImage(file)) {
    const compressed = await imageCompression(file, {
      maxSizeMB: Math.min(maxSizeMB, maxBytes / (1024 * 1024)),
      maxWidthOrHeight,
      useWebWorker: true,
      initialQuality: 0.82,
      fileType: 'image/webp',
    });

    nextFile = new File([compressed], toWebpFileName(file.name), {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  }

  if (nextFile.size > maxBytes) {
    throw new Error(`File must be less than ${Math.round(maxBytes / (1024 * 1024))}MB`);
  }

  return nextFile;
};
