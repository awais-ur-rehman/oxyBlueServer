const express = require("express");
const router = express.Router();
const Rider = require("../models/rider");

// Route to get all riders
router.get("/", async (req, res) => {
  try {
    const riders = await Rider.find().lean();
    const formattedRiders = riders.map((rider) => ({
      ...rider,
      _id: rider._id.toString(),
    }));
    res.json(formattedRiders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Route to add a new rider
router.post("/add-rider", async (req, res) => {
  const {
    name,
    password,
    phone_number,
    vehicle_type,
    license_plate,
    deliveries_completed,
    rating,
  } = req.body;

  if (
    !name ||
    !password ||
    !phone_number ||
    !vehicle_type ||
    !license_plate ||
    deliveries_completed === undefined ||
    rating === undefined
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const rider = new Rider({
    name,
    password, // Include password in the Rider creation
    phone_number,
    vehicle_type,
    license_plate,
    deliveries_completed: parseInt(deliveries_completed),
    rating: parseFloat(rating),
  });

  try {
    const newRider = await rider.save();
    res.status(201).json(newRider);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to update a rider
router.put("/:id", async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    const {
      name,
      phone_number,
      vehicle_type,
      license_plate,
      deliveries_completed,
      rating,
    } = req.body;

    if (name) rider.name = name;
    if (phone_number) rider.phone_number = phone_number;
    if (vehicle_type) rider.vehicle_type = vehicle_type;
    if (license_plate) rider.license_plate = license_plate;
    if (deliveries_completed !== undefined)
      rider.deliveries_completed = parseInt(deliveries_completed);
    if (rating !== undefined) rider.rating = parseFloat(rating);

    const updatedRider = await rider.save();
    res.json(updatedRider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to delete a rider
router.delete("/:id", async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    await rider.remove();
    res.json({ message: "Rider deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Router for Rider Login
router.post("/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const rider = await Rider.findOne({ name });
    if (rider) {
      if (password == rider.password) {
        res.json({ message: "Login Successful", rider: rider });
      } else {
        res.status(401).json({ message: "Invalid Password" });
      }
    } else {
      res.status(404).json({ message: "Rider not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
