const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the address schema
const addressSchema = new Schema({
  street: { type: String, required: false },
  precinct_no: { type: String, required: true },
  house_no: { type: String, required: false },
  road: { type: String, required: false },
  tower: { type: String, required: false },
  apartment: { type: String, required: false },
  buildingName: { type: String, required: false },
  office: { type: String, required: false },
});

// Define the delivery schema
const deliverySchema = new Schema({
  day1: { type: String },
  day2: { type: String },
});

// Define the customer schema
const customerSchema = new Schema({
  name: { type: String, required: true },
  phone_number: { type: String, required: true },
  address: { type: addressSchema, required: true },
  registrationDate: { type: Date, default: Date.now },
  deliveryDay: { type: deliverySchema, required: true },
  billingPlan: {
    type: String,
    enum: ["COD", "Monthly Package", "Coupon Package"],
  },
  couponType: { type: String, enum: ["16 Coupons", "28 Coupons"] },
  couponId: { type: String },
  numberOfCoupons: { type: Number },
  balance: { type: Number, required: true },
  bottleType: { type: String, enum: ["ownBottles", "Company Bottles"] },
  ratePerBottle: { type: Number },
  bottlesDelivered: { type: Number },
  bottlesReceived: { type: Number, required: true },
  perBottleSecurity: { type: Number },
  securityTotal: { type: Number },
  securityBalance: { type: Number },
});

module.exports = mongoose.model("Customer", customerSchema);
