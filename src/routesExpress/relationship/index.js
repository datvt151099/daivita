import moment from "moment";
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
    return note || '';
  };
  return null;
};

export const setNote = async ({actionUserId, userTwoId, note}) => {
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
  relationship.status = relationalStatus.accepted;
  relationship.actionAt = +moment().format('X');
  if (relationship.userOneId === actionUserId) {
    relationship.noteUserOne = note;
  } else {
    relationship.noteUserTwo = note;
  }
  await relationship.save();
  return true;
}

export default getNote;
