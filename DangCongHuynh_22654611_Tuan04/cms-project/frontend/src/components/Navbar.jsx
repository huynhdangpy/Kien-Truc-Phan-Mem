import { Link } from "react-router-dom";

export default function Navbar({ role, onRoleChange }) {
  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex gap-4">
          <Link to="/" className="font-semibold hover:text-sky-300">
            CMS Home
          </Link>
          <Link to="/admin" className="hover:text-sky-300">
            Admin Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-300">Current role:</span>
          <select
            className="rounded bg-slate-800 px-2 py-1 text-sm"
            value={role}
            onChange={(event) => onRoleChange(event.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
