import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

import { GET_ME } from '../graphql/queries';
import { REMOVE_BOOK } from '../graphql/mutations';

const SavedBooks = () => {
  /* -------------------- 1. Query current user -------------------- */
  const { loading, data } = useQuery(GET_ME, {
    skip: !Auth.loggedIn(),          // don’t even run if no JWT
    fetchPolicy: 'cache-and-network',
  });

  // `data?.me` is the user object or undefined while loading
  const userData = data?.me;

  /* -------------------- 2. Mutation: remove book ----------------- */
  const [removeBook] = useMutation(REMOVE_BOOK, {
    // Keep the GET_ME cache in sync
    update(cache, { data }) {
      if (!data?.removeBook) return;
      cache.writeQuery({
        query: GET_ME,
        data: { me: data.removeBook },
      });
    },
  });

  /* -------------------- 3. Delete handler ----------------------- */
  const handleDeleteBook = async (bookId: string) => {
    if (!Auth.loggedIn()) return false;

    try {
      await removeBook({ variables: { bookId } });
      removeBookId(bookId);            // update localStorage
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------- 4. Render ------------------------------- */
  if (loading) return <h2>LOADING...</h2>;
  if (!userData)   return <h2>Please log in to see saved books.</h2>;

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>
            Viewing {userData.username ? `${userData.username}'s` : 'saved'} books!
          </h1>
        </Container>
      </div>

      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>

        <Row>
          {userData.savedBooks.map((book) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {book.image && (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                )}

                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>

                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
