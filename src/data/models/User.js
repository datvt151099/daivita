import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  created: { type: Date, default: Date.now },
  phone: { type: String, unique: true },
  email: { type: String },
  name: { type: String },
  picture: { type: String },
  role: { type: String },
  password: { type: String}
}, {collection: 'user'});

export default mongoose.model('User', schema);
