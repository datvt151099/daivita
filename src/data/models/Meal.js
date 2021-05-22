import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  createdAt: { type: Number },
  createdBy: { type: String },
  updatedAt: { type: Number },
  updatedBy: { type: String },
  eatAt: { type: Number },
  eatDate: {type: String},
  tags: [ Number ],
  food: { type: String },
  patientId: { type: String },
  note: { type: String },
}, {collection: 'meal'});

schema.index({ patientId: 1, eatAt: -1 }, { background: true });

export default mongoose.model('Meal', schema);
