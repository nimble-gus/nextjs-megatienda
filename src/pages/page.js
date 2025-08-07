// src/pages/index.jsx

import React from 'react';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/HomePage.css';

const HomePage = () => {
  return (
    <>
      <Topbar />
      <Header />
      <main className="home-main">
        <section className="home-placeholder">
          <h2>Bienvenido a LaMegaTiendaGT</h2>
          <p>Explora nuestras ofertas y productos destacados</p>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
