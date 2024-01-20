import * as firebase from "firebase/app";
import "firebase/database";
import { getDatabase, get, ref, child } from "firebase/database";
import { apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId, measurementId } from '@env';


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

var fb = firebase.initializeApp(firebaseConfig);

var db = ref(getDatabase());

export default db;
