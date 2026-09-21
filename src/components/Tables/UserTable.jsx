import React from 'react';
import { FaEdit, FaTrash, FaUser, FaComments, FaIdBadge, FaSchool, FaCloud } from 'react-icons/fa';
import './userTable.css';

const roleStyle = {
  teacher: { background: 'rgba(37, 99, 235, 0.12)', color: '#1d4ed8' },
  student: { background: 'rgba(16, 185, 129, 0.12)', color: '#15803d' },
  admin: { background: 'rgba(124, 58, 237, 0.12)', color: '#6d28d9' },
};

const UserTable = ({ users, onEdit, onDelete, onAddUser, onChat, loading, isOffline, unreadCounts = {} }) => {
  return (
    <section className="user-table-container glass-section">
      <div className="user-table-header glass-section-header">
        <div>
          <p className="glass-kicker">User Operations</p>
          <h2 className="user-table-title">Users Management</h2>
          <p className="user-table-subtitle">Manage teachers, students, class allocations, and direct messaging.</p>
        </div>

        <button onClick={onAddUser} className="add-user-btn glass-btn">
          <FaUser /> Add New User
        </button>
      </div>

      {isOffline && (
        <div className="offline-warning-banner">
          <FaCloud />
          <span>You are viewing offline data. Some records might not be synced with the server.</span>
        </div>
      )}

      <div className="user-cards-wrapper">
        {loading ? (
          <div className="loading-grid-state">
            <div className="minimalist-spinner"></div>
            <p>Syncing users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-grid-state">
            <FaUser size={40} opacity={0.2} />
            <p>No user records found matching your criteria.</p>
          </div>
        ) : (
          <div className="user-cards-grid">
            {users.map((user) => (
              <article key={user.id} className="user-card-item glass-card">
                <div className="user-card-header">
                  <div className="user-card-avatar-wrap">
                    {user.profile_image ? (
                      <img src={user.profile_image} alt={user.name} className="user-card-img" />
                    ) : (
                      <div className="user-card-avatar-fallback">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className={`status-indicator-dot ${user.online ? 'is-online' : 'is-offline'}`} title={user.online ? 'Online' : 'Offline'}></span>
                  </div>
                  <div className="user-card-role-badge" style={roleStyle[user.role] || roleStyle.student}>
                    {user.role}
                  </div>
                </div>

                <div className="user-card-body">
                  <h3 className="user-card-name">{user.name}</h3>
                  <p className="user-card-email">{user.email}</p>
                  
                  <div className="user-card-meta-grid">
                    <div className="meta-item">
                      <FaIdBadge className="meta-icon" />
                      <span>ID: {user.id}</span>
                    </div>
                    <div className="meta-item">
                      <FaSchool className="meta-icon" />
                      <span>{user.class_name || 'No Class'}</span>
                    </div>
                  </div>

                  {user.bio && (
                    <p className="user-card-bio">
                      {user.bio.length > 85 ? `${user.bio.slice(0, 82)}...` : user.bio}
                    </p>
                  )}
                </div>

                <div className="user-card-footer">
                  <div className="user-card-actions">
                    <button className="card-action-btn chat-btn" onClick={() => onChat?.(user)} title="Open inbox">
                      <FaComments color="#0f766e" />
                      <span>Inbox</span>
                      {unreadCounts[user.id] > 0 && (
                        <small className="unread-count-chip">{unreadCounts[user.id]}</small>
                      )}
                    </button>
                    <button className="card-action-btn edit-btn" onClick={() => onEdit(user)} title="Edit profile">
                      <FaEdit color="#2563eb" />
                      <span>Edit</span>
                    </button>
                    <button className="card-action-btn delete-btn" onClick={() => onDelete(user.id)} title="Delete user">
                      <FaTrash color="#dc2626" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UserTable;
