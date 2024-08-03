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
  coupon: {
    type: String,
    required: true,
  },
  order_status: {
    type: String,
    enum: ["Completed", "Not Available"],
    default: "Completed",
  },
});

const Orders = mongoose.model("Orders", orderSchema);

module.exports = Orders;
