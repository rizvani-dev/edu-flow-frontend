import React from 'react';
import { FaEdit, FaTrash, FaUser, FaComments } from 'react-icons/fa';
import './userTable.css';

const roleStyle = {
  teacher: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  student: { backgroundColor: '#dcfce7', color: '#15803d' },
  admin: { backgroundColor: '#ede9fe', color: '#6d28d9' },
};

const UserTable = ({ users, onEdit, onDelete, onAddUser, onChat, loading }) => {
  return (
    <div className="user-table-container">
      <div className="user-table-header">
        <div>
          <h2 className="user-table-title">Users Management</h2>
          <p className="user-table-subtitle">Manage teachers, students, class allocations, and direct messaging.</p>
        </div>

        <button onClick={onAddUser} className="add-user-btn">
          <FaUser /> Add New User
        </button>
      </div>

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Class</th>
              <th>Status</th>
              <th>Bio</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-row">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-primary">
                      {user.profile_image ? (
                        <img src={user.profile_image} alt={user.name} className="user-avatar" />
                      ) : (
                        <div className="user-avatar user-avatar-fallback">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                       <div className="user-id-badge">
                        ID: {user.id}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="role-pill" style={roleStyle[user.role] || roleStyle.student}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div>{user.class_name || '-'}</div>
                    {user.role === 'student' && user.teacher_name ? (
                      <small className="user-email">Teacher: {user.teacher_name}</small>
                    ) : null}
                  </td>
                  <td>
                    <span className={`status-pill ${user.online ? 'is-online' : 'is-offline'}`}>
                      {user.online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td>{user.bio ? `${user.bio.slice(0, 54)}${user.bio.length > 54 ? '...' : ''}` : '-'}</td>
                  <td className="actions">
                    <button onClick={() => onChat?.(user)} title="Open chat">
                      <FaComments color="#0f766e" />
                    </button>
                    <button onClick={() => onEdit(user)} title="Edit user">
                      <FaEdit color="#2563eb" />
                    </button>
                    <button onClick={() => onDelete(user.id)} title="Delete user">
                      <FaTrash color="#dc2626" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
