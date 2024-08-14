const express = require("express");
const router = express.Router();
const Customer = require("../models/customer");
const Security = require("../models/security");

router.get("/all-data", async (req, res) => {
  try {
    const customer = await Customer.find();
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to add a new customer
router.post("/add-customer", async (req, res) => {
  try {
    const {
      name,
      phone_number,
      address,
      security,
      deliveryDay,
      billing_plan,
      coupon,
      numberOfCoupon,
    } = req.body;

    console.log("Received request to add customer:", req.body);

    if (
      !name ||
      !phone_number ||
      !address.precinct_no ||
      security === undefined ||
      !deliveryDay ||
      !billing_plan ||
      numberOfCoupon === undefined
    ) {
      console.error("Validation failed. Missing required fields.");
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    const securityDoc = await Security.findOne();
    if (!securityDoc) {
      console.error("Security document not found.");
      return res.status(404).json({ message: "Security document not found" });
    }
    const securityValue = parseFloat(security);
    if (isNaN(securityValue)) {
      console.error("Invalid security value provided.");
      return res
        .status(400)
        .json({ message: "Invalid security value provided." });
    }

    // Calculate balance
    const balance = securityDoc.securityValue - securityValue;
    if (isNaN(balance)) {
      console.error("Failed to calculate balance.");
      return res.status(400).json({ message: "Failed to calculate balance." });
    }

    // Create a new customer object
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
      balance,
      security: securityValue,
      deliveryDay,
      billing_plan,
      coupon,
      numberOfCoupon,
    });

    console.log("Customer object being created:", customer);
    const newCustomer = await customer.save();
    console.log("Customer saved successfully:", newCustomer);
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error("Error saving customer:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Route to update a customer
router.put("/:id", async (req, res) => {
  const {
    name,
    phone_number,
    address,
    balance,
    security,
    billing_plan,
    coupon,
    numberOfCoupon,
  } = req.body;

  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (name) customer.name = name;
    if (phone_number) customer.phone_number = phone_number;
    if (address) {
      if (address.street !== undefined)
        customer.address.street = address.street;
      if (address.precinct_no !== undefined)
        customer.address.precinct_no = address.precinct_no;
      if (address.house_no !== undefined)
        customer.address.house_no = address.house_no;
      if (address.road !== undefined) customer.address.road = address.road;
      if (address.tower !== undefined) customer.address.tower = address.tower;
      if (address.apartment !== undefined)
        customer.address.apartment = address.apartment;
      if (address.buildingName !== undefined)
        customer.address.buildingName = address.buildingName;
      if (address.office !== undefined)
        customer.address.office = address.office;
    }
    if (balance !== undefined) customer.balance = balance;
    if (security !== undefined) customer.security = security;
    if (billing_plan) customer.billing_plan = billing_plan;
    if (coupon) customer.coupon = coupon;
    if (numberOfCoupon !== undefined) customer.numberOfCoupon = numberOfCoupon;

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
  const { day1, day2 } = req.query;

  if (!day1 || !day2) {
    return res
      .status(400)
      .json({ message: "Please provide both day1 and day2" });
  }

  try {
    const daysArray = [day1, day2];

    const customers = await Customer.find({
      $or: [
        { "deliveryDay.day1": { $in: daysArray } },
        { "deliveryDay.day2": { $in: daysArray } },
      ],
    }).lean();

    if (customers.length === 0) {
      return res
        .status(404)
        .json({ message: "No customers found for the given days" });
    }

    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
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
      "name phone_number address balance security billing_plan"
    ).lean();
    const customerData = customers.map((customer) => ({
      name: customer.name,
      phone_number: customer.phone_number,
      address: customer.address,
      balance: customer.balance,
      security: customer.security,
      billing_plan: customer.billing_plan,
    }));
    res.json(customerData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to find customers by delivery days but not in the provided list
router.post("/find-customers-by-day", async (req, res) => {
  const { customers, days } = req.body;

  if (!customers || !days) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  try {
    const customerNames = customers.map((customer) => customer.name);
    const customerAddresses = customers.map((customer) => {
      return JSON.stringify({
        street: customer.address.street,
        precinct_no: customer.address.precinct_no,
        house_no: customer.address.house_no,
        road: customer.address.road,
        tower: customer.address.tower,
        apartment: customer.address.apartment,
        buildingName: customer.address.buildingName,
        office: customer.address.office,
      });
    });
    const matchingCustomers = await Customer.find({
      $or: [
        { "deliveryDay.day1": { $in: days } },
        { "deliveryDay.day2": { $in: days } },
      ],
      $and: [
        { name: { $nin: customerNames } },
        {
          address: { $nin: customerAddresses.map((addr) => JSON.parse(addr)) },
        },
      ],
    }).lean();

    res.status(200).json(matchingCustomers);
  } catch (err) {
    console.error("Error finding customers:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Route to register a new customer
router.post("/register-customer", async (req, res) => {
  try {
    let {
      name,
      phone_number,
      registrationDate,
      deliveryDay,
      billingPlan,
      couponType,
      couponId,
      numberOfCoupons,
      balance,
      bottleType,
      ratePerBottle,
      bottlesDelivered,
      bottlesReceived,
      perBottleSecurity,
      securityTotal,
      address,
    } = req.body;

    console.log("Received request to register customer:", req.body);

    // Validate required fields
    if (
      !name ||
      !phone_number ||
      !registrationDate ||
      !deliveryDay ||
      !billingPlan ||
      balance === undefined ||
      !bottleType ||
      bottlesDelivered === undefined ||
      bottlesReceived === undefined
    ) {
      console.error("Validation failed. Missing required fields.");
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Conditional validation for coupon billing plan
    if (billingPlan === "Coupon Package") {
      if (!couponType || !couponId || numberOfCoupons === undefined) {
        console.error("Validation failed. Missing coupon fields.");
        return res.status(400).json({
          message:
            "Please provide all coupon fields for the coupon billing plan.",
        });
      }
    } else {
      // If not a coupon package, these fields should be null
      couponType = null;
      couponId = null;
      numberOfCoupons = null;
    }

    // Conditional validation for bottle type
    let ratePerBottleValue = ratePerBottle;
    let perBottleSecurityValue = perBottleSecurity;
    let securityTotalValue = securityTotal;

    if (bottleType === "Company") {
      if (
        ratePerBottle === undefined ||
        perBottleSecurity === undefined ||
        securityTotal === undefined
      ) {
        console.error(
          "Validation failed. Missing required fields for company bottles."
        );
        return res.status(400).json({
          message:
            "Please provide rate per bottle, security per bottle, and security total for company bottles.",
        });
      }
    } else {
      // If bottle type is "Owned," these fields should be null
      ratePerBottleValue = 0;
      perBottleSecurityValue = 0;
      securityTotalValue = 0;
    }

    // Validate address based on selected precinct
    if (
      address.precinct_no === "P-19" ||
      [
        "Bharia Heights",
        "Central Park apartment",
        "Paragon apartments",
      ].includes(address.precinct_no)
    ) {
      if (!address.tower || !address.apartment) {
        return res.status(400).json({
          message: "Please provide tower and apartment for this precinct.",
        });
      }
    } else if (["Jinnah A", "Jinnah B"].includes(address.precinct_no)) {
      if (!address.buildingName || !address.office) {
        return res.status(400).json({
          message: "Please provide building name and office for this precinct.",
        });
      }
    } else if (address.precinct_no === "Head Office") {
      if (!address.office) {
        return res.status(400).json({
          message: "Please provide office for Head Office precinct.",
        });
      }
    } else {
      if (!address.street || !address.road || !address.house_no) {
        return res.status(400).json({
          message:
            "Please provide street, road, and house number for this precinct.",
        });
      }
    }

    // Create a new customer object
    const customer = new Customer({
      name,
      phone_number,
      registrationDate,
      deliveryDay,
      billingPlan,
      couponType,
      couponId,
      numberOfCoupons,
      balance,
      bottleType,
      ratePerBottle: ratePerBottleValue,
      bottlesDelivered,
      bottlesReceived,
      perBottleSecurity: perBottleSecurityValue,
      securityTotal: securityTotalValue,
      securityBalance: securityTotalValue
        ? securityTotalValue - bottlesDelivered * perBottleSecurityValue
        : null,
      address,
    });

    console.log("Customer object being created:", customer);
    const newCustomer = await customer.save();
    console.log("Customer saved successfully:", newCustomer);
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error("Error registering customer:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
