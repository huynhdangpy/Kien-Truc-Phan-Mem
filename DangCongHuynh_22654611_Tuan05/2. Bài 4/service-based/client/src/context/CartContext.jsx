import { createContext, useContext, useState } from "react";
import api from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });

  const loadCart = async () => {
    const { data } = await api.get("/users/cart");
    setCart(data);
  };

  const addToCart = async (productId) => {
    const { data } = await api.post("/users/cart", { productId, quantity: 1 });
    setCart(data);
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await api.put(`/users/cart/${productId}`, { quantity });
    setCart(data);
  };

  const removeItem = async (productId) => {
    const { data } = await api.delete(`/users/cart/${productId}`);
    setCart(data);
  };

  return (
    <CartContext.Provider
      value={{ cart, loadCart, addToCart, updateQuantity, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
