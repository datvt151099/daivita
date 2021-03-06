/* eslint-disable consistent-return */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {indexThreshold} from "../../constants";

const schema = new mongoose.Schema({
  created: { type: Date, default: Date.now },
  createdBy: { type: String },
  phone: { type: String, unique: true, required: true },
  birth: { type: String },
  age: { type: Number },
  fullName: { type: String },
  diseaseType: { type: Number},
  avatar: { type: String },
  role: { type: Number },
  inAccount: { type: Boolean },
  password: { type: String, required: true },
  sex: {type: Number },
  highIndex: { type: Number, default: indexThreshold.high},
  lowIndex: { type: Number, default: indexThreshold.low},
  workHospital: { type: String },
  firebaseId: { type: String },
  myDoctorId: { type: String },
  registrationToken: { type: String },
}, {collection: 'user'});



schema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (error, hash) => {
      if (error) return next(error);
      user.password = hash;
      next();
    })
  })
});

schema.methods.comparePassword = function (candidatePassword) {
  const user = this;
  return bcrypt.compare(candidatePassword, user.password)
}
export default mongoose.model('User', schema);
