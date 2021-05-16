import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  createdAt: { type: Number },
  currentIndex: { type: Number },
  measureAt: { type: Number },
  patientId: { type: String },
  fullName: { type: String },
  age: { type: Number },
  special: { type: Boolean },
  diseaseType: { type: Number },
  avgIndex: { type: Number }
}, { collection: 'health' });

schema.index({ patientId: 1 }, { background: true });

export default mongoose.model('Health', schema);
