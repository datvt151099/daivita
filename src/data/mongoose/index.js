import mongoose from 'mongoose';
import Promise from 'bluebird';
import { buildUri } from './helpers';

if (process.env.NODE_ENV !== 'test') {
  const mongoUri = buildUri(process.env.MONGODB_DB);
  // eslint-disable-next-line no-console
  console.log('Connecting to ', mongoUri);
  mongoose.Promise = Promise;

  mongoose.set('debug', process.env.MONGOOSE_DEBUG === 'on');

  if (mongoose.connection.readyState === 1) {
    // mongoose.connection.close();
    // mongoose.disconnect().then(() => mongoose.connect(mongoUri));
  } else {
    mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      autoIndex: process.env.AUTO_INDEX && process.env.AUTO_INDEX === 'true',
    });
  }
  Object.keys(mongoose.connection.models).forEach(key => {
    // check also if property is not inherited from prototype
    if (Object.prototype.hasOwnProperty.call(mongoose.connection.models, key)) {
      // eslint-disable-next-line security/detect-object-injection
      delete mongoose.connection.models[key];
    }
  });
}

export default mongoose;
