import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = 3000;
const API_URL = 'https://bookbridge-9res.onrender.com/' || 'http://localhost:4000';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());

app.get('/', async (req, res) => {
  const sortField = req.query.sort;
  try {
    const result = await axios.get(`${API_URL}/api/get-book`, {
      params: { sort: sortField },
    });
    res.render('index', { book: result.data });
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).send({
      message: 'An error occurred while fetching books. Please try again later.',
      error: error.response?.data || 'Internal Server Error',
    });
  }
});

app.get('/admin', async (req, res) => {
  try {
    const result = await axios.get(`${API_URL}/api/get-book`);
    res.render('admin', { book: result.data });
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).send({
      message: 'An error occurred while fetching books. Please try again later.',
      error: error.response?.data || 'Internal Server Error',
    });
  }
});

app.get('/admin/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await axios.get(`${API_URL}/api/admin`, {
      params: { bookId: id },
    });
    res.render('new', { book: result.data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

app.get('/search-book', async (req, res) => {
  res.render('search-book');
});

app.post('/search-book', async (req, res) => {
  const query = req.body.searchBook.trim().toLowerCase();

  if (!query) {
    return res.status(400).send('Search term is required.');
  }

  try {
    const result = await axios.post(`${API_URL}/api/search-book`, { searchBook: query });

    res.render('search-book', { data: result.data });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).send('Failed to fetch books.');
  }
});

app.post('/add-book', async (req, res) => {
  const { title, author, rating, date, review, note, cover, isbn } = req.body;

  try {
    await axios.post(`${API_URL}/api/add-book`, { title, author, rating, date, review, note, cover, isbn });
    res.redirect('/admin');
  } catch (error) {
    console.error('Error adding book:', error.message);

    const errorMessage = error.response?.data?.message || 'Failed to add book. Please try again later.';

    res.status(500).send({
      message: 'An error occurred while adding the book. Check if the book already exists.',
      error: errorMessage,
    });
  }
});

app.get('/book/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const result = await axios.get(`${API_URL}/api/book`, {
      params: { bookId },
    });

    res.render('book', { book: result.data });
  } catch (error) {
    console.error('Error fetching book details:', error.message);

    const errorMessage = error.response?.data?.message || 'Failed to fetch book details. Please try again later.';

    res.status(500).send({
      message: 'An error occurred while fetching the book details.',
      error: errorMessage,
    });
  }
});

app.get('/edit-book/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const result = await axios.get(`${API_URL}/api/book`, {
      params: { bookId },
    });

    res.render('edit', { book: result.data });
  } catch (error) {
    console.error('Error fetching book details for editing:', error.message);

    const errorMessage = error.response?.data?.message || 'Failed to fetch book details for editing. Please try again later.';

    res.status(500).send({
      message: 'An error occurred while fetching the book details for editing.',
      error: errorMessage,
    });
  }
});

app.post('/edit-book', async (req, res) => {
  const { id, title, author, rating, date, review, cover } = req.body;

  try {
    await axios.post(`${API_URL}/api/edit-book`, {
      id,
      title,
      author,
      rating,
      date,
      review,
      cover,
    });
    res.redirect('/admin');
  } catch (error) {
    console.error('Error editing the book:', error.message);

    const errorMessage = error.response?.data?.message || 'Failed to edit the book. Please try again later.';

    res.status(500).send({
      message: 'An error occurred while editing the book.',
      error: errorMessage,
    });
  }
});

app.get('/delete/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const result = await axios.get(`${API_URL}/api/book`, {
      params: { bookId },
    });

    res.render('confirm-delete', { book: result.data[0] });
  } catch (error) {
    console.error('Error fetching book for deletion:', error.message);
    res.status(500).send('Failed to fetch the book details.');
  }
});

app.post('/delete/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    // Sending the bookId to the delete API endpoint
    const result = await axios.get(`${API_URL}/api/delete-book`, {
      params: { bookId }, // Pass the bookId as a query parameter
    });

    res.redirect('/admin'); // Redirect to the admin page
  } catch (error) {
    // Log the full error to help with debugging
    console.error('Error deleting the book:', error);

    // Extracting the error message from the response, if available
    const errorMessage = error.response?.data?.message || 'Failed to delete the book. Please try again later.';

    // Send the 500 error status with the message
    res.status(500).send({
      message: 'An error occurred while deleting the book.',
      error: errorMessage,
    });
  }
});

app.get('/add-note/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const result = await axios.get(`${API_URL}/api/book`, {
      params: { bookId },
    });

    res.render('note', { book: result.data });
  } catch (error) {
    console.error('Error fetching book details for notes:', error.message);

    const errorMessage = error.response?.data?.message || 'Failed to fetch book details for notes. Please try again later.';

    res.status(500).send({
      message: 'An error occurred while fetching the book details for notes.',
      error: errorMessage,
    });
  }
});

app.post('/add-note', async (req, res) => {
  const { note, title } = req.body;
  try {
    const result = await axios.post(`${API_URL}/api/add-note`, { note, title });
    console.log(result.data);
    res.redirect('/admin');
  } catch (error) {
    console.error('Error in Axios POST:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/add-new-note/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const result = await axios.get(`${API_URL}/api/book`, {
      params: { bookId },
    });

    res.render('new-note', { book: result.data });
  } catch (error) {
    console.error('Error fetching book details for new note:', error.message);

    const errorMessage = error.response?.data?.message || 'Failed to fetch book details for new note. Please try again later.';

    res.status(500).send({
      message: 'An error occurred while fetching the book details for a new note.',
      error: errorMessage,
    });
  }
});

app.post('/add-new-note', async (req, res) => {
  const { note, title } = req.body;
  try {
    const result = await axios.post(`${API_URL}/api/add-new-note`, { note, title });
    console.log(result.data);
    res.redirect('/admin');
  } catch (error) {
    console.error('Error in Axios POST:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`localhost running on port ${port}`);
});
