const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  customer_name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    require: true,
  },
  delivered_bottles: {
    type: Number,
    require: true,
  },
  received_bottles: {
    type: Number,
    require: true,
  },
  total_amount: {
    type: Number,
    require: true,
  },
  paid_amount: {
    type: Number,
    require: true,
  },
  coupon: {
    type: String,
    require: true,
  },
});

const Orders = mongoose.model("Orders", orderSchema);

module.exports = Orders;
