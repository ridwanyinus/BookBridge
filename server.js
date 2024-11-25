import express from 'express';
import pg from 'pg';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  port: 5432,
  password: 'yaro2825432',
  database: 'book-notes',
});

db.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Connection error:', err));

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3000' }));

let searchBook = [];

app.get('/api/admin', (req, res) => {
  const id = req.query.bookId;
  res.json(searchBook[id]);
});

app.post('/api/search-book', async (req, res) => {
  try {
    const query = req.body.searchBook;

    const result = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    searchBook = result.data.docs;
    res.json(result.data.docs);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books.' });
  }
});

app.get('/api/get-book', async (req, res) => {
  try {
    const sortField = req.query.sort || 'rating';
    const result = await fetchBook(sortField);
    res.json(result);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books.' });
  }
});

app.post('/api/add-book', async (req, res) => {
  const { title, author, rating, date, review, note, cover, isbn } = req.body;

  // Validate required fields
  if (!title || !author || !rating || !date || !review || !note || !cover || !isbn) {
    return res.status(400).json({
      message: 'All fields are required to add a book.',
    });
  }

  const addBook = `
    INSERT INTO note
    (title, author, rating, date_read, review, note, book_cover, isbn)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  try {
    // Execute the database query
    await db.query(addBook, [title, author, rating, date, review, note, cover, isbn]);

    res.json({ message: 'Book added successfully' });
  } catch (error) {
    console.error('Error adding book to database:', error.message);

    // Send error response to client
    res.status(500).json({
      message: 'Error adding book to database: duplicate key value violates unique constraint "note_title_key"',
      error: error.message,
    });
  }
});

app.get('/api/book', async (req, res) => {
  const bookId = req.query.bookId;

  if (!bookId) {
    return res.status(400).json({
      message: 'Book ID is required to fetch book details.',
    });
  }

  try {
    const response = await db.query('SELECT * FROM note WHERE title = $1', [bookId]);

    if (response.rows.length === 0) {
      return res.status(404).json({
        message: 'Book not found.',
      });
    }

    res.json(response.rows);
  } catch (error) {
    console.error('Error fetching book details:', error.message);

    res.status(500).json({
      message: 'An error occurred while fetching the book details. ',
      error: error.message,
    });
  }
});

app.post('/api/edit-book', async (req, res) => {
  const { title, author, rating, date, review, cover } = req.body;

  if (!title || !author || !rating || !date || !review || !cover) {
    return res.status(400).json({
      message: 'All fields (title, author, rating, date, review, cover) are required to edit the book details.',
    });
  }

  const editBookDetails = `
    UPDATE note
    SET title = $1, author = $2, rating = $3, date_read = $4, review = $5, book_cover = $6
    WHERE title = $7;
  `;

  try {
    const result = await db.query(editBookDetails, [title, author, rating, date, review, cover, title]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Book not found. Please provide a valid title.',
      });
    }

    res.json({ message: 'Book details edited successfully' });
  } catch (error) {
    console.error('Error editing book details:', error.message);

    res.status(500).json({
      message: 'An error occurred while editing the book details.',
      error: error.message,
    });
  }
});

app.get('/api/delete-book', async (req, res) => {
  const bookId = req.query.bookId;

  if (!bookId) {
    return res.status(400).json({
      message: 'Book ID is required to delete a book.',
    });
  }

  const deleteQuery = `DELETE FROM note WHERE title = $1 RETURNING *`;

  try {
    const result = await db.query(deleteQuery, [bookId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Book not found. No records were deleted.',
      });
    }

    res.json({ message: 'Book deleted successfully', deletedBook: result.rows[0] });
  } catch (error) {
    console.error('Error deleting book:', error.message);

    res.status(500).json({
      message: 'An error occurred while trying to delete the book.',
      error: error.message,
    });
  }
});

app.post('/api/add-note', async (req, res) => {
  const { note, title } = req.body;

  const addNote = `
    UPDATE note
    SET note = $1
    WHERE title = $2;
  `;

  try {
    await db.query(addNote, [note, title]);

    res.json('Note added successfully');
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to update the note' });
  }
});

app.post('/api/add-new-note', async (req, res) => {
  const { note, title } = req.body;

  const addNote = `
    UPDATE note
    SET note = note || $1
    WHERE title = $2;
  `;

  try {
    await db.query(addNote, [`\n\n${note}`, title]);
    res.json('Note added successfully');
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to update the note' });
  }
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});

async function fetchBook(sortField = 'rating') {
  let query = `SELECT * FROM note ORDER BY title ASC, date_read DESC, rating DESC`;

  if (sortField === 'title') {
    query = `SELECT * FROM note ORDER BY title ASC, date_read DESC, rating DESC`;
  } else if (sortField === 'rating') {
    query = `SELECT * FROM note ORDER BY rating DESC, title ASC, date_read DESC`;
  } else if (sortField === 'date_read') {
    query = `SELECT * FROM note ORDER BY date_read DESC, title ASC, rating DESC`;
  }

  const result = await db.query(query);
  return result.rows;
}
