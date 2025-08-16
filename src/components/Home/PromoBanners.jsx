// src/components/Home/PromoBanners.jsx
import React from 'react';

const PromoBanners = () => {
  return (
    <section className="promo-banners">
      <div className="promo-row-top">
        <div className="promo-small">
          <img src="/assets/promos/promo1-small.webp" alt="Promo pequeña" />
        </div>
        <div className="promo-medium">
          <img src="/assets/promos/promo2-medium.jpg" alt="Promo mediana" />
        </div>
      </div>

      <div className="promo-large">
        <img src="/assets/promos/promo3-large.png" alt="Promo grande" />
      </div>
    </section>
  );
};

export default PromoBanners;
