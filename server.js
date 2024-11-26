import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const app = express();
const port = process.env.NODE_ENV === 'production' ? process.env.PORT : 4000;
const API_URL = process.env.NODE_ENV === 'production' ? process.env.API_URL : 'http://localhost:4000';
const supabaseUrl = 'https://exngtygoeiilahayrrjd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());

let searchBook = [];

app.get('/', async (req, res) => {
  const sortField = req.query.sort;
  try {
    const result = await axios.get(`${API_URL}/api/get-book`, {
      params: { sort: sortField },
    });
    res.render('index.ejs', { book: result.data });
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

// Backend logic
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

  if (!title || !author || !rating || !date || !review || !note || !cover || !isbn) {
    return res.status(400).json({
      message: 'All fields are required to add a book.',
    });
  }

  try {
    // Insert data into Supabase
    const { data, error } = await supabase.from('note').insert([
      {
        title,
        author,
        rating,
        date_read: date, // Ensure date format is correct
        review,
        note,
        book_cover: cover,
        isbn,
      },
    ]);

    if (error) {
      throw error; // Forward the error to the catch block
    }

    res.json({ message: 'Book added successfully', data });
  } catch (error) {
    console.error('Error adding book to database:', error.message);

    res.status(500).json({
      message: 'Error adding book to database',
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
    const { data, error } = await supabase.from('note').select('*').eq('title', bookId);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: 'Book not found.',
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching book details:', error.message);

    res.status(500).json({
      message: 'An error occurred while fetching the book details.',
      error: error.message,
    });
  }
});

app.post('/api/edit-book', async (req, res) => {
  const { id, title, author, rating, date, review, cover } = req.body;

  if (!title || !author || !rating || !date || !review || !cover) {
    return res.status(400).json({
      message: 'All fields (title, author, rating, date, review, cover) are required to edit the book details.',
    });
  }

  try {
    // Update the book details in the 'note' table
    const { data, error } = await supabase
      .from('note')
      .update({
        title,
        author,
        rating,
        date_read: date,
        review,
        book_cover: cover,
      })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ message: 'Book Updated successfully' });
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

  try {
    // Attempt to delete the book based on the bookId
    const { data, error } = await supabase.from('note').delete().eq('title', bookId);

    if (error) {
      throw new Error(error.message);
    }

    // If deletion is successful, respond with success message
    return res.status(200).json({
      message: 'Book deleted successfully',
      deletedBookId: bookId, // Use bookId for clarity
    });
  } catch (error) {
    console.error('Error deleting book:', error.message);

    // Send 500 status with the error message
    return res.status(500).json({
      message: 'An error occurred while trying to delete the book.',
      error: error.message,
    });
  }
});

app.post('/api/add-note', async (req, res) => {
  const { note, title } = req.body;

  if (!note || !title) {
    return res.status(400).json({
      message: 'Both note and title are required to add a note.',
    });
  }

  try {
    // Update the note for the specified title in the 'note' table
    const { data, error } = await supabase.from('note').update({ note }).eq('title', title).select();

    if (error) {
      throw new Error(error.message);
    }

    if (data.length === 0) {
      return res.status(404).json({
        message: 'Book with the provided title not found.',
      });
    }

    res.json({ message: 'Note added successfully', updatedNote: data[0] });
  } catch (error) {
    console.error('Error updating note:', error.message);

    res.status(500).json({
      message: 'An error occurred while updating the note.',
      error: error.message,
    });
  }
});

app.post('/api/add-new-note', async (req, res) => {
  const { note, title } = req.body;

  try {
    const { data: currentNoteData, error: fetchError } = await supabase.from('note').select('note').eq('title', title).single();

    if (fetchError) {
      throw new Error('Failed to fetch the current note.');
    }

    const currentNote = currentNoteData?.note || '';

    const { error: updateError } = await supabase
      .from('note')
      .update({ note: `${currentNote}\n\n${note}` })
      .eq('title', title);

    if (updateError) {
      throw new Error('Failed to update the note.');
    }

    res.json('Note added successfully');
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to update the note' });
  }
});

async function fetchBook(sortField = 'rating') {
  // Define the base query
  let query = supabase.from('note').select('*');

  // Add logic for dynamic sorting based on `sortField`
  if (sortField === 'title') {
    query = query.order('title', { ascending: true }).order('date_read', { ascending: false }).order('rating', { ascending: false });
  } else if (sortField === 'rating') {
    query = query.order('rating', { ascending: false }).order('title', { ascending: true }).order('date_read', { ascending: false });
  } else if (sortField === 'date_read') {
    query = query.order('date_read', { ascending: false }).order('title', { ascending: true }).order('rating', { ascending: false });
  }

  // Execute the query
  const { data, error } = await query;

  // Handle errors
  if (error) {
    console.error('Error fetching books:', error.message);
    throw new Error('Unable to fetch books');
  }

  return data;
}

app.listen(port, () => {
  console.log(`localhost running on port ${port}`);
});
