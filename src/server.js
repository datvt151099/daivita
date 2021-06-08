import './dotenv';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
// import expressJwt, { UnauthorizedError as Jwt401Error } from 'express-jwt';
// import passport from './passport';
import expressGraphQL from 'express-graphql';
import jwt from 'jsonwebtoken';
import PrettyError from 'pretty-error';
import routesExpress from './routesExpress';
import auth from './routesExpress/auth';
import config from './config';
import './data/mongoose';
import schema from './data/schema';
import { formatError } from './data/graphql/baseResolver';
import User from "./data/models/User";

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
});

const app = express();

//
// If you are using proxy from external machine, you can set TRUST_PROXY env
// Default is to trust proxy headers only from loopback interface.
// -----------------------------------------------------------------------------
app.set('trust proxy', config.trustProxy);

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//
// Authentication
// -----------------------------------------------------------------------------
// eslint-disable-next-line consistent-return
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    // eslint-disable-next-line consistent-return
    try {
      const decoded = jwt.verify(token, config.auth.jwt.secret);
      const user = await User.findOne({_id: decoded._id});
      if (user) {
        req.user = JSON.parse(JSON.stringify(user));
        next();
      } else {
        res.status(401).send('Unauthorized');
      }
    } catch (e) {
      return res.status(403).send('Forbidden');
    }

  } else {
    res.status(401).send('Unauthorized');
  }
};

// app.use(
//   expressJwt({
//     secret: config.auth.jwt.secret,
//     credentialsRequired: false,
//     getToken: req => req.cookies.id_token,
//   }),
// );
// Error handler for express-jwt

// app.use(passport.initialize());
//
// app.get(
//   '/login/facebook',
//   passport.authenticate('facebook', {
//     scope: ['email', 'user_location'],
//     session: false,
//   }),
// );
// app.get(
//   '/login/facebook/return',
//   passport.authenticate('facebook', {
//     failureRedirect: '/login',
//     session: false,
//   }),
//   (req, res) => {
//     const expiresIn = 60 * 60 * 24 * 180; // 180 days
//     const token = jwt.sign(req.user, config.auth.jwt.secret, { expiresIn });
//     res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true });
//     res.redirect('/');
//   },
// );

//
// Register API middleware
// -----------------------------------------------------------------------------
app.use(
  '/graphql',
  authenticateJWT,
  expressGraphQL(req => ({
    schema,
    graphiql: __DEV__,
    rootValue: { request: req },
    pretty: __DEV__,
    customFormatErrorFn: formatError,
  })),
);

app.use('/auth', auth);
app.use('/api', authenticateJWT, routesExpress);
//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

//
// Launch the server
if (!module.hot) {
  app.listen(config.port, () => {
    console.info(`The server is running at port=${config.port}`);
  });
}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
  app.hot = module.hot;
  module.hot.accept('./router');
}

export default app;
