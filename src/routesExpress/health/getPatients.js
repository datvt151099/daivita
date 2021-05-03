import * as _ from 'lodash';
import Relationship from "../../data/models/Relationship";
import {relationalStatus} from "../../constants";
import Health from "../../data/models/Health";

const getPatients = async (userId) => {
  const patients = await Relationship.find({
    $or: [
      {
        userOneId: userId,
      },
      {
        userTwoId: userId,
      }
    ],
    status: relationalStatus.accepted
  });

  const userIds = _.map(patients, i => {
    if (i.userOneId !== userId) return i.userOneId;
    return i.userTwoId;
  });

  const result = await Health.find({
    userId: { $in: userIds }
  });

  return result;
}

export default getPatients;
