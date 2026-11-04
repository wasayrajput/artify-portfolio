import React, { useState } from 'react';
import './AdminUploadModal.css';

const ADMIN_SECRET = 'artify2026';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CATEGORY_OPTIONS = [
  'Event Flyer',
  'Business Card',
  'Social Media',
  'Marketing',
  'Packaging',
  'Logo Design',
  'Restaurant Menu',
  'Banner & Cover',
  'Other',
];

const AdminUploadModal = ({ isOpen, onClose, onDesignAdded, isAdmin, setIsAdmin }) => {
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Event Flyer');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(() => {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

  if (!isOpen) return null;

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_SECRET) {
      setIsAdmin(true);
      sessionStorage.setItem('artify_admin', 'true');
      setAuthError('');
    } else {
      setAuthError('Ghalat password! Baraye meharbani sahi password enter karein.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadStatus({ type: 'error', message: 'Sirf image files (JPG, PNG, WEBP) allowed hain.' });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadStatus({ type: '', message: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Design image select karna zaroori hai!' });
      return;
    }
    if (!title.trim()) {
      setUploadStatus({ type: 'error', message: 'Design title likhna zaroori hai!' });
      return;
    }

    const finalCategory = category === 'Other' ? customCategory.trim() || 'General' : category;

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', title.trim());
    formData.append('category', finalCategory);
    formData.append('date', date.trim());

    setIsSubmitting(true);
    setUploadStatus({ type: 'info', message: 'Cloudinary par upload aur database save ho raha hai...' });

    try {
      const response = await fetch(`${API_URL}/api/designs`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Upload fail ho gaya.');
      }

      setUploadStatus({ type: 'success', message: '🎉 Design Cloud par kamyabi se upload ho gaya!' });

      if (onDesignAdded) {
        onDesignAdded(result.data);
      }

      // Reset form
      setTimeout(() => {
        setTitle('');
        setSelectedFile(null);
        setPreviewUrl('');
        setCustomCategory('');
        setUploadStatus({ type: '', message: '' });
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setUploadStatus({
        type: 'error',
        message: err.message || 'Server se connect nahi ho saka. Make sure backend chal raha hai.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="admin-close-btn" onClick={onClose}>
          &times;
        </button>

        {!isAdmin ? (
          <div className="admin-auth-box">
            <div className="admin-lock-icon">🔐</div>
            <h2>Admin Login</h2>
            <p>Naye designs cloud par upload karne ke liye password enter karein:</p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="admin-input"
              />
              {authError && <div className="admin-error-msg">{authError}</div>}
              <button type="submit" className="admin-submit-btn">
                Unlock
              </button>
            </form>
          </div>
        ) : (
          <div className="admin-upload-box">
            <div className="admin-header-row">
              <h2>☁️ Cloud Design Upload</h2>
              <button
                className="admin-logout-btn"
                onClick={() => {
                  setIsAdmin(false);
                  sessionStorage.removeItem('artify_admin');
                }}
              >
                Logout
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              {/* File Upload Drop Area */}
              <div className="admin-file-picker">
                {previewUrl ? (
                  <div className="admin-preview-container">
                    <img src={previewUrl} alt="Preview" className="admin-preview-img" />
                    <button
                      type="button"
                      className="admin-remove-img"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                    >
                      ✕ Change Image
                    </button>
                  </div>
                ) : (
                  <label className="admin-dropzone">
                    <span className="upload-icon">📁</span>
                    <span className="dropzone-text">Click to choose design photo (or drag & drop)</span>
                    <span className="dropzone-sub">JPG, PNG, WEBP (Max 10MB)</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>

              {/* Title */}
              <div className="admin-field">
                <label>Design Title</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Luxury Visiting Card"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="admin-input"
                  required
                />
              </div>

              {/* Category */}
              <div className="admin-field">
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="admin-select"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {category === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom category name..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="admin-input custom-cat-input"
                    required
                  />
                )}
              </div>

              {/* Date */}
              <div className="admin-field">
                <label>Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="admin-input"
                />
              </div>

              {/* Status Message */}
              {uploadStatus.message && (
                <div className={`admin-status-msg ${uploadStatus.type}`}>
                  {uploadStatus.message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="admin-submit-btn upload-btn"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span> Uploading to Cloud...
                  </>
                ) : (
                  '🚀 Upload to Cloud & Live Website'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUploadModal;
