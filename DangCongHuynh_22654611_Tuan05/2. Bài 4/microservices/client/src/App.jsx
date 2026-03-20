import { useEffect, useState } from "react";
import api from "./api";

export default function App() {
  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    const { data } = await api.get("/products");
    setProducts(data);
  };

  useEffect(() => {
    loadProducts().catch(() => {});
  }, []);

  const register = async () => {
    try {
      const { data } = await api.post("/auth/register", auth);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Register failed");
    }
  };

  const login = async () => {
    try {
      const { data } = await api.post("/auth/login", {
        email: auth.email,
        password: auth.password,
      });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Login failed");
    }
  };

  const addToCart = async (productId) => {
    if (!user) return;
    const { data } = await api.post(`/cart/${user.id}/items`, {
      productId,
      quantity: 1,
    });
    setCart(data);
  };

  const placeOrder = async () => {
    if (!user || !cart.items.length) return;
    const { data } = await api.post("/orders", {
      userId: user.id,
      items: cart.items,
    });
    setOrders([data, ...orders]);
    await api.delete(`/cart/${user.id}/clear`);
    setCart({ items: [] });
  };

  const loadOrders = async () => {
    if (!user) return;
    const { data } = await api.get(`/orders/history/${user.id}`);
    setOrders(data);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-orange-600">
        Food Delivery Microservices
      </h1>

      <section className="bg-white p-4 rounded-lg shadow-sm grid md:grid-cols-4 gap-2">
        <input
          className="border p-2 rounded"
          placeholder="Name"
          value={auth.name}
          onChange={(e) => setAuth({ ...auth, name: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={auth.email}
          onChange={(e) => setAuth({ ...auth, email: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Password"
          type="password"
          value={auth.password}
          onChange={(e) => setAuth({ ...auth, password: e.target.value })}
        />
        <div className="flex gap-2">
          <button
            className="bg-orange-500 text-white px-3 rounded"
            onClick={register}
          >
            Register
          </button>
          <button
            className="bg-slate-800 text-white px-3 rounded"
            onClick={login}
          >
            Login
          </button>
        </div>
      </section>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {user && (
        <p className="text-sm">
          Logged in as <b>{user.name}</b>
        </p>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-2">Products</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {products.map((p) => (
            <div key={p._id} className="bg-white rounded p-3 shadow-sm">
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-slate-600">${p.price}</p>
              <button
                className="mt-2 bg-emerald-600 text-white px-3 py-1 rounded"
                onClick={() => addToCart(p._id)}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded p-4 shadow-sm">
        <h2 className="text-xl font-semibold">Cart</h2>
        <ul className="list-disc list-inside text-sm">
          {cart.items.map((i) => (
            <li key={i.productId}>
              {i.productId} x {i.quantity}
            </li>
          ))}
        </ul>
        <button
          className="mt-3 bg-indigo-600 text-white px-4 py-1 rounded"
          onClick={placeOrder}
        >
          Place Order
        </button>
      </section>

      <section className="bg-white rounded p-4 shadow-sm">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">Orders</h2>
          <button className="text-sm underline" onClick={loadOrders}>
            Refresh
          </button>
        </div>
        <ul className="text-sm mt-2 space-y-2">
          {orders.map((o) => (
            <li key={o._id}>
              Order {o._id} - ${o.totalPrice}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
