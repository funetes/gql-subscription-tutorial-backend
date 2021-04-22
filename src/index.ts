import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import cors from "cors";
import dotenv from "dotenv";
import { ChatResolver } from "./resolvers/chat";
import http from "http";

dotenv.config();

const main = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors({ origin: "http://localhost:3000", credentials: true }));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [ChatResolver],
      validate: false,
    }),
    subscriptions: {
      path: "/subscriptions",
      onConnect: (p) => {
        console.log("p", p);
        console.log("client connected");
      },
      onDisconnect: (p) => {
        console.log("disConnect", p);
        console.log("client disconnected");
      },
    },
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
  apolloServer.installSubscriptionHandlers(httpServer);
  httpServer.listen(process.env.PORT, () => {
    console.log(
      `Server ready at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
    );
    console.log(
      `Subscriptions ready at ws://localhost:${process.env.PORT}${apolloServer.subscriptionsPath}`
    );
  });
};

main().catch((err) => {
  console.log(err);
});
