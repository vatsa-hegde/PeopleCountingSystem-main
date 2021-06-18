const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
var admin = require("firebase-admin");

var serviceAccount = require("crowdmanagement-f5374-firebase-adminsdk-f2khz-dfc4442d84.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crowdmanagement-f5374-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();
app.use(express.static(path.join(__dirname, "public")));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const ref = db.ref('/import/');
ref.orderByChild('timestamp').startAt(1439922600).endAt(1441391400).once('value', (snapshot) => {
console.log(snapshot.val());

});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/monitor',function(req,res){
  res.render("monitor");
});

app.get("/ml",function(req,res){
  const ref = db.ref('/import/');
  ref.orderByChild('timestamp').startAt(1439922600).endAt(1441391400).once('value', (snapshot) => {
  console.log(snapshot.val());
  });
});
})


app.listen(port, () => {
  console.log(`🚀🚀Listening on port : ${port}`);
});
