const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const Orders = require("../models/order");

router.get("/final", async (req, res) => {
  try {
    const totalExpense = await Expense.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalOrderAmount = await Orders.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total_amount" },
          totalPaid: { $sum: "$paid_amount" },
        },
      },
    ]);

    const totalExpenseAmount = totalExpense[0]
      ? totalExpense[0].totalAmount
      : 0;
    const totalOrder = totalOrderAmount[0]
      ? totalOrderAmount[0].totalAmount
      : 0;
    const totalPaid = totalOrderAmount[0] ? totalOrderAmount[0].totalPaid : 0;

    res.json({
      totalExpenseAmount,
      totalOrderAmount: totalOrder,
      totalPaidAmount: totalPaid,
    });
    console.log(res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
