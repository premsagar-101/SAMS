const express = require("express");
const router = express.Router();

// Placeholder routes
router.get("/summary", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

module.exports = router;
