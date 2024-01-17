import * as firebase from "firebase/app";
import "firebase/database";
import { getDatabase, get, ref, child } from "firebase/database";
import { apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId, measurementId } from '@env';


// Initialize Firebase
var firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  databaseURL: databaseURL,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId
};

var fb = firebase.initializeApp(firebaseConfig);

var db = ref(getDatabase());

export default db;
