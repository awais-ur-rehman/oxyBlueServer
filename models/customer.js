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
  balance: { type: Number, required: true },
  assigned_to: {
    type: String,
    required: true,
  },
  deliveryDay: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Customer", customerSchema);
