import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

export default function PostFormPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPost() {
      if (!isEdit) {
        return;
      }

      try {
        const post = await api.getPostById(id);
        setFormData({
          title: post.title || "",
          content: post.content || "",
          tags: post.tags || [],
        });
      } catch (err) {
        setError(err.message);
      }
    }

    loadPost();
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags
          .toString()
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (isEdit) {
        await api.updatePost(id, payload);
      } else {
        await api.createPost(payload);
      }

      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">
        {isEdit ? "Edit Post" : "Create Post"}
      </h1>

      {error && <p className="mb-3 text-red-600">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-1 block font-medium text-slate-800"
            htmlFor="title"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            className="mb-1 block font-medium text-slate-800"
            htmlFor="content"
          >
            Content
          </label>
          <textarea
            id="content"
            name="content"
            required
            value={formData.content}
            onChange={handleChange}
            rows={8}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            className="mb-1 block font-medium text-slate-800"
            htmlFor="tags"
          >
            Tags (comma separated)
          </label>
          <input
            id="tags"
            name="tags"
            value={
              Array.isArray(formData.tags)
                ? formData.tags.join(", ")
                : formData.tags
            }
            onChange={handleChange}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded bg-sky-700 px-4 py-2 font-medium text-white hover:bg-sky-600"
          >
            {isEdit ? "Update Post" : "Create Post"}
          </button>

          <Link
            to="/admin"
            className="rounded bg-slate-300 px-4 py-2 hover:bg-slate-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
