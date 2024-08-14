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
    added_by,
    payment_option,
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
    !order_status ||
    coupon_received == null ||
    !added_by ||
    !payment_option
  ) {
    console.log("Missing or invalid fields:", req.body);
    return res.status(400).json({ message: "Incomplete Information" });
  }

  try {
    const customer = await Customer.findOne({ name: customer_name });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const existingOrder = await Orders.findOne({ customer_name, date });
    if (existingOrder) {
      // Update existing order
      existingOrder.delivered_bottles = delivered_bottles;
      existingOrder.received_bottles = received_bottles;
      existingOrder.total_amount = total_amount;
      existingOrder.paid_amount = paid_amount;
      existingOrder.img = img;
      existingOrder.added_by = added_by;
      existingOrder.payment_option = payment_option;
      existingOrder.order_status = order_status;
      existingOrder.coupon_received = coupon_received;

      const updatedOrder = await existingOrder.save();
      console.log("Order updated:", updatedOrder);

      // Update customer data based on the order
      await updateCustomerData(
        customer,
        delivered_bottles,
        received_bottles,
        coupon_received,
        total_amount,
        paid_amount
      );

      res.status(201).json(updatedOrder);
    } else {
      // Create a new order
      const newOrder = new Orders({
        customer_name,
        date,
        delivered_bottles,
        received_bottles,
        total_amount,
        paid_amount,
        img,
        added_by,
        payment_option,
        order_status,
        coupon_received,
      });

      const savedOrder = await newOrder.save();
      console.log("New order saved:", savedOrder);

      // Update customer data based on the order
      await updateCustomerData(
        customer,
        delivered_bottles,
        received_bottles,
        coupon_received,
        total_amount,
        paid_amount
      );

      res.status(201).json(savedOrder);
    }
  } catch (error) {
    console.log(`Error creating or updating order: ${error}`);
    res.status(500).json({ message: "Error processing your request" });
  }
});

// Function to update customer data
async function updateCustomerData(
  customer,
  delivered_bottles,
  received_bottles,
  coupon_received,
  total_amount,
  paid_amount
) {
  // Update bottles delivered and received
  customer.bottlesDelivered += delivered_bottles;
  customer.bottlesReceived += received_bottles;

  // Update number of coupons if applicable
  if (customer.billingPlan === "Coupon Package" && coupon_received) {
    customer.numberOfCoupons -= coupon_received;
  }

  // Update customer balance if paid amount is less than total amount
  if (paid_amount < total_amount) {
    const remainingAmount = total_amount - paid_amount;
    customer.balance += remainingAmount;
  }

  // Save updated customer data
  await customer.save();
  console.log("Customer data updated:", customer);
}

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
