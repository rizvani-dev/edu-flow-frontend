import { SERVER_ORIGIN } from '../config/env';

const MEDIA_CDN_ORIGIN = String(import.meta.env.VITE_MEDIA_CDN_ORIGIN || '').replace(/\/$/, '');
const CLOUDFLARE_IMAGE_PREFIX = String(import.meta.env.VITE_CLOUDFLARE_IMAGE_PREFIX || '/cdn-cgi/image');
const ENABLE_CLOUDFLARE_IMAGE_RESIZING = String(import.meta.env.VITE_ENABLE_CLOUDFLARE_IMAGES || '').toLowerCase() === 'true';
const SERVER_ORIGIN_URL = (() => {
  try {
    return new URL(SERVER_ORIGIN);
  } catch {
    return null;
  }
})();

export const resolveMediaUrl = (value) => {
  if (!value) return null;
  // Recognize data URLs (Base64) to prevent prepending SERVER_ORIGIN
  if (value.startsWith('http') || value.startsWith('blob:') || value.startsWith('data:')) return value;

  const base = SERVER_ORIGIN.replace(/\/$/, '');
  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `${base}${normalizedPath}`;
};

const buildCloudflareTransformString = (transformations) => {
  if (!transformations || typeof transformations === 'string') {
    return transformations || 'format=auto,quality=85';
  }

  return Object.entries(transformations)
    .filter(([, itemValue]) => itemValue !== undefined && itemValue !== null && itemValue !== '')
    .map(([key, itemValue]) => `${key}=${itemValue}`)
    .join(',');
};

const canRewriteToMediaCdn = (originalValue, resolvedValue) => {
  if (!MEDIA_CDN_ORIGIN) return false;

  if (!String(originalValue || '').startsWith('http')) {
    return true;
  }

  try {
    const resolvedUrl = new URL(resolvedValue);
    return Boolean(SERVER_ORIGIN_URL) && resolvedUrl.origin === SERVER_ORIGIN_URL.origin;
  } catch {
    return false;
  }
};

const canApplyCloudflareResizing = (resolvedValue) => {
  if (!ENABLE_CLOUDFLARE_IMAGE_RESIZING || !SERVER_ORIGIN_URL) {
    return false;
  }

  try {
    const resolvedUrl = new URL(resolvedValue);
    return resolvedUrl.origin === SERVER_ORIGIN_URL.origin;
  } catch {
    return false;
  }
};

export const resolveOptimizedMediaUrl = (value, transformations = { format: 'auto', quality: 85 }) => {
  const resolved = resolveMediaUrl(value);
  if (!resolved) return null;
  // Do not attempt to resize Blobs or Base64 Data URLs via Cloudflare
  if (resolved.startsWith('blob:') || resolved.startsWith('data:')) return resolved;

  // Priority 1: Cloudflare Image Resizing (cdn-cgi/image) if enabled.
  // This assumes Cloudflare is configured to fetch the 'resolved' URL as its source.
  // The 'resolved' URL could be a direct Supabase URL or a SERVER_ORIGIN URL.
  if (ENABLE_CLOUDFLARE_IMAGE_RESIZING) {
    const transformString = buildCloudflareTransformString(transformations);
    if (transformString) {
      try {
        const sourceUrl = encodeURIComponent(resolved);
        // Use MEDIA_CDN_ORIGIN if available, otherwise SERVER_ORIGIN, as the base for Cloudflare Images.
        // This base should be the domain that Cloudflare is configured to proxy.
        const cdnBase = MEDIA_CDN_ORIGIN || SERVER_ORIGIN;
        return `${cdnBase}${CLOUDFLARE_IMAGE_PREFIX}/${transformString}/${sourceUrl}`;
      } catch (e) {
        console.warn("Failed to apply Cloudflare image resizing:", e);
      }
    }
  }

  // Priority 2: Generic Media CDN if configured (and Cloudflare Images was not applied).
  // This assumes MEDIA_CDN_ORIGIN is a direct replacement for the original host.
  if (MEDIA_CDN_ORIGIN && resolved.startsWith('http')) { // Only rewrite if it's an absolute URL
    try {
      const url = new URL(resolved);
      // Replace the origin with the MEDIA_CDN_ORIGIN. This is a simple CDN rewrite.
      return `${MEDIA_CDN_ORIGIN}${url.pathname}${url.search}`;
    } catch (e) {
      console.warn("Failed to rewrite URL to MEDIA_CDN_ORIGIN:", e);
    }
  }

  // Fallback: Return the original resolved URL if no optimization/CDN applies or fails.
  return resolved;
};

export const appendCacheBust = (value, seed) => {
  const resolved = resolveMediaUrl(value);
  if (!resolved) return null;

  // Never append cache bust to data URLs or local blobs as it breaks the URI scheme
  if (resolved.startsWith('data:') || resolved.startsWith('blob:')) return resolved;

  const separator = resolved.includes('?') ? '&' : '?';
  return `${resolved}${separator}t=${encodeURIComponent(seed)}`;
};
