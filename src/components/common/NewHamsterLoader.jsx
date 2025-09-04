'use client';

import '@/styles/NewHamsterLoader.css';

const NewHamsterLoader = ({ size = 'medium', message = 'Cargando...' }) => {
  const sizeClasses = {
    small: 'hamster-small',
    medium: 'hamster-medium',
    large: 'hamster-large'
  };

  return (
    <div className="new-hamster-loader">
      <div className={`hamster-container ${sizeClasses[size]}`}>
        <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className="wheel-and-hamster">
          <div className="wheel"></div>
          <div className="hamster">
            <div className="hamster__body">
              <div className="hamster__head">
                <div className="hamster__ear"></div>
                <div className="hamster__eye"></div>
                <div className="hamster__nose"></div>
              </div>
              <div className="hamster__limb hamster__limb--fr"></div>
              <div className="hamster__limb hamster__limb--fl"></div>
              <div className="hamster__limb hamster__limb--br"></div>
              <div className="hamster__limb hamster__limb--bl"></div>
              <div className="hamster__tail"></div>
            </div>
          </div>
          <div className="spoke"></div>
        </div>
      </div>
      {message && <p className="hamster-message">{message}</p>}
    </div>
  );
};

export default NewHamsterLoader;







