const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");

// Route to get all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().lean();
    const formattedExpenses = expenses.map((expense) => ({
      ...expense,
      _id: expense._id.toString(),
    }));
    res.json(formattedExpenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to add a new expense
router.post("/add-expense", async (req, res) => {
  const { date, amount, expense_category, comment } = req.body;

  if (!date || !amount || !expense_category) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const expense = new Expense({
    date: new Date(date),
    amount: parseFloat(amount),
    expense_category,
    comment,
  });

  try {
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
