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

const customerSchema = new Schema({
  name: { type: String, required: true },
  phone_number: { type: String, required: true },
  address: { type: addressSchema, required: true },
  balance: { type: Number, required: true },
  assigned_to: { type: String, required: true },
  deliveryDay: { type: String, required: true },
  coupon: { type: String },
});

module.exports = mongoose.model("Customer", customerSchema);
