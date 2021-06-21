import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  createdAt: { type: Number },
  updatedAt: { type: Number },
  fromUserId: { type: String },
  toUserId: { type: String },
  status: { type: Boolean, default: false},
  notification: {
    title: { type: String },
    body: { type: String }
  },
  type: { type: String },
  payload: { type: String, default: "null"},
  isValid: { type: Boolean, default: true}
}, { collection: 'notification' });

schema.index({ userId: -1 }, { background: true });

export default mongoose.model('Notification', schema);
