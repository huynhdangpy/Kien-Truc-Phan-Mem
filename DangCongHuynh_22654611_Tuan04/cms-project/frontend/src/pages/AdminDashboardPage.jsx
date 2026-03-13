import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState([]);
  const [plugins, setPlugins] = useState([]);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [postData, pluginData] = await Promise.all([
        api.getPosts(),
        api.getPlugins(),
      ]);
      setPosts(postData);
      setPlugins(pluginData.plugins || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(postId) {
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) {
      return;
    }

    try {
      await api.deletePost(postId);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <Link
          to="/admin/create"
          className="rounded bg-sky-700 px-4 py-2 font-medium text-white hover:bg-sky-600"
        >
          Create New Post
        </Link>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h2 className="text-xl font-semibold text-slate-800">Loaded Plugins</h2>
        <ul className="mt-2 list-disc pl-6 text-slate-700">
          {plugins.map((pluginName) => (
            <li key={pluginName}>{pluginName}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-lg font-semibold text-slate-900">
              {post.title}
            </h3>
            <div className="mt-3 flex gap-3">
              <Link
                className="rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-500"
                to={`/admin/edit/${post.id}`}
              >
                Edit
              </Link>
              <button
                type="button"
                className="rounded bg-rose-600 px-3 py-1 text-white hover:bg-rose-500"
                onClick={() => handleDelete(post.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <p className="rounded bg-white p-4 shadow">No posts yet.</p>
        )}
      </div>
    </section>
  );
}
