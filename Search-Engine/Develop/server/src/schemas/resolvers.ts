/**********************************************************************
 *  resolvers.ts – Apollo Server v4 (TypeScript)
 *********************************************************************/

import { GraphQLError } from 'graphql';
import User from '../models/User.js';

import { signToken, type GraphQLContext } from '../services/auth.js';

/* ---------- helper for repeated auth check ---------- */
const unauth = () =>
  new GraphQLError('You must be logged in', {
    extensions: { code: 'UNAUTHENTICATED' },
  });

/* ---------- GraphQL resolvers ---------- */
export default {
  Query: {
    me: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      if (!context.user) throw unauth();

      const userId = context.user._id as string;
      const user = await User.findById(userId);
      return user;
    },
  },

  Mutation: {
    addUser: async (
      _parent: unknown,
      {
        username,
        email,
        password,
      }: { username: string; email: string; password: string }
    ) => {
      const userDoc = await User.create({
        username,
        email,
        password,
      });

      const token = signToken({
        _id: userDoc._id.toString(),
        username: userDoc.username,
        email: userDoc.email,
      });

      return { token, user: userDoc };
    },

    login: async (
      _parent: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      const userDoc =
        (await User.findOne({ email })) ||
        (await User.findOne({ username: email }));

      if (!userDoc || !(await userDoc.isCorrectPassword(password))) {
        throw new GraphQLError('Incorrect credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const token = signToken({
        _id: userDoc._id.toString(),
        username: userDoc.username,
        email: userDoc.email,
      });

      return { token, user: userDoc };
    },

    saveBook: async (
      _parent: unknown,
      { input }: { input: BookInput },
      context: GraphQLContext
    ) => {
      if (!context.user) throw unauth();

      const userId = context.user._id as string;

      return User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { savedBooks: input },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    },

    removeBook: async (
      _parent: unknown,
      { bookId }: { bookId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) throw unauth();

      const userId = context.user._id as string;

      return User.findByIdAndUpdate(
        userId,
        {
          $pull: { savedBooks: { bookId } },
        },
        {
          new: true,
        }
      );
    },
  },
};

/* ---------- Input type for book saving ---------- */
interface BookInput {
  bookId: string;
  authors?: string[];
  title?: string;
  description?: string;
  image?: string;
  link?: string;
}
