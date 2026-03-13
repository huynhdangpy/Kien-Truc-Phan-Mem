const API_BASE_URL = "http://localhost:5000";

async function request(path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    ...restOptions,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getPosts: () => request("/posts"),
  getPostById: (id) => request(`/posts/${id}`),
  createPost: (payload) =>
    request("/posts", {
      method: "POST",
      headers: { "x-role": "admin" },
      body: JSON.stringify(payload),
    }),
  updatePost: (id, payload) =>
    request(`/posts/${id}`, {
      method: "PUT",
      headers: { "x-role": "admin" },
      body: JSON.stringify(payload),
    }),
  deletePost: (id) =>
    request(`/posts/${id}`, {
      method: "DELETE",
      headers: { "x-role": "admin" },
    }),
  getPlugins: () => request("/plugins"),
};
