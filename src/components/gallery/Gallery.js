import React, { useState, useEffect } from 'react';
import './Gallery.css';
import { ArtifyDesigns } from '../GalleryData';
import AdminUploadModal from '../admin/AdminUploadModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Gallery = () => {
  const [designs, setDesigns] = useState(ArtifyDesigns);
  const [selectedImg, setSelectedImg] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('artify_admin') === 'true';
  });

  const itemsPerPage = 15;

  // Fetch designs from Cloud Database / Backend
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const res = await fetch(`${API_URL}/api/designs`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDesigns(data);
          }
        }
      } catch (err) {
        console.warn('Backend connection unavailable, using local design cache:', err.message);
      }
    };

    fetchDesigns();
  }, []);

  // Helper to resolve full image URL (Cloudinary or local public fallback)
  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }
    return `/designs/${img}`;
  };

  // Callback when a new design is uploaded via Admin Modal
  const handleDesignAdded = (newDesign) => {
    setDesigns((prev) => [newDesign, ...prev]);
    setActiveFilter('All');
    setCurrentPage(1);
  };

  // Optional: Delete design (only visible to unlocked Admin)
  const handleDeleteDesign = async (item, e) => {
    e.stopPropagation();
    if (!window.confirm(`Kya aap "${item.title}" ko delete karna chahte hain?`)) {
      return;
    }

    try {
      if (item._id) {
        const res = await fetch(`${API_URL}/api/designs/${item._id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Delete request failed');
      }

      setDesigns((prev) => prev.filter((d) => (d._id ? d._id !== item._id : d.id !== item.id)));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const categories = ['All', ...new Set(designs.map((item) => item.category).filter(Boolean))];

  const filteredData =
    activeFilter === 'All'
      ? designs
      : designs.filter((item) => item.category === activeFilter);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, startPage + 2);
  if (endPage - startPage < 2) {
    startPage = Math.max(1, endPage - 2);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    if (i > 0) pageNumbers.push(i);
  }

  const paginate = (num) => {
    setCurrentPage(num);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (cat) => {
    setActiveFilter(cat);
    setCurrentPage(1);
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header-row">
        <h2 className="section-title">My Creative Work</h2>
        {isAdmin && (
          <span className="admin-badge">
            🔐 Admin Mode Active
          </span>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="filter-container">
        {categories.map((cat, index) => (
          <button
            key={index}
            className={`filter-btn ${activeFilter === cat ? 'active-filter' : ''}`}
            onClick={() => handleFilterChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Design Grid */}
      <div className="design-grid">
        {currentItems.map((item, idx) => {
          const itemKey = item._id || item.legacyId || item.id || idx;
          const imgSrc = getImageUrl(item.image);

          return (
            <div key={itemKey} className="art-card">
              <div className="img-container" onClick={() => setSelectedImg(item.image)}>
                <img src={imgSrc} alt={item.title} loading="lazy" />
              </div>
              <div className="art-info">
                <div className="art-info-top">
                  <h3>{item.title}</h3>
                  {isAdmin && (
                    <button
                      className="delete-card-btn"
                      title="Delete design"
                      onClick={(e) => handleDeleteDesign(item, e)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <p className="category-tag">{item.category}</p>
                <div className="upload-info">
                  <span>🕒 Published: {item.date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 2 && (
            <button onClick={() => paginate(1)} className="page-btn first-btn">
              1 ..
            </button>
          )}

          <button
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            className="page-btn arrow-btn"
            disabled={currentPage === 1}
          >
            &laquo;
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={currentPage === number ? 'active-page' : 'page-btn'}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
            className="page-btn arrow-btn"
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </div>
      )}

      {/* Zoom Lightbox Modal */}
      {selectedImg && (
        <div className="lightbox-overlay" onClick={() => setSelectedImg(null)}>
          <span className="close-btn">&times;</span>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={getImageUrl(selectedImg)} alt="Zoomed" className="lightbox-img" />
          </div>
        </div>
      )}

      {/* Floating Action Button for Upload */}
      <button
        className="admin-fab-btn"
        onClick={() => setIsModalOpen(true)}
        title="Upload new design"
      >
        <span className="admin-fab-icon">⚡</span>
        <span>Upload Design</span>
      </button>

      {/* Admin Upload Modal */}
      <AdminUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDesignAdded={handleDesignAdded}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />
    </div>
  );
};

export default Gallery;
