const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Add book
router.post('/', async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.json(book);
});

// Search / list books
router.get('/', async (req, res) => {
  const query = req.query.search || '';
  const books = await Book.find({ name: { $regex: query, $options: 'i' } });
  res.json(books);
});

// Update quantity
router.put('/:id', async (req, res) => {
  const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

module.exports = router;
