import { gql } from 'graphql-tag';

export default gql`
  # --------------- Root Query ---------------
  type Query {
    # Returns the logged‑in user (or null if not authenticated)
    me: User
  }

  # -------------- Root Mutation -------------
  type Mutation {
    # Authentication
    login(email: String!, password: String!): Auth!
    addUser(username: String!, email: String!, password: String!): Auth!

    # Book management
    saveBook(input: BookInput!): User!     # adds a book and returns updated user
    removeBook(bookId: ID!): User!         # removes a book and returns updated user
  }

  # -------------- Domain Types -------------
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int!
    savedBooks: [Book!]!
  }

  type Book {
    bookId: String!
    authors: [String]          # array may be empty or undefined
    description: String
    title: String
    image: String
    link: String
  }

  # -------------- Input Types --------------
  input BookInput {
    bookId: String!
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }

  # -------------- Auth Payload -------------
  type Auth {
    token: String!
    user: User!
  }
`;
