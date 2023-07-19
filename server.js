require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

//app use
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//methods
const connectDB = require("./db/connectDB");
const auth = require("./middleware/auth");
const authRoute = require("./routes/authRoute");
const postRoute = require("./routes/postRoute");
const userRoute = require("./routes/userRoutes");

//route
app.use("/api/v12/auth", authRoute);
app.use("/api/v12/post", auth, postRoute);
app.use("/api/v12/user", auth, userRoute);

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(3000, console.log("Server running .."));
  } catch (error) {
    console.log(error);
  }
};

startServer();
