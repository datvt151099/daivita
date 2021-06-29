import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  createdAt: { type: Number },
  createdBy: { type: String },
  updatedAt: { type: Number },
  updatedBy: { type: String },
  measureAt: { type: Number },
  measureDate: { type: String },
  index: { type: Number },
  patientId: { type: String },
  tag: {type: Number},
  note: { type: String },
  image: { type: String }
}, {collection: 'index'});

schema.index({ patientId: 1, measureAt: -1 }, { background: true });

export default mongoose.model('Index', schema);
