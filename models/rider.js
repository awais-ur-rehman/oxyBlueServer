const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const riderSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  vehicle_type: {
    type: String,
    required: true,
  },
  license_plate: {
    type: String,
    required: true,
  },
  deliveries_completed: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Rider", riderSchema);
