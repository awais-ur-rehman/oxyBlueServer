const express = require("express");
const router = express.Router();
const Orders = require("../models/order");
const Rider = require("../models/rider");
const Expense = require("../models/expense");

router.get("/generate-report", async (req, res) => {
  const { date, name } = req.query;

  try {
    // Fetch the rider's data
    const rider = await Rider.findOne({ name });
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    // Sum up delivered and received bottles for the given date and rider
    const orders = await Orders.find({ date, added_by: name });
    
    const totalDeliveredBottles = orders.reduce(
      (sum, order) => sum + order.delivered_bottles,
      0
    );
    console.log(totalDeliveredBottles);
    console.log(date);
    console.log(name);

    const totalReceivedBottles = orders.reduce(
      (sum, order) => sum + order.received_bottles,
      0
    );
    console.log(totalReceivedBottles);

    // Sum up payment amounts based on payment option (COD or Online)
    const totalCODPayments = orders
      .filter((order) => order.payment_option === "COD")
      .reduce((sum, order) => sum + order.paid_amount, 0);
    const totalOnlinePayments = orders
      .filter((order) => order.payment_option === "Online")
      .reduce((sum, order) => sum + order.paid_amount, 0);

    console.log(totalCODPayments);
    console.log(totalOnlinePayments);
    // Sum up expenses for the given date and rider
    const expenses = await Expense.find({ date, added_by: name });
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Construct the report
    const report = {
      deliveries_completed: rider.deliveries_completed,
      totalDeliveredBottles,
      totalReceivedBottles,
      totalCODPayments,
      totalOnlinePayments,
      totalExpenses,
    };

    // Return the report
    res.status(200).json(report);
    console.log(report);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
