const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// POST /transactions
router.post('/', async (req, res) => {
  try {
    const { bookId, bookName, type, quantity, date } = req.body;

    const validTypes = ['Add', 'Sold', 'Transfer']; // ✅ Added Transfer
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid transaction type. Allowed: ${validTypes.join(', ')}` });
    }

    const txnDate = date || (() => {
      const now = new Date();
      const tzOffset = now.getTime() + (5.5 * 60 * 60 * 1000); // IST offset
      const istDate = new Date(tzOffset);
      const yyyy = istDate.getFullYear();
      const MM = String(istDate.getMonth() + 1).padStart(2, '0');
      const dd = String(istDate.getDate()).padStart(2, '0');
      const HH = String(istDate.getHours()).padStart(2, '0');
      const mm = String(istDate.getMinutes()).padStart(2, '0');
      return `${yyyy}-${MM}-${dd} ${HH}:${mm}`;
    })();

    const newTxn = new Transaction({
      bookId,
      bookName,
      type,
      quantity,
      date: txnDate
    });

    const savedTxn = await newTxn.save();
    res.status(201).json(savedTxn);

  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /transactions
router.get('/', async (req, res) => {
  try {
    const trxList = await Transaction.find()
      .populate('bookId', 'name')
      .sort({ _id: -1 }); // sort by newest

    const formatted = trxList.map(tx => ({
      _id: tx._id,
      bookId: tx.bookId?._id || null,
      bookName: tx.bookName || tx.bookId?.name || "Unknown",
      type: tx.type,
      quantity: tx.quantity,
      date: tx.date
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
