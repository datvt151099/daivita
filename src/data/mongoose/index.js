import mongoose from 'mongoose';
import Promise from 'bluebird';


const mongoUri = process.env.MONGO_URI;
// eslint-disable-next-line no-console
console.log('Connecting to ', process.env.NODE_ENV, mongoUri);
mongoose.Promise = Promise;
mongoose.set('debug', process.env.MONGOOSE_DEBUG === 'on');
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
});

export default mongoose;
