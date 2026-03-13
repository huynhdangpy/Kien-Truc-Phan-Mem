import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await api.getPostById(id);
        setPost(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadPost();
  }, [id]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!post) {
    return <p>Loading post...</p>;
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow">
      <h1 className="text-3xl font-bold text-slate-900">{post.title}</h1>
      <p className="mt-4 whitespace-pre-wrap text-slate-700">{post.content}</p>
      <p className="mt-4 text-sm text-slate-500">
        Updated:{" "}
        {post.updatedAt ? new Date(post.updatedAt).toLocaleString() : "N/A"}
      </p>
      <Link
        to="/"
        className="mt-4 inline-block text-sky-700 hover:text-sky-500"
      >
        Back to home
      </Link>
    </section>
  );
}
