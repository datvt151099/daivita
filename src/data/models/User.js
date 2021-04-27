/* eslint-disable consistent-return */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const schema = new mongoose.Schema({
  created: { type: Date, default: Date.now },
  phone: { type: String, unique: true, required: true },
  email: { type: String },
  fullName: { type: String },
  picture: { type: String },
  role: { type: String },
  password: { type: String, required: true },
  sex: {type: Number}
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
