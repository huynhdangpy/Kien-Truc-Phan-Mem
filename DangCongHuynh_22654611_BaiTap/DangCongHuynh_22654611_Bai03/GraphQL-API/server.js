/**
 * GraphQL API - Apollo Server
 * Node.js + Apollo Server + GraphQL
 *
 * Khái niệm: GraphQL (Query Language)
 * - Declarative data fetching
 * - Single endpoint: POST /graphql
 * - Type system and schema
 * - No over-fetching, no under-fetching
 */

const { ApolloServer, gql } = require("apollo-server");

// ============================================
// IN-MEMORY DATA
// ============================================

let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

let posts = [
  { id: 1, userId: 1, title: "First Post", content: "Hello GraphQL" },
  { id: 2, userId: 1, title: "Second Post", content: "Query optimization" },
  { id: 3, userId: 2, title: "Bob's Post", content: "GraphQL rocks" },
];

// ============================================
// GRAPHQL SCHEMA (Type Definitions)
// ============================================

const typeDefs = gql`
  # User type
  type User {
    id: Int!
    name: String!
    email: String!
    posts: [Post!]!
  }

  # Post type
  type Post {
    id: Int!
    userId: Int!
    title: String!
    content: String!
    author: User!
  }

  # Query type (read operations)
  type Query {
    # Get user by ID
    user(id: Int!): User

    # Get all users
    users: [User!]!

    # Get post by ID
    post(id: Int!): Post

    # Get all posts
    posts: [Post!]!
  }

  # Mutation type (write operations)
  type Mutation {
    # Create new user
    createUser(name: String!, email: String!): User!

    # Create new post
    createPost(userId: Int!, title: String!, content: String!): Post!

    # Update user
    updateUser(id: Int!, name: String, email: String): User

    # Delete user
    deleteUser(id: Int!): Boolean!

    # Delete post
    deletePost(id: Int!): Boolean!
  }

  # Subscription type (real-time operations)
  type Subscription {
    # Subscribe to new posts
    postCreated: Post!
  }
`;

// ============================================
// RESOLVERS (Implementation)
// ============================================

const resolvers = {
  // Query resolvers
  Query: {
    user: (_, { id }) => {
      console.log(`[GraphQL] Query.user(id=${id})`);
      return users.find((u) => u.id === id);
    },

    users: () => {
      console.log("[GraphQL] Query.users");
      return users;
    },

    post: (_, { id }) => {
      console.log(`[GraphQL] Query.post(id=${id})`);
      return posts.find((p) => p.id === id);
    },

    posts: () => {
      console.log("[GraphQL] Query.posts");
      return posts;
    },
  },

  // Mutation resolvers
  Mutation: {
    createUser: (_, { name, email }) => {
      console.log(
        `[GraphQL] Mutation.createUser(name=${name}, email=${email})`,
      );
      const newUser = {
        id: Math.max(...users.map((u) => u.id), 0) + 1,
        name,
        email,
      };
      users.push(newUser);
      return newUser;
    },

    createPost: (_, { userId, title, content }) => {
      console.log(
        `[GraphQL] Mutation.createPost(userId=${userId}, title=${title})`,
      );
      const newPost = {
        id: Math.max(...posts.map((p) => p.id), 0) + 1,
        userId,
        title,
        content,
      };
      posts.push(newPost);
      return newPost;
    },

    updateUser: (_, { id, name, email }) => {
      console.log(`[GraphQL] Mutation.updateUser(id=${id})`);
      const user = users.find((u) => u.id === id);
      if (user) {
        if (name) user.name = name;
        if (email) user.email = email;
      }
      return user;
    },

    deleteUser: (_, { id }) => {
      console.log(`[GraphQL] Mutation.deleteUser(id=${id})`);
      const index = users.findIndex((u) => u.id === id);
      if (index > -1) {
        users.splice(index, 1);
        posts = posts.filter((p) => p.userId !== id);
        return true;
      }
      return false;
    },

    deletePost: (_, { id }) => {
      console.log(`[GraphQL] Mutation.deletePost(id=${id})`);
      const index = posts.findIndex((p) => p.id === id);
      if (index > -1) {
        posts.splice(index, 1);
        return true;
      }
      return false;
    },
  },

  // Field resolvers
  User: {
    // Get posts for a user
    posts: (user) => {
      console.log(`[GraphQL] User.posts(userId=${user.id})`);
      return posts.filter((p) => p.userId === user.id);
    },
  },

  Post: {
    // Get author for a post
    author: (post) => {
      console.log(`[GraphQL] Post.author(userId=${post.userId})`);
      return users.find((u) => u.id === post.userId);
    },
  },
};

// ============================================
// CREATE APOLLO SERVER
// ============================================

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Logging
  plugins: {
    didResolveOperation({ operationName }) {
      console.log(`Operation: ${operationName}`);
    },
  },
});

// ============================================
// START SERVER
// ============================================

server.listen({ port: 4000 }).then(({ url }) => {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log(`║ GraphQL Server running at ${url}${" ".repeat(18)}║`);
  console.log("║                                                  ║");
  console.log("║ Try queries at:                                  ║");
  console.log("║ - http://localhost:4000                          ║");
  console.log("║                                                  ║");
  console.log("║ Example Query:                                   ║");
  console.log("║ query {                                          ║");
  console.log("║   user(id: 1) {                                  ║");
  console.log("║     name                                         ║");
  console.log("║     posts { title }                              ║");
  console.log("║   }                                              ║");
  console.log("║ }                                                ║");
  console.log("╚══════════════════════════════════════════════════╝");
});

module.exports = { server, resolvers, typeDefs };
