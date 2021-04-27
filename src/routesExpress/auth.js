/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User from "../data/models/User";
import {ERROR_MESSAGE_SERVER} from "../constants";

const router = new Router();

const generateToken = (user) => {
  const { expiresIn } = config.auth.jwt;
  const accessToken = jwt.sign(JSON.parse(JSON.stringify(user)), config.auth.jwt.secret, {expiresIn});
  return {
    accessToken,
    expiresIn,
  }
}

router.post('/login', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        {phone: username},
        {email: username}
      ],
    });

    if (user) {
      const isMatch = user.comparePassword(password);
      if (isMatch) {
        const {accessToken, expiresIn } = generateToken(JSON.parse(JSON.stringify(user)));
        result.status = true;
        result.accessToken = accessToken;
        result.expiresIn = expiresIn;
        result.message = "Đăng nhập thành công!"
      } else {
        result.message = "Sai mật khẩu!"
      }
    } else {
      result.message = "Tài khoản không tồn tại!"
    }
  } catch (e) {
    result.message = ERROR_MESSAGE_SERVER;
  }
  res.status(200).send(result);
});

router.post("/register", async (req, res) => {
  const {
    phone,
    email,
    fullName,
    password,
    sex
  } = req.body;

  const result = {
    status: false,
    message: ''
  };

  try {
    const user = await User.findOne({
      $or: [
        {phone},
        {email}
      ],
    })
    if (user) result.message = "Tài khoản đã tồn tại!";
    else {
      const newUser = new User({
        phone,
        email,
        fullName,
        password,
        sex
      })
      await newUser.save();
      const {accessToken, expiresIn } = generateToken(JSON.parse(JSON.stringify(newUser)));
      result.status = true;
      result.accessToken = accessToken;
      result.expiresIn = expiresIn;
      result.message = "Đăng ký thành công!";
    }
  } catch (e) {
    console.log(JSON.stringify(e))
    result.message = ERROR_MESSAGE_SERVER;
  }
  res.status(200).send(result);
})

export default router;
