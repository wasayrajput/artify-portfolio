import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <div>
      <footer className="footer">
        <p>© {new Date().getFullYear} Artify Studio | Built with React.js</p>
        <div className="social-links">
          <a href="https://www.instagram.com/artify_studio_569?igsh=MW9pYXQ3bzdtaWd4Mg==" target="_blank" rel="noreferrer">Instagram</a> • 
          <a href="https://www.linkedin.com/in/abdul-wasay-dev" target="_blank" rel="noreferrer">LinkedIn</a> • 
          <a href="https://github.com/wasayrajput" target="_blank" rel="noreferrer">GitHub</a> •
          <a href="https://wa.me/923274760151" target="_blank" rel="noreferrer">Contact</a>
        </div>
      </footer>
    </div>
  )
}

export default Footer