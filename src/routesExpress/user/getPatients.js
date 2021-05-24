import * as _ from 'lodash';
import Relationship from "../../data/models/Relationship";
import {relationalStatus} from "../../constants";
import Health from "../../data/models/Health";

const getPatients = async ({doctorId, page, rowsPerPage}) => {
  const offset = (page - 1) * rowsPerPage;
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

  const items = await Health
    .find({
      patientId: { $in: patientIds }
    })
    .sort({
      priority: -1
    })
    .skip(offset)
    .limit(rowsPerPage);

  const total = await Health.count({
      patientId: { $in: patientIds }
    });

  return {
    total,
    items,
  };
}

export default getPatients;
