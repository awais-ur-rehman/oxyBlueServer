const express = require("express");
const router = express.Router();
const Coupon = require("../models/coupon");
const Customer = require("../models/customer");

// Route to add a coupon and update the customer's balance and coupons
router.post("/add", async (req, res) => {
  const {
    customerName,
    coupon,
    noOfCoupon,
    totalCouponAmount,
    paidCouponAmount,
    riderName,
  } = req.body;

  try {
    const newCoupon = new Coupon({
      customerName,
      coupon,
      noOfCoupon,
      totalCouponAmount,
      paidCouponAmount,
      riderName,
    });

    const savedCoupon = await newCoupon.save();
    console.log("Coupon saved:", savedCoupon);

    const customer = await Customer.findOne({ name: customerName });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    if (paidCouponAmount < totalCouponAmount) {
      const remainingAmount = totalCouponAmount - paidCouponAmount;
      customer.balance += remainingAmount;
    }

    customer.numberOfCoupons += noOfCoupon;

    const updatedCustomer = await customer.save();
    console.log("Customer updated:", updatedCustomer);

    res.status(201).json({
      message: "Coupon added and customer updated successfully.",
    });
  } catch (error) {
    console.error("Error adding coupon:", error.message);
    res.status(500).json({ message: "Error processing your request" });
  }
});

module.exports = router;
