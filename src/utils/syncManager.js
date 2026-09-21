export const getSyncQueue = () => JSON.parse(localStorage.getItem('sync_queue') || '[]');
export const setSyncQueue = (queue) => localStorage.setItem('sync_queue', JSON.stringify(queue));
export const addToSyncQueue = (item) => {
  const queue = getSyncQueue();
  queue.push({ 
    ...item, 
    id: Date.now() + Math.random(), 
    timestamp: new Date().toISOString() 
  });
  setSyncQueue(queue);
};