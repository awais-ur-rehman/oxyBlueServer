const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const securitySchema = new Schema({
  securityValue: {
    type: Number,
    required: true,
  },
});

const Security = mongoose.model("Security", securitySchema);

module.exports = Security;
