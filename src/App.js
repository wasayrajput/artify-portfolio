import React from 'react';
import './App.css';
import Header from './components/header/Header';
import Gallery from './components/gallery/Gallery';
import Footer from './components/footer/Footer';

function App() {
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