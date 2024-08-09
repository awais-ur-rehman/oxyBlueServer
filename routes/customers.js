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
    balance,
    assigned_to,
    deliveryDay,
    billing_plan,
    coupon,
  } = req.body;

  if (
    !name ||
    !phone_number ||
    !address ||
    !address.precinct_no ||
    balance === undefined ||
    !assigned_to ||
    !deliveryDay ||
    !billing_plan ||
    !coupon
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const customer = new Customer({
    name,
    phone_number,
    address: {
      street: address.street,
      precinct_no: address.precinct_no,
      house_no: address.house_no,
      road: address.road,
      tower: address.tower,
      apartment: address.apartment,
      buildingName: address.buildingName,
      office: address.office,
    },
    balance: parseFloat(balance),
    assigned_to,
    billing_plan,
    deliveryDay,
    coupon,
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
  const {
    name,
    phone_number,
    address,
    balance,
    assigned_to,
    deliveryDay,
    billing_plan,
    coupon,
  } = req.body;

  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (name) customer.name = name;
    if (phone_number) customer.phone_number = phone_number;
    if (address) {
      if (address.office !== undefined)
        customer.address.office = address.office;
    }
    if (balance !== undefined) customer.balance = parseFloat(balance);
    if (assigned_to) customer.assigned_to = assigned_to;
    if (deliveryDay) customer.deliveryDay = deliveryDay;
    if (billing_plan) customer.billing_plan = billing_plan;
    if (coupon) customer.coupon = coupon;

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

// Route to get specific customers
router.get("/get-order", async (req, res) => {
  const { assigned_to, deliveryDay } = req.query;
  if (!assigned_to || !deliveryDay) {
    return res.status(400).json({ message: "Please provide required fields" });
  }
  try {
    const customers = await Customer.find({
      deliveryDay: deliveryDay,
      assigned_to: assigned_to,
    }).lean();
    console.log(customers);
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to get specific customers based on name containing the provided name
router.get("/get-customer", async (req, res) => {
  const { name } = req.query;
  console.log({ name });

  if (!name) {
    return res.status(400).json({ message: "Please provide search criteria" });
  }

  try {
    const customers = await Customer.find({
      $or: [
        { name: { $regex: name, $options: "i" } },
        { "address.precinct_no": { $regex: name, $options: "i" } },
        { "address.street": { $regex: name, $options: "i" } },
        { "address.house_no": { $regex: name, $options: "i" } },
        { "address.road": { $regex: name, $options: "i" } },
        { "address.tower": { $regex: name, $options: "i" } },
        { "address.apartment": { $regex: name, $options: "i" } },
        { "address.buildingName": { $regex: name, $options: "i" } },
        { "address.office": { $regex: name, $options: "i" } },
      ],
    }).lean();

    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to get customer data
router.get("/get-customers-data", async (req, res) => {
  try {
    const customers = await Customer.find(
      {},
      "name phone_number address balance billing_plan"
    ).lean();
    const customerData = customers.map((customer) => ({
      name: customer.name,
      phone_number: customer.phone_number,
      address: customer.address,
      balance: customer.balance,
      billing_plan: customer.billing_plan,
    }));
    res.json(customerData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to find customers assigned to a rider but not in the provided list
router.post("/find-missing-customers", async (req, res) => {
  const { customers, assignedTo } = req.body;

  if (!customers || !assignedTo) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  try {
    const customerNames = customers.map((customer) => customer.name);
    const customerAddresses = customers.map((customer) =>
      JSON.stringify(customer.address)
    );
    const customersNotInList = await Customer.find({
      assigned_to: assignedTo,
      $or: [
        { name: { $nin: customerNames } },
        {
          address: { $nin: customerAddresses.map((addr) => JSON.parse(addr)) },
        },
      ],
    }).lean();

    res.status(200).json(customersNotInList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
