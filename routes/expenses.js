const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// Route to get all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to get expenses with category "Rashan Exp."
router.get("/rashan-exp", async (req, res) => {
  try {
    const expenses = await Expense.find({ category: "Welfare Funds" });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
