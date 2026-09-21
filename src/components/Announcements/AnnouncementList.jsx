import React from 'react';
import { FaTrash } from 'react-icons/fa';
import './announcement.css'

const AnnouncementList = ({ announcements, onDelete, canDelete = false }) => {
  return (
    <div className="announcements-list">
      {announcements.length === 0 ? (
        <div className="empty-state glass-empty glass-card">
          No announcements available at the moment.
        </div>
      ) : (
        announcements.map((ann) => {
          const annDate = new Date(ann.date);
          
          return (
            <article key={ann.id} className="announcement-item glass-card">
              <div className="announcement-glow" />
              <div className="announcement-header">
                <div>
                  <p className="announcement-chip">Live Announcement</p>
                  <h4 className="announcement-title">{ann.title}</h4>
                    <p className="announcement-description">{ann.description}</p>
                  <div className="announcement-meta">
                    <span className="announcement-author">By: <strong>{ann.created_by_name || 'Admin'}</strong></span>
                    <span className="announcement-date glass-chip">
                      {annDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {canDelete && (
                  <button 
                    onClick={() => onDelete(ann.id)}
                    className="delete-btn glass-icon-btn"
                    title="Delete Announcement"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

            
            </article>
          );
        })
      )}
    </div>
  );
};

export default AnnouncementList;
