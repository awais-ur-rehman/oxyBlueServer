const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  street: { type: String, required: false },
  precinct_no: { type: String, required: true },
  house_no: { type: String, required: false },
  road: { type: String, required: false },
  tower: { type: String, required: false },
  apartment: { type: String, required: false },
  building_name: { type: String, required: false },
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
  registrationDate: { type: String },
  deliveryDay: { type: deliverySchema, required: true },
  billingPlan: {
    type: String,
  },
  couponType: { type: String, enum: ["16 Coupons", "28 Coupons"] },
  couponId: { type: String },
  numberOfCoupons: { type: Number },
  balance: { type: Number, required: true },
  bottleType: { type: String, enum: ["ownBottles", "companyBottles"] },
  ratePerBottle: { type: Number },
  bottlesDelivered: { type: Number },
  bottlesReceived: { type: Number, required: true },
  perBottleSecurity: { type: Number },
  securityTotal: { type: Number },
  securityBalance: { type: Number },
});

module.exports = mongoose.model("Customer", customerSchema);
