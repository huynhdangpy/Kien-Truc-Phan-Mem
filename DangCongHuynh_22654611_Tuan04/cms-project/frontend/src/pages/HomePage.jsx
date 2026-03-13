import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await api.getPosts();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  return (
    <section>
      <h1 className="mb-4 text-3xl font-bold text-slate-900">All Posts</h1>

      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-4">
        {posts.map((post) => (
          <article key={post.id} className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-xl font-semibold text-slate-800">
              {post.title}
            </h2>
            <p className="mt-2 text-slate-600">
              {(post.content || "").slice(0, 120)}...
            </p>
            <Link
              className="mt-3 inline-block font-medium text-sky-700 hover:text-sky-500"
              to={`/posts/${post.id}`}
            >
              View details
            </Link>
          </article>
        ))}

        {!loading && posts.length === 0 && (
          <p className="rounded bg-white p-4 shadow">No posts available.</p>
        )}
      </div>
    </section>
  );
}
