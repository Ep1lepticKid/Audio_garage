import React from 'react';
import styles from './ContactsPage.module.css';

const ContactsPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Контакты</h1>
      <div className={styles.content}>
        <div className={styles.info}>
          <h2 className={styles.subtitle}>Аудио Гараж</h2>
          <p className={styles.address}>
            <span className={styles.icon}>📍</span>
            г. Москва, Канатчиковский проезд, вл13
          </p>
          <p className={styles.phone}>
            <span className={styles.icon}>📞</span>
            +7 (123) 456-78-90
          </p>
          <p className={styles.email}>
            <span className={styles.icon}>✉️</span>
            info@audiogarage.ru
          </p>
          <p className={styles.workTime}>
            <span className={styles.icon}>🕒</span>
            Пн-Пт: 10:00 - 20:00<br />
            Сб-Вс: 11:00 - 18:00
          </p>
        </div>

        <div className={styles.mapContainer}>
          <iframe 
            src="https://yandex.ru/map-widget/v1/?ll=37.598878%2C55.698770&mode=whatshere&whatshere%5Bpoint%5D=37.599261%2C55.698408&whatshere%5Bzoom%5D=17&z=16.19" 
            width="100%" 
            height="400" 
            frameBorder="0"
            allowFullScreen={true}
            style={{ border: '2px solid #7a914b' }}
            title="Карта Аудио Гаража"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;