const express = require("express");
const router = express.Router();
const Orders = require("../models/order");
const Customer = require("../models/customer");
const Rider = require("../models/rider");

// Route to add an order and update customer and rider data
router.post("/add", async (req, res) => {
  const {
    customer_name,
    date,
    delivered_bottles,
    received_bottles,
    total_amount,
    paid_amount,
    img,
    added_by,
    payment_option,
    balance,
    order_status,
    coupon_received,
    paid_security,
  } = req.body;

  try {
    // Check if there is an existing order with the same customer and date, but with "Not Available" status
    if (order_status === "Completed") {
      const existingOrder = await Orders.findOne({
        customer_name,
        date,
        order_status: "Not Available",
      });

      if (existingOrder) {
        // Update the existing order with the new data
        existingOrder.delivered_bottles = delivered_bottles;
        existingOrder.received_bottles = received_bottles;
        existingOrder.total_amount = total_amount;
        existingOrder.paid_amount = paid_amount;
        existingOrder.img = img;
        existingOrder.added_by = added_by;
        existingOrder.payment_option = payment_option;
        existingOrder.balance = balance;
        existingOrder.order_status = order_status;
        existingOrder.coupon_received = coupon_received;
        existingOrder.paid_security = paid_security;

        const updatedOrder = await existingOrder.save();
        console.log("Existing order updated:", updatedOrder);

        // Update customer and rider data
        await updateCustomerAndRider(
          customer_name,
          delivered_bottles,
          received_bottles,
          coupon_received,
          balance,
          paid_security,
          added_by
        );

        return res.status(200).json(updatedOrder);
      }
    }

    // If no existing order found, create a new order
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
      balance,
      order_status,
      coupon_received,
      paid_security,
    });

    const savedOrder = await newOrder.save();
    console.log("New order saved:", savedOrder);

    // Update customer and rider data
    await updateCustomerAndRider(
      customer_name,
      delivered_bottles,
      received_bottles,
      coupon_received,
      balance,
      paid_security,
      added_by
    );

    res.status(200).json(savedOrder);
  } catch (error) {
    console.error("Error adding order:", error.message);
    res.status(500).json({ message: "Error processing your request" });
  }
});

// Function to update customer and rider data based on the order
async function updateCustomerAndRider(
  customer_name,
  delivered_bottles,
  received_bottles,
  coupon_received,
  balance,
  paid_security,
  riderName
) {
  try {
    const customer = await Customer.findOne({ name: customer_name });
    if (!customer) {
      throw new Error("Customer not found");
    }
    customer.bottlesDelivered += delivered_bottles;
    customer.bottlesReceived += received_bottles;
    if (coupon_received && customer.numberOfCoupons >= coupon_received) {
      customer.numberOfCoupons -= coupon_received;
    }
    if (balance > 0) {
      customer.balance -= balance;
    }
    if (paid_security > 0) {
      customer.securityBalance -= paid_security;
    }
    await customer.save();
    console.log("Customer updated:", customer);
    const rider = await Rider.findOne({ name: riderName });
    if (rider) {
      rider.deliveries_completed += 1;
      await rider.save();
      console.log("Rider deliveries updated:", rider);
    }
  } catch (error) {
    console.error("Error updating customer or rider:", error.message);
    throw error;
  }
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
