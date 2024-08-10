const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  customer_name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  delivered_bottles: {
    type: Number,
    required: true,
  },
  received_bottles: {
    type: Number,
    required: true,
  },
  total_amount: {
    type: Number,
    required: true,
  },
  paid_amount: {
    type: Number,
    required: true,
  },
  img: {
    type: String,
  },
  added_by: {
    type: String,
  },
  payment_option: {
    type: String,
  },
  order_status: {
    type: String,
    enum: ["Completed", "Not Available"],
    default: "Completed",
  },
  coupon_received: {
    type: Number,
    required: true,
  },
});

const Orders = mongoose.model("Orders", orderSchema);

module.exports = Orders;
