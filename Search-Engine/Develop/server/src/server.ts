/**********************************************************************
 *  server.ts – Express + Apollo Server (GraphQL)                      *
 *********************************************************************/
import express, { Express } from 'express';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import dotenv from 'dotenv';

import db from './config/connection';           // MongoDB / Mongoose
import typeDefs from './schemas/typeDefs';
import resolvers from './schemas/resolvers';
import { authMiddleware } from './utils/auth';   // the file we just wrote

dotenv.config();

const PORT = process.env.PORT || 3001;

/* ------------------------------------------------------------------ */
/*  Create the Express app                                            */
/* ------------------------------------------------------------------ */
const app: Express = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ------------------------------------------------------------------ */
/*  Create and start Apollo Server                                    */
/* ------------------------------------------------------------------ */
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  formatError: (err) => {
    // 🔒  Prevent leaking stack traces in production.
    if (process.env.NODE_ENV === 'production') {
      const { message, locations, path, extensions } = err;
      return { message, locations, path, extensions };
    }
    return err;
  },
});

await apolloServer.start();

/*  Mount Apollo as /graphql                                           */
app.use(
  '/graphql',
  expressMiddleware(apolloServer, {
    context: authMiddleware,      // attaches decoded `user` (if any)
  })
);

/* ------------------------------------------------------------------ */
/*  Serve React static assets in production                           */
/* ------------------------------------------------------------------ */
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../client/build');
  app.use(express.static(clientBuild));

  // React Router catch‑all:
  app.get('*', (_, res) =>
    res.sendFile(path.join(clientBuild, 'index.html'))
  );
}

/* ------------------------------------------------------------------ */
/*  Start the HTTP server after Mongo connects                        */
/* ------------------------------------------------------------------ */
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍  REST/GraphQL server running on port ${PORT}`);
    console.log(`🚀  GraphQL endpoint ready at http://localhost:${PORT}/graphql`);
  });
});
