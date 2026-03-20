import { useEffect, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load products"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <article
          key={product._id}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-sm text-slate-600 mt-1">{product.description}</p>
          <p className="text-orange-600 font-bold mt-2">${product.price}</p>
          {user && (
            <button
              className="mt-3 bg-slate-800 text-white px-3 py-1 rounded"
              onClick={() => addToCart(product._id)}
            >
              Add to cart
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
