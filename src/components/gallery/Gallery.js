import React, { useState } from 'react';
import './Gallery.css'; 
import { ArtifyDesigns } from '../GalleryData'; 

const Gallery = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All'); 
  
  // 1. Aapki requirement ke mutabiq 15 products
  const itemsPerPage = 15;

  // Unique Categories nikalne ka logic
  const categories = ['All', ...new Set(ArtifyDesigns.map(item => item.category))];

  // Filtered Data logic
  const filteredData = activeFilter === 'All' 
    ? ArtifyDesigns 
    : ArtifyDesigns.filter(item => item.category === activeFilter);

  // --- PAGINATION LOGIC (Wapis Set Kiya) ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Smart Sliding Numbers (Sirf 3 dikhane ke liye)
  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, startPage + 2);
  if (endPage - startPage < 2) {
    startPage = Math.max(1, endPage - 2);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    if(i > 0) pageNumbers.push(i);
  }

  const paginate = (num) => { 
    setCurrentPage(num); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleFilterChange = (cat) => {
    setActiveFilter(cat);
    setCurrentPage(1); // Filter change hote hi page 1 par
  };

  return (
    <div className="gallery-container">
      <h2 className="section-title">My Creative Work</h2>

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
      
      <div className="design-grid">
        {currentItems.map((item) => (
          <div key={item.id} className="art-card">
            <div className="img-container" onClick={() => setSelectedImg(item.image)}>
              {/* <img src={require(`../designs/${item.image}`)} alt={item.title} /> */}
              <img src={`/designs/${item.image}`} alt={item.title} />
            </div>
            <div className="art-info">
              <h3>{item.title}</h3> 
              <p className="category-tag">{item.category}</p>
              <div className="upload-info"><span>🕒 Published: {item.date}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* --- PAGINATION UI (AB YE GAYAB NAHI HOGA) --- */}
      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 2 && (
            <button onClick={() => paginate(1)} className="page-btn first-btn">1 ..</button>
          )}

          <button 
            onClick={() => currentPage > 1 && paginate(currentPage - 1)} 
            className="page-btn arrow-btn"
            disabled={currentPage === 1}
          > &laquo; </button>

          {pageNumbers.map(number => (
            <button 
              key={number} 
              onClick={() => paginate(number)}
              className={currentPage === number ? "active-page" : "page-btn"}
            >
              {number}
            </button>
          ))}

          <button 
            onClick={() => currentPage < totalPages && paginate(currentPage + 1)} 
            className="page-btn arrow-btn"
            disabled={currentPage === totalPages}
          > &raquo; </button>
        </div>
      )}

      {/* Zoom Modal */}
      {selectedImg && (
        <div className="lightbox-overlay" onClick={() => setSelectedImg(null)}>
          <span className="close-btn">&times;</span>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={require(`../designs/${selectedImg}`)} alt="Zoomed" className="lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;