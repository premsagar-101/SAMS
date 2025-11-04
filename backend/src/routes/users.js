const express = require('express');
const router = express.Router();

// Placeholder user routes
router.get('/profile', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.put('/profile', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;