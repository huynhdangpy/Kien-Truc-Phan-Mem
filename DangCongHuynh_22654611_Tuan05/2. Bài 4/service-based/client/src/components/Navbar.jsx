import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-orange-600">
          Food Delivery
        </Link>
        <div className="flex gap-4 items-center text-sm">
          <Link to="/products">Products</Link>
          {user && <Link to="/cart">Cart</Link>}
          {user && <Link to="/orders">Orders</Link>}
          {user && <Link to="/profile">Profile</Link>}
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link
                to="/register"
                className="bg-orange-500 text-white px-3 py-1 rounded"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              className="bg-slate-800 text-white px-3 py-1 rounded"
              onClick={logout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
