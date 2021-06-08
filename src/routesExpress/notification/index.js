/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import moment from "moment";
import * as _ from 'lodash';
import Relationship from "../../data/models/Relationship";
import {notifyTypes, relationalStatus} from "../../constants";
import User from "../../data/models/User";
import Notification from "../../data/models/Notification";
import admin from "../../firebaseAdmin";

const router = new Router();

const ROWS_PER_PAGE = 10;

const getFollowers = async (userId) => {
  const relationships = await Relationship.find({
    $or: [
      { userOneId: userId},
      { userTwoId: userId},
    ],
    status: relationalStatus.accepted,
  });
  const result = _.map(relationships, item => {
    return item.userOneId !== userId ? item.userOneId : item.userTwoId;
  })
  return result;
};

// eslint-disable-next-line no-unused-vars
const getNotifyUsers = async (userIds, index, fromUserId) => {
  // const noticeExists = await Notification.find({
  //   createdAt: {
  //     $gte: +moment().startOf('day').format('X'),
  //     $lte: +moment().endOf('day').format('X')
  //   },
  //   type: notifyTypes.index,
  //   fromUserId,
  //   toUserId: { $in: userIds },
  // });
  //
  // const toUserIds = _.map(noticeExists, i => i.toUserId);
  // const resultUserIds = [];
  //
  // _.forEach(userIds,  id => {
  //   if (!toUserIds.includes(id)) {
  //     resultUserIds.push(id)
  //   }
  // })
  //
  // const users = await User.find({
  //   _id: {$in: resultUserIds},
  //   registrationToken: { $exists: true, $ne: null },
  // });
  //
  // const result = [];
  // _.forEach(users, (user) => {
  //   if (index <= user.lowIndex || index >= user.highIndex)
  //     result.push({
  //       _id: user._id,
  //       token: user.registrationToken,
  //     });
  // })

  const users = await User.find({
    _id: {$in: userIds},
    registrationToken: { $exists: true, $ne: null },
  });

  const result = [];
  _.forEach(users, (user) => {
    if (index <= user.lowIndex || index >= user.highIndex)
      result.push({
        _id: user._id,
        token: user.registrationToken,
      });
  })

  return result;
};

const sendNotification = async (users, title, body, data, fromUserId) => {
  const registrationTokens = _.map(users, u => u.token);

  const message = {
    notification: {
      title,
      body
    },
    data,
    tokens: registrationTokens,
  };

  const response = await admin.messaging().sendMulticast(message)
  const successfulUsers = [];
  response.responses.forEach((resp, idx) => {
    if (resp.success) {
      successfulUsers.push(users[idx]);
    }
  });

  const now = +moment().format('X');
  const notifications = _.map(successfulUsers, user => {
    return {
      createdAt: now,
      fromUserId,
      toUserId: user._id,
      status: false,
      notification: {
        title,
        body
      },
      type: notifyTypes.index,
    }
  })

  await Notification.insertMany(notifications);
};

export const genNotification = async ({userId, measureAt, index }) => {
  if (moment().isSame(measureAt * 1000, 'day')) {
    const followers = await getFollowers(userId);
    const notifyUsers = await getNotifyUsers(followers, index, userId);
    if (notifyUsers.length) {
      const fromInfo = await User.findOne({_id: userId});
      const title = "Đường huyết";
      const body = `Cảnh báo đường huyết bất thường: bệnh nhân ${fromInfo.fullName}`;
      const data = {
        type: notifyTypes.index,
        fromUserId: userId
      }
      await sendNotification(notifyUsers, title, body, data, userId);
    }
  }
  return false;
}

router.post('/get-notifications', async (req, res) => {
  const { page = 1,  rowsPerPage = ROWS_PER_PAGE } = req.body || {};
  const offset = (page - 1) * rowsPerPage;
  const data = await Notification.find({
    toUserId: req.user._id,
  }).sort({
    createdAt: -1
  })
    .skip(offset)
    .limit(rowsPerPage);

  res.send({
    status: true,
    data
  });
});

router.post('/read-notification', async (req, res) => {
  const {
    _id,
  } = req.body;
  await Notification.findOneAndUpdate({ _id },
    {
      $set: {
        status: true,
        updatedAt: +moment().format('X')
      }
    })

  res.send({
    status: true,
    message: 'Thành công!'
  });
});


export default router;
