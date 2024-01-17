import * as firebase from "firebase/app";
import "firebase/database";
import { getDatabase, get, ref, child } from "firebase/database";
import { apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId, measurementId } from '@env';

console.log("Connecting...");

// Initialize Firebase
var firebaseConfig = {
  apiKey: proccess.env.apiKey,
  authDomain: proccess.env.authDomain,
  databaseURL: proccess.env.databaseURL,
  projectId: proccess.env.projectId,
  storageBucket: proccess.env.storageBucket,
  messagingSenderId: proccess.env.messagingSenderId,
  appId: proccess.env.appId,
  measurementId: proccess.env.measurementId
};

try{
  var fb = firebase.initializeApp(firebaseConfig);

  var db = ref(getDatabase());  

  console.log("Connected");

} catch(error){
  console.log("Failed to connect to Database", error);
}

export default db;
