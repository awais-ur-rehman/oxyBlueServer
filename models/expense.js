const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  date: { type: String, required: true },
  expense_category: { type: String, required: true },
  amount: { type: Number, required: true },
  comment: { type: String },
  added_by: { type: String, required: true },
  img: { type: String },
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
