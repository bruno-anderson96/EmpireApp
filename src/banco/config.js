import * as firebase from "firebase/app";
import "firebase/database";
import { getDatabase, get, ref, child } from "firebase/database";

// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyAVC_qw9K4UHP_BRvLt2Q6nP-eJXkBQvl8",
  authDomain: "csemp-40952.firebaseapp.com",
  databaseURL: "https://csemp-40952-default-rtdb.firebaseio.com",
  projectId: "csemp-40952",
  storageBucket: "csemp-40952.appspot.com",
  messagingSenderId: "318928152766",
  appId: "1:318928152766:web:3f2fa2164771dc27ed56ef",
  measurementId: "G-Q3S43D5469",
};

var fb = firebase.initializeApp(firebaseConfig);

var db = ref(getDatabase());

export default db;

// db.ref("caveiraman2012/itens").on("value", (snapshot) => {
//   const data = snapshot.val();
//   console.log(data);
// });
