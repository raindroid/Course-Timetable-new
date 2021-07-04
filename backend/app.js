const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const mongoose = require('mongoose')

require("dotenv").config();

async function startServer() {
  const app = express();
  const port = process.env.PORT;

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/testOnly" });

  await mongoose.connect(process.env.DB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  console.log('Mongoose Connected ...')

  // Routes
  app.set("trust proxy", true);

  app.get("/", function (req, res) {
    res.send("Hello World");
  });

  app.use("/api", function (req, res) {
    res.json({
      data: "API is preparing",
    });
  });

  app.listen(port, () => {
    console.log(`Course Timetable app listening at http://localhost:${port}`);
  });
}
startServer();
