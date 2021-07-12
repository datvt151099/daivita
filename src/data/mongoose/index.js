/* eslint-disable no-console */
import mongoose from 'mongoose';
import Promise from 'bluebird';

const mongoUri =  process.env.MONGO_URI || 'mongodb://localhost:27017/daivita?retryWrites=true&w=majority';
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  autoIndex: true, // Don't build indexes
  poolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

mongoose.Promise = Promise;
mongoose.set('debug', process.env.MONGOOSE_DEBUG === 'on');
console.log('Connecting to', process.env.NODE_ENV, mongoUri);
mongoose.connect(mongoUri, options);
mongoose.connection.on('connected', () => {
  console.log("Connected to mongo instance")
})
mongoose.connection.on('error', () => {
  console.log("Error connecting to mongo")
})
if (mongoose.connection.readyState !== 1) {
  mongoose.connect(mongoUri, options);
}

Object.keys(mongoose.connection.models).forEach(key => {
  if (Object.prototype.hasOwnProperty.call(mongoose.connection.models, key)) {
    delete mongoose.connection.models[key];
  }
});

export default mongoose;
