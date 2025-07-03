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

// ✅ Summary route (total titles, total quantity, out-of-stock books)
router.get('/summary', async (req, res) => {
  try {
    const totalTitles = await Book.countDocuments({});
    const totalQuantityAgg = await Book.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
    ]);
    const totalQuantity = totalQuantityAgg[0]?.totalQuantity || 0;

    const outOfStockBooks = await Book.find({ quantity: 0 });

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

module.exports = router;
