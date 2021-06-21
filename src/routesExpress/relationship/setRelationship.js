import moment from "moment";
import * as _ from "lodash";
import Relationship from "../../data/models/Relationship";
import {relationalStatus} from "../../constants";

export const getNote = async ({actionUserId, userTwoId}) => {
  const relationship = await Relationship.findOne( {
    $or: [
      { userOneId: actionUserId, userTwoId },
      { userOneId: userTwoId, userTwoId: actionUserId }
    ]
  });
  if (relationship) {
    const note = relationship.userOneId === actionUserId ? relationship.noteUserOne : relationship.noteUserTwo;
    return note;
  };
  return null;
};

const setRelationship = async ({actionUserId, userTwoId, status, note}) => {
  if (!Object.values(relationalStatus).includes(status)) {
    throw new Error('Trạng thái không hợp lệ');
  }
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
}

export const setNote = async ({actionUserId, userTwoId, note, inAccount}) => {
  const relationship = await Relationship.findOne( {
    $or: [
      { userOneId: actionUserId, userTwoId },
      { userOneId: userTwoId, userTwoId: actionUserId }
    ]
  }) || new Relationship({
    userOneId: actionUserId,
    userTwoId,
  });
  if (inAccount) {
    relationship.actionUserId = actionUserId;
    relationship.status = relationalStatus.pending;
  } else {
    relationship.actionUserId = userTwoId;
    relationship.status = relationalStatus.accepted;
  }
  relationship.actionAt = +moment().format('X');
  if (relationship.userOneId === actionUserId) {
    relationship.noteUserOne = note;
  } else {
    relationship.noteUserTwo = note;
  }
  await relationship.save();
  return true;
};

export const getFollowers = async (userId) => {
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

export default setRelationship;
