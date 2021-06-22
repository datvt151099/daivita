/* eslint-disable no-console, consistent-return */
import {Router} from 'express';
import Promise from "bluebird";
import setRelationship from "./setRelationship";
import Notification from '../../data/models/Notification';
import {followTypes, notifyTypes, relationalStatus, roles} from "../../constants";
import mongoose from "../../data/mongoose";
import {startTransaction} from "../helpers";
import User from "../../data/models/User";

const router = new Router();

router.post('/accept-following', async (req, res) => {
  const { userId, note } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    await setRelationship({
      actionUserId,
      userTwoId: userId,
      status: relationalStatus.accepted,
      note
    });
    await Notification.remove({
      fromUserId: userId,
      toUserId: actionUserId,
      type: notifyTypes.follow
    });
    result.status = true;
    result.message = 'Đã chấp nhận lời theo dõi!';
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    result.message = JSON.stringify(error.message);
  } finally {
    await session.endSession();
  }

  res.send(result);
});

router.post('/deny-following', async (req, res) => {
  const { userId } = req.body;
  const { _id: actionUserId, role } = req.user;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    await Promise.all([
      setRelationship({
        actionUserId,
        userTwoId: userId,
        status: relationalStatus.declined
      }),
      Notification.remove({
        fromUserId: userId,
        toUserId: actionUserId,
        type: notifyTypes.follow
      })
    ])

    if (role === roles.doctor) {
      await User.findOneAndUpdate({
        _id: userId,
      }, {
        $set: {
          myDoctorId: null
        }
      })
    }
    result.status = true;
    result.message = 'Đã từ chối lời theo dõi!';
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    result.message = JSON.stringify(error.message);
  } finally {
    await session.endSession();
  }
  res.send(result);
});

router.post('/remove-follower', async (req, res) => {
  const actionUserId = req.user._id;
  const {
    userId,
    type
  } = req.body || {};

  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    await setRelationship({
      actionUserId,
      userTwoId: userId,
      status: relationalStatus.blocked
    });
    if (type === followTypes.doctor || type === followTypes.patient) {
      await User.findOneAndUpdate({
        _id: type === followTypes.doctor ? actionUserId : userId,
      }, {
        $set: {
          myDoctorId: null
        }
      })
    }
    if (type === followTypes.patient) {
      await Notification.updateMany({
        fromUserId: userId,
        toUserId: actionUserId,
        type: notifyTypes.index
      }, {
        $set: {
          isValid: false
        }
      })
    } else if (type === followTypes.doctor || type === followTypes.relative) {
      await Notification.updateMany({
        fromUserId: actionUserId,
        toUserId: userId,
        type: notifyTypes.index
      }, {
        $set: {
          isValid: false
        }
      })
    }

    result.status = true;
    result.message = 'Thành công!';
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    result.message = JSON.stringify(error.message);
  } finally {
    await session.endSession();
  }
  res.send(result);
});

router.post('/unfollow-patient', async (req, res) => {
  const { patientId } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    await setRelationship({
      actionUserId,
      userTwoId: patientId,
      status: relationalStatus.blocked
    });
    await User.findOneAndUpdate({
      _id: patientId,
    }, {
      $set: {
        myDoctorId: null
      }
    })
    result.status = true;
    result.message = 'Thành công!';
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    result.message = JSON.stringify(error.message);
  } finally {
    await session.endSession();
  }
  res.send(result);
});

export default router;
