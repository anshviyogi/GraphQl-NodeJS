const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { default: axios } = require("axios");

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  const server = new ApolloServer({
    typeDefs: `
        type Todos {
            id: ID!
            userId: ID!
            title: String!
            completed: String!
            user: Users
        }

        type Users {
            id: ID!
            name: String!
            username: String!
            email: String!
            phone: String!
        }

        type Query {
            getAllTodos: [Todos]
            getAllUsers: [Users]
            getSingleUser(id:ID!): Users
        }
    `,
    resolvers: {
      Todos: {
        user: async (todo) => {
          let data = await axios.get(
            `https://jsonplaceholder.typicode.com/users/${todo.userId}`
          );

          return data.data;
        },
      },
      Query: {
        getAllTodos: async () => {
          return (await axios.get("https://jsonplaceholder.typicode.com/todos"))
            .data;
        },
        getAllUsers: async () => {
          return (await axios.get("https://jsonplaceholder.typicode.com/users"))
            .data;
        },
        getSingleUser: async (parent, { id }) =>
          (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`))
            .data,
      },
    },
  });

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  app.listen(8000, () => {
    console.log("Server started at PORT 8000");
  });
}

startServer();
