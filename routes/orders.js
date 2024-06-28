const express = require("express");
const router = express.Router();
const Orders = require("../models/order");

// add order
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
    const newOrder = await order.save();
    res.status(201).json(newOrder);
    console.log(newOrder);
  } catch (error) {
    res.status(401).json({ message: "Error creating order" });
  }
});

// view order
router.get("/view", async (req, res) => {
  try {
    const orders = await Orders.find();
    res.status(200).json(orders);
  } catch (error) {
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

module.exports = router;
