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
  const { name, phone_number, address, assigned_to, deliveryDay } = req.body;

  if (!name || !phone_number || !address || !assigned_to || !deliveryDay) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const customer = new Customer({
    name,
    phone_number,
    address,
    assigned_to,
    deliveryDay,
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
  const { name, phone_number, address, assigned_to, deliveryDay } = req.body;

  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (name) customer.name = name;
    if (phone_number) customer.phone_number = phone_number;
    if (address) customer.address = address;
    if (assigned_to) customer.assigned_to = assigned_to;
    if (deliveryDay) customer.deliveryDay = deliveryDay;

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

// Route to get specific customers based on assigned_to and deliveryDay
router.get("/get-order", async (req, res) => {
  const { assigned_to, deliveryDay } = req.query;

  if (!assigned_to || !deliveryDay) {
    return res
      .status(400)
      .json({ message: "Please provide both assigned_to and deliveryDay" });
  }

  try {
    const customers = await Customer.find({
      assigned_to: assigned_to,
      deliveryDay: deliveryDay,
    }).lean();

    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
