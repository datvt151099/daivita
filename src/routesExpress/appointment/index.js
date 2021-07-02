/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import moment from "moment";
import Promise from 'bluebird';
import Appointment from "../../data/models/Appointment";
import {notifyTypes, roles} from "../../constants";
import Notification from "../../data/models/Notification";
import mongoose from "../../data/mongoose";
import {startTransaction} from "../helpers";

const router = new Router();

router.post('/create-appointment', async (req, res) => {
  const {
    patientId,
    time = +moment().format('X'),
    address
  } = req.body;
  const createdBy = req.user._id;
  const createdName = req.user.fullName;
  const now = +moment().format('X');

  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    await Promise.all([
      Appointment.create({
        createdAt: now,
        updatedAt: now,
        createdBy,
        patientId,
        time,
        address
      }),
      Notification.create({
        createdAt: now,
        fromUserId: createdBy,
        toUserId: patientId,
        status: false,
        notification: {
          title: 'Lịch khám',
          body: `Bạn có lịch khám từ bác sĩ ${createdName}.`
        },
        type: notifyTypes.appointment,
      })
    ]) ;
    await session.commitTransaction();
    res.send({
      status: true,
      message: 'Tạo thành công!'
    });
  } catch (error) {
    await session.abortTransaction();
    res.send({
      status: false,
      message: JSON.stringify(error.message)
    });
  } finally {
    await session.endSession();
  }
});

router.post('/edit-appointment', async (req, res) => {
  const {
    address,
    time,
    patientId,
    _id
  } = req.body;

  const now = +moment().format('X');
  const { _id: doctorId, fullName} = req.user;
  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    await Promise.all([
      Appointment.findOneAndUpdate({
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
      }),
      Notification.create({
        createdAt: now,
        fromUserId: doctorId,
        toUserId: patientId,
        status: false,
        notification: {
          title: 'Lịch khám',
          body: `Bác sĩ ${fullName} đã thay đổi lịch khảm của bạn.`
        },
        type: notifyTypes.appointment,
      })
    ]);
    await session.commitTransaction();
    res.send({
      status: true,
      message: 'Chỉnh sửa thành công!'
    });
  } catch (error) {
    await session.abortTransaction();
    res.send({
      status: false,
      message: JSON.stringify(error.message)
    });
  } finally {
    await session.endSession();
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
    _id,
    patientId
  } = req.body;

  const now = +moment().format('X');
  const { _id: doctorId, fullName} = req.user;
  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    await Promise.all([
      Appointment.remove({
        _id
      }),
      Notification.create({
        createdAt: now,
        fromUserId: doctorId,
        toUserId: patientId,
        status: false,
        notification: {
          title: 'Lịch khám',
          body: `Bác sĩ ${fullName} đã hủy lịch khảm của bạn.`
        },
        type: notifyTypes.appointment,
      })
    ]);
    await session.commitTransaction();
    res.send({
      status: true,
      message: 'Hủy thành công!'
    });
  } catch (error) {
    await session.abortTransaction();
    res.send({
      status: false,
      message: JSON.stringify(error.message)
    });
  } finally {
    await session.endSession();
  }
});

export default router;
