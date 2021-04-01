import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User from "../data/models/User";

const router = new Router();

// eslint-disable-next-line consistent-return
router.post('/login', async (req, res) => {
  // Read username and password from request body
  const { username } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        {phone: username},
        {email: username}
      ],
    });

    if (user) {
      // Generate an access token
      const accessToken = jwt.sign(JSON.parse(JSON.stringify(user)), config.auth.jwt.secret, {expiresIn: config.auth.jwt.expiresIn});

      res.status(200).send({
        status: true,
        accessToken
      });
    } else {
      res.status(401).send({
        status: false,
        message: 'Username or password incorrect'
      });
    }
  } catch (e) {
    return res.status(500).send(e.message);
  }
  // Filter user from the users array by username and password

});

export default router;
