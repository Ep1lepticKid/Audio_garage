import React, { useState } from 'react';
import styles from './Specifications.module.css';

const Specifications = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className={styles.specifications}>
      {/* Вкладки */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'description' ? styles.active : ''}`}
          onClick={() => setActiveTab('description')}
        >
          Описание
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'specs' ? styles.active : ''}`}
          onClick={() => setActiveTab('specs')}
        >
          Характеристики
        </button>
      </div>

      {/* Содержимое вкладок */}
      <div className={styles.content}>
        {activeTab === 'description' && (
          <div className={styles.description}>
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p className={styles.noInfo}>Описание отсутствует</p>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className={styles.specs}>
            {Object.keys(product.specifications || {}).length > 0 ? (
              <table className={styles.specsTable}>
                <tbody>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key}>
                      <td className={styles.specName}>{key}</td>
                      <td className={styles.specValue}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.noInfo}>Характеристики отсутствуют</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Specifications;