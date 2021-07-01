const express = require("express");
const path = require("path");
const port = process.env.PORT || 3000;
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cons = require("consolidate");
const serviceAccount = require("crowdmanagement-f5374-firebase-adminsdk-f2khz-e33f789d77.json");
require("dotenv").config();
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const helmet = require("helmet");
const cookieSession = require("cookie-session");

const AUTH_CONFIG = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: AUTH_CONFIG.CLIENT_ID,
  clientSecret: AUTH_CONFIG.CLIENT_SECRET,
};

function verifyCallback(accessToken, refreshToken, profile, done) {
  // console.log(`accessToken ${accessToken}`);
  console.log(`Google Profile`, profile);
  done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((userObj, done) => {
  done(null, userObj);
});
const app = express();

app.use(helmet());

app.use(
  cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [AUTH_CONFIG.COOKIE_KEY_1, AUTH_CONFIG.COOKIE_KEY_2],
  })
);

app.use(passport.initialize());
app.use(passport.session());
/* ---------------------- database ---------------------- */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://crowdmanagement-f5374-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = admin.database();
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.engine("html", cons.swig);
app.set("views", path.join(__dirname, "public"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "html");

function checkLoggedIn(req, res, next) {
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn) {
    return res.redirect("/");
  }
  next();
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
  })
);

app.get("/auth/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/failure", (req, res) => {
  res.send("Failed to login");
});

app.get("/monitor", function (req, res) {
  res.render("monitor");
});

app.get("/ml", checkLoggedIn, function (req, res) {
  res.render("ML");
});

app.post("/ml", function (req, res) {
  var mall = req.body.mall;
  var day = req.body.day;
  var month = req.body.month;
  var year = req.body.year;
  var weekend = req.body.weekend;
  var holiday = req.body.holiday;
  var dayOfWeek = req.body.dayOfWeek;
  console.log("in");
  const data = JSON.stringify({
    mall: mall,
    day: day,
    month: month,
    year: year,
    weekend: weekend,
    holiday: holiday,
    dayOfWeek: dayOfWeek,
  });
  const opt = {
    hostname: "localhost",
    port: 5000,
    path: "/",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const request = https.request(opt, response => {
    console.log(`statusCode: ${res.statusCode}`);
    response.on("data", d => {
      process.stdout.write(d);
      res.send(d.toString());
    });
  });

  request.on("error", error => {
    console.error(error);
  });

  request.write(data);
  request.end();
});

app.get("/", (req, res) => {
  res.sendFile("index.html");
});
app.listen(port, () => {
  console.log(`🚀🚀Listening on port : ${port}`);
});
