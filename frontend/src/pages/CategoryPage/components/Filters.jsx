import React, { useState } from 'react';
import styles from './Filters.module.css';

const Filters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [priceError, setPriceError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setLocalFilters(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Валидация цен
    if (name === 'minPrice' || name === 'maxPrice') {
      const min = name === 'minPrice' ? value : localFilters.minPrice;
      const max = name === 'maxPrice' ? value : localFilters.maxPrice;
      
      if (min && max && Number(min) > Number(max)) {
        setPriceError('Минимальная цена не может быть больше максимальной');
      } else {
        setPriceError('');
      }
    }
  };

  const applyFilters = () => {
    if (!priceError) {
      onFilterChange(localFilters);
    }
  };

  const resetFilters = () => {
    const resetValues = {
      minPrice: '',
      maxPrice: '',
      inStock: false
    };
    setLocalFilters(resetValues);
    onFilterChange(resetValues);
    setPriceError('');
  };

  return (
    <div className={styles.filters}>
      <h3 className={styles.filtersTitle}>Фильтры</h3>
      
      {/* Ценовой диапазон */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Цена (₽)</label>
        <div className={styles.priceInputs}>
          <div className={styles.priceInputRow}>
            <input
                type="number"
                name="minPrice"
                placeholder="Мин. цена"
                value={localFilters.minPrice}
                onChange={handleInputChange}
                className={styles.priceInput}
                min="0"
                />
            </div>
            <div className={styles.priceInputRow}>
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Макс. цена"
                    value={localFilters.maxPrice}
                    onChange={handleInputChange}
                    className={styles.priceInput}
                    min="0"
                />
            </div>
        </div>
        {priceError && <span className={styles.errorMessage}>{priceError}</span>}
      </div>

      {/* Наличие */}
      <div className={styles.filterGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="inStock"
            checked={localFilters.inStock}
            onChange={handleInputChange}
          />
          <span>Только в наличии</span>
        </label>
      </div>

      {/* Кнопки */}
      <div className={styles.filterActions}>
        <button 
          className={styles.applyBtn}
          onClick={applyFilters}
        >
          Применить
        </button>
        <button 
          className={styles.resetBtn}
          onClick={resetFilters}
        >
          Сбросить
        </button>
      </div>
    </div>
  );
};

export default Filters;