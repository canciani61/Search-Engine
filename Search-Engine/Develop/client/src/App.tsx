import { Outlet } from 'react-router-dom';
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import Navbar from './components/Navbar';
import './App.css';

/* ------------------------------------------------------------------ */
/* 1.  Create the HTTP link to your GraphQL endpoint                   */
/* ------------------------------------------------------------------ */
const httpLink = createHttpLink({
  // When running through the same Express server, this is just /graphql
  uri: '/graphql',
});

/* ------------------------------------------------------------------ */
/* 2.  Attach the JWT to every outgoing request                        */
/* ------------------------------------------------------------------ */
const authLink = setContext((_, { headers }) => {
  // Boot‑camp starter saves tokens as id_token; adjust if you use another key
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

/* ------------------------------------------------------------------ */
/* 3.  Instantiate the Apollo client                                   */
/* ------------------------------------------------------------------ */
const client = new ApolloClient({
  link: authLink.concat(httpLink), // authLink ➜ httpLink
  cache: new InMemoryCache(),
});

/* ------------------------------------------------------------------ */
/* 4.  Export the wrapped App                                          */
/* ------------------------------------------------------------------ */
function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
