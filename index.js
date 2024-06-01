const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080; // Use the PORT environment variable provided by Azure

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const dbUrl =
  "mongodb+srv://awaisurrehman:RealMadrid@mongodb.uk7fwy7.mongodb.net/OculaCare?retryWrites=true&w=majority&appName=MongoDB";
mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
const expenseRoutes = require("./routes/expenses");
app.use("/expenses", expenseRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/test", (req, res) => {
  res.send("API is working!");
});
