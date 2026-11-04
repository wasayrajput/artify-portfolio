import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/header/Header';
import Gallery from './components/gallery/Gallery';
import Footer from './components/footer/Footer';
import AdminPage from './components/admin/AdminPage';

function App() {
  const checkIsAdmin = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === '/admin' ||
      path === '/admin/' ||
      hash === '#admin' ||
      hash === '#/admin'
    );
  };

  const [isAdminView, setIsAdminView] = useState(checkIsAdmin);

  useEffect(() => {
    const handleNavigation = () => {
      setIsAdminView(checkIsAdmin());
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, []);

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAdminView) {
    return <AdminPage onBackToPortfolio={navigateToHome} />;
  }

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Gallery />
      </main>
      <Footer />
    </div>
  );
}

export default App;
