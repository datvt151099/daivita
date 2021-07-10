import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  type: { type: String },
  title: { type: String },
  background: { type: String },
  body: { type: String },
  role: { type: Number}
}, {collection: 'paper'});

export default mongoose.model('Paper', schema);
