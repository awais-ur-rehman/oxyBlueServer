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

    const totalOrderStats = await Orders.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total_amount" },
          totalPaid: { $sum: "$paid_amount" },
          totalBottlesDelivered: { $sum: "$delivered_bottles" },
          totalBottlesReceived: { $sum: "$received_bottles" },
        },
      },
    ]);

    const totalExpenseAmount = totalExpense[0]
      ? totalExpense[0].totalAmount
      : 0;
    const totalOrderAmount = totalOrderStats[0]
      ? totalOrderStats[0].totalAmount
      : 0;
    const totalPaidAmount = totalOrderStats[0]
      ? totalOrderStats[0].totalPaid
      : 0;
    const totalBottlesDelivered = totalOrderStats[0]
      ? totalOrderStats[0].totalBottlesDelivered
      : 0;
    const totalBottlesReceived = totalOrderStats[0]
      ? totalOrderStats[0].totalBottlesReceived
      : 0;

    res.json({
      totalExpenseAmount,
      totalOrderAmount,
      totalPaidAmount,
      totalBottlesDelivered,
      totalBottlesReceived,
    });
    console.log(res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
