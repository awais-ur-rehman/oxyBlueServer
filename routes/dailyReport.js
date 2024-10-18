const express = require("express");
const router = express.Router();
const Orders = require("../models/order");
const Rider = require("../models/rider");
const Expense = require("../models/expense");

router.get("/generate-report", async (req, res) => {
  let { date, name } = req.query;

  try {
    if (!date) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = String(today.getFullYear()).slice(-2);
      date = `${day}-${month}-${year}`;
    }

    const rider = await Rider.findOne({ name });
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    const orders = await Orders.find({ date, added_by: name });

    const totalDeliveredBottles = orders.reduce(
      (sum, order) => sum + order.delivered_bottles,
      0
    );

    const totalReceivedBottles = orders.reduce(
      (sum, order) => sum + order.received_bottles,
      0
    );

    const totalCODPayments = orders
      .filter((order) => order.payment_option === "COD")
      .reduce((sum, order) => sum + order.paid_amount, 0);

    const totalOnlinePayments = orders
      .filter((order) => order.payment_option === "Online")
      .reduce((sum, order) => sum + order.paid_amount, 0);

    const expenses = await Expense.find({ date, added_by: name });
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const currentDeliveries = await Orders.countDocuments({
      date,
      added_by: name,
      order_status: "Completed",
    });

    const report = {
      deliveries_completed: rider.deliveries_completed,
      current_deliveries: currentDeliveries,
      totalDeliveredBottles,
      totalReceivedBottles,
      totalCODPayments,
      totalOnlinePayments,
      totalExpenses,
    };

    // Return the report
    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// router.get("/generate-report", async (req, res) => {
//   const { date, name } = req.query;

//   try {
//     const rider = await Rider.findOne({ name });
//     if (!rider) {
//       return res.status(404).json({ message: "Rider not found" });
//     }

//     // Sum up delivered and received bottles for the given date and rider
//     const orders = await Orders.find({ date, added_by: name });

//     const totalDeliveredBottles = orders.reduce(
//       (sum, order) => sum + order.delivered_bottles,
//       0
//     );
//     console.log(totalDeliveredBottles);
//     console.log(date);
//     console.log(name);

//     const totalReceivedBottles = orders.reduce(
//       (sum, order) => sum + order.received_bottles,
//       0
//     );
//     console.log(totalReceivedBottles);

//     // Sum up payment amounts based on payment option (COD or Online)
//     const totalCODPayments = orders
//       .filter((order) => order.payment_option === "COD")
//       .reduce((sum, order) => sum + order.paid_amount, 0);
//     const totalOnlinePayments = orders
//       .filter((order) => order.payment_option === "Online")
//       .reduce((sum, order) => sum + order.paid_amount, 0);

//     console.log(totalCODPayments);
//     console.log(totalOnlinePayments);
//     // Sum up expenses for the given date and rider
//     const expenses = await Expense.find({ date, added_by: name });
//     const totalExpenses = expenses.reduce(
//       (sum, expense) => sum + expense.amount,
//       0
//     );

//     // Construct the report
//     const report = {
//       deliveries_completed: rider.deliveries_completed,
//       totalDeliveredBottles,
//       totalReceivedBottles,
//       totalCODPayments,
//       totalOnlinePayments,
//       totalExpenses,
//     };

//     // Return the report
//     res.status(200).json(report);
//     console.log(report);
//   } catch (error) {
//     console.error("Error generating report:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

module.exports = router;
