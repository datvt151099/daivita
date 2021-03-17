import mongoUriBuilder from 'mongo-uri-builder';

export function buildUri(database, auth) {
  return mongoUriBuilder({
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    host: process.env.MONGODB_HOST || 'localhost',
    port: process.env.MONGODB_PORT || 27017,
    database,
    options: {
      w: 0,
      readPreference: 'secondary',
      authSource: auth || process.env.MONGODB_AUTH || 'admin',
    },
  });
}

export function startTransaction(session) {
  if (session) {
    session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    });
  }
}
