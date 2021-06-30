const admin = require("firebase-admin");

const serviceAccount = require("../daivita-78a7c-firebase-adminsdk-1r8gd-4e174b6864.json");

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    apiKey: "AIzaSyBuKYvdatfN8mt26-xgMzcRNEzePUYawvc",
    authDomain: "daivita-78a7c.firebaseapp.com",
    projectId: "daivita-78a7c",
    storageBucket: "daivita-78a7c.appspot.com",
    messagingSenderId: "611216538619",
    appId: "1:611216538619:web:46dcbed462d780fb46695e"
  });
}

// const fb = require('firebase');
//
// if (fb.apps.length === 0) {
// fb.initializeApp({
//   apiKey: "AIzaSyBuKYvdatfN8mt26-xgMzcRNEzePUYawvc",
//   authDomain: "daivita-78a7c.firebaseapp.com",
//   projectId: "daivita-78a7c",
//   storageBucket: "daivita-78a7c.appspot.com",
//   messagingSenderId: "611216538619",
//   appId: "1:611216538619:web:46dcbed462d780fb46695e",
//   measurementId: "G-9ST4FT49XD"
// });
// }

export default admin;
