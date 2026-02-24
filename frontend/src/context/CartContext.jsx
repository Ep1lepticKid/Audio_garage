import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Загружаем корзину из localStorage при запуске
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Сохраняем корзину в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Добавление в корзину с проверкой остатка
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      // Проверяем доступное количество на складе
      const availableStock = product.quantity || 0;
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > availableStock) {
          alert(`Нельзя добавить больше ${availableStock} шт. (доступно на складе)`);
          return prevItems;
        }
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantity > availableStock) {
          alert(`Нельзя добавить больше ${availableStock} шт. (доступно на складе)`);
          return prevItems;
        }
        return [...prevItems, { 
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          maxStock: availableStock
        }];
      }
    });
  };

  // Удаление из корзины
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Изменение количества
  const updateQuantity = (productId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
          if (newQuantity > item.maxStock) {
            alert(`Нельзя добавить больше ${item.maxStock} шт.`);
            return item;
          }
          if (newQuantity < 1) return item;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Очистка корзины
  const clearCart = () => {
    setCartItems([]);
  };

  // Подсчёт итогов
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      showCart,
      setShowCart
    }}>
      {children}
    </CartContext.Provider>
  );
};