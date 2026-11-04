import React, { useState, useEffect } from 'react';
import './AdminPage.css';

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

const AdminPage = ({ onBackToPortfolio }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('artify_admin_token') === 'authorized';
  });

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

  // Designs list for admin management
  const [designs, setDesigns] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all designs for admin overview
  const fetchDesigns = async () => {
    setLoadingDesigns(true);
    try {
      const res = await fetch(`${API_URL}/api/designs`);
      if (res.ok) {
        const data = await res.json();
        setDesigns(data);
      }
    } catch (err) {
      console.warn('Designs fetch error:', err.message);
    } finally {
      setLoadingDesigns(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDesigns();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_SECRET) {
      setIsAuthenticated(true);
      sessionStorage.setItem('artify_admin_token', 'authorized');
      setAuthError('');
    } else {
      setAuthError('Ghalat password! Sahi password enter karein.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('artify_admin_token');
    setPassword('');
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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Image select karna zaroori hai!' });
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

      setUploadStatus({ type: 'success', message: '🎉 Design Cloud par upload ho gaya!' });

      // Prepend to admin list
      setDesigns((prev) => [result.data, ...prev]);

      // Reset form
      setTitle('');
      setSelectedFile(null);
      setPreviewUrl('');
      setCustomCategory('');

      setTimeout(() => {
        setUploadStatus({ type: '', message: '' });
      }, 3000);
    } catch (err) {
      console.error(err);
      setUploadStatus({
        type: 'error',
        message: err.message || 'Upload fail ho gaya. Make sure backend chal raha hai.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (design) => {
    if (!window.confirm(`Kya aap "${design.title}" ko permanently delete karna chahte hain?`)) {
      return;
    }

    try {
      if (design._id) {
        const res = await fetch(`${API_URL}/api/designs/${design._id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Delete failed on server');
      }

      setDesigns((prev) => prev.filter((d) => (d._id ? d._id !== design._id : d.legacyId !== design.legacyId)));
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };

  const filteredAdminDesigns = designs.filter((d) =>
    (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page-root">
      {/* Top Bar */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <span className="admin-logo">ARTIFY <span>STUDIO</span></span>
          <span className="admin-tag">Admin Panel</span>
        </div>
        <div className="admin-nav-right">
          <button className="admin-btn-back" onClick={onBackToPortfolio}>
            ← View Portfolio
          </button>
          {isAuthenticated && (
            <button className="admin-btn-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="admin-page-content">
        {!isAuthenticated ? (
          /* Login Card */
          <div className="admin-login-card">
            <div className="admin-lock-badge">🔐</div>
            <h1>Admin Authentication</h1>
            <p>Enter the master password to access design upload and management:</p>
            <form onSubmit={handleLogin} className="admin-login-form">
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="admin-login-input"
              />
              {authError && <div className="admin-auth-error">{authError}</div>}
              <button type="submit" className="admin-login-btn">
                Unlock Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Dashboard */
          <div className="admin-dashboard-container">
            {/* Stats Row */}
            <div className="admin-stats-row">
              <div className="stat-card">
                <span className="stat-number">{designs.length}</span>
                <span className="stat-label">Total Designs</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">☁️</span>
                <span className="stat-label">Cloudinary (CDN) Connected</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🍃</span>
                <span className="stat-label">MongoDB Atlas Connected</span>
              </div>
            </div>

            {/* Split layout: Upload on Left/Top, Manage on Right/Bottom */}
            <div className="admin-grid-layout">
              {/* Upload Card */}
              <div className="admin-card upload-card">
                <h2>⚡ Upload New Design</h2>
                <p className="card-subtitle">Choose image, enter details, and publish directly to cloud.</p>

                <form onSubmit={handleUploadSubmit} className="admin-upload-form">
                  {/* Dropzone */}
                  <div className="admin-dropzone-wrapper">
                    {previewUrl ? (
                      <div className="admin-preview-wrap">
                        <img src={previewUrl} alt="Preview" className="admin-preview-image" />
                        <button
                          type="button"
                          className="admin-change-img-btn"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl('');
                          }}
                        >
                          ✕ Change Photo
                        </button>
                      </div>
                    ) : (
                      <label className="admin-custom-dropzone">
                        <span className="dropzone-icon">📷</span>
                        <span className="dropzone-primary-text">Click to choose design photo</span>
                        <span className="dropzone-secondary-text">JPG, PNG, WEBP (Max 10MB)</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                      </label>
                    )}
                  </div>

                  {/* Title */}
                  <div className="admin-form-group">
                    <label>Design Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Luxury Business Card Design"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="admin-input-control"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="admin-input-control"
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
                        placeholder="Type custom category name..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="admin-input-control"
                        style={{ marginTop: '8px' }}
                        required
                      />
                    )}
                  </div>

                  {/* Date */}
                  <div className="admin-form-group">
                    <label>Publish Date</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="admin-input-control"
                    />
                  </div>

                  {/* Status Banner */}
                  {uploadStatus.message && (
                    <div className={`admin-status-banner ${uploadStatus.type}`}>
                      {uploadStatus.message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="admin-submit-upload-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="admin-spinner"></span> Uploading to Cloud...
                      </>
                    ) : (
                      '🚀 Upload to Cloud & Live Site'
                    )}
                  </button>
                </form>
              </div>

              {/* Manage Existing Designs Card */}
              <div className="admin-card manage-card">
                <div className="manage-header">
                  <h2>📂 Manage Designs ({filteredAdminDesigns.length})</h2>
                  <input
                    type="text"
                    placeholder="Search by title or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="admin-search-input"
                  />
                </div>

                {loadingDesigns ? (
                  <div className="admin-loading-state">Loading designs from cloud...</div>
                ) : (
                  <div className="admin-designs-list">
                    {filteredAdminDesigns.map((item, index) => {
                      const itemKey = item._id || item.legacyId || index;
                      const imgSrc = item.image.startsWith('http')
                        ? item.image
                        : `/designs/${item.image}`;

                      return (
                        <div key={itemKey} className="admin-design-row">
                          <img src={imgSrc} alt={item.title} className="admin-row-thumb" />
                          <div className="admin-row-info">
                            <span className="admin-row-title">{item.title}</span>
                            <div className="admin-row-meta">
                              <span className="admin-row-tag">{item.category}</span>
                              <span className="admin-row-date">🕒 {item.date}</span>
                            </div>
                          </div>
                          <button
                            className="admin-row-delete-btn"
                            title="Delete this design"
                            onClick={() => handleDelete(item)}
                          >
                            🗑️
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
