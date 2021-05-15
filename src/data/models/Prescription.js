import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  createdAt: { type: Number },
  updatedAt: { type: Number },
  createdBy: { type: String },
  patientId: { type: String },
  medicines: [{
    name: { type: String },
    amount: { type: String },
    note: { type: String }
  }],
  note: { type: String },
}, {collection: 'prescription'});

export default mongoose.model('Prescription', schema);
