import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  createdAt: { type: Number },
  createdBy: { type: String },
  updatedAt: { type: Number },
  updatedBy: { type: String },
  eatAt: { type: Number },
  food: { type: String },
  userId: { type: String },
  note: { type: String },
}, {collection: 'meal'});

schema.index({ userId: 1, measureAt: -1 }, { background: true });

export default mongoose.model('Meal', schema);
