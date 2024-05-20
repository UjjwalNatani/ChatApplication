const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
      const messages = await Message.find().sort({ timestamp: 1 });
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching messages' });
    }
  });

  // Edit message
router.put('/:id', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { message, edited: true },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(updatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
