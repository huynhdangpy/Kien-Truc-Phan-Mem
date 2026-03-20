import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-sm space-y-3"
    >
      <h2 className="text-2xl font-semibold">Register</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input
        className="w-full border rounded p-2"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="w-full border rounded p-2"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        className="w-full border rounded p-2"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="w-full bg-orange-500 text-white py-2 rounded">
        Register
      </button>
    </form>
  );
}
