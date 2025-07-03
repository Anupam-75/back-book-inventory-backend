const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// 📚 Add a new book
router.post('/', async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// 🔍 Search or list all books
router.get('/', async (req, res) => {
  try {
    const query = req.query.search || '';
    const books = await Book.find({ name: { $regex: query, $options: 'i' } });
    res.json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// ✏️ Update book quantity
router.put('/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(updatedBook);
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// 📊 Get summary: total titles, total quantity, and out-of-stock books
router.get('/summary', async (req, res) => {
  try {
    const totalTitles = await Book.countDocuments();
    const totalQuantityAgg = await Book.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);
    const totalQuantity = totalQuantityAgg[0] ? totalQuantityAgg[0].total : 0;

    const outOfStockBooks = await Book.find({ quantity: 0 });

    res.json({
      totalTitles,
      totalQuantity,
      outOfStockBooks
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
