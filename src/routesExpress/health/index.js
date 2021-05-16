/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import * as _ from "lodash";
import moment from "moment";
import getPatients from "./getPatients";
import checkPermission from "../user/checkPermission";
import Index from "../../data/models/Index";
import addIndex, {updateIndex} from "./addIndex";
import updateHealth from "./updateHealth";
import Health from "../../data/models/Health";
import User from "../../data/models/User";
import {ERROR_MESSAGE_SERVER, relationalStatus, roles} from "../../constants";
import setRelationship from "../user/setRelationship";
import addMeal from "./addMeal";
import Prescription from "../../data/models/Prescription";
import Meal from "../../data/models/Meal";

const router = new Router();

router.post('/get-patients', async (req, res) => {
  // const { offset, rowsPerPage } = req.body || {};
  const data = await getPatients(req.user._id);
  res.send({
    status: true,
    data,
    message: '',
  });
});

router.post('/get-patient', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const {phone} = req.body || {};
  const user = await User.findOne({phone});

  if (!user) {
    result.status = true;
  } else if (user.role === roles.doctor) {
    result.message = 'Số điện thoại đã đăng ký tài khoản bác sĩ!';
  } else {
    result.status = true;
    result.data = _.omit(JSON.parse(JSON.stringify(user)), ['password', 'firebaseId']);
  }
  res.send(result);
});

router.post('/add-patient', async (req, res) => {
  const actionUserId = req.user._id;
  const {
    phone,
    note,
    fullName,
    diseaseType,
    birth,
    sex
  } = req.body || {};
  let patientId;
  const user = await User.findOne({phone});
  if (user && user.role === roles.patient) {
    patientId = user._id;
  } else if (!user) {
    const patient = new User({
      fullName,
      diseaseType,
      inAccount: false,
      role: roles.patient,
      birth,
      sex,
      phone,
      password: 'test',
    });
    await patient.save();
    await Health.create({
      createdAt: +moment().format('X'),
      patientId: patient._id,
      age: moment().diff(birth, 'years'),
      diseaseType,
      fullName,
    })
    patientId = patient._id;
  } else {
    res.send({
      status: false,
      message: 'Số điện thoại không hợp lệ!'
    });
  }
  await setRelationship({
    actionUserId,
    userTwoId: patientId,
    status: relationalStatus.pending,
    note,
  });
  await setRelationship({
    actionUserId: patientId,
    userTwoId: actionUserId,
    status: relationalStatus.accepted,
  })
  res.send({
    status: true,
    message: 'Thêm bệnh nhân thành công!'
  });
});

router.post('/unfollow-patient', async (req, res) => {
  const { patientId } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  try{
    const status = await setRelationship({
      actionUserId,
      userTwoId: patientId,
      status: relationalStatus.blocked
    })
    if (status) {
      result.status = true;
      result.message = 'Đã hủy theo dõi!';
    }
  } catch (e) {
    result.message = ERROR_MESSAGE_SERVER;
  };

  res.send(result);
});

router.post('/set-special-patient', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const { patientId, special } = req.body;
  const isMatch = await checkPermission(req.user._id, patientId);
  if (isMatch) {
    await Health.findOneAndUpdate({
      patientId
    }, {
      $set: {
        special: Boolean(special)
      }
    })

    result.status = true;
    result.message = 'Đánh dấu thành công!';
  }

  res.send(result);
});

router.post('/add-index', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const createdBy = req.user._id;
  const { measureAt, index, patientId = createdBy, note, labels } = req.body;
  const isMatch = await checkPermission(createdBy, patientId);
  if (isMatch) {
    await addIndex({
      measureAt,
      index,
      patientId,
      createdBy,
      updatedBy: createdBy,
      labels,
      note
    });
    await updateHealth(patientId);
    result.status = true;
    result.message = 'Thêm thành công!'
  }
  res.send(result);
});

router.post('/update-index', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const updatedBy = req.user._id;
  const { measureAt, indexId, note, index } = req.body;
  const { userId } = await Index.findOne({ _id: indexId }) || {};
  const isMatch = await checkPermission(updatedBy, userId);
  if (isMatch) {
    await updateIndex({
      updatedBy,
      indexId,
      measureAt,
      index,
      note
    });
    await updateHealth(userId);
    result.status = true;
    result.message = 'Cập nhật thành công!'
  }
  res.send(result);
});

router.post('/add-meal', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const createdBy = req.user._id;
  const { eatAt, food, patientId = createdBy, note, labels } = req.body;
  const isMatch = await checkPermission(createdBy, patientId);
  if (isMatch) {
    await addMeal({
      eatAt,
      food,
      patientId,
      createdBy,
      updatedBy: createdBy,
      note,
      labels
    });
    result.status = true;
    result.message = 'Thêm thành công!'
  }
  res.send(result);
});

router.post('/get-health-info', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const { patientId } = req.body;

  // Kiểm tra có phải bác sĩ theo dõi không
  const user = await User.findOne({_id: patientId, role: roles.patient});
  if (!user) {
    result.message = 'Không tồn tại!';
  } else {
    const prescription = await Prescription
      .find({patientId}, { medicines: true, note: true })
      .sort({createdAt: -1})
      .limit(1) || [];

    const indexData = await Index
      .find({
        patientId,
        measureAt: {
          $gte: +moment().subtract(7, 'days').startOf('day').format('X'),
          $lte: +moment().endOf('day').format('X')
        }
      }, {
        measureAt: true,
        index: true,
        note: true,
      })
      .sort({measureAt: -1});

    const mealData = await Meal
      .find({
        patientId,
        eatAt: {
          $gte: +moment().subtract(7, 'days').startOf('day').format('X'),
          $lte: +moment().endOf('day').format('X')
        }
      }, {
        eatAt: true,
        food: true,
        note: true,
      })
      .sort({eatAt: -1});

    const currentIndex = indexData ? indexData[0] : {};
    result.data = {
      user: _.omit(JSON.parse(JSON.stringify(user)), ['password', 'firebaseId']),
      health: {
        currentIndex: currentIndex ? currentIndex.index : null,
        mealData,
        indexData,
      },
      prescription: prescription[0]
    }
    result.status = true;
  }
  res.send(result);
});

router.post('/update-patient-info', async (req, res) => {
  const actionUserId = req.user._id;
  const {
    patientId,
    phone,
    note,
    fullName,
    diseaseType,
    birth,
    sex
  } = req.body || {};
  const user = await User.findOne({_id: patientId});
  if (!user) {
    res.send({
      status: false,
      message: 'Lỗi!'
    });
    return;
  }
  if (user && !user.inAccount) {
    await User.findOneAndUpdate({
      _id: patientId
    }, {
      ...(phone && {phone}),
      ...(fullName && {fullName}),
      ...(diseaseType && {diseaseType}),
      ...(birth && {birth}),
      ...(sex && {sex}),
    })
  };

  await setRelationship({
    actionUserId,
    userTwoId: patientId,
    status: relationalStatus.pending,
    note,
  });
  await setRelationship({
    actionUserId: patientId,
    userTwoId: actionUserId,
    status: relationalStatus.accepted,
  })
  res.send({
    status: true,
    message: 'Cập nhật thông tin thành công!'
  });
});

export default router;
