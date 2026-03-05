import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './FeedbackPage.module.css';

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Имитация отправки
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <div className={styles.feedbackPage}>
      <div className={styles.container}>
        <motion.h1 
          className={styles.pageTitle}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Обратная <span>связь</span>
        </motion.h1>

        <div className={styles.content}>
          <motion.div 
            className={styles.infoBlock}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Свяжитесь с нами</h2>
            <p>Если у вас есть вопросы, предложения или просто хотите поздороваться — заполните форму справа. Мы обязательно ответим!</p>
            
            <div className={styles.contactInfo}>
              <div className={styles.infoItem}>
                <span className={styles.icon}>📞</span>
                <div>
                  <h3>Телефон</h3>
                  <p>+7 (123) 456-78-90</p>
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.icon}>✉️</span>
                <div>
                  <h3>Email</h3>
                  <p>info@audiogarage.ru</p>
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.icon}>📍</span>
                <div>
                  <h3>Адрес</h3>
                  <p>г. Москва, ул. Звуковая, д. 1</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className={styles.formBlock}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {submitted ? (
              <div className={styles.successMessage}>
                <span className={styles.successIcon}>✓</span>
                <h3>Спасибо за обращение!</h3>
                <p>Мы свяжемся с вами в ближайшее время.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Имя</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ваше имя"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Сообщение</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Ваше сообщение..."
                    required
                  />
                </div>

                <button type="submit" className={styles.submitButton}>
                  Отправить сообщение
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;