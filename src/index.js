const ejs = require("ejs");
const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const config = require("../config/default.json");
require("dotenv").config();

const { applicationRouter } = require("./routers");

app.use(express.static(path.join(__dirname, "..", "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());

//Session Configuration...
app.use(
  session({
    secret: "03O{kIPl6a#`|mQ",
    resave: false,
    saveUninitialized: true,
  })
);

//BodyParser Initialized...
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//Routes...
app.use("/", applicationRouter);

//404 page not found error for Non Existing Routes...
app.get("*", function (req, res) {
  res.render("error404");
});

app.listen(process.env.APP_PORT || config.app.port, () => {
  console.log(
    `Server is up and running on port ${
      process.env.APP_PORT || config.app.port
    }`
  );
});
