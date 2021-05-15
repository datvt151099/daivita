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
    }) || {};

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
export default async ({actionUserId, userTwoId, status, note}) => {
  const isMatch = await checkPermission({actionUserId, userTwoId, status});
  if (isMatch) {
    const relationship = await Relationship.findOne( {
        $or: [
          { userOneId: actionUserId, userTwoId },
          { userOneId: userTwoId, userTwoId: actionUserId }
        ]
    }) || new Relationship({
      userOneId: actionUserId,
      userTwoId,
    });

    relationship.actionUserId = actionUserId;
    relationship.status = status;
    relationship.actionAt = +moment().format('X');
    if (relationship.userOneId === actionUserId) {
      relationship.noteUserOne = note;
    } else {
      relationship.noteUserTwo = note;
    }

    await relationship.save();
    return true;
  };
  return false;
}


