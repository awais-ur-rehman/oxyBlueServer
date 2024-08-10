const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

const deliverySchema = new Schema({
  day1: { type: String },
  day2: { type: String },
});

const customerSchema = new Schema({
  name: { type: String, required: true },
  phone_number: { type: String, required: true },
  address: { type: addressSchema, required: true },
  balance: { type: Number, required: true },
  security: { type: Number, required: true },
  deliveryDay: { type: deliverySchema, required: true },
  billing_plan: { type: String },
  coupon: { type: String },
  numberOfCoupon: { type: Number },
});

module.exports = mongoose.model("Customer", customerSchema);
