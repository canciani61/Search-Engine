import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-express';
import dotenv from 'dotenv';

dotenv.config();

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

export interface GraphQLContext {
  user?: JwtPayload;          // present only when the JWT is valid
}

/* ------------------------------------------------------------------ */
/* Context middleware for ApolloServer                                */
/* ------------------------------------------------------------------ */

/**
 * authMiddleware
 *
 * Pass this function to ApolloServer’s `context` option:
 *
 *   const server = new ApolloServer({
 *     typeDefs,
 *     resolvers,
 *     context: authMiddleware,
 *   });
 */
export const authMiddleware = ({ req }: { req: Request }): GraphQLContext => {
  // Expected header: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization ?? '';
  let token: string | undefined;

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1].trim();
  } else if (req.body?.token) {
    token = req.body.token;
  } else if (req.query?.token) {
    token = String(req.query.token);
  }

  if (!token) return {}; // unauthenticated request

  try {
    const secret = process.env.JWT_SECRET_KEY as string;
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return { user: decoded };
  } catch {
    throw new AuthenticationError('Invalid or expired token');
  }
};

/* ------------------------------------------------------------------ */
/* Helper to sign JWTs                                                */
/* ------------------------------------------------------------------ */

export const signToken = (
  user: { _id: string; username: string; email: string },
  expires = '1h'
): string => {
  const secret = process.env.JWT_SECRET_KEY as string;
  return jwt.sign(
    { _id: user._id, username: user.username, email: user.email },
    secret,
    { expiresIn: expires }
  );
};
