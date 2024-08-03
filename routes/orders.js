const express = require("express");
const router = express.Router();
const Orders = require("../models/order");
const Customer = require("../models/customer");
const Rider = require("../models/rider");

// Route to add an order
router.post("/add", async (req, res) => {
  const {
    customer_name,
    date,
    delivered_bottles, // Expect these could be zero
    received_bottles,
    total_amount,
    paid_amount,
    coupon = "", // Default empty if not provided
    order_status,
  } = req.body;

  if (
    !customer_name ||
    !date ||
    order_status == null || // Ensure only truly required fields are checked for existence
    delivered_bottles == null ||
    received_bottles == null || // Check explicitly for null to allow zero
    total_amount == null ||
    paid_amount == null
  ) {
    console.log("Missing or invalid fields:", req.body);
    return res.status(400).json({ message: "Incomplete Information" });
  }

  // Find the customer by name to handle balance updates or identify unavailability
  const customer = await Customer.findOne({ name: customer_name });
  if (!customer) {
    console.log(`Customer not found: ${customer_name}`);
    return res.status(404).json({ message: "Customer not found" });
  }

  // Prepare the order object
  const order = new Orders({
    customer_name,
    date,
    delivered_bottles,
    received_bottles,
    total_amount,
    paid_amount,
    coupon,
    order_status,
  });

  // Save the order and handle the response
  try {
    const newOrder = await order.save();
    console.log("Order saved:", newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    console.log(`Error creating order: ${error}`);
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
