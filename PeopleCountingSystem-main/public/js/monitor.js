(function(){
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDpbdnCpUC1d6tDaOBMQ1-3rG5QcN7OFX8",
    authDomain: "crowdmanagement-f5374.firebaseapp.com",
    databaseURL: "https://crowdmanagement-f5374-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "crowdmanagement-f5374",
    storageBucket: "crowdmanagement-f5374.appspot.com",
    messagingSenderId: "1062036382613",
    appId: "1:1062036382613:web:46ade195c3b4b628884c9c",
    measurementId: "G-9B5314EXNL"
  };
//initialize app
firebase.initializeApp(firebaseConfig);

//select element
const gotInObject = document.getElementById('gotin');
const gotOutObject = document.getElementById('gotout');
//create reference
const refGotIn =  firebase.database().ref('/SomeMall/').child('gotIn');
const refGotOut =  firebase.database().ref('/SomeMall/').child('gotOut');
//sync obj changes
refGotIn.on('value', snap => {
  gotInObject.innerText = JSON.stringify(snap.val(), null, 3);
});

refGotOut.on('value', snap => {
  gotOutObject.innerText = JSON.stringify(snap.val() , null , 3);
});
}())
