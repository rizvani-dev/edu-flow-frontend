import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../../api/axiosInstance';
import './announcement.css'

const AnnouncementForm = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);

    try {
      await API.post('/announcements', {
        title: title.trim(),
        description: description.trim()
      });

      toast.success("Announcement published successfully!");
      setTitle('');
      setDescription('');
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to publish announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="announcement-form-card glass-section">
      <div className="glass-section-header">
        <div>
          <p className="glass-kicker">Broadcast Studio</p>
          <h3>Create New Announcement</h3>
          <p className="glass-muted">Publish premium school-wide updates with cleaner structure and faster readability.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="glass-form-stack">
        <input
          className="glass-input"
          type="text"
          placeholder="Announcement Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required 
        />

        <textarea
          className="glass-textarea"
          placeholder="Write your announcement here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          required
        />

        <button type="submit" disabled={loading} className="publish-btn glass-btn">
          {loading ? 'Publishing...' : 'Publish Announcement'}
        </button>
      </form>
    </section>
  );
};

export default AnnouncementForm;
