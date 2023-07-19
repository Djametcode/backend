require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

//app use
app.use(cors());
app.use(express.json());

//methods
const connectDB = require("./db/connectDB");
const authRoute = require("./routes/authRoute");

//route
app.use("/api/v12/auth", authRoute);

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(3000, console.log("Server running .."));
  } catch (error) {
    console.log(error);
  }
};

startServer();
