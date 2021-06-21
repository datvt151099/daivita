import moment from "moment";
import * as _ from "lodash";
import {getFollowers} from "../relationship/setRelationship";
import User from "../../data/models/User";
import {notifyTypes} from "../../constants";
import Notification from "../../data/models/Notification";
import admin from "../../firebaseAdmin";

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
// eslint-disable-next-line no-unused-vars
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
      payload: JSON.stringify({
        patientId: fromUserId
      })
    }
  })

  await Notification.insertMany(notifications);
};

const genIndexNotification = async ({userId, measureAt, index, lowIndex, highIndex }) => {
  if (moment().isSame(measureAt * 1000, 'day') && (index <= lowIndex || index >= highIndex)) {
    const followers = await getFollowers(userId);
    if (followers.length) {
      const fromInfo = await User.findOne({_id: userId});
      const title = "Đường huyết";
      const body = `Cảnh báo đường huyết bất thường: bệnh nhân ${fromInfo.fullName}`;
      const payload = JSON.stringify({
        patientId: userId
      });

      const now = +moment().format('X');
      const notifications = _.map(followers, followerId => {
        return {
          createdAt: now,
          fromUserId: userId,
          toUserId: followerId,
          status: false,
          notification: {
            title,
            body
          },
          type: notifyTypes.index,
          payload
        }
      })
      await Notification.insertMany(notifications);
    }
  }
  return false;
}

export default genIndexNotification;
