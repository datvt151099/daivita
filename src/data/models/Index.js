import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  createdAt: { type: Number },
  updatedAt: { type: Number },
  measureAt: { type: Number },
  updatedBy: { type: String },
  index: { type: Number },
  userId: { type: String },
  note: { type: String },
}, {collection: 'index'});

schema.index({ userId: 1, measureAt: -1 }, { background: true });

export default mongoose.model('Index', schema);
