/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import moment from "moment";
import * as _ from "lodash";
import config from '../config';
import User from "../data/models/User";
import {ERROR_MESSAGE_SERVER, roles} from "../constants";
// import Relationship from "../data/models/Relationship";
import Health from "../data/models/Health";

const router = new Router();

export const generateToken = (user) => {
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
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });

    if (user) {
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        const userInfo = _.omit(JSON.parse(JSON.stringify(user)), ['password', 'firebaseId']);
        const {accessToken, expiresIn } = generateToken({_id: userInfo._id});
        result.status = true;
        result.data = {
          accessToken,
          userInfo,
          expiresIn
        };
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
    diseaseType,
    role = roles.doctor,
    birth,
    workHospital,
    sex,
    firebaseId,
  } = req.body;

  const result = {
    status: false,
    message: ''
  };

  try {
    const user = await User.findOne({phone});
    if (user) result.message = "Tài khoản đã tồn tại!";
    else {
      const newUser = new User({
        phone,
        email,
        fullName,
        password,
        diseaseType,
        age: moment().diff(birth, 'years'),
        role,
        inAccount: true,
        birth,
        workHospital,
        sex,
        firebaseId
      });
      await newUser.save();
      if (role === roles.patient) {
        await Health.create({
          createdAt: +moment().format('X'),
          patientId: newUser._id,
          age: moment().diff(birth, 'years'),
          diseaseType,
          fullName,
        })
      };
      const userInfo = _.omit(JSON.parse(JSON.stringify(newUser)), ['password', 'firebaseId']);
      const { accessToken, expiresIn } = generateToken({_id: userInfo._id});
      result.status = true;
      result.data = {
        accessToken,
        userInfo,
        expiresIn
      };
      result.message = "Đăng ký thành công!";
    }
  } catch (e) {
    console.log(JSON.stringify(e))
    result.message = ERROR_MESSAGE_SERVER;
  }
  res.status(200).send(result);
})

router.post("/get-user-by-phone", async (req, res) => {
  const {
    phone,
  } = req.body;

  const result = {
    status: false,
    message: ''
  };

  try {
    const user = await User.findOne({phone});
    result.status = true;
    result.data = user ? _.omit(JSON.parse(JSON.stringify(user)), ['password', 'firebaseId']) : user;
  } catch (e) {
    console.log(JSON.stringify(e))
    result.message = ERROR_MESSAGE_SERVER;
  }
  res.status(200).send(result);
})

router.post("/forgot-password", async (req, res) => {
  const {
    phone,
    password,
    firebaseId,
  } = req.body;

  const result = {
    status: false,
    message: ''
  };

  try {
    const user = await User.findOne({
      phone,
      firebaseId
    });
    if (!user) {
      result.message = 'Số điện thoại chưa đăng ký tài khoản!';
    } else {
      user.password = password;
      await user.save();
      result.status = true;
      result.message = "Đổi mật khẩu thành công!"
    }
  } catch (e) {
    console.log(JSON.stringify(e))
    result.message = ERROR_MESSAGE_SERVER;
  }
  res.status(200).send(result);
})

export default router;
