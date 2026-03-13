import axios from "axios";

export class CMSCore {
  constructor(jsonServerUrl) {
    this.client = axios.create({
      baseURL: jsonServerUrl,
      timeout: 5000,
    });
  }

  async listPosts() {
    const response = await this.client.get("/posts");
    return response.data;
  }

  async getPostById(id) {
    const response = await this.client.get(`/posts/${id}`);
    return response.data;
  }

  async createPost(payload) {
    const post = {
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response = await this.client.post("/posts", post);
    return response.data;
  }

  async updatePost(id, payload) {
    const existing = await this.getPostById(id);
    const nextPost = {
      ...existing,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    const response = await this.client.put(`/posts/${id}`, nextPost);
    return response.data;
  }

  async deletePost(id) {
    await this.client.delete(`/posts/${id}`);
    return { message: "Post deleted successfully" };
  }
}
