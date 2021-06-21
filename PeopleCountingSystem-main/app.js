const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const admin = require("firebase-admin");
const https = require('http');
const bodyParser = require('body-parser');
const cons = require('consolidate');

const serviceAccount = require("crowdmanagement-f5374-firebase-adminsdk-f2khz-e33f789d77.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crowdmanagement-f5374-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.engine('html', cons.swig);
app.set('views', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "html");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/monitor',function(req,res){
  res.render("monitor");
});

app.get("/ml",function(req,res){
  res.render("ML")
});

app.post("/ml",function(req,res){
  var mall = req.body.mall;
  var day = req.body.day;
  var month = req.body.month;
  var year = req.body.year;
  var weekend = req.body.weekend;
  var holiday = req.body.holiday;
  var dayOfWeek = req.body.dayOfWeek;
  console.log("in");
  const data = JSON.stringify({
  'mall' : mall,
  'day' : day,
  'month' : month,
  'year' : year,
  'weekend':weekend,
  'holiday':holiday,
  'dayOfWeek':dayOfWeek
});
const opt = {
  hostname: 'localhost',
  port: 5000,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const request = https.request(opt, response => {
  console.log(`statusCode: ${res.statusCode}`)

  response.on('data', d => {
    process.stdout.write(d)
    res.send(d.toString());
  })
})

request.on('error', error => {
  console.error(error)
})

request.write(data)
request.end()
});


app.listen(port, () => {
  console.log(`🚀🚀Listening on port : ${port}`);
});
