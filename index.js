const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// MongoDB Connection
const dbUrl = process.env.PROD_DB_URL;
mongoose
  .connect(
    "mongodb+srv://dripitwatersolutions:ge6iLEaS8CezIox8@cluster0.mzbjl.mongodb.net/OxyBlue?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
const expenseRoutes = require("./routes/expenses");
const ridersRoutes = require("./routes/riders");
const customerRoutes = require("./routes/customers");
const orderRoutes = require("./routes/orders");
const totalRoutes = require("./routes/total");
const reportRoutes = require("./routes/dailyReport");
const couponRoutes = require("./routes/coupons");

app.use("/expenses", expenseRoutes);
app.use("/riders", ridersRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/totals", totalRoutes);
app.use("/reports", reportRoutes);
app.use("/coupons", couponRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/test", (req, res) => {
  res.send("API is working!");
});
