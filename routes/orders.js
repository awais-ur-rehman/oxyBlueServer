const express = require("express");
const router = express.Router();
const Orders = require("../models/order");
const Customer = require("../models/customer");

// Route to add an order
router.post("/add", async (req, res) => {
  const {
    customer_name,
    date,
    delivered_bottles,
    received_bottles,
    total_amount,
    paid_amount,
    coupon,
  } = req.body;

  if (
    !customer_name ||
    !date ||
    !delivered_bottles ||
    !received_bottles ||
    !total_amount ||
    !paid_amount ||
    !coupon
  ) {
    return res.status(400).json({ message: "Incomplete Information" });
  }

  const order = new Orders({
    customer_name,
    date: date,
    delivered_bottles: delivered_bottles,
    received_bottles: received_bottles,
    total_amount: total_amount,
    paid_amount: paid_amount,
    coupon: coupon,
  });

  try {
    // Save the new order
    const newOrder = await order.save();

    // Calculate the remaining amount
    const remainingAmount = total_amount - paid_amount;

    if (remainingAmount !== 0) {
      // Find the customer by name and update their balance
      const customer = await Customer.findOne({ name: customer_name });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      customer.balance += remainingAmount;
      await customer.save();
    }

    res.status(201).json(newOrder);
    console.log(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Error creating order" });
  }
});

// view order
router.get("/view", async (req, res) => {
  console.log("starting");
  try {
    const orders = await Orders.find();
    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Error fetching orders" });
  }
});

// get order by month
router.get("/month/:month", async (req, res) => {
  const month = req.params.month;
  try {
    const orders = await Orders.find({ date: { $regex: month } });
    res.status(200).json(orders);
  } catch (error) {
    res.status(401).json({ message: "Error fetching orders" });
  }
});

// get order by customer
router.get("/customer/:customer", async (req, res) => {
  const customer = req.params.customer;
  try {
    const orders = await Orders.find({ customer_name: customer });
    res.status(200).json(orders);
  } catch (error) {
    res.status(401).json({ message: "Error fetching orders" });
  }
});

// get order by customer and month
router.get("/customer/:customer/month/:month", async (req, res) => {
  const { customer, month } = req.params;
  console.log(req.params);
  try {
    let orders;
    if (month === "13") {
      orders = await Orders.find({ customer_name: customer });
    } else {
      const regex = new RegExp(`-${month.padStart(2, "0")}-`);
      orders = await Orders.find({
        customer_name: customer,
        date: { $regex: regex },
      });
    }
    res.status(200).json(orders);
  } catch (error) {
    res.status(401).json({ message: "Error fetching orders" });
  }
});

module.exports = router;
