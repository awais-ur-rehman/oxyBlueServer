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
app.use("/expenses", expenseRoutes);
app.use("/riders", ridersRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/test", (req, res) => {
  res.send("API is working!");
});
