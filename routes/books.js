const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Transaction = require('../models/Transaction'); // ✅ Import Transaction model

// ✅ Add new book
router.post('/', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// ✅ Search / list books with pagination (return _id, name & quantity)
router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = parseInt(req.query.limit) || 20; // default 20 books per page
    const skip = (page - 1) * limit;

    // Filter books by name if search query is provided
    const filter = searchQuery
      ? { name: { $regex: searchQuery, $options: 'i' } }
      : {};

    // Get total count for pagination
    const totalBooks = await Book.countDocuments(filter);

    // Fetch books for current page
    const books = await Book.find(filter, { name: 1, quantity: 1 }) // ✅ _id included by default
      .sort({ name: 1 }) // Alphabetical order
      .skip(skip)
      .limit(limit);

    res.json({
      page,
      totalPages: Math.ceil(totalBooks / limit),
      totalBooks,
      books,
    });
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// ✅ Update quantity
router.put('/:id', async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// ✅ Summary route (total titles, total quantity, out-of-stock books)
router.get('/summary', async (req, res) => {
  try {
    const totalTitles = await Book.countDocuments({});
    const totalQuantityAgg = await Book.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
    ]);
    const totalQuantity = totalQuantityAgg[0]?.totalQuantity || 0;

    const outOfStockBooks = await Book.find(
      { quantity: 0 },
      { name: 1, quantity: 1 } // ✅ Include _id for future updates
    );

    res.json({
      totalTitles,
      totalQuantity,
      outOfStockBooks
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: 'Server error fetching summary' });
  }
});

// ✅ Transfer stock
router.post('/transfer/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock to transfer' });
    }

    // Decrease stock
    book.quantity -= quantity;
    await book.save();

    // Log transfer as a transaction
    const txnDate = new Date().toLocaleString('en-GB', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '').replace(/\//g, '-');

    const transaction = new Transaction({
      bookId: book._id,
      bookName: book.name,
      type: 'Transfer',
      quantity,
      date: txnDate,
    });
    await transaction.save();

    res.json({
      message: 'Stock transferred and transaction logged',
      updatedBook: { _id: book._id, name: book.name, quantity: book.quantity }, // ✅ Include _id
      transferTransaction: transaction
    });
  } catch (err) {
    console.error('Error during stock transfer:', err);
    res.status(500).json({ error: 'Failed to transfer stock' });
  }
});

module.exports = router;
