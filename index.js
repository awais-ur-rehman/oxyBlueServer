const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// MongoDB Connection
const dbUrl =
  "mongodb+srv://awaisurrehman:RealMadrid@mongodb.uk7fwy7.mongodb.net/OxyBlue?retryWrites=true&w=majority&appName=MongoDB";
mongoose
  .connect(dbUrl)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
const expenseRoutes = require("./routes/expenses");
const ridersRoutes = require("./routes/riders");
const customerRoutes = require("./routes/customers");
const orderRoutes = require("./routes/orders");
const totalRoutes = require("./routes/total");
const reportRoutes = require("./routes/dailyReport");

app.use("/expenses", expenseRoutes);
app.use("/riders", ridersRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/totals", totalRoutes);
app.use("/reports", reportRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/test", (req, res) => {
  res.send("API is working!");
});
