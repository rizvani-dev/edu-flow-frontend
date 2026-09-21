import React, { useState, useEffect, useCallback } from 'react';
import { FaCloudUploadAlt, FaSync, FaTimes, FaCircle, FaSearch, FaExclamationTriangle, FaTrashRestore, FaRedo } from 'react-icons/fa';
import API from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import './syncQueue.css';

const SyncQueueManager = ({ isOnline, onSyncComplete }) => {
  const [queue, setQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const refreshQueue = useCallback(() => {
    setQueue(JSON.parse(localStorage.getItem('sync_queue') || '[]'));
  }, []);

  const runSync = useCallback(async () => {
    const currentQueue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
    if (!navigator.onLine || isSyncing || currentQueue.length === 0) return;
    
    setIsSyncing(true);
    const failedItems = [];
    toast("Syncing your offline tasks...", { icon: '🔄', id: 'sync-toast' });

    for (const item of currentQueue) {
      if (item.hasConflict) {
        failedItems.push(item);
        continue;
      }
      try {
        await API({
          method: item.method,
          url: item.url,
          data: item.payload
        });
      } catch (error) {
        if (error.response?.status === 409) {
          failedItems.push({ ...item, hasConflict: true });
          toast.error(`Conflict detected for ${item.type}. Manual resolution required.`, { id: 'conflict-toast' });
        } else {
          failedItems.push(item);
        }
      }
    }

    localStorage.setItem('sync_queue', JSON.stringify(failedItems));
    setQueue(failedItems);
    setIsSyncing(false);

    if (failedItems.length === 0) {
      toast.success("Sync complete!", { id: 'sync-toast' });
      if (onSyncComplete) onSyncComplete();
    } else {
      toast.error(`Sync partially failed. ${failedItems.length} items remaining.`, { id: 'sync-toast' });
    }
  }, [isSyncing, onSyncComplete]);

  const resolveConflict = (id, action) => {
    const currentQueue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
    let updatedQueue;
    if (action === 'discard') {
      updatedQueue = currentQueue.filter(item => item.id !== id);
    } else {
      updatedQueue = currentQueue.map(item => item.id === id ? { ...item, hasConflict: false } : item);
    }
    localStorage.setItem('sync_queue', JSON.stringify(updatedQueue));
    setQueue(updatedQueue);
    if (action === 'retry') runSync();
  };

  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, 3000);
    if (navigator.onLine) runSync();
    
    window.addEventListener('online', runSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', runSync);
    };
  }, [refreshQueue, runSync]);

  if (queue.length === 0) return null;

  const filteredQueue = queue.filter(item => 
    (item.type || 'task').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sync-manager-fixed">
      <button className={`sync-fab ${isSyncing ? 'syncing' : ''}`} onClick={() => setShowPanel(!showPanel)}>
        <FaCloudUploadAlt />
        <span className="sync-badge">{queue.length}</span>
      </button>
      {showPanel && (
        <div className="sync-popover glass-card">
          <div className="sync-popover-header">
            <h4>Offline Tasks ({queue.length})</h4>
            <button className="close-panel-btn" onClick={() => setShowPanel(false)}><FaTimes /></button>
          </div>
            <div className="sync-search-bar">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Filter tasks by type..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          <div className="sync-popover-body">
              {filteredQueue.map(item => (
                <div key={item.id} className={`sync-queue-item ${item.hasConflict ? 'conflicted' : ''}`}>
                  {item.hasConflict ? <FaExclamationTriangle className="dot error" /> : <FaCircle className="dot" />}
                <div className="info">
                    <p>{item.type.charAt(0).toUpperCase() + item.type.slice(1).replace('_', ' ')}</p>
                  <small>{new Date(item.timestamp).toLocaleTimeString()}</small>
                </div>
                  {item.hasConflict && (
                    <div className="conflict-actions">
                      <button onClick={() => resolveConflict(item.id, 'retry')} title="Force Retry" className="conflict-btn retry">
                        <FaRedo />
                      </button>
                      <button onClick={() => resolveConflict(item.id, 'discard')} title="Discard" className="conflict-btn discard">
                        <FaTrashRestore />
                      </button>
                    </div>
                  )}
              </div>
            ))}
              {filteredQueue.length === 0 && <p className="empty-filter">No matches found.</p>}
          </div>
          <button className="btn-sync-action" disabled={!isOnline || isSyncing} onClick={runSync}>
            {isSyncing ? 'Processing...' : isOnline ? 'Sync All Now' : 'Waiting for Internet...'}
          </button>
        </div>
      )}
    </div>
  );
};
export default SyncQueueManager;