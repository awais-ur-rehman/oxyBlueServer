const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  comment: { type: String },
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
