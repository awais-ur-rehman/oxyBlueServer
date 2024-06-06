const express = require("express");
const router = express.Router();
const Customer = require("../models/customer");

// Route to get all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().lean();
    const formattedCustomers = customers.map((customer) => ({
      ...customer,
      _id: customer._id.toString(),
    }));
    res.json(formattedCustomers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to add a new customer
router.post("/add-customer", async (req, res) => {
  const {
    name,
    phone_number,
    address,
    bottles_to_be_delivered,
    bottles_to_get,
    coupon,
    bill,
  } = req.body;

  if (
    !name ||
    !phone_number ||
    !address ||
    bottles_to_be_delivered === undefined ||
    bottles_to_get === undefined ||
    coupon === undefined ||
    bill === undefined
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const customer = new Customer({
    name,
    phone_number,
    address,
    bottles_to_be_delivered: parseInt(bottles_to_be_delivered),
    bottles_to_get: parseInt(bottles_to_get),
    coupon: Boolean(coupon),
    bill: parseFloat(bill),
  });

  try {
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to update a customer
router.put("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const {
      name,
      phone_number,
      address,
      bottles_to_be_delivered,
      bottles_to_get,
      coupon,
      bill,
    } = req.body;

    if (name) customer.name = name;
    if (phone_number) customer.phone_number = phone_number;
    if (address) customer.address = address;
    if (bottles_to_be_delivered !== undefined)
      customer.bottles_to_be_delivered = parseInt(bottles_to_be_delivered);
    if (bottles_to_get !== undefined)
      customer.bottles_to_get = parseInt(bottles_to_get);
    if (coupon !== undefined) customer.coupon = Boolean(coupon);
    if (bill !== undefined) customer.bill = parseFloat(bill);

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to delete a customer
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await customer.remove();
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
