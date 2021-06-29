import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  createdAt: {
    type: Number
  },
  updatedAt: {
    type: Number
  },
  createdBy: {
    type: String
  },
  patientId: {
    type: String
  },
  time: {
    type: Number
  },
  address: {
    type: String
  }
}, { collection: 'appointment' });

export default mongoose.model('Appointment', schema);
