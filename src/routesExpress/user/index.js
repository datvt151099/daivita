/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import * as _ from "lodash";
import moment from "moment";
import Promise from 'bluebird';
import setRelationship from "./setRelationship";
import {ERROR_MESSAGE_SERVER, relationalStatus, roles} from "../../constants";
import getPatients from "./getPatients";
import User from "../../data/models/User";
import Relationship from "../../data/models/Relationship";
import Health from "../../data/models/Health";
import checkPermission from "./checkPermission";
import {rounding} from "../helpers";

const router = new Router();

const ROWS_PER_PAGE = 10;

router.post('/follow', async (req, res) => {
  const { userId } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  try{
    const status = await setRelationship({
      actionUserId: userId,
      userTwoId: actionUserId,
      status: relationalStatus.accepted
    });
    if (status) {
      result.status = true;
      result.message = 'Đã gửi lời theo dõi';
    }
  } catch (e) {
    result.message = ERROR_MESSAGE_SERVER;
  };

  res.send(result);
});

router.post('/accept-following', async (req, res) => {
  const { userId } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  try{
    const status = await setRelationship({
      actionUserId,
      userTwoId: userId,
      status: relationalStatus.accepted
    })
    if (status) {
      result.status = true;
      result.message = 'Đã chấp nhận lời theo dõi';
    }
  } catch (e) {
    result.message = ERROR_MESSAGE_SERVER;
  };

  res.send(result);
});

router.post('/decline-following', async (req, res) => {
  const { userId } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  try{
    const status = await setRelationship({
      actionUserId,
      userTwoId: userId,
      status: relationalStatus.declined
    })
    if (status) {
      result.status = true;
      result.message = 'Từ chối lời theo dõi'
    }
  } catch (e) {
    result.message = ERROR_MESSAGE_SERVER;
  };

  res.send(result);
});

router.post('/unfollow', async (req, res) => {
  const { userId } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  try{
    const status = await setRelationship({
      actionUserId,
      userTwoId: userId,
      status: relationalStatus.blocked
    })
    if (status) {
      result.status = true;
      result.message = 'Đã hủy theo dõi';
    }
  } catch (e) {
    result.message = ERROR_MESSAGE_SERVER;
  };

  res.send(result);
});

router.post('/get-patients', async (req, res) => {
  const { page = 1,  rowsPerPage = ROWS_PER_PAGE } = req.body || {};
  const data = await getPatients({doctorId: req.user._id, page, rowsPerPage});
  res.send({
    status: true,
    data,
    message: '',
  });
});

router.post('/get-patient', async (req, res) => {
  const { patientId } = req.body || {};
  const data = await Health.findOne({patientId})
  res.send({
    status: true,
    data,
  });
});


router.post('/validate-add-patient', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const { phone } = req.body || {};
  const user = await User.findOne({phone});

  if (!user) {
    result.status = true;
  } else if (user.role === roles.doctor) {
    result.message = 'Số điện thoại đã đăng ký tài khoản bác sĩ!';
  } else {
    const relationship = await Relationship.findOne({
      $or: [
        { userOneId: req.user._id, userTwoId: user._id},
        { userTwoId: user._id, userOneId: req.user._id},
      ],
      status: relationalStatus.accepted,
    })

    if (relationship) {
      result.status = false;
      result.message = 'Bệnh nhân đã theo dõi!';
    } else {
      result.status = true;
      result.data = _.omit(JSON.parse(JSON.stringify(user)), ['password', 'firebaseId']);
    }
  }
  res.send(result);
});

const editUserInfo = async ({
                                 userId,
                                 fullName,
                                 diseaseType,
                                 birth,
                                 sex,
                                 avatar,
                              workHospital,
                              role = roles.patient
}) => {
  await Promise.all([
    User.findOneAndUpdate({
      _id: userId
    }, {
      ...(fullName && {fullName}),
      ...(Boolean(diseaseType === 0 || diseaseType) && {diseaseType}),
      ...(birth && {
        birth,
        age: moment().diff(birth, 'years'),
      }),
      ...(Boolean(sex === 0 || sex) && {sex}),
      ...(workHospital && {workHospital}),
      ...(avatar && {avatar }),
    }), () => {
      if (role === roles.patient) {
        return Health.findOneAndUpdate({
          patientId: userId
        }, {
          $set: {
            ...(fullName && {fullName}),
            ...(avatar && {avatar }),
            ...(Boolean(diseaseType === 0 || diseaseType) && {diseaseType}),
            ...(birth && {
              age: moment().diff(birth, 'years'),
            }),
          }
        })
      }
    }
  ]);
  return User.findOne({_id: userId});
}
router.post('/add-patient', async (req, res) => {
  const actionUserId = req.user._id;
  const {
    phone,
    note,
    fullName,
    diseaseType,
    birth,
    avatar,
    sex
  } = req.body || {};
  let patientId;
  const user = await User.findOne({phone});
  if (user && user.role === roles.patient) {
    patientId = user._id;
    if (!user.inAccount) {
      await editUserInfo({
        userId: patientId,
        fullName,
        diseaseType,
        birth,
        sex,
        role: roles.patient,
        avatar
      })
    }
  } else if (!user) {
    const patient = new User({
      fullName,
      createdBy: actionUserId,
      diseaseType,
      inAccount: false,
      role: roles.patient,
      birth,
      age: moment().diff(birth, 'years'),
      avatar,
      sex,
      phone,
      password: 'password',
    });
    await patient.save();
    await Health.create({
      createdAt: +moment().format('X'),
      patientId: patient._id,
      age: moment().diff(birth, 'years'),
      diseaseType,
      fullName,
      avatar,
    })
    patientId = patient._id;
  } else {
    res.send({
      status: false,
      message: 'Số điện thoại không hợp lệ!'
    });
  }
  const relationship = await Relationship.findOne( {
    $or: [
      { userOneId: actionUserId, userTwoId: patientId },
      { userOneId: patientId, userTwoId: actionUserId }
    ]
  }) || new Relationship({
    userOneId: actionUserId,
    userTwoId: patientId,
  });
  relationship.actionUserId = patientId;
  relationship.status = relationalStatus.accepted;
  relationship.actionAt = +moment().format('X');
  if (relationship.userOneId === actionUserId) {
    relationship.noteUserOne = note;
  } else {
    relationship.noteUserTwo = note;
  }
  await relationship.save();
  res.send({
    status: true,
    message: 'Thêm bệnh nhân thành công!'
  });
});

router.post('/edit-patient-info', async (req, res) => {
  const actionUserId = req.user._id;
  const {
    patientId,
    note,
    fullName,
    diseaseType,
    birth,
    sex,
    avatar,
  } = req.body || {};
  let data = {};
  const user = await User.findOne({_id: patientId});
  if (!user) {
    res.send({
      status: false,
      message: 'Lỗi!'
    });
    return;
  }
  if (user && !user.inAccount) {
    data = await editUserInfo({
      userId: patientId,
      fullName,
      diseaseType,
      birth,
      sex,
      role: roles.patient,
      avatar
    })
  };

  const relationship = await Relationship.findOne( {
    $or: [
      { userOneId: actionUserId, userTwoId: patientId },
      { userOneId: patientId, userTwoId: actionUserId }
    ]
  }) || new Relationship({
    userOneId: actionUserId,
    userTwoId: patientId,
  });
  relationship.actionUserId = patientId;
  relationship.status = relationalStatus.accepted;
  relationship.actionAt = +moment().format('X');
  if (relationship.userOneId === actionUserId) {
    relationship.noteUserOne = note;
  } else {
    relationship.noteUserTwo = note;
  }
  await relationship.save();
  data.note = note;
  res.send({
    status: true,
    message: 'Cập nhật thông tin thành công!',
    data: _.omit({
      ...JSON.parse(JSON.stringify(data)),
      note,
    }, ['password', 'firebaseId']),
  });
});

router.post('/edit-user-info', async (req, res) => {
  const {
    fullName,
    diseaseType,
    birth,
    sex,
    avatar,
    workHospital
  } = req.body || {};
  const {
    _id,
    role,
  } = req.user;
  const data = await editUserInfo({
    userId: _id,
    fullName,
    diseaseType,
    workHospital,
    birth,
    sex,
    role,
    avatar
  })

  res.send({
    status: true,
    message: 'Cập nhật thông tin thành công!',
    data: _.omit(JSON.parse(JSON.stringify(data)), ['password', 'firebaseId'])
  });
});

router.post('/edit-index-threshold', async (req, res) => {
  const {
    lowIndex,
    highIndex,
  } = req.body || {};
  const {
    _id,
  } = req.user;

  await User.findOneAndUpdate({
    _id
  }, {
    $set: {
      lowIndex: rounding(lowIndex),
      highIndex: rounding(highIndex)
    }
  })

  res.send({
    status: true,
    message: 'Thành công!'
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
export default router;
