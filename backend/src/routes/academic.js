const express = require('express');
const router = express.Router();

// Placeholder academic routes
router.get('/departments', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/programs', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/semesters', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/subjects', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;