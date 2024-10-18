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

    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error("Error saving customer:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Route to update a customer by name
router.put("/updateByName", async (req, res) => {
  const {
    name,
    phone_number,
    address,
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
    securityBalance,
  } = req.body;

  try {
    // Find the customer by name
    const customer = await Customer.findOne({ name: name });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Update customer fields with the received data
    if (phone_number) customer.phone_number = phone_number;
    if (registrationDate) customer.registrationDate = registrationDate;

    // Update address fields
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

    // Update delivery day
    if (deliveryDay) {
      if (deliveryDay.day1 !== undefined)
        customer.deliveryDay.day1 = deliveryDay.day1;
      if (deliveryDay.day2 !== undefined)
        customer.deliveryDay.day2 = deliveryDay.day2;
    }

    // Update other fields
    if (balance !== undefined) customer.balance = balance;
    if (billingPlan) customer.billingPlan = billingPlan;
    if (couponType) customer.couponType = couponType;
    if (couponId) customer.couponId = couponId;
    if (numberOfCoupons !== undefined)
      customer.numberOfCoupons = numberOfCoupons;
    if (bottleType) customer.bottleType = bottleType;
    if (ratePerBottle !== undefined) customer.ratePerBottle = ratePerBottle;
    if (bottlesDelivered !== undefined)
      customer.bottlesDelivered = bottlesDelivered;
    if (bottlesReceived !== undefined)
      customer.bottlesReceived = bottlesReceived;
    if (perBottleSecurity !== undefined)
      customer.perBottleSecurity = perBottleSecurity;
    if (securityTotal !== undefined) customer.securityTotal = securityTotal;
    if (securityBalance !== undefined)
      customer.securityBalance = securityBalance;

    // Save the updated customer
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
  console.log("Started");
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
      securityBalance,
      address,
    } = req.body;

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
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Validate coupon fields for the coupon billing plan
    if (billingPlan === "Coupon Package") {
      if (!couponType || !couponId || numberOfCoupons === undefined) {
        return res.status(400).json({
          message:
            "Please provide all coupon fields for the coupon billing plan.",
        });
      }
    } else {
      // If not a coupon package, set couponType to null
      couponType = null;
      couponId = null;
      numberOfCoupons = null;
    }

    // Validate bottle-related fields based on bottle type
    if (
      bottleType === "companyBottles" &&
      (perBottleSecurity === undefined || securityTotal === undefined)
    ) {
      return res.status(400).json({
        message:
          "Please provide security per bottle and security total for company bottles.",
      });
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
      if (!address.building_name || !address.office) {
        return res.status(400).json({
          message: "Please provide building name and office for this precinct.",
        });
      }
    } else if (address.precinct_no === "Head Office" && !address.office) {
      return res.status(400).json({
        message: "Please provide office for Head Office precinct.",
      });
    } else if (!address.street || !address.road || !address.house_no) {
      return res.status(400).json({
        message:
          "Please provide street, road, and house number for this precinct.",
      });
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
      ratePerBottle,
      bottlesDelivered,
      bottlesReceived,
      perBottleSecurity:
        bottleType === "companyBottles" ? perBottleSecurity : 0,
      securityTotal: bottleType === "companyBottles" ? securityTotal : 0,
      securityBalance,
      address,
    });

    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
