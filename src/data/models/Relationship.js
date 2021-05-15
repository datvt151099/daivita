import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userOneId: { type: String },
  userTwoId: { type: String },
  actionUserId: { type: String },
  status: { type: Number },
  actionAt: { type: Number },
  noteUserOne: { type: String },
  noteUserTwo: { type: String }
}, {collection: 'relationship'});

export default mongoose.model('Relationship', schema);
