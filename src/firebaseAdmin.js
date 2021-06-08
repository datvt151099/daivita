const admin = require("firebase-admin");

const serviceAccount = require("../daivita-78a7c-firebase-adminsdk-1r8gd-4e174b6864.json");

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
