const express = require("express");
const { ApolloServer } = require("@apollo/server");
const bodyParser = require("body-parser");
const cors = require("cors");
const { expressMiddleware } = require("@apollo/server/express4");
const { default: axios } = require("axios");

async function startServer() {
  const app = express();
  const server = new ApolloServer({
    // ! - this sign means that this field is mandatory
    typeDefs: `
        type User {
            id: ID!
            name: String!
            username: String!
            email: String!
            phone: String!
            website: String!
        }

        type Todo {
            id: ID!
            title: String!
            completed: Boolean
            user: User
        }

        type Query{
            getTodos: [Todo]
            getAllUsers: [User]
            getUser(id:ID!): User
        }
    `,

    resolvers: {
      Todo: {
        user: async (todo) =>
          (
            await axios.get(
              `https://jsonplaceholder.typicode.com/users/${todo.id}`
            )
          ).data,
      },
      Query: {
        getTodos: async () =>
          // Else database operations are done here
          (await axios.get("https://jsonplaceholder.typicode.com/todos")).data,

        getAllUsers: async () => {
          return (await axios.get("https://jsonplaceholder.typicode.com/users"))
            .data;
        },
        getUser: async (parent, { id }) => {
          return (
            await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)
          ).data;
        },
      },
    },
  });

  app.use(bodyParser.json());
  app.use(cors());

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  app.listen(8000, () => {
    console.log("Server started at port 8000");
  });
}

startServer();
