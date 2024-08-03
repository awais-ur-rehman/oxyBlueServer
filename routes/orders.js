const express = require("express");
const router = express.Router();
const Orders = require("../models/order");
const Customer = require("../models/customer");
const Rider = require("../models/rider");

// Route to add or update an order
router.post("/add", async (req, res) => {
  const {
    customer_name,
    date,
    delivered_bottles,
    received_bottles,
    total_amount,
    paid_amount,
    coupon = "", // Default to empty if not provided
    order_status,
  } = req.body;

  if (
    !customer_name ||
    !date ||
    delivered_bottles == null ||
    received_bottles == null ||
    total_amount == null ||
    paid_amount == null ||
    order_status == null
  ) {
    console.log("Missing or invalid fields:", req.body);
    return res.status(400).json({ message: "Incomplete Information" });
  }

  try {
    // First, try to find an existing order with the same customer name and date
    const existingOrder = await Orders.findOne({ customer_name, date });

    if (
      existingOrder &&
      existingOrder.order_status === "Not Available" &&
      order_status === "Completed"
    ) {
      // If found and the status is "Not Available", update the existing order with new details
      existingOrder.delivered_bottles = delivered_bottles;
      existingOrder.received_bottles = received_bottles;
      existingOrder.total_amount = total_amount;
      existingOrder.paid_amount = paid_amount;
      existingOrder.coupon = coupon;
      existingOrder.order_status = order_status;

      const updatedOrder = await existingOrder.save();
      console.log("Order updated:", updatedOrder);
      res.status(201).json(updatedOrder);
    } else {
      // If no such order exists, or the conditions are not met, create a new order
      const newOrder = new Orders({
        customer_name,
        date,
        delivered_bottles,
        received_bottles,
        total_amount,
        paid_amount,
        coupon,
        order_status,
      });

      const savedOrder = await newOrder.save();
      console.log("New order saved:", savedOrder);
      res.status(201).json(savedOrder);
    }
  } catch (error) {
    console.log(`Error creating or updating order: ${error}`);
    res.status(500).json({ message: "Error processing your request" });
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
