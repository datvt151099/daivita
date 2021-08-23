import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  createdAt: { type: Number },
  updatedAt: { type: Number },
  createdBy: { type: String },
  creatorName: { type: String },
  patientId: { type: String },
  diagnose: { type: String },
  medicines: [{
    name: { type: String },
    dose: { type: String },
    total: { type: String },
  }],
  note: { type: String },
}, {collection: 'prescription'});

export default mongoose.model('Prescription', schema);
