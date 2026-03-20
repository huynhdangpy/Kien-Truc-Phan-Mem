import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import api from "../services/api";

export default function Cart() {
  const { cart, loadCart, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    loadCart();
  }, []);

  const placeOrder = async () => {
    await api.post("/orders");
    await loadCart();
    alert("Order placed");
  };

  const total = (cart.items || []).reduce(
    (sum, i) => sum + i.quantity * (i.product?.price || 0),
    0,
  );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Your Cart</h2>
      {(cart.items || []).map((item) => (
        <div
          key={item.product?._id}
          className="bg-white p-4 rounded-lg shadow-sm flex justify-between"
        >
          <div>
            <p className="font-semibold">{item.product?.name}</p>
            <p className="text-sm text-slate-600">${item.product?.price}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              className="w-16 border rounded p-1"
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(item.product._id, Number(e.target.value))
              }
            />
            <button
              className="text-red-600"
              onClick={() => removeItem(item.product._id)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <p className="font-bold">Total: ${total.toFixed(2)}</p>
      <button
        className="bg-orange-500 text-white px-4 py-2 rounded"
        onClick={placeOrder}
        disabled={!cart.items?.length}
      >
        Place order
      </button>
    </section>
  );
}
