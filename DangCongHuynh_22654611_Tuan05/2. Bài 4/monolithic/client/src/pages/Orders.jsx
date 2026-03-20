import { useEffect, useState } from "react";
import api from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/history")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading orders...</p>;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Order History</h2>
      {orders.map((order) => (
        <div key={order._id} className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
          <p className="font-bold">Total: ${order.totalPrice.toFixed(2)}</p>
          <ul className="list-disc list-inside text-sm mt-2">
            {order.items.map((item) => (
              <li key={item.product}>
                {item.name} x {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
