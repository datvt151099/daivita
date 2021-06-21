/* eslint-disable no-console, consistent-return */
import {Router} from 'express';
import moment from "moment";
import * as _ from 'lodash';
import {followTypes, relationalStatus, roles} from "../../constants";
import getPatients from "./getPatients";
import User from "../../data/models/User";
import Relationship from "../../data/models/Relationship";
import {formatUserData, rounding} from "../helpers";
import addFollower from "./addFollower";
import editUserInfo, {editPatientInfo} from "./editUser";
import {getFollowers} from "../relationship/setRelationship";
import validateAddFollower from "./validateAddFollower";

const router = new Router();

const ROWS_PER_PAGE = 10;

router.post('/get-patients', async (req, res) => {
  const { page = 1,  rowsPerPage = ROWS_PER_PAGE } = req.body || {};
  try {
    const data = await getPatients({doctorId: req.user._id, page, rowsPerPage});
    res.send({
      status: true,
      data
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message),
    });
  }
});

router.post('/validate-add-patient', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const { phone } = req.body || {};
  try {
    const patient = await User.findOne({phone});
    if (!patient) {
      result.status = true;
    } else if (patient.role === roles.doctor) {
      result.message = 'Số điện thoại đã đăng ký tài khoản bác sĩ!';
    } else {
      const followers = await getFollowers(patient._id);
      if (!followers || followers.length === 0) {
        result.status = true;
        result.data = formatUserData(patient);
      } else if (followers.includes(req.user._id)) {
        result.status = false;
        result.message = 'Bệnh nhân đã theo dõi!';
      } else {
        const doctor = await User.findOne({
          _id: {$in: followers},
          role: roles.doctor
        });
        if (doctor) {
          result.status = false;
          result.message = 'Bệnh nhân đã được bác sĩ khác theo dõi!';
        } else {
          result.status = true;
          result.data = formatUserData(patient);
        }
      }
    }
  } catch (e) {
    result.message = JSON.stringify(e.message);
  }
  res.send(result);
});

router.post('/validate-add-follower', async (req, res) => {
  const {
    phone,
    type = followTypes.doctor,
  } = req.body || {};
  const result = await validateAddFollower({
    phone,
    type,
    userId: req.user._id
  });
  res.send(result);
});

router.post('/add-patient', async (req, res) => {
  const {_id: actionUserId, fullName: actionUserName} = req.user;
  const {
    phone,
    note,
    fullName,
    diseaseType,
    birth,
    avatar,
    sex
  } = req.body || {};

  try {
    await addFollower({
      actionUserId,
      actionUserName,
      phone,
      note,
      fullName,
      diseaseType,
      birth,
      avatar,
      sex,
      type: followTypes.patient
    });
    res.send({
      status: true,
      message: 'Thêm bệnh nhân thành công!'
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message),
    });
  }
});

router.post('/add-follower', async (req, res) => {
  const {_id: actionUserId, fullName: actionUserName} = req.user;
  const {
    userId,
    phone,
    note,
    fullName,
    diseaseType,
    birth,
    avatar,
    sex,
    type = followTypes.patient,
  } = req.body || {};

  try {
    await addFollower({
      userId,
      actionUserName,
      actionUserId,
      phone,
      note,
      fullName,
      diseaseType,
      birth,
      avatar,
      sex,
      type
    });
    res.send({
      status: true,
      message: 'Gửi yêu cầu thành công!'
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message),
    });
  }
});

router.post('/unfollow-patient', async (req, res) => {
  const { patientId } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  try{
    await Relationship.findOneAndUpdate( {
      $or: [
        { userOneId: actionUserId, userTwoId: patientId },
        { userOneId: patientId, userTwoId: actionUserId },
      ]
    }, {
      $set: {
        actionUserId,
        status: relationalStatus.blocked,
        actionAt: +moment().format('X')
      }
    });
    result.status = true;
    result.message = 'Đã hủy theo dõi thành công!';
  } catch (e) {
    result.message = JSON.stringify(e.message);
  };
  res.send(result);
});

router.post('/my-doctor', async (req, res) => {
  const result = {
    status: false,
    message: '',
    data: null
  };
  const { myDoctorId, _id } = req.user;
  console.log(req.user);
  try{
    if ( myDoctorId ) {
      const relationship = await Relationship.findOne( {
        $or: [
          { userOneId: myDoctorId, userTwoId: _id },
          { userOneId: _id, userTwoId: myDoctorId },
        ],
        status: {$in: [relationalStatus.accepted, relationalStatus.pending]}
      })
      console.log()
      if (relationship) {
        // eslint-disable-next-line no-empty
        if (relationship.status === relationalStatus.pending && relationship.actionUserId === myDoctorId) {

        } else {
          const doctor = await User.findOne({_id: myDoctorId });
          const accepted = relationship.status === relationalStatus.accepted;
          result.data = doctor ? formatUserData(doctor, {accepted}) : null;
        }
      }
    };
    result.status = true;
  } catch (e) {
    result.message = JSON.stringify(e.message);
  };
  res.send(result);
});

router.post('/get-relatives', async (req, res) => {
  const result = {
    status: false,
    message: '',
    data: null
  };
  const { _id } = req.user;
  try{
    const followers = await getFollowers(_id);
    const relatives = await User.find({
      _id: {$in: followers},
      role: roles.patient
    });
    result.data = _.map(relatives, i => formatUserData(i));
    result.status = true;
  } catch (e) {
    result.message = JSON.stringify(e.message);
  };
  res.send(result);
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

  try {
    const info = await editPatientInfo({
      actionUserId,
      patientId,
      note,
      fullName,
      diseaseType,
      birth,
      avatar,
      sex
    });
    if (info.status) {
      res.send({
        status: true,
        data: formatUserData(info.data),
        message: 'Cập nhật thông tin thành công!',
      });
    } else {
      res.send({
        status: false,
        message: 'Lỗi cập nhật!'
      });
    }
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message),
    });
  }
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
  try {
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
      data: formatUserData(data),
      message: 'Cập nhật thông tin thành công!',
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message),
    });
  }
});

router.post('/edit-index-threshold', async (req, res) => {
  const {
    lowIndex,
    highIndex,
  } = req.body || {};
  const {
    _id,
  } = req.user;
  try {
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
      message: 'Cập nhật thành công!'
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message),
    });
  }

});

export default router;
