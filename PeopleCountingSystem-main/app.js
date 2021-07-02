//core module requires
const path = require("path");
//express requires
const express = require("express");
const bodyParser = require("body-parser");
//authentication login
require("dotenv").config();
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const cookieSession = require("cookie-session");
//firebase requires
const admin = require("firebase-admin");
const serviceAccount = require("crowdmanagement-f5374-firebase-adminsdk-f2khz-e33f789d77.json");

//config constants
const PORT = process.env.PORT || 3000;
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
app.use(
  cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [AUTH_CONFIG.COOKIE_KEY_1, AUTH_CONFIG.COOKIE_KEY_2],
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));
/* ---------------------- database ---------------------- */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://crowdmanagement-f5374-default-rtdb.asia-southeast1.firebasedatabase.app",
});

console.log(process.env.CONFIG);
const db = admin.database();
const ref = db.ref("/");

function checkLoggedIn(req, res, next) {
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn) {
    return res.redirect("/");
  }
  next();
}

function checkAuthorization(req, res, next) {
  const users = ref.child("/");
  users.child(req.user.email).then(snapshot => {
    if (!snapshot.exists()) {
      return res.redirect("/");
    }
  });
  next();
}

//routes

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

app.get("/buy", checkLoggedIn, (req, res) => {
  const users = ref.child("/"+req.user.displayName).set({
    id: req.user.id,
    gotIn: 0,
    gotOut: 0,
    ml: {}
  });
  console.log(users);
  // users.child(req.user.email).then(snapshot => {
  //   if (!snapshot.exists()) {
  //     users.set({
  //       email: req.user.email,
  //       gotIn: 0,
  //       gotOut: 0,
  //       ml: {},
  //     });
  //   }
  // });
  res.redirect("/");
});

app.get("/monitor", function (req, res) {
  console.log(req.user.displayName);
  res.render("monitor",{ user : req.user.displayName});
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
  if (req.user) {
    res.render("index", {
      loggedIn: true,
    });
  } else {
    res.render("index", {
      loggedIn: false,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀🚀Listening on port : ${PORT}`);
});
