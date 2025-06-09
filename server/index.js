const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const { login, register } = require("./controllers/authController");
const { getNotes, createNote } = require("./controllers/noteController");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/noteRoutes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running", PORT);
});
