import * as _ from 'lodash';
import Relationship from "../../data/models/Relationship";
import {relationalStatus} from "../../constants";
import Health from "../../data/models/Health";

const getPatients = async (doctorId) => {
  const patients = await Relationship.find({
    $or: [
      {
        userOneId: doctorId,
      },
      {
        userTwoId: doctorId,
      }
    ],
    status: relationalStatus.accepted
  });

  const patientIds = _.map(patients, i => {
    if (i.userOneId !== doctorId) return i.userOneId;
    return i.userTwoId;
  });

  const result = await Health.find({
    patientId: { $in: patientIds }
  });

  return result;
}

export default getPatients;
