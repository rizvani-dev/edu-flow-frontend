import { API_BASE_URL } from '../config/env';

const parseSseChunk = (chunk, onEvent) => {
  const blocks = chunk.split('\n\n').filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n');
    const eventLine = lines.find((line) => line.startsWith('event:'));
    const dataLine = lines.find((line) => line.startsWith('data:'));
    if (!dataLine) continue;

    const event = eventLine?.replace('event:', '').trim() || 'message';
    const data = JSON.parse(dataLine.replace('data:', '').trim());
    onEvent(event, data);
  }
};

export const streamAiResponse = async ({ path, body, token, onToken, onDone }) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ ...body, stream: true }),
  });

  if (!response.ok || !response.body) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || 'Streaming request failed');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const boundary = buffer.lastIndexOf('\n\n');
    if (boundary === -1) continue;

    const safeChunk = buffer.slice(0, boundary);
    buffer = buffer.slice(boundary + 2);

    parseSseChunk(safeChunk, (event, data) => {
      if (event === 'token') onToken?.(data.token || '');
      if (event === 'done') onDone?.(data);
    });
  }

  if (buffer.trim()) {
    parseSseChunk(buffer, (event, data) => {
      if (event === 'token') onToken?.(data.token || '');
      if (event === 'done') onDone?.(data);
    });
  }
};
