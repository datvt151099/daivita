import moment from "moment";
import Promise from "bluebird";
import {roles} from "../../constants";
import User from "../../data/models/User";
import Health from "../../data/models/Health";
import mongoose from "../../data/mongoose";
import {startTransaction} from "../helpers";
import {setNote} from "../relationship";

const editUserInfo = async ({
                              userId,
                              fullName,
                              diseaseType,
                              birth,
                              sex,
                              avatar,
                              workHospital,
                              role = roles.patient
                            }) => {

  await Promise.all([
    User.findOneAndUpdate({
      _id: userId
    }, {
      ...(fullName && {fullName}),
      ...(Boolean(diseaseType === 0 || diseaseType) && {diseaseType}),
      ...(birth && {
        birth,
        age: moment().diff(birth, 'years'),
      }),
      ...(Boolean(sex === 0 || sex) && {sex}),
      ...(workHospital && {workHospital}),
      ...(avatar && {avatar }),
      // eslint-disable-next-line consistent-return
    }), () => {
      if (role === roles.patient) {
        return Health.findOneAndUpdate({
          patientId: userId
        }, {
          $set: {
            ...(fullName && {fullName}),
            ...(avatar && {avatar }),
            ...(Boolean(diseaseType === 0 || diseaseType) && {diseaseType}),
            ...(birth && {
              age: moment().diff(birth, 'years'),
            }),
          }
        })
      }
    }
  ]);
  const user = await User.findOne({_id: userId});
  return JSON.parse(JSON.stringify(user));
};

export const editPatientInfo = async ({
                                 actionUserId,
                                 patientId,
                                 note,
                                 fullName,
                                 diseaseType,
                                 birth,
                                 sex,
                                 avatar
}) => {
  const result = {
    status: false,
    data: {},
  };
  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    const user = await User.findOne({_id: patientId});
    if (user) {
      if (!user.inAccount) {
        result.data = await editUserInfo({
          userId: patientId,
          fullName,
          diseaseType,
          birth,
          sex,
          role: roles.patient,
          avatar
        })
      };
      await setNote({actionUserId, userTwoId: patientId, note});
      result.status = true;
      result.data.note = note;
    };
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export default editUserInfo;
