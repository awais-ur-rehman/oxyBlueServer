const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  street: { type: String, required: true },
  precinct_no: { type: String, required: true },
  house_no: { type: String, required: true },
});

const customerSchema = new Schema({
  name: { type: String, required: true },
  phone_number: { type: String, required: true },
  address: { type: addressSchema, required: true },
  bottles_to_be_delivered: { type: Number, required: true },
  bottles_to_get: { type: Number, required: true },
  coupon: { type: Boolean, required: true },
  bill: { type: Number, required: true },
});

module.exports = mongoose.model("Customer", customerSchema);
