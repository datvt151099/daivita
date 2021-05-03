import moment from "moment";
import Relationship from "../../data/models/Relationship";
import {relationalStatus} from "../../constants";

const checkPermission = async ({actionUserId, userTwoId, status}) => {
  let relationship = null;
  if (status === relationalStatus.pending) {
    relationship = await Relationship.findOne({
      $or: [
        { userOneId: actionUserId, userTwoId },
        { userOneId: userTwoId, userTwoId: actionUserId }
      ],
      status: { $ne: relationalStatus.accepted }
    });

  } else if ( status === relationalStatus.accepted || status === relationalStatus.declined) {
    relationship = await Relationship.findOne({
      $or: [
        { userOneId: actionUserId, userTwoId },
        { userOneId: userTwoId, userTwoId: actionUserId }
      ],
      actionUserId: userTwoId,
      status: relationalStatus.pending
    })
  } else if (status === relationalStatus.blocked) {
    relationship = await Relationship.findOne({
      $or: [
        {userOneId: actionUserId, userTwoId},
        {userOneId: userTwoId, userTwoId: actionUserId}
      ],
      actionUserId: userTwoId,
      status: relationalStatus.accepted
    })
  }

  if (relationship) return true;
  return false;
}
export default async ({actionUserId, userTwoId, status}) => {
  const isMatch = await checkPermission({actionUserId, userTwoId, status});
  if (isMatch) {
    await Relationship.findOneAndUpdate( {
      $or: [
        { userOneId: actionUserId, userTwoId },
        { userOneId: userTwoId, userTwoId: actionUserId }
      ]
    }, {
      $setOnInsert: {
        userOneId: actionUserId,
        userTwoId,
        actionAt: +moment().format('X')
      },
      $set: {
        actionUserId,
        status
      }
    }, {
      upsert: true
    });
    return true;
  };
  return false;
}


