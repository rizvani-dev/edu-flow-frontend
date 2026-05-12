import React from 'react';
import { FaChalkboardTeacher, FaComments } from 'react-icons/fa';

const TeacherCard = React.memo(({
  teacher,
  onMessageClick
}) => {
  if (!teacher) return null;

  return (
    <div className="info-card teacher-card-container">
      <h3 className="section-title text-blue-800">
        <FaChalkboardTeacher className="inline mr-2" /> Teacher Profile
      </h3>
      <div className="teacher-card-content">
        <div className="teacher-main-info">
          <div className="teacher-avatar-wrapper">
            {teacher.profile_image ? (
              <img src={teacher.profile_image} alt={teacher.name} />
            ) : (
              <div className="avatar-placeholder">T</div>
            )}
          </div>
          <div className="teacher-details">
            <p className="teacher-name">{teacher.name}</p>
            <p className="teacher-role">Class In-charge • {teacher.class_name || 'N/A'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`status-dot ${teacher?.online ? 'online' : 'offline'}`} />
              <span className="text-xs font-medium text-slate-500 uppercase">
                {teacher?.online ? 'Available now' : 'Currently offline'}
              </span>
            </div>
          </div>
        </div>
        {teacher.bio ? <p className="teacher-bio-summary">{teacher.bio}</p> : null}
      </div>
      <button className="message-teacher-btn" onClick={onMessageClick}>
        <FaComments /> Message Your Teacher
      </button>
    </div>
  );
});

TeacherCard.displayName = 'TeacherCard';

export default TeacherCard;