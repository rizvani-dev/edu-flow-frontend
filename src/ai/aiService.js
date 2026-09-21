import API from '../api/axiosInstance';
import { withAiCache } from './aiCacheLayer';
import { aiRateGuard } from './aiRateLimiter';
import { streamAiResponse } from './aiStreamingHandler';

const token = () => localStorage.getItem('token');

export const getStudentPerformanceInsight = async ({ studentId, remarks, cacheKey }) => {
  aiRateGuard(`student-performance:${studentId || 'self'}`);
  return withAiCache(
    'student-performance',
    cacheKey || { studentId, remarks },
    async () => {
      const url = studentId ? `/ai/student-performance/${studentId}` : '/ai/student-performance';
      const { data } = await API.post(url, { remarks }, { timeout: 60000 });
      return data;
    },
    1000 * 60 * 20
  );
};

export const getStudentPredictionInsight = async ({ studentId, remarks, cacheKey }) => {
  aiRateGuard(`student-prediction:${studentId || 'self'}`);
  return withAiCache(
    'student-prediction',
    cacheKey || { studentId, remarks },
    async () => {
      const url = studentId ? `/ai/student-prediction/${studentId}` : '/ai/student-prediction';
      const { data } = await API.post(url, { remarks }, { timeout: 60000 });
      return data;
    },
    1000 * 60 * 20
  );
};

export const getTopAchieversInsight = async ({ roleScope = 'dashboard' } = {}) => {
  aiRateGuard(`top-achievers:${roleScope}`);
  return withAiCache(
    'top-achievers',
    { roleScope },
    async () => {
      const { data } = await API.get('/ai/top-achievers', { timeout: 60000 });
      return data;
    },
    1000 * 60 * 20
  );
};

export const sendAiChatMessage = async ({ message, context }) => {
  aiRateGuard('ai-chat');
  const { data } = await API.post('/ai/chat', { message, context }, { timeout: 60000 });
  return data;
};

export const streamAiChatMessage = async ({ message, context, onToken, onDone }) => {
  aiRateGuard('ai-chat-stream');
  return streamAiResponse({
    path: '/ai/chat',
    body: { message, context },
    token: token(),
    onToken,
    onDone,
  });
};

export const generateAiQuiz = async (payload) => {
  aiRateGuard('ai-quiz');
  const { data } = await API.post('/ai/quiz', payload);
  return data;
};

export const listAiModels = async () => {
  const { data } = await API.get('/ai/free-models');
  return data;
};
