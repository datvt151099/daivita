/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import moment from "moment";
import Appointment from "../../data/models/Appointment";
import {roles} from "../../constants";

const router = new Router();

router.post('/create-appointment', async (req, res) => {
  const {
    patientId,
    time = +moment().format('X'),
    address
  } = req.body;
  const createdBy = req.user._id;
  const now = +moment().format('X');

  try {
    await Appointment.create({
      createdAt: now,
      updatedAt: now,
      createdBy,
      patientId,
      time,
      address
    });
    res.send({
      status: true,
      message: 'Tạo thành công!'
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message)
    });
  }
});

router.post('/edit-appointment', async (req, res) => {
  const {
    address,
    time,
    _id
  } = req.body;

  try {
    await Appointment.findOneAndUpdate({
      _id
    }, {
      $set: { ...(time && {
          time
        }),
        ...(address && {
          address
        }),
        updatedAt: +moment().format('X')
      }
    });
    res.send({
      status: true,
      message: 'Chỉnh sửa thành công!'
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message)
    });
  }
});

router.post('/get-appointment-history', async (req, res) => {
  const {
    role,
    _id
  } = req.user;
  const queryField = role === roles.doctor ? 'createdBy' : 'patientId';

  try {
    const data = await Appointment.aggregate([{
      $match: {
        [queryField]: _id,
        time: {
          $lt: +moment().startOf('day').format('X')
        }
      }
    }, {
      $lookup: {
        let: {
          userId: {
            "$toObjectId": role === roles.doctor ? '$patientId' : '$createdBy'
          }
        },
        from: "user",
        pipeline: [{
          "$match": {
            "$expr": {
              "$eq": ["$_id", "$$userId"]
            }
          }
        }],
        as: "user"
      }
    }, {
      $unwind: '$user'
    }, {
      $sort: {
        time: -1
      }
    }, {
      $project: {
        _id: true,
        address: true,
        time: true,
        'user._id': true,
        'user.fullName': true,
        'user.avatar': true,
        'user.age': true
      }
    }]).allowDiskUse(true);
    res.send({
      status: true,
      data
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message)
    });
  }
});

router.post('/get-appointments', async (req, res) => {
  const {
    role,
    _id
  } = req.user;
  const queryField = role === roles.doctor ? 'createdBy' : 'patientId';

  try {
    const data = await Appointment.aggregate([{
      $match: {
        [queryField]: _id,
        time: {
          $gte: +moment().startOf('day').format('X')
        }
      }
    }, {
      $lookup: {
        let: {
          userId: {
            "$toObjectId": role === roles.doctor ? '$patientId' : '$createdBy'
          }
        },
        from: "user",
        pipeline: [{
          "$match": {
            "$expr": {
              "$eq": ["$_id", "$$userId"]
            }
          }
        }],
        as: "user"
      }
    }, {
      $unwind: '$user'
    }, {
      $sort: {
        time: 1
      }
    }, {
      $project: {
        address: true,
        time: true,
        patientId: true,
        'user.fullName': true,
        'user.avatar': true,
        'user.age': true,
        'user._id': true
      }
    }]).allowDiskUse(true);
    res.send({
      status: true,
      data
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message)
    });
  }
});

router.post('/cancel-appointment', async (req, res) => {
  const {
    _id
  } = req.body;

  try {
    await Appointment.remove({
      _id
    });
    res.send({
      status: true,
      message: 'Hủy thành công!'
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message)
    });
  }
});

export default router;
