const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  customerName: { type: String },
  coupon: { type: String },
  noOfCoupon: { type: Number },
  totalCouponAmount: { type: Number },
  paidCouponAmount: { type: Number },
  riderName: { type: String },
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
