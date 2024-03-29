import * as firebase from "firebase/app";
import "firebase/database";
import { getDatabase, get, ref, child } from "firebase/database";
import { apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId, measurementId } from '@env';

console.log("Connecting...");

// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyAVC_qw9K4UHP_BRvLt2Q6nP-eJXkBQvl8",
  authDomain: "csemp-40952.firebaseapp.com",
  databaseURL: "https://csemp-40952-default-rtdb.firebaseio.com",
  projectId: "csemp-40952",
  storageBucket: "csemp-40952.appspot.com",
  messagingSenderId: "318928152766",
  appId: "1:318928152766:web:3f2fa2164771dc27ed56ef",
  measurementId: "G-Q3S43D5469"
};

try{
  var fb = firebase.initializeApp(firebaseConfig);

  var db = ref(getDatabase());  

  console.log("Connected");

} catch(error){
  console.log("Failed to connect to Database", error);
}

export default db;
