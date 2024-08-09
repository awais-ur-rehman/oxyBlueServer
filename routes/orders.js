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
    img = "",
    order_status,
    coupon_received,
  } = req.body;

  if (
    !customer_name ||
    !date ||
    delivered_bottles == null ||
    received_bottles == null ||
    total_amount == null ||
    paid_amount == null ||
    order_status == null ||
    coupon_received == null
  ) {
    console.log("Missing or invalid fields:", req.body);
    return res.status(400).json({ message: "Incomplete Information" });
  }

  try {
    const existingOrder = await Orders.findOne({ customer_name, date });

    if (
      existingOrder &&
      existingOrder.order_status === "Not Available" &&
      order_status === "Completed"
    ) {
      // Update existing order fields
      existingOrder.delivered_bottles = delivered_bottles;
      existingOrder.received_bottles = received_bottles;
      existingOrder.total_amount = total_amount;
      existingOrder.paid_amount = paid_amount;
      existingOrder.img = img;
      existingOrder.order_status = order_status;
      existingOrder.coupon_received = coupon_received;

      // Update the order in the database
      const updatedOrder = await existingOrder.save();

      // Find customer and update coupon count
      const customer = await Customer.findOne({ name: customer_name });
      if (customer) {
        customer.numberOfCoupon = Math.max(
          0,
          customer.numberOfCoupon - coupon_received
        );
        await customer.save();
      }

      console.log("Order updated and customer coupons adjusted:", updatedOrder);
      res.status(201).json(updatedOrder);
    } else {
      const newOrder = new Orders({
        customer_name,
        date,
        delivered_bottles,
        received_bottles,
        total_amount,
        paid_amount,
        img,
        order_status,
        coupon_received,
      });

      // Save the new order
      const savedOrder = await newOrder.save();
      console.log("New order saved:", savedOrder);
      res.status(201).json(savedOrder);
    }
  } catch (error) {
    console.log(`Error creating or updating order: ${error}`);
    res.status(500).json({ message: "Error processing your request" });
  }
});

// View all orders
router.get("/view", async (req, res) => {
  try {
    const orders = await Orders.find();
    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Error fetching orders" });
  }
});

// Get orders by month
router.get("/month/:month", async (req, res) => {
  const month = req.params.month;
  try {
    const orders = await Orders.find({ date: { $regex: month } });
    res.status(200).json(orders);
  } catch (error) {
    res.status(401).json({ message: "Error fetching orders" });
  }
});

// Get orders by customer
router.get("/customer/:customer", async (req, res) => {
  const customer = req.params.customer;
  try {
    const orders = await Orders.find({ customer_name: customer });
    res.status(200).json(orders);
  } catch (error) {
    res.status(401).json({ message: "Error fetching orders" });
  }
});

// Get orders by customer and month
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
