import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  created: { type: Date, default: Date.now },
  email: { type: String, unique: true },
  phone: { type: String },
  name: { type: String },
  picture: String,
  role: String,
});

export default mongoose.model('User', schema);
