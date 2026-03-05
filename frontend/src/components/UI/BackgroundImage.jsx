import React from 'react';
import styles from './BackgroundImage.module.css';
import garageImage from '../../assets/images/garage.jpg';

const BackgroundImage = ({ children }) => {
  return (
    <div className={styles.backgroundWrapper}>
      <div 
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${garageImage})` }}
      />
      <div className={styles.overlay} />
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default BackgroundImage;