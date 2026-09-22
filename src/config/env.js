const DEV_SERVER_ORIGIN = 'http://localhost:5000';
const PROD_SERVER_ORIGIN = 'https://rizo99.serv00.net';
const configuredServerOrigin = String(import.meta.env.VITE_SERVER_ORIGIN || '').trim();
const configuredProdServerOrigin = String(import.meta.env.VITE_PRODUCTION_SERVER_ORIGIN || '').trim();
const LEGACY_RAILWAY_ORIGIN = 'https://pretty-mercy-production-aca0.up.railway.app';

const productionServerOrigin = configuredProdServerOrigin
  .replace(/\/$/, '')
  .toLowerCase() === LEGACY_RAILWAY_ORIGIN
  ? PROD_SERVER_ORIGIN
  : configuredProdServerOrigin;

let effectiveServerOrigin;

if (import.meta.env.DEV) {
  effectiveServerOrigin = configuredServerOrigin || DEV_SERVER_ORIGIN;
} else {
  if (productionServerOrigin) {
    effectiveServerOrigin = productionServerOrigin;
  } else if (configuredServerOrigin && configuredServerOrigin !== DEV_SERVER_ORIGIN) {
    effectiveServerOrigin = configuredServerOrigin;
  } else {
    effectiveServerOrigin = PROD_SERVER_ORIGIN;
  }
}

/** Backend origin (no trailing slash): REST lives at `${SERVER_ORIGIN}/api`, uploads at `${SERVER_ORIGIN}/uploads`. */
export const SERVER_ORIGIN = effectiveServerOrigin.replace(/\/$/, '');

export const API_BASE_URL = `${SERVER_ORIGIN}/api`;

/** Same host as HTTP API; Socket.IO attaches to this origin. */
export const SOCKET_URL = SERVER_ORIGIN;
