const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");

// Route to add a new expense
router.post("/add", async (req, res) => {
  const { date, amount, expense_category, comment, added_by, img } = req.body;
  if (!date || !amount || !expense_category || !added_by) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const expense = new Expense({
    date: new Date(date),
    amount: parseFloat(amount),
    expense_category,
    comment,
    added_by,
    img,
  });

  try {
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
    console.log(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to get all expenses
router.get("/view", async (req, res) => {
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

// view only selected expenses
router.get("/view-selected", async (req, res) => {
  const { added_by } = req.query;
  try {
    const expenses = await Expense.find({
      added_by: added_by,
    })
      .select("-img")
      .lean(); // Exclude the image field
    const formattedExpenses = expenses.map((expense) => ({
      ...expense,
      _id: expense._id.toString(),
    }));

    res.json(formattedExpenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to get expenses with category "Rashan Exp."
router.get("/category-exp", async (req, res) => {
  try {
    const expenses = await Expense.find({ expense_category: "Welfare Funds" });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/rider-exp", async (req, res) => {
  const { added_by } = req.query;
  try {
    const expenses = await Expense.find({ added_by });
    if (!expenses.length) {
      return res
        .status(404)
        .json({ message: "No expenses found for this rider" });
    }
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
});

module.exports = router;
